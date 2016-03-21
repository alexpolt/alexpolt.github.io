  
# Value semantics

  One can find a lot of information on the Internet about it. In my view value semantics has 
  just one requirement - a copy operation (copy-assingment, copy-construction) on an object 
  produces an independent copy. 
  
  Also, don't confuse a pointer (that's an object in itself) and  an object it points to. Using 
  pointers doesn't mean it's not value semantics. But if you use pointers as a *moniker* for 
  an object (happens almost all the time), than copying  them breaks value semantics. On the other
  hand references in C++ support value semantics (that is a weighty statement here).
  
  Notice that C++ allows one to design a wrapper, that will contain a pointer, and produce real 
  copies of referred-to object on assignments, thus providing value-like behaviour. There is 
  probably little to no reason to do so. And usually value semantics means using objects directly.

  So one *very important advantage* of using objects as values is **avoiding dynamic memory allocation**.
  For some objects it could mean *thousands* of dynamic memory allocations and deallocations.


