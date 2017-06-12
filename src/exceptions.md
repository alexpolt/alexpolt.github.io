
##C++ Exceptions

  I guess every C++ programmer out there have struggled with the question of
  whether or not to use exceptions. Some say they complicate the code, others that
  they are a serious performance hit.

  I also gave it some time. After long hours of musing on the subject, coming up
  with examples - no matter how hard I tried to come up with a better solution for
  error handling, I always landed with something similar to exceptions.

  You need some registration mechanism on entering a scope to get the best out of RAII.
  Also exceptions remove that obnoxious *check and return* pattern.
  Exceptions make you aware of the cost of a function call, so you are mildly pushed to
  rearrange your data and algorithms.

  So my conclusion is: *always use exceptions*, just use them right. 
  There is only one case for not using them, that is in real-time critical code (but you 
  always have the option of redesigning algorithms to offset the cost of exceptions).

  My personal checklist when using exceptions is this:
  
  * any problem related to resources (network connection, files, memory etc.) should end with 
    an exception
  * any sort of bad input from outside world: wrong numbers, corrupted files, invalid input
  * don't use exceptions for checking preconditions (use types and asserts for that)
  * don't use exceptions for business logic
  * combine exceptions with RAII for full throttle (take a look at Alexandrescu's *scope_guard*)
  * don't confuse recovarable and irrecovarable ( covered by assertions ) cases

<!--first character is non-space to avoid markdown bug of not closing list-->

  Exceptions are indispensable. There is just and odd anxiety among developers about them.
  

