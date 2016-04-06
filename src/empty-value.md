
##Why we should abandon move constructors and move assignment operators

  The title is a bit radical. The things are not that bad, but certainly there are *serious perils*.

  Doing some programming with extensive use of move semantics I had several major bugs due to being 
  sloppy in my handling of object state in move constructors/assignment operators and destructors.
  But it wasn't because of my lack of heed or skill. It was the direct result of having to keep 
  synchronized three places in the code: move constructor/assignment operator and destructor.

  So consider this:


    struct test {
    
      ...constructors...
    
      test( test&& other ) : data{ other.data } { //better to always std::move 
        other.data = nullptr; //<------
      }
    
      test& operator==( test&& other ) { //may be unnecessary if using copy-and-swap idiom
        data = other.data; //for simplicity
        other.data = nullptr; //<------
        return *this;
      }
    
      ~test() {
        if( data ) { //<------
          ...
        }
      }
    
      void *data;
    
    };


  Three places! Well, okay, minimum two places that you have to keep track of and keep in sync.
  Now, all that pain would be justified if only there were no choice. But we have a choice! 
  So here is my idea. 

> *If we make the firm statement that a bind to an r-value reference parameter is always followed 
> by a move (sensible requirement), then we can assume that the r-value has become an empty value. 
> So don't call a destructor on such a value.*

  Do you see? If we have that rule, then suddenly you don't need any of that mess with checking 
  `if( data ) blah blah` (at least the part related to move implementation). Okay. We don't have 
  to abandon our beloved move constructors and move assignment operators. Let's just introduce 
  the rule (sorry for the lame language):

> *An empty value is an r-value after being bound to an r-value reference function parameter 
> in a function call and the end of the function call. If the class of the empty value object 
> doesn't have a user-defined move constructor then skip destructing that object.*

  This way the user has a choice (the user can =default the move constructor for example or have 
  implicit one) and avoid extra bugs in their code.

  PS. I am really not sure if I haven't missed something important. Would be grateful for any 
  critique.


