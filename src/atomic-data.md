
##atomic\_data: A Multibyte General Purpose Lock-Free Data Structure


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

  A one of kind resource the Internet about multithreaded programming, memory barriers,
  lock-free techniques, etc. is the website by [Jeff Preshing](http://preshing.com/about/). 


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


  **Now to the evils that hunt lock-free programming.** Here is a picture of a stack and two
  threads doing work.

 <center>![](images/The-ABA-Problem.png)</center>


###Evil Number One: the ABA

  As we observed above, CAS on pointers ties together the pointer and the data it points to.
  ABA happens when our idea about this relationship no longer holds true: the state of shared 
  data has changed (broken invariant) and we are unable to detect that with the CAS (LL/LC is 
  immune to this problem) on the pointer, because that pointer might have been deleted and 
  reallocated again. The ABA results in lost data and invalid data structure.

  ABA can be solved in a number of ways: GC, hazard pointers, versioned pointers. Another solution
  is to make the data immutable in a strict sense. I mean, not only the data itself is constant,
  but also the address it occupies is unique. This is the way a versioned pointer works: we add
  a version tag to the pointer and this has the effect of increasing the address space.

  It really helps to think about lock-free operations in the following way: as soon as we touched 
  any piece of shared data - we initiated a transaction, and the transaction should behave
  as stated by the ACID rules. 


###Evil Number Two: Lifetime Management

 <center>![](images/atomic-cat.png)</center>

  In the above image the cat is an object. The object lifetime problem in multithreaded programming 
  is fundamental because at any point in time shared data could be accessed by a thread. Even 
  using locks won't be of great service here. Again, GC, hazard pointers or using  shared\_ptr 
  can help, but they all are not ideal. GC needs a stop-the-world pause, hazard pointers require
  checking all threads, reference counting is a performance hit and might break out of control.
  
  Now it is time for me to introduce **atomic_data** that is a good compromise between having a 
  lock-free data structure and avoiding the ABA and lifetime issues.

###atomic\_data: A Multibyte General Purpose Lock-Free Data Structure

  atomic\_data is a variant of RCU (Read-Copy-Update). Actually, at first I didn't know that fact,
  but then, while exploring, I came upon this [page](http://www.rdrop.com/~paulmck/RCU/) by 
  Paul McKenney. After studying different implementations I came to a conclusion that 
  atomic\_data has a novel design and therefore has some value for the community. But if you 
  feel like that was already done before - feel free to leave a comment.

  The one important aspect that divides RCU techniques is in how reclamation of used memory is
  done. We need a grace period - when data is no longer accessed by threads - to do cleaning.
  This way we solve the lifetime management problem but not necessarily the ABA problem. 
  
  atomic\_data is a template that wraps any data structure. There is a static preallocated queue 
  of this data of desired length (power of two). C++ rules for templates and static data makes it
  one per data type. The following illustration will make it easier to understand.


  During operation the update and read methods are being called that accept a lambda  as a 
  parameter provided by the user. It atomically allocates an element from the queue, makes a 
  copy of the current data and passes it to the lambda. After lambda finishes the update method
  tries to do CAS on the pointer to current data. In case of failure the steps are repeated.
  On success the now old data element is being atomically returned to the queue.

  So how do we avoid reusing old data and the ABA problem? That's where atomic\_data differs:
  we introduce a synchronization barrier when the left pointer (atomic integer) modulo N 
  (length of the queue) equals zero. The barrier separates used elements from unused. By
  waiting at the barrier for the condition *(right - left) == N* (N - length of the queue) 
  we make the used elements ready to be used again. This solves the lifetime and ABA problems 
  at once. By increasing the length of the queue we are able to offset the cost of this
  synchronization.

  But careful readers noticed that some elements in the queue might still be accessed by readers.
  There are a number of options to solve this. atomic\_data uses a static atomic reader counter
  with relaxed memory order (one per data type). Yes, this adds a point of contention, but it's a 
  good compromise because makes it easy to check for readers at the synchronization barrier.

  To summarize the cost of atomic\_data: two relaxed atomic increments/decrements for readers,
  two CAS and data structure copy for writers (optimistic scenario), and on hitting barrier
  we wait for all threads to stop working with data.





