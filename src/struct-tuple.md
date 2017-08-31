
##Turn a Data Structure Into a Tuple Using Pure C++ (C++14)

  RTTI has long been a pain in C++. People used all sorts of tools ranging from macros to 
  domain specific languages to get structure info at runtime. What if all you need is just
  structure data member types? And it turns out in C++14 it's an easy thing if your types are
  **literal and non-const/non-reference**.

  The following is a very short piece of code that will turn a data structure into a std::tuple. 
  And you can then use that tuple to serialize data, read it back, bind it to scripting languages 
  or what else.

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
   
    //and here is our hot and fresh out of kitchen tuple
    //usage: as_tuple_t< data_t, 3 >
    //3 - is the number of fields in data_t
    template<typename T, int N>
    using as_tuple_t = decltype( get_type_tuple< T >( std::make_index_sequence< N >{} ) );

  And here is how it can be used:

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
      
      auto& t = ( as_tuple_t< data1, 3 >& ) d1;
      
      getn<0>(t) = "Hello World!";
      
      tuple_do( t, []( auto& value ) { 
        std::cout << typeid(value).name() << ": " << value << ", "; 
      } );
    
    }

  See it in action online at [tio.run](https://goo.gl/k8isXW) or [Ideone](https://ideone.com/5P0Bpt).

  The compiled code [looks clean](https://godbolt.org/g/52A8Bw). MSC has some trouble with 
  std::tuple\_elemen\_t. I use it only to get a type from a type list by an index. You can easily
  replace it with custom type list.

  The problem with std::tuple is that it reverses the order of fields but its easy to fix with
  a wrapper (getn in the code). Also it's formally not a POD type. And its std::get method 
  is only compile-time (with the help of some code we can do it at runtime but not so efficient). 
  Therefore it could be better to write a custom tuple with all the bells and whistles. Also read 
  that [comment](https://goo.gl/uL9hgC) from Howard Hinnant on std::tuple.



