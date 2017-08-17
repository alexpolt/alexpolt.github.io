
##Useful Properties of String Interning in C++

###Description

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
  instances into one (code: [gist][gist0]).

  An example of using it:

    printf( "%p: %s", &intern("Hellow"), intern("Hellow") );

  See online [Ideone][ide0].

  Right now it is using fixed-length strings. [Ruslan Abdikeev][a] has provided an  alternative 
  implementation that is cleaner and allows variable length strings. There is a [gist][gista0] 
  with code and [Ideone][idea0] to see it in action.

  GCC and Clang provide an extension that allows using a user defined raw literal operator template
  for strings which makes the implementation simple and clean. [Ruslan Abdikeev][a] provided an
  [implementation][gista1]. There is a proposal [N3599][] to add this to the standard and, no
  suprise, it also talks about string interning.


###Other Uses

  There are other interesting uses of string interning in C++. Because we turn a string into a 
  type, we can use it everywhere where a type can be used. First, let's add a macro:

      #define intern_t(s) interned<ch(s,0),ch(s,1),ch(s,2),ch(s,3),ch(s,4),ch(s,5),ch(s,6)>::type

  The name is random, I just want to show the technique. Now we can use it as a template 
  parameter:

      some_template< intern_t("hellow world") >

  or for overload resolution:

      some_method( intern_t("overload one") );
      some_method( intern_t("overload two") );

  [Ideone][ide1].

  We can also use it in place of enums because it has a fixed address. Maybe not really good idea 
  if you have hundreds of enums but for a couple it has the advantage of being self-describing.

  Have you ever been in a situation when you have a small fixed set of name-value pairs and you
  wanted to map them in your program. Some programmers would create a small hash map for this.
  But there is simpler and more efficient method using the same style as in string interning:

    template<typename K, typename V> struct map {
      static V value;
    }
    
    template<typename K, typename V> map<K,V>::value{};
    
    map< intern_t("singleton") >::value.do_action();

  You can try it [online][tio0] at tio.run. 

  Another use is program internationalization: we can run some code for every interned string 
  (just another static member) that will populate a map with strings that can later be used
  for translation. Or we can apply the above mapping trick for that. The only problem is added
  linker work.

  Because we now have the characters of a string as a parameter pack, we can parse it and do all 
  sort of hacks with it. We can create a list of types for example or anything else. Just as an 
  example here's a primitive calculator that can only add or subtract integer numbers:

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
  [N3599]: http://open-std.org/JTC1/SC22/WG21/docs/papers/2013/n3599.html "Literal operator templates for strings"


  [tio0]: https://tio.run/##jVJNa8JAED1nf8VgaU0glX4XkphC6aUIOYkXFdluVrsQNyG7KW3F325nzSaxLZaenmbmvX3zZlhRnK8Y2@1OhGRZlXKImNKpyGMCRPN1kVHNI/ZKy8FgAEkMSpcV0yCk5qXkKWyIUykhV6A/Cg7DthASAEdpqgUDQweWS6XhjWYVn85Dsg2PPHDQ3GhFCdbiILDkjfn7nY@dyCV7Gn8vSqvy6nZq7pnypsncN6ogPDQOUHJdlRIERJDAA6ipmEMA/dlFHw0ScpLypZDc@lhoV3mdJxRX/oXn7/HS4pXFa4s3Fm8t3lm893AckxgOYRM1IWZc59JESpx2NNMl6ZrDOCZO2@SOzQSOI5YujG0yMBx2VnvpS89rCh52OkWJxaXbe5ZCC5qJT7O1p8fu4QBO1Uz2/FbQC5HHM8XhKP9v8tZM8paLFNJ8QZkWaLz23Yh1/OCgBYVqOm6Z/E5i5EP7e9Ke5JoW@6Xao5vUtxb@T2Ni6NHInzRnthlttkeYMdQXv@J60W1taBXaLzGyza2tqainxhS/UaIf24Lm7cFBFCiyJbvdFw

