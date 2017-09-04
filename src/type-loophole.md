
##The Great Type Loophole (C++14)

  Recently I was doing some work on retrieving struct data member types. And as I was exploring, 
  researching and testing ideas I uncovered this pearl:

    auto loophole();
    
    template<typename T>
    struct loophole_t {
      friend auto loophole() { return T{}; };
    };
    
    sizeof( loophole_t<std::string> );
    
    std::is_same< std::string, decltype( loophole() ) >::value == true;

  **If you're not screaming right now in excitement or screaming not loud enough then read on.** 
   But first, I made a C++ meme:




https://godbolt.org/g/qZU8rx


