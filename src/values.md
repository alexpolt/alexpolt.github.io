
##Value semantics

  Lengthy articles are written about value semantics. Now it's my turn and I will try to be short.

  First, what is a value? A value is the content of an object. There are different types of values,
  depending on the usage.

  *Value semantics*: manipulating with the value of an object directly without any sort of a proxy.
  Proxies are usually pointers. Although you could come up with other sorts of addressing the object.
  Whether references are such proxies too is questionable. To me references seem more like a way 
  to change the scope of an object.

  C++ allows one to create a wrapper class containing a pointer to an object, that will behave as
  a value.

    
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

