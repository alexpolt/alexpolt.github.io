
##Turn a Data Structure Into a Tuple Using Pure C++ (C++14)

  RTTI has long been a pain in C++. People used all sorts of tools ranging from macros to 
  domain specific languages to get structure info at runtime. What if all you need is just
  structure data member types? And it turns out in C++14 it's an easy thing if your types are
  literal and non-const.

  The following is a very short piece of code that will turn a data structure into a std::tuple. 
  And you can then use that tuple to serialize data, read it back, bind it to scripting languages 
  or what else.

    //our data
    struct data1 {
      char const* c;
      float b;
      int a;
      char d;
    };
    
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
    //number 4 is the number of fields in our data structure
    using data1_as_tuple = decltype( get_type_tuple< data1 >( std::make_index_sequence< 4 >{} ) );

  See it in [action online at tio.run](https://goo.gl/HPS2Hr).

  The compiled code [looks clean](https://godbolt.org/g/no5cnc). MSC has some trouble with 
  std::tuple\_elemen\_t. I use it only to get a type from a type list by an index. You can easily
  replace it with custom type list.

  The problem with std::tuple is that it reverses the order of fields. Also it's formally not a 
  POD type. And its std::get method is only compile-time (with the help of some code we can do 
  it at runtime but not so efficient). Therefore it could be better to write a custom wrapper 
  with all bells and whistles. Also read that [comment](https://goo.gl/uL9hgC) from Howard Hinnant 
  on std::tuple.



