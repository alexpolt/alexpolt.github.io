
* [When should One Use r-value References and noexcept](move-noexcept.html)

  Some thoughts on when to use move semantics and exception specifiers.


* [Memory Allocation Wisdom](alloc.html)

  What lessons can we learn from garbage collectors.


* [To Throw or to Assert, Or Return an Error Code?](return-codes.html)

  This is a really important question actually because all our code consists of functions.


* [Floating Point Rounding](fp-round.html)

  How to properly round a floating point number?


* [C++ Templates and Static Initialization <del>Order</del> Hell](member-init.html)

  Ran into a nasty problem with how the global static objects are initialized in templates.



* [Color Throne - Brain Gymnastics](color-throne.html)

  Released my first Android application on Google Play. It's a color puzzle-arcade game.
  Any installs and positive reviews are much welcome.


* [atomic\_data: A Multibyte General Purpose Lock-Free Data Structure](atomic-data.html)

  **My greatest work so far**. I am writing about lock-free programming gotchas and also present
  a hopefully novel design: **atomic\_data**.


* [A Better Alternative to shared\_ptr for Shared Ownership](link.html)

  *shared_ptr* is not an answer to the shared ownership problem.


* [unique\_ptr -> unique](unique.html)

  We need a more general *unique* design pattern.


* [Using Macro Kung Fu to Easier Check Function Return Values](macros-checking.html)

  Checking multiple function calls with one macro.


> Program execution could be viewed as data flowing across scopes.


* [Some Problems with C++ Move Semantics](empty-value.html)

  Some thoughts on the C++ move minor annoyances.


* [Free Variables Perfect Hashing Algorithm](perfect-hashing.html)

  A generalization and simplification of the CHM Perfect Hashing Algorithm.


* [Consistent Hashing Revisited](random-probing.html)

  Consistent hashing is used to balance load in case a bucket (server) goes bad.


* [C++ Properties](cpp-property.html)

  One more nugget from C++.


> When serializing data into a file, developers often make a dry run to calculate
> the size for the header. One possible workaround: add a size data member as the
> last field in the header struct, then just write the header at the end of the file.


* [Value Semantics](values.html)

  Some thoughts on using values vs pointers/references.


* [Polymorphism](polymorphism.html)
  
  A couple notes on polymorphic behaviour.


* [C++ Exceptions](exceptions.html)

  Neverending struggle to work out the rules of using C++ exceptions, my thoughts on that.  
  TLDR. Use them almost always.


> \#define that (\*this)  
>
> that.value = ...


* [The Way *operator&lt;&lt;* and *operator&gt;&gt;* Should Have Been Overloaded](vector-push.html)

> *std::vector&lt;int&gt; v{}; int i{};*  
> *v << 1 << 2;*  
> *v >> i;*


* [Print-format a Float in Base-10](print-fp.html)

  A hack for quick and easy printing of a floating point number in base-10.


<div>
<style type="text/css">
  #main-menu-0 {
    background-color: #d3e4ff;
  }
</style>
</div>


