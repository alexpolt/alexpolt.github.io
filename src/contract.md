
##Pattern: Narrow Contract

  Sadly I have only learned this very useful software design principle only recently. First, 
  an example:

    void do_something( object *ptr ) {
    
      if( ptr ) {
        ...
      }
    }

  The problem is the null check in the body of the function. It widens the contract for the input
  and, as you might expect, the users of the function will happily rely on that. Which in turn
  will lead to nullptr's crawling into the code.

  There is a lesson: make the contract of a function as narrow as possible, let it do only what
  its purpose is, not more.

  While writing the post I was remembering the talk by Chandler Carruth [Undefined Behaviour][u]
  where he draws a connection between undefined behaviour and narrow contract.

  Actually it would make a lot of sense to make the contract clear and mark certain inputs as
  leading to undefined behaviour:

    // ptr == nullptr is undefined behaviour
    void do_something( object *ptr ) {
      
      assert( ptr );
      
      ...
    }


  [u]:https://www.youtube.com/watch?v=yG1OZ69H_-o "Arguing about Undefined Behavior"


