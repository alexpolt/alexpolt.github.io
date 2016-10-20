
##Floating Point Rounding

  Asked myself, "What is the best way to round a floating point?" Looked up an [answer][round].

  People note that using the straightforward way of adding +0.5 and truncating breaks in some cases,
  including negative numbers.

  While thinking about it I came up with a simple and stable solution that works in all those
  cases. And it's certainly easier than this [solution][pascal] by "pascal".


    #include <stdio.h>
    
    double n0 = 0.5;
    double n1 = -0.5;
    
    //one ULP below 0.5, breaks naive rounding
    double n2 = 0.49999999999999994;
    double n3 = -0.49999999999999994;
    
    int round_naive( double n ) {
    
      return n + 0.5;
    }
    
    int round_less_naive( double n ) {
    
      return n > 0.0 ? n + 0.5 : n - 0.5;
    }
    
    int round_my_try( double n ){
    
      int n2 = (int)( n * 2.0 ); // double it
      int bit = n2 & 0x1; // extract the half-bit
      unsigned sign = n2 >> 31; // extract sign info
      return  n2/2 + sign ? -bit : bit; // adjust
    }
    
    void test( double n ) {
    
      printf( "round_naive      ( %.17f ) -> %d\n", n, round_naive( n ) );
      printf( "round_less_naive ( %.17f ) -> %d\n", n, round_less_naive( n ) );
      printf( "round_my_try     ( %.17f ) -> %d\n\n", n, round_my_try( n ) );
    }
    
    int main(void) {
    
      test( n0 );
      test( n1 );
      test( n2 );
      test( n3 );
    
      return 0;
    }
    
    Output:
    
    round_naive      ( 0.50000000000000000 )  ->  1
    round_less_naive ( 0.50000000000000000 )  ->  1
    round_my_try     ( 0.50000000000000000 )  ->  1
    
    round_naive      ( -0.50000000000000000 ) ->  0 //<--wrong
    round_less_naive ( -0.50000000000000000 ) -> -1
    round_my_try     ( -0.50000000000000000 ) -> -1
    
    round_naive      ( 0.49999999999999994 )  ->  1 //<-- wrong
    round_less_naive ( 0.49999999999999994 )  ->  1 //<-- wrong
    round_my_try     ( 0.49999999999999994 )  ->  0
    
    round_naive      ( -0.49999999999999994 ) ->  0
    round_less_naive ( -0.49999999999999994 ) -> -1 //<--wrong
    round_my_try     ( -0.49999999999999994 ) ->  0




  [Ideone](http://ideone.com/koDJi8)


  [round]: http://stackoverflow.com/questions/485525/round-for-float-in-c
  [pascal]: http://blog.frama-c.com/index.php?post/2013/05/03/nearbyintf2


