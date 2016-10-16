##C++ Static Objects and Default Member Initializer Hell

  Ran into a nasty problem with how the global static objects are initialized with respect to
  default member initializers. Check the code:

    
    #include <cstdio>
     
    struct test {
     
      int getA() { return _a; }
    
      void setA( int a ) { _a = a; }
     
      int _a{}; 
    };
     
    struct init {
     
      init() {
    
        t.setA( 10 ); //set the value to 10
      } 
     
    static test t;
    };
     
    test init::t; //global static object, default constructed
     
    int main() {
     
      printf( "A = %d\n", init::t.getA() ); // A = 0, check Ideone
     
    }
    

  [Ideone](http://ideone.com/P02SbL)

  As you can guess, **member initializers are the last to be constructed**.


