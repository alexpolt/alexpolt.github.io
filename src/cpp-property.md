
## C++ properties

   C++ allows one to have syntatic sugar for properties. Here's how.

    
    #include <cstdio>
    
    template<class T0> struct prop {
    
        T0 operator()() {
          return data;
        }
    
        void operator()( T0 data_ ) {
          data = static_cast<T0&&>( data_ ); //data_ is always a copy, so move it
        }
    
        T0 data;
    };
    
    
    struct test {
        prop<int> data;
    };
    
    
    int main() {
    
      test t0{};
    
      t0.data( 10 );
      
      printf( "data = %d\n", t0.data() );
      
    }

  [Github](https://github.com/alexpolt/poetry/blob/master/cpp-properties.cpp) [Ideone](http://ideone.com/oAUNuO)

