
##Polymorphism

  There is a description of [polymorphism](https://en.wikipedia.org/wiki/Polymorphism_%28computer_science%29)
  on _Wikipedia_, but I don't agree with it. In my view polymorphism is any change in the execution path.
  If you rig a class with a parameter that changes the behaviour of an object: it's polymorphism.

  Another interesting aspect of polymorphic code:
        
        //first version of some code
        if(a > 5) {
          if(a < 100 ) {
             ...
    
        //now what if we turned our 'a' into a set of polymorphic types
        //then we could write such code
    
        a.do_things();

  You see the pattern? Polymorphism makes our code more functional. Functional code is, in fact, 
  highly polymorphic. It's just wraps the polymorphism in a different style (pattern matching is 
  one such technique).

  Interesting question is what code could be less polymorphic for the same algorithm? 
  I guess we need to introduce some measure of the amount of polymorphism. Like the number of 
  conditional jumps after compilation, so that we could compare different languages.

