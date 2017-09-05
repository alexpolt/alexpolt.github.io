
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

  Or we can turn a structure into luple: a lightweight luple of my design that has the advantage 
  of a stable layout across compilers (at least as far as I tested it):

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

  If you want to know more about how it works then check out the code: I provide full commented 
  source code of both the type loophole and luple in the [GitHub repo][g].

  You can see it in action online at [tio.run][e0], [Coliru][e1], [Ideone][e2], [Rextester][e3].

  I have not so far examined if that's in violation of the Standard. So, c++ Standard gurus are
  really welcome.

  Follow me on [Twitter][t] for updates about my new articles (mostly programming and computer
  graphics). 
  
  <h3>Finally, some love to our C++ heroes:</h3>

  <center><img class="img50" src="images/stroustrup-didnt-plan-for-this.png"/></center>
  
  <center><img class="img50" src="images/alexandrescu-we-need-this-in-d.png"/></center>

  <center><img class="img50" src="images/chandler-carruth-what-is-this.png"/></center>

  <center><img class="img50" src="images/herb-sutter-time-out.png"/></center>


  [t]: https://twitter.com/poltavsky_alex "Alexandr Poltavsky, Software Developer"
  [g]: https://github.com/alexpolt/luple "Repository for Type Loophole and Luple"
  [c]: https://godbolt.org/g/PHjMPC "The Great Type Loophole"
  [s]: http://alexpolt.github.io/struct-tuple.html "Structure Data Members as a Type List Using Pure C++"
  
  [e0]: https://goo.gl/DxBpmq "Demonstration of the Great Type Loophole at Work at tio.run"
  [e1]: http://coliru.stacked-crooked.com/a/36ed9873b5386508 "Demonstration of the Great Type Loophole at Work at Coliru"
  [e2]: https://ideone.com/Bj5fje "Demonstration of the Great Type Loophole at Work at Ideone"
  [e3]: http://rextester.com/XTRLU84508 "Demonstration of the Great Type Loophole at Work at Rextester"
  

