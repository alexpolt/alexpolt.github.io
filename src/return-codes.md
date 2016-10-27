
##To Throw or to Assert, Or Return an Error Code?


  This is a really important question actually because all our code consists of functions.
  Recently, while coding, I ran into a quandary of the kind - should I assert or throw?

  As I have updated my post on [exceptions](/exceptions.html) I wrote that one should divide 
  between recoverable and irrecoverable situations. 
  
  Out of bounds array access for example is irrecoverable. It's like reading a null pointer,
  the same matter. Also reading garbage will certainly lead to further problems in the program.
  So it's definitely an assert: program should terminate now!

  If it's a file access error and the user has an option (or the program has on option), than 
  just throw.

  But now the following question comes: **given the above should a function return an error code?**
  And the answer is no, I guess. Because you either assert or throw. In all other cases a 
  function should work perfectly and return only needed values. Probably you might return some
  code that's not an error but is part of the logic, returning an optional falls into that 
  category.

  And sure you should have proper handling of APIs: create wrappers and throw or assert. I tried
  to follow that code style recently and it's going well thus far.

  

