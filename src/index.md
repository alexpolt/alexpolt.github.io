

  * [Tasking and object sharing](tasking.html)
    
    Task programming model gives a chance to solve the object sharing problem.


  * [C++ properties](cpp-property.html)

    One more nugget from C++.


>   __Quick tip__   
>
>   When serializing data into a file, developers often make a dry run to calculate
>   the size for the header. One possible workaround: add a size data member as the
>   last field in the header struct, then just write the header at the end of the file.


  * [Value semantics](values.html)

    Some thoughts on using values vs pointers/references.


  * [Polymorphism](polymorphism.html)
    
    A couple notes on polymorphic behaviour.


  * [C++ Exceptions](exceptions.html)

    Neverending struggle to work out the rules of using C++ exceptions, my thoughts on that.  
    TLDR. Use them almost always.


>   __Quick tip__  
>
>   #define $this (\*this)  
>   $this.value = ... //I advocate the use of '$' prefix for macros in C++


  * [The way *operator<<* and *operator>>* should have been overloaded](vector-push.html)

    >*std::vector&lt;int&gt; v{}; int i{};*  
    >*v << 1 << 2;*  
    >*v >> i;*


  * [*Print-format a float in base-10*](print-fp.html)
  
    A hack for quick and easy printing of a floating point number in base-10.

  * [Human Memory](memory.html)

    Some observations regarding human memory.

  * [*On motivation*](motivation.html)
  
    First blog post is about an important topic of motivation.


