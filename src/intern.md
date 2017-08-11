
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

    #define intern(s) interned<ch(s,0),ch(s,1),ch(s,2),ch(s,3),ch(s,4),ch(s,5),ch(s,6),'\0'>::value

  The idea is simple: turn a string into a type and use the powers of linker to collapse all
  instances into one.

  An example of using it:

    printf( "%p: %s", &intern("Hellow"), intern("Hellow") );

  Check it online at [Ideone](https://ideone.com/EBPVQs).

  Right now it is using fixed-length strings (7 in above code, increase for your needs), but using 
  some template magic it can be made variable length.

  Another nice thing is that, since we turn a string into a type, we can use it everywhere where 
  a type can be used. First, let's add a macro:

      #define intern_t(s) interned<ch(s,0),ch(s,1),ch(s,2),ch(s,3),ch(s,4),ch(s,5),ch(s,6)>::type

  The name is arbitrary, I just want to show the technique. Now we can use it as a template 
  parameter:

      some_template< intern_t("hellow world") >

  or for overload resolution:

      some_method( intern_t("overload one") );
      some_method( intern_t("overload two") );

  Check it online at [Ideone](https://ideone.com/qhNAmc).

  Well, now the fun part. Because we now have the characters of a string as a parameter pack, we
  can parse it and do all sort of hacks with it. We can create a list of types for example or
  anything else. Just as an example here's a primitive calculator that can only add or subtract
  integer numbers and use it like this:

      printf( "calc(100+20-10) = %d\n", calc_t("100+20-10")::value );

  Output: calc(100+20-10) = 110

  Check it online at [Ideone](https://ideone.com/3muhLN)
  ( [gist](https://gist.github.com/alexpolt/aee1b6a8ac3d229fa36ada466f079c1e) ).


