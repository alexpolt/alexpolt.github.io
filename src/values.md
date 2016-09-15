
##Value Semantics

  Lengthy articles are written about value semantics. Now it's my turn and I will try to be short.

  First, what is a value? A value is the content of an object. There are different types of values,
  depending on the usage.

  *Value semantics* in C++ is defined by passing objects by value (in contrast to by pointer or by
  reference) and this requirement recursively holds for all data members. It has a direct relation 
  to functional style of programming (add to that immutability).

  Even if you use pointers in your data, you still can maintain value semantics for them. Here is
  a wrapper over a pointer that provides value-like behaviour:

    
    template<class T0> struct value_wrapper {
    
        value_wrapper( T0* data_ ) : data{ data_ } {}
    
        value_wrapper() : data{ new T0{} } {}
    
        value_wrapper( const value_wrapper& other ) : value_wrapper{} {
            *data = *other.data;
        }
    
        value_wrapper& operator=( const value_wrapper& other ) { 
            //could've used copy-and-swap
            *data = *other.data;
        }
    
        ~value_wrapper() {
            delete data;
        }
    
        //move construction and assigment
        //other operators, member functions
    
        T0* data;

    };

  [Ideone](http://ideone.com/FBaLtw)

