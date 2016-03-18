
# A quick and easy way to print a float in base-10.

  The implementation of *printf* for the "*%f*" format specifier is quite involved. 
  I invite you to take a look: [*printf_fp.c*](https://gcc.gnu.org/bugzilla/attachment.cgi?id=24137). That's hard.

  But there is a hack, that you could use in cases where you don't need an exact number.

  The format of a 32-bit floating point in modern systems is 
  ![float format](images/fp-format.png "Floating point number format") where b = 2 ( &copy;Wikipedia ).

  You could transform the base-2 exponent to base-10, take the integer part, and multiply the rest of the number with 
  fractional part. This way you essentially get a base-10 number. I provide a draft implementation that you could use
  and improve.

    #include <cstdio>
    #include <cmath>

    int main() {

        union {
            float d;
            int u;
        };

        d = -0.00594;
        
        printf("%.10f\n", d); //original numer
        
        bool minus = u >> 31; //store sign
        u = u & ~(1 << 31); //clear sign
        double exp = (u >> 23) - 127; //extract exponent
        double exp10 = exp / log2( 10.0 ); //compute base-10

        //adjust the number
        u = (u & ~(0xFF << 23)) | (127 << 23);
        double d2 = double(d) * pow( 10.0, exp10 - int(exp10) ); 
        if( d2 >= 10.0 ) { d2 = d2 / 10.0; exp10+=1.0; }
        if( d2 < 1.0 ) { d2 = d2 * 10.0; exp10-=1.0; }

        //print sign
        if( minus ) printf("-");
    
        //print integer part
        int i = int( d2 );
        printf("%.1d.", i);
        d2 = d2 - i;
        
        //print the rest
        int digits = 10; 

        while( digits-- ) { 
            d2 = d2 * 10.0;
            int i = int( d2 );
            printf("%.1d", i);
            d2 = d2 - i;
        }
        
        //print exponent part
        printf("e%d", int(exp10));

    }

    Output:

    -0.0059400001
    -5.9400000609e-3

  [Github](https://github.com/alexpolt/poetry/blob/master/print-fp.cpp)

  It's just a sketch, you can improve the code. Also I haven't done error analysis. 
  All calculations are done in double, so I expect this to work at least for floats.

  I'd like to thank **Bruce Dawson** for his outstanding series on 
  [floating points](https://randomascii.wordpress.com/category/floating-point/).

  **Alexandr Poltavsky**  
  *2016-03-18T21:19+0300*

