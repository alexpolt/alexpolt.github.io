
##nuple: a Named Tuple

  While browsing the Internets I came upon this [blog post][vnt] by [Victor Laskin][victor].
  In there he describes an implementation of a named tuple in C++. It just so happened that some 
  time ago I was writing about useful properties of string interning in C++. I quickly realized 
  that another good use of it is to implement a named tuple which I called **nuple** - a named 
  tuple. By the way, you should check up Victor's [blog][vb] if you're a fan of functional 
  programming and C++.

  So, the implementation turned out to be pretty simple. The usage is like this:

    using nameid_t = nuple< $("name"), char const*, $("id"), int >;

  The dollar sign is [string interning][intern] which turns a string literal into a type. All we 
  have to do is to sort this parameter type list into a names list and a type list. The type list
  is then passed to [luple][] which is a lightweight (source code I mean) tuple I created for 
  the [C++ type loophole][l]. The [source code][luple] (GitHub) is short and easy to read 
  (header is **nuple.h**).

  So, here's an example of using it:

    nameid_t n[] = { {"alex", 1}, {"ivan", 2} };
    
    for( auto& v : n )      
      printf( "name: %s, id: %d\n", get<$("name")>(v), get<$("id")>(v) );

  Because **nuple** inherits from **luple** (I'm not good at terminology) we can use all other 
  tuple-like methods:

    auto get_person(int i) { return nameid_t{"john", i}; }
    
    auto p = get_person(3);
    
    printf( "tuple size: %d\n", size(p) );
    
    get<0>(p) = "irene";
    
    get<int>(p) = 4;
    
    printf( "name: %s, id: %d\n", get<$("name")>(p), get<$("id")>(p) );

  See it online [at tio.run][n-tio] (or at [Ideone][n-ide]).

  There is no hacks. It's all valid C++ [source code][luple] (C++14) and can be safely used in 
  production code. There is a limit on string length of 10 characters (sort of arbitrary), you can 
  increase it by editing the $(...) macro in the intern.h header. Or #define N3599 to use [N3599][]
  proposal (adds string literal template to the language) which GCC and Clang implement as an 
  extension.

  Follow me on [Twitter][t] for updates about my new articles (mostly programming and computer
  graphics). 

  [vnt]: http://vitiy.info/named-tuple-for-cplusplus/ "Named tuple for C++"
  [victor]: http://twitter.com/VictorLaskin "Victor Laskin Twitter"
  [vb]: http://vitiy.info/ "Victor Laskin's Blog"
  [intern]: intern.html "Useful Properties of String Interning in C++"
  [l]: type-loophole.html "The C++ Type Loophole (C++14)"
  [luple]: https://github.com/alexpolt/luple/
  [t]: https://twitter.com/poltavsky_alex "Alexandr Poltavsky, Software Developer"

  [n-tio]: https://goo.gl/EMWgBG "nuple Online Example"
  [n-ide]: https://ideone.com/uvZ3uZ "nuple Online Example"

  [N3599]: http://open-std.org/JTC1/SC22/WG21/docs/papers/2013/n3599.html "Literal operator templates for strings"

  

