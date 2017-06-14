
##Lets talk about error handling...

  Lets consider a simple example of filling a std::vector:


    std::vector<int> data;
    
    for( int i = 0; i < 10; i++ ) data.push_back( i );


  What could possibly go wrong? Well, apart from "out of memory"? Nothing. Computers are such
  marvellous machines that never fail (to execute some bug-free code like above). Except for
  hardware errors but that is out of a developer control. That puts the question what is an 
  error really and when do they happen.

  If we think about it, we'll realize that the only sources of errors are external API calls.
  Okay, good. Anytime we call some API, be it a *syscall* or some *middleware* etc., there usually
  are some ways of communicating back the success state. And we have a choice what to do with it.

  So this is what I'm trying to tell: every time we call an external API we have a choice of
  what to do with errors. If we state that some error (file not found, network timeout, etc.) is
  **expected** then we handle it right there in the code. Otherwise the error is **unexpected** 
  and we just don't do anything about it: we throw an exception.

  Therefore I think there is little space for tools like *std::optional* or similar. Because it
  turns an obvious error into an implicit one. Just throw in that case, or handle it in place.

  As for tools like *assert*, their primary purpose is to assist the type system but keep the code
  efficient. Take vector subscript as an example: should we be checking out of bounds access every
  time or just assert it? Asserting is the only valid option because we don't write buggy soft 
  (at least we do our best). And buggy soft is not something we should accept as a new normal.

  Another important aspect is **exception safety in C++**. Again, if we rule out API calls and out 
  of memory then suddenly we have no point of failure. Then what's the value of creating that 
  insane layer of complexity? New jobs? A simple rule, that should've gone into C++ standard, 
  of not calling into OS or other APIs in object constructors (destructors are already special 
  cased) solves most exception safety issues.

  Before I had written a post about [when to use exceptions](exceptions.html). It's still worth
  taking a look and becomes even more clear with above description.


