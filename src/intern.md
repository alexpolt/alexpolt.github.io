
##Useful Properties of String Interning in C++

  String interning is useful because it saves space and also allows for fast string comparsion
  for equality by comparing just the pointers. And it is possible to do it quite easily in pure
  C++:

    template<char... N> struct interned {
      
      static char const value[];
    };
    
    template<char... N> char const interned<N...>::value[]{N...};
    
    template<int N>
    constexpr char ch(char const(&s)[N], int i) {
      return i < N ? s[i] : '\0';
    }
    
    #define $(s) interned<ch(s,0),ch(s,1),ch(s,2),ch(s,3),ch(s,4),ch(s,5),ch(s,6) ... >

  The idea is simple: turn a string into a type and use the powers of linker to collapse all
  instances into one. Full [source code][intern] at Github.

  Here's how to use it:

    std::cout << $("interned string")::value;

  Right now it has a limit on string length. You can increase it by editing the $(...) macro in
  the **intern.h** header. I didn't know at first, but there is a proposal to add this capability 
  to the standard: [N3599][] "Literal operator templates for strings" by [Richard Smith][rich]. 
  GCC and Clang already provide it as an extension, I hope MSVC catches up. [Ruslan Abdikeev][a] 
  provided a [sample][gista1] showing it in code. To use this extension just **#define N3599** 
  before including the header.

  String interning turns a string into a type and as such allows for a number of other nice things.

  We can use it as a template parameter:

      template<typename T> struct tag {};
      
      using tag_int = tag< $("int") >;

  or for overload resolution:

      void method( $("apple") ) { ... }
      void method( $("orange") ) { ... }
      
      method( $("apple"){} );

  It can also be used as a simple type id system:

    #define $typeid(s) $( #s )::value

    using typeid_t = void const*;

    struct data {
    
      constexpr static typeid_t tid = $typeid( data ); //address is unique
    };

  See it in action online [here at tio.run][i-tio] (or at [Coliru][i-col]).

  We can also use it in place of enums because it has a fixed address. Maybe not really good idea 
  if you have hundreds of enums but for a couple it has the advantage of being self-describing.

  Have you ever been in a situation when you have a small fixed set of name-value pairs and you
  wanted to map them in your program. Some programmers would create a small hash map for this.
  But there is simpler and more efficient method using the same style as in string interning:

    template<typename K, typename V> struct map {
      static V value;
    }
    
    template<typename K, typename V> map<K,V>::value{};
    
    map< $("singleton") >::value.do_action();

  You can try it [online at tio.run][m-tio] ( or at [Ideone][m-ide] ).

  Another use is program internationalization: we can run some code for every interned string 
  (just another static member) that will populate a map with strings that can later be used
  for translation. Or we can apply the above mapping trick for that. The only problem is added
  linker work.

  Because we now have the characters of a string as a parameter pack, we can parse it and do all 
  sort of hacks with it. We can create a list of types for example or anything else. Just as an 
  example here's a primitive calculator that can only add or subtract integer numbers:

      printf( "calc(100+20-10) = %d\n", calc_t("100+20-10")::value );
      
      Output: calc(100+20-10) = 110

  You can try it [online at tio.run][c-tio] ( or at [Ideone][c-ide] ).

  **Update.** It also let's us create a [named tuple][nuple] with a neat interface.

  The source code for string interning is in the intern.h header at [Github][intern].


  [intern]: https://github.com/alexpolt/luple "C++ String Interning"
  [rich]: https://twitter.com/zygoloid "Richard Smith"
  [a]: https://twitter.com/aruslan "Ruslan Abdikeev"
  [gista1]: https://gist.github.com/alexpolt/532b48b9353e98e276b79296ec9f4ab6 "C++ String Interning"
  [N3599]: http://open-std.org/JTC1/SC22/WG21/docs/papers/2013/n3599.html "Literal operator templates for strings"
  [i-tio]: https://goo.gl/sBtBKn "C++ String Interning Online Example at tio.run"
  [i-col]: http://coliru.stacked-crooked.com/a/ad43084765b89d9c "C++ String Interning Online Example at Coliru"
  [m-tio]: https://goo.gl/ghbfQK "Linkin Using String Interning"
  [m-ide]: https://ideone.com/A9Vk6q "Linkin Using String Interning"
  [c-tio]: https://goo.gl/5gJ3vB "C++ String Interning Calculator Example"
  [c-ide]: https://ideone.com/tDWfwI "C++ String Interning Calculator"
  [nuple]: named-tuple.html "nuple: a Named Tuple"

