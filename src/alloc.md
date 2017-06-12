
##Memory Allocation Wisdom

  Memory allocators are in fact primitive garbage collectors: one has to decide when it's okay
  to reclaim memory back to OS. Modern garbage collectors are very sophisticated machines when 
  it comes to memory handling and I thought we should take some lessons from them.

  For example, consider the following case:

    std::ifstream file{ "somefile.txt" }
    
    std::string line;
    
    while( std::getline( file, line ) ) {
      ...
    }

  Here we read a file line by line and store lines perhaps in a map or a vector. Now, think about
  memory allocation. Because you have to store the lines, you'll allocate memory and copy on every
  iteration.

  Now what we can learn from garbage collectors is that some objects are persistent, such objects
  usually live till the end of the program. In the above example the generated strings could be 
  such objects. We can rig our string with an allocator that will allocate memory in big chunks 
  and use bump allocation from these chunks. It doesn't need to free memory because it's assumed
  that memory is going to be held till the end. Here is some incomplete code:

    template<typename T>
    allocator {
      
      using value_type = T;
      
      T* allocate( size_t ); //allocates memory from chunks by bumping up an offset
      
      void deallocate( T*, size_t ); // does nothing
      
      size_t chunk_size;
      
      std::shared_ptr< chunk > chunk_list; //points to a list of chunks and uses a custom deleter
    };
    
    std::string line{ allocator{ 1024 } }; //chunk size 1024


  From the code you can get the general idea of how it works. The allocator keeps a list of
  chunks and serves memory on demand. All the copied strings will share the allocator with 
  shared\_ptr responsible for deallocation using a custom deleter;


