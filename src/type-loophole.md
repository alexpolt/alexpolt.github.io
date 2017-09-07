
##The Great Type Loophole (C++14)

  Recently I was doing some work on retrieving struct data member types. And as I was exploring, 
  researching and testing ideas I uncovered this pearl:

    template<int N> struct tag{};
    
    template<typename T, int N>
    struct loophole_t {
      friend auto loophole(tag<N>) { return T{}; };
    };
    
    auto loophole(tag<0>);
    
    sizeof( loophole_t<std::string, 0> );
    
    ===> std::is_same< std::string, decltype( loophole(tag<0>{}) ) >::value; <===

  **What is the result you think? TRUE!** Check it [here at godbolt.org][c].

  My jaw dropped. I had so much pain creating [struct reader][s] to detect data member types of
  a struct. And it was painfully limited: only literal types, pre-built type list, etc. With this 
  anything becomes possible.

  After some compiler-fight I came up with an elegant ten lines of code header that can create a
  type list from a data structure (with certain limitations) with just C++, no fixed type lists.
  Here is a short example of what it can do:

    using wndclass_tlist = loophole_ns::as_type_list< WNDCLASS >;

    Resulting type list (Visual Studio 2017):

      0. unsigned int
      1. __int64 (__cdecl*)(struct HWND__ * __ptr64,unsigned int,unsigned __int64,__int64)
      2. int
      3. int
      4. struct HINSTANCE__ * __ptr64
      5. struct HICON__ * __ptr64
      6. struct HICON__ * __ptr64
      7. struct HBRUSH__ * __ptr64
      8. wchar_t const * __ptr64
      9. wchar_t const * __ptr64

  <h3>Isn't it awesome!?</h3> 

  This type loophole basically allows us to store some type into a "variable" and later read 
  it back! It's very powerful.

  More examples: we can turn a structure into luple: a lightweight tuple of my design that has 
  the advantage of a stable layout across compilers (at least as far as I tested it):

    struct data {
      float a;
      std::string b;
    };

    using data_tlist = loophole_ns::as_type_list< data >;
    using data_luple = luple< data_tlist >;
    
    data d{ 1.f, "Hello World!" };

    auto& l = reinterpret_cast< wndclass_luple& >( d ); //I know what you feel)
    
    get< std::string >(l) = "Welcome, New World!"
    
    luple_do( l, []( auto& value ) { std::cout << value << "\n"; }

  If you want to know more about how it works and its limitations then check out the code. 
  I provide full **commented source code** of both the type loophole and luple in the 
  [GitHub repo][g]. It works on all three major compilers.

  You can see it in action online at [tio.run][e0], [Coliru][e1], [Ideone][e2], [Rextester][e3].

  You can find a more condensed example of a data member type detector using type loophole 
  [here at godbolt.org][memd] (a slightly other version was initially [provided][redc] by a 
  user named jguegant at Reddit).

  [Sasha Sobol][sa] has come up with an example ([online at Coliru][sa0]) that makes it possible 
  to assign unique IDs to types during compile time (it's instantiation order dependent).

  If you're not comfortable with reading the source code then some nice guy (render787) on Reddit 
  made a [detailed comment][red] that gives a good observation of how this loophole allows the 
  struct data member type information to be acquired. 

  I have not so far examined if that's in violation of the Standard. So, C++ Standard gurus are
  really welcome. The first to [respond at Twitter][simt] was [Simon Brand][sim] who pointed to a 
  defect report [2118][].

  Follow me on [Twitter][t] for updates about my new articles (mostly programming and computer
  graphics). 


  <h3>Finally, some love to our C++ heroes:</h3>

  <center><a href="https://twitter.com/stroustrup" title="Bjarne Stroustrup">
  <img class="img50" src="images/stroustrup-didnt-plan-for-this.png"/></a></center>
  
  <center><a href="https://twitter.com/incomputable" title="Andrei Alexandrescu">
  <img class="img50" src="images/alexandrescu-we-need-this-in-d.png"/></a></center>

  <center><a href="https://twitter.com/chandlerc1024" title="Chandler Carruth">
  <img class="img50" src="images/chandler-carruth-what-is-this.png"/></a></center>

  <center><a href="https://twitter.com/herbsutter" title="Herb Sutter">
  <img class="img50" src="images/herb-sutter-time-out.png"/></a></center>

  I should've generated a meme for every other C++ leader out there like 
  [Scott Meyers](https://twitter.com/scott__meyers), 
  [Stephan T. Lavavej](https://twitter.com/stephantlavavej),
  [Alisdair Meredith](https://twitter.com/alisdairmered),
  [Howard Hinnant](https://howardhinnant.github.io/)
  and basically everyone on [the committee](https://isocpp.org/std/the-committee) and others
  who contribute to the C++.


  [t]: https://twitter.com/poltavsky_alex "Alexandr Poltavsky, Software Developer"
  [g]: https://github.com/alexpolt/luple "Repository for Type Loophole and Luple"
  [c]: https://godbolt.org/g/PHjMPC "The Great Type Loophole"
  [s]: struct-tuple.html "Structure Data Members as a Type List Using Pure C++"
  
  [e0]: https://goo.gl/DxBpmq "Demonstration of the Great Type Loophole at Work at tio.run"
  [e1]: http://coliru.stacked-crooked.com/a/c433a4b5f1bda686 "Demonstration of the Great Type Loophole at Work at Coliru"
  [e2]: https://ideone.com/bw6ch7 "Demonstration of the Great Type Loophole at Work at Ideone"
  [e3]: http://rextester.com/GEQBN34830 "Demonstration of the Great Type Loophole at Work at Rextester"
  
  [sim]: https://twitter.com/TartanLlama "Simon Brand"
  [simt]: https://twitter.com/TartanLlama/status/905306427929001986 "Type Loophole Twitter Post"
  [2118]: http://www.open-std.org/jtc1/sc22/wg21/docs/cwg_active.html#2118 "Core Working Group Defect Report 2118"
  [red]: https://www.reddit.com/r/cpp/comments/6ydxya/the_great_type_loophole/dmmoveu/

  [sa]: https://github.com/sasha-s "Sasha Sobol GitHub"
  [sa0]: http://coliru.stacked-crooked.com/a/6094c5aa5e75e240 "Compile Time Type IDs using Type Loophole"

  [memd]: https://godbolt.org/g/bxcKZY "Member Type Detector using Type Loophole"
  [redc]: https://www.reddit.com/r/cpp/comments/6ydxya/the_great_type_loophole/dmn50vn/ "Type Loophole at Reddit"


