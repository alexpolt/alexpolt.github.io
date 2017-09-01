
##Visual C++ Struct Layout Reminder

  Consider these two very similar data structures:

    struct data {
      void* a;
      int b;
      int c;
    };
    
    struct A { void* data;  };
    struct B : A { int data; };
    struct C : B { int data; };

  Any programmer would expect it to bee identical in memory. And it is so with GCC and Clang. But
  not so fast. Visual C++ has some Easter eggs in store for us. This is the output of this 
  [very simple program][p] on Clang 64 bit:

    offset data::a = 0
    offset data::b = 8
    offset data::c = 12
    
    offset A::data = 0
    offset B::data = 8
    offset C::data = 12

  Identical! The same story for 32 bit architecture. And now that is the output on Visual C++ 64 bit.

    offset data::a = 0
    offset data::b = 8
    offset data::c = 12
    
    offset A::data = 0
    offset B::data = 8
    offset C::data = 16 //Ahaha, Microsoft, please, stop! :)

  On 32 bits the layout is the same. Yes, I understand, non-POD means no moral right to ask for 
  anything. But if you do something like this, you better have some rationale. My hypothesis is 
  that Visual C++ align every class in an inheritance hierarchy independently taking the alignment 
  from base classes. And it's a great fault if that is so.

  UPD. [Arseny Kapoulkine][t] has provided a great insight which rehabilitates Visual C++. 
  The thing happening is that Clang and GCC pack data into alignment padding which can be observed 
  by comparing the sizes of B and C. Take a look at [this code][a]: sizeof(B) == sizeof(C).
  Not great. So, holding on to PODs (means aggregate) could be a great advice.

  [Ruslan Abdikeev][r] has also shared a search keyword "tail padding overlaying" and another
  [example (tio.run)][e] that demonstrates an effect of that.


  [p]: https://godbolt.org/g/H1pcGM
  [a]: https://godbolt.org/g/Q3VR6z
  [t]: https://twitter.com/zeuxcg "Arseny Kapoulkine Twitter"
  [r]: https://twitter.com/aruslan "Ruslan Abdikeev"
  [e]: https://goo.gl/ECrb4h "Tail Padding Overlaying"


