
##Structure Data Members as a Type List Using Pure C++ (C++14)

  There is no standard way of getting type description in C++ at this moment. As a result 
  developers come up with all sorts of tools ranging from macros to domain specific languages 
  to have RTTI. But the truth is with C++14 you can at least get data member types in the form of
  a type list with only one (serious) limitation: the technique can only work with **literal and 
  non-const/non-reference types**. That means types like bool or char, char const\*, float  and 
  others (including user provided literal types) are fine.

  Here is the relevant part that makes it possible:

    struct read_type {
      template<typename U> constexpr operator U() {
        find U in a type list and assign its index to data
        return {};
      }
      int data;
    };
    
    //T - user provided structure
    template<typename T, int... N> constexpr auto get_type_id( int n ) {
      read_type tid[sizeof...(N)]{};
      T d = T{ tid[N]... }; (void)d;
      return tid[n].data;
    }

  I hope it's crystal clear from the code what happens: we have a templated custom conversion
  operator in read\_type that is then used in get\_type\_id constexpr function to identify and
  return a data member type by its index. All in all in takes a dozen lines of code.

  Having a type list of a data structure at hands we can then turn that into a tuple for example.
  The only problem is that std::tuple is usually implemented using single inheritance. It means
  the structure layout may vary across compilers as I note in this [blog post][l]. Also it stores
  data in reverse order. Because of this I decided to create my own tuple which I named 
  **luple: a lightweight tuple**. It uses multiple inheritance which has identical layout on 
  three major compilers (at least as far as I tested because it's not a POD type formally).

  So here is an example of using it:

    struct data {
      int a;
      float b;
      char const *c;
    };
    
    using data_tlist = struct_reader::as_type_list< data >; //type_list< int, float, char const* >
    using data_luple = luple< data_tlist >; //luple - lightweight tuple
    
    data d{1, 1.f, "Hello World!"};
    auto& l = reinterpret_cast< data_luple& >( d );
    
    get<1>(l) = 5.f;
    auto& a = get<int>(l);
    std::cout << get<2>(l);

  After getting member type information we can calculate theirs offsets. Or here I just cast it 
  into a luple (tuple-like data structure) and work with it using usual tuple methods.
  Check an [online example at tio.run][d] (or [at Ideone][c]) where I print out the guts of a 
  FILE (stdio) data structure.

  You can find both **luple and struct\_reader** in a [Github repository][git]. The header files
  have more detailed description of the API.

  There is also relevant [comment](https://goo.gl/uL9hgC) by [Howard Hinnant][h] on non-recursive 
  tuples.

  The idea was inspired by [Antony Polukhin's][anton] [talk at CppCon 2016][cppcon] 
  (thanks to [Ruslan Abdikeev][r] for pointing to it).

  [cppcon]: https://www.youtube.com/watch?v=abdeAew3gmQ "C++14 Reflections Without Macros, Markup nor External Tooling"
  [anton]: http://apolukhin.github.io/ "Antony Polukhin"
  [h]: https://howardhinnant.github.io/ "Howard Hinnant"
  [l]: http://alexpolt.github.io/struct-layout.html "Visual C++ Struct Layout Reminder"
  [d]: https://goo.gl/vS46PL "Struct Reader Online Example"
  [c]:  https://ideone.com/gcz6JY "Struct Reader Online Example"
  [git]: https://github.com/alexpolt/luple "Luple: a lightweight tuple and Struct Reader"
  [r]: https://twitter.com/aruslan "Ruslan Abdikeev"

