
##To Move or Not to Move, Except or noexcept

  With the introduction of move semantics into C++ one has to decide when and how
  to use it for the benefit. I have already written on the [problems][move] that it introduces.
  Also I came up with a clear rule for this:

  * If you store on object than just use a value (no references) as a parameter. It'll deal with
  both r-values and l-values correctly. This is the clear advantage that move semantics has given
  us.

  * You can use copy-and-swap idiom. But there are subtleties with container like objects - you
  don't want unnecessary copies.

  * In other cases you'll end up using either a universal reference or two distinct methods/functions.

<!-- stop list -->

  Now to the question of noexcept. I've already written on the subject of [exceptions][exceptions] 
  and where to use them. With regard to noexcept my experience tells me that we should just forget
  about noexcept. The only case it is necessary is for std::vector or other containers ( noexcept
  on move constructor ). But this is the result of the really dubious decision to allow exceptions
  on copy and move. We should just ban exceptions in that cases and make our lives better.
  bad\_alloc? Yes, memory allocation failure is a no-go situation. **We write programs with an
  assumption that an OS will behave as documented. No spurious failures are allowed!** No threads
  should become suddenly suspended, no memory allocation failures in case we're not *out of memory*,
  which is a bug of a program than a normal situation. STL went the wrong way with its exception 
  safety paranoia. So I think one should not normally use noexcept. Try to make your constructors
  and probably assignment operators noexcept by default and allow exceptions in every other case.


  [move]: empty-value.html "Problems of Move Semantics in C++"
  [exceptions]: exceptions.html "C++ Exceptions"

