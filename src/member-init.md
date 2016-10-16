
##C++ Templates and Static Initialization Order

  Ran into a nasty problem with how the global static objects are initialized in templates.
  Check the code:


    #include <cstdio>
    
    struct test {
    
      test() : _a{} { }
      
      int getA() { return _a; }
      int setA(int a) { return _a = a; }
    
      int _a; 
    };
    
    template<class T>
    struct init {
      
      init() {
        //init objects
        t1.setA( 10 );
        t2.setA( 10 );
      } 
      
    static test t1;
    static test t2;
    };
    
    //declare static objects
    template<class T> test init<T>::t1;
    template<class T> test init<T>::t2;
    
    //test instantiation
    template test init<void>::t2;
    
    //init t1 and t2
    init<void> I;
    
    int main() {
      
    
      printf( "t1.A = %d\n", I.t1.getA() );
      printf( "t2.A = %d\n", I.t2.getA() );
      
      return 0;
    }
    
    Output:
    
    t1.A = 0
    t2.A = 10

  [Ideone](http://ideone.com/P02SbL)


  There is a good explanation on [Stackoverflow][1] of the Hell happening.


  [1]: http://stackoverflow.com/questions/1819131/c-static-member-initalization-template-fun-inside



