
##String Interning in C++

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

    #define intern(s) interned<ch(s,0),ch(s,1),ch(s,2),ch(s,3),ch(s,4),ch(s,5),ch(s,6)>::value

  The idea is simple: turn a string into a type and use the powers of linker to collapse all
  instances into one.

  An example of using it:

    printf( "%p: %s", &intern("Hellow"), intern("Hellow") );

  Check it online at [Ideone](https://ideone.com/AoT5EJ).


