
##atomic_data: A Multibyte General Purpose Lock-Free Data Structure


  Perhaps every article on lock-free programming should start with a warning that it's extremely
  hard to do right. There are certain subtle effects that lead to hard-to-catch bugs. Also, in
  an attempt to deal with it lock-free data structures and algorithms quickly become monstrous
  and entangled. Is it possible to keep everything simple and avoid bugs at the same time? We'll
  talk about it.
  
  This article discusses two major problems in the lock-free Universe: the lifetime management 
  problem and the root cause of the ABA. Also we will describe a relatively new lock-free 
  data structure **atomic_data**. It solves the above two problems and offers a general enough 
  approach to serve as a foundation for robust lock-free algorithms. 
  
  As a reminder, there are three levels of guarantees: **wait-free, lock-free and obstruction
  free**. Wait-free is the strongest: operations on shared data basically never fail. This could 
  be achieved, for example, when reading and updating is a single atomic operation. Lock-free 
  assumes that some operations may fail, but progress is guaranteed in a fixed number of steps. 
  And finally obstruction free means progress under no contention from other threads.

  There are two major primitives/ways for doing lock-free programming:  **CAS** (compare and swap) 
  and  **LL/SC** (load-linked/store-conditional. These are RMW ( Read-Modify-Write ) operations, 
  but they are not equivalent. Also important is the fact that these operations acquire additional 
  semantics when operating on pointers.


###CAS (Compare-And-Swap)

  CAS is an indivisible operation (*[lock] cmpxchg* instruction on x86) that compares an expected
  value at a memory address and replaces it with a desired value, on fail it returns the current 
  value. Using CAS you could implement things like an atomic increment and basically any other
  atomic arithmetic operation. 
  
  But it gains additional meaning when used on pointers. Using CAS on a pointer could also be 
  viewed as a rename with a check. Actually *rename* is the way you do atomic file modifications 
  in Linux (rename system call is atomic if on the same device). Also important is that it 
  establishes an equivalence relationship between the pointer and the data it points to. In the 
  section on ABA we'll see how it plays out. 
  
  CAS provides the lock-free level of guarantee.


###LL/SC (Load Linked/Store Conditional).
  
  LL/SC operates with the help of a *link register* (one per core). By doing a special read 
  (lwarx on PowerPC, ldrex on ARM) the link register is initialized. Any processing is then 
  allowed and finished with a conditional store (stwcx on PowerPC, strex on ARM). 
  
  LL/SC is orthogonal to CAS because it's not comparing anything. It is also more general and 
  robust. But it requires more work from the OS developers: on context  switch a dummy conditional 
  store is necessary to clear the reservation. This also could manifest itself under heavy 
  contention: LL/SC could theoretically become obstruction free (CAS is always lock-free because 
  at least one thread will always succeed).


  Now to the problems that hunt lock-free programming. Here is a picture of a stack and two
  threads doing work.

 <center>![](images/The-ABA-Problem.png)</center>

  The above illustration shows two major evils in the lock-free world: the ABA and lifetime
  management. Can you spot them?

##Evil number one: The ABA

  Often it is also referred to as a reordering problem.





