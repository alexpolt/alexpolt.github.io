
## C++ properties

   C++ allows one to have syntatic sugar for properties. Here's how.

    
    template<class T0> struct prop {

        void operator()() {
          return data;
        }

        void operator()( T0 data_ ) {
          data = static_cast<T&&>( data_ ); //data_ is always a copy, so move it
        }

        T0 data;
    };


    struct test {
        prop<int> data;
    };

    int main() {
      
      test t0{};
      
      t0.data( 1 );
    }

  [Github](https://github.com/alexpolt/poetry/blob/master/cpp-property.cpp) [Ideone](http://ideone.com/oAUNuO)

