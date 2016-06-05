
##unique_ptr -> unique

  *unique_ptr* is well-known design patters, but it is limited to memory handling. In practice
  we need the same semantics (owning and RAII) for other resources too. So I suggest adding
  *unique* as a more general wrapper (sample code):


    template<typename T0> struct unique {
    
      unique( T0 handle ) : handle{ std::move( handle ) } { }

      unique( unique const &) = delete; //no copy
      unique& operator=( unique const & ) = delete; //no assignment
    
      unique( unique&& r ) : handle{} {
        using std::swap;
        swap( handle, r.handle );
      }
    
      unique& operator=( unique&& r ) {
        ~unique();
        using std::swap;
        swap( handle, r.handle );
        return *this;
      }

      ~unique();
    
      T0 handle;
    }
    
    
    template<> unique<FILE*>::~unique() {
      fclose( handle );
    }


  By specializing *unique* you can provide custom destructors for your needs.


