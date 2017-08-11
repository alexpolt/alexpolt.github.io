
##String Interning in C++

  String interning is useful because it saves space and also allows for fast string comparsion
  for equality by comparing just the pointers. And it is possible to do it quite easily in pure
  C++:

    template<char... N> struct interned {
      
      using type = interned;
      static char const value[];
      
    };
    
    template<char... N> char const interned<N...>::value[]{N...};
    
    template<int N>
    constexpr char ch(char const(&s)[N], int i) {
      return i < N ? s[i] : '\0';
    }
    
    #define intern(s) interned<ch(s,0),ch(s,1),ch(s,2),ch(s,3),ch(s,4),ch(s,5),ch(s,6)>::value

  The idea is simple: turn a string into a type and use the powers of linker to collapse all
  instances into one. Complete code: [gist][gist0].

  An example of using it:

    printf( "%p: %s", &intern("Hellow"), intern("Hellow") );

  Check it online at [Ideone][ide0].

  Right now it is using fixed-length strings (7 in above code, increase for your needs), but using 
  some template magic it can be made variable length. [Ruslan Abdikeev][a] has provided an 
  alternative implementation that is cleaner and allows variable length strings.
  There is a [gist][gista0] with code and [Ideone][idea0] to see it in action.

  GCC and Clang provide an extension that allows using a user defined raw literal operator template
  for strings which makes the implementation simple and clean. [Ruslan Abdikeev][a] provided an
  [implementation][gista1].

  Another nice thing is that, since we turn a string into a type. We can use it everywhere where 
  a type can be used. First, let's add a macro:

      #define intern_t(s) interned<ch(s,0),ch(s,1),ch(s,2),ch(s,3),ch(s,4),ch(s,5),ch(s,6)>::type

  The name is arbitrary, I just want to show the technique. Now we can use it as a template 
  parameter:

      some_template< intern_t("hellow world") >

  or for overload resolution:

      some_method( intern_t("overload one") );
      some_method( intern_t("overload two") );

  Check it online at [Ideone][ide1].

  Well, now the fun part. Because we now have the characters of a string as a parameter pack, we
  can parse it and do all sort of hacks with it. We can create a list of types for example or
  anything else. Just as an example here's a primitive calculator that can only add or subtract
  integer numbers:

      printf( "calc(100+20-10) = %d\n", calc_t("100+20-10")::value );

      Output: calc(100+20-10) = 110

  Check it online at [Ideone][ide2] ( [gist][gist1] ).


  [gist0]: https://gist.github.com/alexpolt/44540ff2cfb81e312245cc5d2d6cb859 "C++ String Interning"
  [gist1]: https://gist.github.com/alexpolt/aee1b6a8ac3d229fa36ada466f079c1e "C++ String Interning Calculator"
  [ide0]: https://ideone.com/GigbNk "C++ String Interning Example"
  [ide1]: https://ideone.com/q3329k "C++ String Interning Example"
  [ide2]: https://ideone.com/7Y0SvG "C++ String Interning Calculator Example"
  [a]: https://twitter.com/aruslan "Ruslan Abdikeev"
  [gista0]: https://gist.github.com/alexpolt/5481a5db94ff94647bb0d114e322f0b9 "C++ String Interning"
  [gista1]: https://gist.github.com/alexpolt/532b48b9353e98e276b79296ec9f4ab6 "C++ String Interning"
  [idea0]: https://ideone.com/4oKRMR "C++ String Interning Example"




