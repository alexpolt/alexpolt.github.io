
# C++ Exceptions

  I guess every c++ programmer out there have struggled with the question of
  where or not to use exceptions. Some say they complicate the code, others that
  they are a serious performance hit.

  I also gave it some time. After long hours of musing on the subject, coming up
  with examples - no matter how hard I tried to come up with a better solution for
  error handling, I always landed with something similar to exceptions.

  You need some registration mechanism on entering a scope to get the best out of RAII.
  And exiting the scope *should call destructors*, period.  
  So my conclusion is: *always use exceptions*, just use them right. There is only one case 
  for not using them, that is in real-time critical code.

  My personal checlist when using exceptions is this:
  
  * any problem related to resources (network connection, files, memory etc.) should end with and exception
  * any sort of bad input from outside world: wrong numbers, corrupted files, invalid input
  * don't use exceptions for checking preconditions (use types and asserts for that)
  * don't use exceptions for business logic
  * combine exceptions with RAII for full throttle

<!--first character is non-space to avoid markdown bug of not closing list-->
  Exceptions are indispensable. There is just and odd anxiety among developers about them.
  Yes, they make think harder, but error handling is hard. In fact I think the Holy Grail of 
  the software development discipline is the ability to at least reason about program correctness.
  How do you know if that pacemaker software doesn't contain a bug? By waiting for a death case?


