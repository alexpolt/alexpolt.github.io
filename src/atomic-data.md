
##**atomic\_data**: A Multibyte General Purpose Lock-Free Data Structure


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

  A one of kind resource on the Internet about multithreaded programming, memory barriers,
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

###**atomic\_data**: A Multibyte General Purpose Lock-Free Data Structure

  **atomic\_data** is a variant of RCU (Read-Copy-Update). Actually, at first I didn't know that fact,
  but then, while exploring, I came upon this [page](http://www.rdrop.com/~paulmck/RCU/) by 
  Paul McKenney. After studying different implementations I came to a conclusion that 
  **atomic\_data** has a novel design and therefore has some value for the community. But if you 
  feel like that was already done before - feel free to leave a comment.

  The one important aspect that divides RCU techniques is in how reclamation of used memory is
  done. We need a grace period - when data is no longer accessed by threads - to do cleaning.
  This way we solve the lifetime management problem but not necessarily the ABA problem. 
  
  **atomic\_data** is a template that wraps any data structure. There is a static preallocated 
  circular lock-free queue of this data of desired length. C++ rules for templates and static 
  data makes it one instance per data type. The following illustration will make it easier to 
  understand.

 <center>![](images/atomic-data.png)</center>

  During operation the update and read methods are being called that accept a functor (a lambda)
  as a parameter provided by the user. It atomically allocates an element from the circular 
  lock-free queue, makes a copy of the current data and passes it to the functor. After the functor 
  finishes, the update method tries to do CAS on the pointer to current data. In case of a failure 
  the steps are repeated. On success the now old data element is being atomically returned to the 
  circular queue. There is also an *update\_weak* method that doesn't loop and returns a boolean.

  So how do we avoid reusing used data and the ABA problem? That's where **atomic\_data** differs:
  we introduce *a synchronization barrier* when the left pointer (atomic integer) modulo N
  (length of the queue) equals zero.  The barrier separates used elements from unused. By waiting 
  at the barrier for the usage counter (readers + writers) to become zero we make sure that no 
  threads access the data elements from the queue in the update method. The used elements are now 
  ready to be safely used again. This solves the lifetime and ABA problems at once. By increasing 
  the length of the queue we are able to offset the cost of this synchronization.


###Performance Cost

  For readers: an atomic increment and a decrement for the usage counter with relaxed memory order. 
  For writers: it is four relaxed increments/decrements, a data structure copy and a CAS on the 
  data pointer. On hitting the barrier we wait for all threads (usage counter) to stop working with 
  data.


###Exceptions

  **atomic\_data** dynamically constructs queue elements in the constructor and deletes in the
  destructor. It doesn't catch exceptions there. The *read* and *update* methods don't catch 
  exceptions, but leave **atomic\_data** in the correct state.


###Shortcomings of **atomic\_data**

  Although **atomic\_data** is quite robust and lock-free, it is still a compromise. First, there
  is a contention point on the usage counter. Secondly, there is a sync barrier. Upon hitting this
  barrier we should wait for all threads - writers and readers - to finish their work.

  Also it's not tolerant to a thread kill or suspension. But this seems far-fetched. We write
  our programs under the assumption that the hardware and OS will behave as documented. Threads 
  are no worse than processes. There should be no unexpected thread/process kill signals or 
  suspensions. It's a completely different story if a programmer does that on purpose.

  **atomic\_data::update** is not reentrable for a thread: calling **atomic\_data::update** from 
  inside **atomic\_data::update** can cause an infinite wait on the barrier.


###How Long Should Be the Queue of Preallocated Data Elements?
  
  This question might seem to be trivial, but it leads to interesting results on the pros/cons
  of lock-free data structures. For update-only scenarios it doesn't make much sense to have a 
  lengthy queue because only one thread will ever succeed, all other threads will do useless 
  work. In fact there is a better concurrent data structure for such cases: messaging queues.
  A messaging queue allows one to monitor the load, also messages can be reordered for better
  efficiency. And it's relatively easy to implement.

  For other cases it makes sense to make the queue length equal the number of threads (and power 
  of two for better efficiency). You should really measure the frequency of sync events to make a 
  good decision. For example, if reading isn't fast then it makes sense to bump up the queue size.


###Code Samples

  **atomic\_data** is easy to use and it works on any copyable data structure. Although you should 
  always keep in mind the cost of copying.

  Let's implement an atomic lock-free array. The threads will scan the array and increment the
  minimal value:


        template<typename T, size_t N>
        struct atomic_array {
            static const size_t size = N;
            T data[N];
        };
        
        using array_t = atomic_array<unsigned, 16>;
        
        atomic_data<array_t, 4> array0;
        
        //called by each thread
        void update_array() {
          array0.update( []( array_t* array_new ) {
        
            unsigned min = -1;
            size_t min_index = 0;
        
            //look up minimum value
            for( size_t i = 0; i < array_t.size; i++ ) {
                if( array_new->data[i] < min ) {
                  min = array_new->data[i];
                  min_index = i;
                }
            }
        
            array_new->data[ min_index ]++;
        
          } );
        }

  Here is the [Ideone](http://ideone.com/ExtrT5) example (everything in a single file, the above 
  algorithm is at the end of the code).

  Remember, you can't touch any data that doesn't belong to **atomic\_data**. So, for example, you 
  can't really make a double ended linked list, unless you make the size fixed and store the entire 
  list in the **atomic\_data**.


###Lock-free std::map?

  Actually the design of the **atomic\_data** makes it easy to make std::map (or anything else) 
  lock-free. 


        atomic_data< std::map<key,value> > atomic_map0;
        
        atomic_map0.update( []( auto *map_new ) {
            map_new->insert( { key, value } );
        } );
        
        atomic_map0.read( [&value]( auto *map ) mutable {
            auto it = map->find( key );
            if( it != map->end() ) value = *it;
        } );


  Technically it isn't lock-free because of memory allocation. To make it truly lock-free we
  need to implement a lock-free allocator and the design of **atomic\_data** helps: defer memory
  freeing by storing a pointer in a data field and then, in a copy constructor, you check for it.
  Since data elements from the queue are allocated atomically to every thread, it's going to be 
  safe.



