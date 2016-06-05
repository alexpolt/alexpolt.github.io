
##On dangers of C++ move semantics

  Doing some programming with extensive use of move semantics I had several major bugs in my 
  handling of object state in move constructors/assignment operators and destructors. But it 
  wasn't because of my lack of heed or skill. It was the direct result of having to keep 
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
  C++ is flexible, so you can partially solve this problem by introducing a wrapper around types.
  After all you only need special handling in destructors for resources (memory, handles, etc.).

  After thinking about it, it seems that the introduction of the move constructor/assignment operator
  was a bad idea. All we needed is r-value references for the sake of argument deduction, r-values
  should've been movable by default (and you can't forbid it). If an object is moved then don't call 
  the destructor of such an object - it's empty, no need for move constructors/operators. C++
  would'be been so much simpler!

  Another thing to be aware of:
   
    Base test( Base&& object ) { // should we allow binding of an r-value of derived to base?
    
      return std::move( object ); // worse than slicing
    
    }
    

  No warnings in Clang 3.8.0 or GCC 5.3.0: [Godbolt](https://godbolt.org/g/eVbFBs)


