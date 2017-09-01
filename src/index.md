

* [Visual C++ Struct Layout Reminder](struct-layout.html)

  Microsoft Visual C++ (64 bit mode) has different layout between seemingly very similar 
  data structures. Be warned.


* [Turn a Data Structure Into a Tuple Using Pure C++](struct-tuple.html)

  Wouldn't it be nice to turn a POD data structure into a tuple? It can be done with just 
  C++ (C++14) in about ten lines of code.


* [Pattern: Narrow Contract](contract.html)

  I wish I learned that simple software design principle earlier.


* [Useful Properties of String Interning in C++](intern.html)

  I show how to get string interning in C++ and what benefits it brings.


* [Undefined Behaviour and Optimizations: GCC vs Clang vs MSC](undefined.html)

  Was thinking the other day about undefined behaviour and optimizations it allows and came up
  with a couple interesting short samples.


* [When should One Use r-value References and noexcept](move-noexcept.html)

  Some thoughts on when to use move semantics and exception specifiers.


* [Memory Allocation Wisdom](alloc.html)

  What lessons can we learn from garbage collectors.


* [Lets Talk About Error Handling...](error-handling.html)

  What's really the right way to handle program errors? I have some ideas.


* [Floating Point Rounding](fp-round.html)

  How to properly round a floating point number?


* [C++ Templates and Static Initialization <del>Order</del> Hell](member-init.html)

  Ran into a nasty problem with how the global static objects are initialized in templates.


* [Color Throne - Brain Gymnastics](color-throne.html)

  Released my first Android application on Google Play. It's a color puzzle-arcade game.
  Any installs and positive reviews are much welcome.


* [atomic\_data: A Multibyte General Purpose Lock-Free Data Structure](atomic-data.html)

  My **greatest** work so far. I am writing about lock-free programming gotchas and also present
  a hopefully novel design: **atomic\_data**.


* [Using Macro Kung Fu to Easier Check Function Return Values](macros-checking.html)

  Checking multiple function calls with one macro.


> Program execution could be viewed as data flowing across scopes.


* [Some Problems with C++ Move Semantics](empty-value.html)

  The C++ brings joy, but problems too.


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
<script>
  document.getElementById("main-menu-0").classList.add("active");
</script>
</div>

