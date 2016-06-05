
##A better alternative to shared_ptr for shared ownership

  *shared_ptr* is notorious for the problems it brings into the codebase. The idea is neat and
  simple - reference counting. But, as the complexity and size of the code grows, two questions 
  begin to hunt the programmer: who owns that object and why is it hanging around.

  I've come up with an alternative to that, that allows for controlled shared ownership.
  First, we forbid implicit copying. Second, we introduce two methods: *link( owner )* 
  and link_unsafe(), whose purpose is to create copies that can be moved. This way we
  can track the backreferences, which brings control to our codebase.


    template<typename T0> struct shared {
        
        shared&& link( shared const & owner) {
          //create copy and also add backreference into global table
        }
        
        shared&& link_unsafe() {
          //create copy
        }
        
        ... //implementation details
        
    private:
        shared( shared const& ); //private copy
    }
    
    namespace global {
      std::map<shared, shared> linking; //now you should feel safe
    }


