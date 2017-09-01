
##Turn a Data Structure Into a Tuple Using Pure C++ (C++14)

  RTTI has long been a pain in C++. People used all sorts of tools ranging from macros to 
  domain specific languages to get structure info at runtime. What if all you need is just
  structure data member types? And it turns out in C++14 it's an easy thing if your types are
  **literal and non-const/non-reference**.

  The following is a very short piece of code that will turn a data structure into a std::tuple. 
  And you can then use that tuple to print it out, serialize data, read it back, bind it to a 
  scripting language or what else.

    //helper to get type info
    struct type_id {
    
      using type_list = std::tuple< float, int, char const*, char >;
    
      constexpr operator float () { data = 0; return {}; }
      constexpr operator int () { data = 1; return {}; }
      constexpr operator char const* () { data = 2; return {}; }
      constexpr operator char () { data = 3; return {}; }
      int data{-1};
    };
    
    //here we're using overload resolution to get type info, constexpr hepls a lot
    template<typename T, std::size_t... N>
    constexpr auto get_type_id( std::index_sequence<N...>, int n ) {
      type_id tid[ sizeof...(N) ]{};
      T d{ tid[N]... }; (void) d;
      return tid[n].data;
    }
    
    //get type and put it into tuple
    template<typename T, std::size_t... N>
    constexpr auto get_type_tuple( std::index_sequence<N...> idx ) {
      constexpr std::size_t sz = sizeof...(N) - 1;
      return std::tuple< std::tuple_element_t< get_type_id<T>(idx, sz-N), type_id::type_list >... >{};
    }
   
    //get fields number using expression SFINAE
    template<typename T, int... N>
    constexpr auto fields_number(...) { return sizeof...(N)-1; }
    
    template<typename T, int... N>
    constexpr auto fields_number(int) -> decltype( T{(N,type_id{})...}, sizeof(0) ) { return fields_number<T,N...,0>(0); }
    
    //and here is our hot and fresh out of kitchen tuple, alias template
    //usage: as_tuple_t< data_t >
    template<typename T>
    using as_tuple_t = decltype( get_type_tuple< T >( std::make_index_sequence< fields_number<T>(0) >{} ) );


  That's all for the type inference part. Now we'll just add a couple helper functions and we're 
  ready to go :


    //wrapper around std::get to reverse index (tuple data members are stored in reverse order)
    template<int N, typename T> auto& getn(T& t) { return std::get< std::tuple_size<T>::value-1-N >(t); }
    
    template<std::size_t... N, typename T0, typename T1>
    void tuple_do_impl( std::index_sequence<N...>, T0& t, T1 fn ) {
      char dummy[]{ ( fn( getn<N>(t) ), '\0' )... };
      (void) dummy;
    }
    
    //helper to run code for every member of tuple
    template<typename T0, typename T1>
    void tuple_do( T0& t, T1 fn ) {
      tuple_do_impl( std::make_index_sequence< std::tuple_size<T0>::value >{}, t, fn );
    }
    
    struct data1 {
      char const* a;
      float b;
      char c;
    };
    
    int main() {
    
      data1 d1{ "Hello", 1.0, '!' };
      
      auto& t = ( as_tuple_t< data1 >& ) d1;
      
      getn<0>(t) = "Hello World!";
      
      tuple_do( t, []( auto& value ) { 
        std::cout << typeid(value).name() << ": " << value << ", "; 
      } );
    
    }

  See it in action online at [tio.run](https://goo.gl/DggwYv) or [Ideone](https://ideone.com/AOnPJM).
  The compiled code [looks clean](https://godbolt.org/g/x814oC). 

  The above was inspired by [Antony Polukhin's][anton] talk at [CppCon 2016][cppcon].

  Currently, because of std::tuple\_element, the code won't compile in Visual C++. I have made an
  alternative [example][msc] ([tio.run][msctio]) that doesn't use it and it compiles okay. 
  **But warning: std::tuple is not POD and you should not expect the layout of tuple to match your
  data structure.** Actually, I've noticed that on Visual C++ 64 bit [it won't work][l]. So if you 
  really need that to work stable you should come up with your own tuple-like class that will
  account for the aligment. There is relevant [comment](https://goo.gl/uL9hgC) by [Howard Hinnant][h].

  <!-- calculate alignment: https://goo.gl/SyZCPB -->

  Also the problem with std::tuple is that it reverses the order of fields but it's easy to fix 
  with a wrapper (getn in the code). And its std::get method is only compile-time (with the help 
  of some code we can do it at runtime but not so efficient). 

  [cppcon]: https://www.youtube.com/watch?v=abdeAew3gmQ "C++14 Reflections Without Macros, Markup nor External Tooling"
  [anton]: http://apolukhin.github.io/ "Antony Polukhin"
  [msc]: https://gist.github.com/alexpolt/87aca3eea01731892b623c7239ef60d4
  [msctio]: https://goo.gl/vFTcpZ
  [h]: https://howardhinnant.github.io/ "Howard Hinnant"
  [l]: http://alexpolt.github.io/struct-layout.html "Visual C++ Struct Layout Reminder"


