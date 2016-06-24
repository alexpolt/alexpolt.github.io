
##Lock-free programming from a different angle. New general purpose lock-free data structure.

  Perhaps every article on lock-free programming should start with a warning - it's extremely
  hard to do right. It is so hard, that even the giants are making mistakes. For example,
  Andrei Alexandrescu in his now dated article solves the lifetime management hurdle but
  compeletely ignores the ABA problem. Or take a look at this slide by Herb Sutter. Do you
  see the problem? It contains a race condition. It doesn't say anything about their
  skill, it's just a reminder to all of us, developers, that parallel programming (and
  programming in general) is so damn hard. 
  
  In this article I will talk about the lifetime management problem and the ABA. I will also 
  describe a relatively new lock-free data structure **atomic_data**. It solves the above two
  problems and offers a general enough approach to serve as a foundation for robust lock-free
  algorithms. But first we'll take a more thorough look at what CAS (Compare-And-Swap) does and 
  compare it to LL/SC (Load Linked/Store Condtional).


  As a reminder, there are three levels of guarantees: wait-free, lock-free and obstruction
  free. Wait-free is the strongest: operations on shared data never fail. This could be 
  achieved, for example, when reading and updating is a single atomic operation (message 
  queue based algorithms are also technically wait-free). Lock-free assumes that some 
  operations may fail, but progress is guaranteed in a fixed number of steps. And finally 
  obstruction free means progress under no contention from other threads.

  The workhorses of lock-free algorithms are RMV ( Read-Modify-Write ) operations: 
  CAS (compare and swap) and LL/SC (load-linked/store-conditional). We'll try to get a fresh
  look at them below.


###CAS (compare and swap)

  CAS is the basic building block for all lock-free algorithms. It 



