
##On dangers of C++ move semantics

> Update: I realized that the greatest C++ design mistake is that r-values were copied.
> They must've been moved. Then today we woulnd't have to deal with all that problems
> surrounding move semantics (constructors, exceptions, etc.), skip the complexity part. 
> Then the only operator we would've needed is move( object) to turn l-value into r-value in place.
> Right now c++ move is essentially a copy. Read on the post to understand what I'm talking about.

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

  If we make the firm statement that a bind to an r-value reference parameter is **always followed 
  by a move (sensible requirement)**, then we can assume that the r-value has become an empty value. 
  So don't call a destructor on such a value.

  If we have that rule then suddenly you don't need any of the code with checking in the 
  destructor (at least the part related to move implementation). Actually we don't have 
  to ditch move constructors and move assignment operators. Let's just introduce a new rule (sorry 
  for the lame language, I'm not a spec guy):

> *An empty value is an r-value after being bound to an r-value reference function parameter 
> in a function call and the end of the function call. If the class of the empty value object 
> doesn't have a user-defined move constructor/move assignment operator then skip destructing 
> that object.*

  This way the user has the choice (the user can =default the move constructor for example or have 
  implicit one) and avoid extra bugs in their code.

  PS. I am really not sure if I haven't missed something important. Would be grateful for any 
  criticism.

  PS2. While writing this post I realized another danger of current state of moving semantics
  in C++. Here is the code:


    #include <cstdio>
    #include <utility>
    
    
    //simple class A that accepts some pointer

    struct A {

      A( int *data_ ) : data{ data_ } {}

      A( A&& other ) : data{ other.data } {

        printf("Call to A( A&& )\n");

        other.data = nullptr; //<--- moved and nulled

      }

      ~A(){ }
      
      int *data;

    };


    //B inherist from A and supplies it with a pointer
    
    struct B : A {

      B() : A{ new int{1} }  { }

      B( B&& other ) : A{ std::move(other) }  { }

      ~B(){ 
        if( !A::data ) //<--- never should happen
              printf("CRASH!\n");
        else  printf("OK!\n");

        //delete A::data;
      }

    };
    
    
    void test( A&& object ) { //<--- should we allow binding of an r-value of derived B to base A&&? 

      A a{ std::move( object ) }; //Worse than slicing.

    }
    
    
    int main() {
    
      test( B{} );
    
    }


  [Ideone](http://ideone.com/yOcawV) 
  
  No warnings in Clang 3.8.0 or GCC 5.3.0: [Godbolt](https://godbolt.org/g/eVbFBs)


