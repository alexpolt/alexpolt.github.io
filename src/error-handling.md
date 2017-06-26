
##Lets Talk About Error Handling...

  Lets consider a simple example of filling a std::vector:

    std::vector<int> data;
    
    for( int i = 0; i < 10; i++ ) data.push_back( i );

  What could possibly go wrong? Well, apart from "out of memory"? Nothing. Computers are such
  marvellous machines that never fail (to execute some bug-free code like above). Except for
  hardware errors but that is out of a developer control. That puts the question what is an 
  error really and when do they happen.

  So to say we can divide all possible errors into two broad categories: **pseudo errors and
  real errors**. Pseudo errors are the ones introduced by the developer: logic errors, API abuse,
  erroneous syntax, incorrect initialization. Real errors are not subject to programmer control:
  file reading errors, network failure, any other device malfunction.

  The majority of problems in software actually comes from pseudo errors. An example:

      void memcopy( void* dest, void* src, size_t size );

  Piece of cake, very clean and simple API, but it can misused in numerous ways. Well, we can
  just open [Exceptional C++][b0] or [Effective Modern C++][b1]. Real question is what can we
  do about it. One can use a tool like [PVS Studio][p] to fight some fraction of bugs but no 
  silver bullet, an open and important problem. Robust testing actually shows good results and 
  maybe this is the way to go forward.

  Now to the second source of program errors. Anytime we call some API, be it a *syscall* or some 
  *middleware* there usually are some ways of communicating back the success state. And we have 
  a choice what to do with it. If we state that some error (file not found, network timeout, etc.) 
  is **expected** then we handle it right there in the code. Otherwise the error is **unexpected** 
  and we just don't do anything about it: we throw an exception.

  A couple words about tools like *assert*. We can see that it's usually used to solve the pseudo 
  error problem, verify preconditions. So their primary purpose is to assist the type system but 
  keep the code efficient. Take vector subscript as an example: should we be checking out of bounds 
  access every time or just assert it? Asserting is the only valid option because we don't write 
  buggy soft (at least we do our best). And buggy soft is not something we should accept as a 
  new normal.

  Another important aspect is **exception safety in C++**. Again, if we rule out API calls and out 
  of memory then ideally we have no point of failure (we can't fight pseudo errors so I ignore it). 
  Then what's the value of creating that insane layer of complexity? New jobs? A simple rule, that 
  should've gone into C++ standard, of not calling into OS or other APIs in object constructors 
  (destructors are already special cased) solves most exception safety issues.

  Before I had written a post about [when to use exceptions](exceptions.html). It's still worth
  taking a look and becomes even more clear with above description.


  [b0]: https://www.amazon.com/Exceptional-Engineering-Programming-Problems-Solutions/dp/0201615622
  [b1]: https://www.amazon.com/Effective-Modern-Specific-Ways-Improve/dp/1491903996
  [p]: https://www.viva64.com "PVS-Studio analyzer"

