
<div id="contents">

#   Contents


  * [Value semantics](values.md)

    Some thoughts on using values vs pointers/references.


  * Polymorphism
    
    There is a descriptin of [polymorphism](https://en.wikipedia.org/wiki/Polymorphism_%28computer_science%29)
    on _Wikipedia_, but I don't agree with it. In my view polymorphism is any change in the execution path.
    If you rig a class with a parameter that changes the behaviour of an object: it's polymorphism.


  * [C++ Exceptions](exceptions.html)

    Neverending struggle to work out the rules of using C++ exceptions, my thoughts on that.  
    TLDR. Use them almost always.


  * Lo and behold: 

    >_#define das (*this)_  
    >_das.value = ..._


  * The way *operator<<* and *operator>>* should have been overloaded:

    >*std::vector<int> v{}; int i{};*  
    >*v << 1 << 2;*  
    >*v >> i;*
    
    >[Github](https://github.com/alexpolt/poetry/blob/master/vector-push.cpp) [Ideone](http://ideone.com/glqESs)


  * [Print-format a float in base-10](print-fp.html)  
  
    A hack for quick and easy printing of a floating point number in base-10.


  * [On motivation](motivation.html)  
  
    First blog post is about an important topic of motivation.

</div><!-- contents -->

