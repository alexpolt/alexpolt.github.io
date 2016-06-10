
##Parallel programming is like Quantum Mechanics

  Actually, the article is not about parallel programming in general, but just about one 
  particular aspect - lock-free programming. The reason for the title will become clear 
  later. Also I will introduce a relatively new atomic data structure *atomic_data*.

  As a reminder, there are three levels of guarantees: wait-free, lock-free and obstruction
  free. Wait-free is the strongest, all operations on  data always succeed. This could be 
  achieved when reading and updating is one single atomic operation, for example, or messaging
  is also technically wait-free. Lock-free assumes that some operations may fail, but progress
  is guaranteed in a fixed number of steps. And finally obstruction free means progress 
  under no contention from other threads.

  The workhorses of lock-free algorithms are RMV ( Read-Modify-Write ) operations: 
  CAS (compare and swap) and LL/SC (load-linked/store-conditional).


###CAS (compare and swap)

  CAS is the basic building block for all lock-free algorithms. It 

