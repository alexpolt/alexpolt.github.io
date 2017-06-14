

##Undefined behaviour and optimizations: GCC vs Clang vs MSC

  It's a well known fact that compiler optimizers sometimes exploit undefined behaviour to
  optimize code. As a classic example:

    int ac = 0;
    for( int i = some_int_value; i < some_int_value + 10; i++ ) ac += 1;

  Integer overflow is banned in C++. Using this fact allows an optimizer to skip the loop and
  just compute the final value of *ac*. But not all undefined cases can be easily optimized out:

    int *a_ptr = &ac;
    float b = *(float*) a_ptr;

  Dereferencing *a\_ptr* is illegal, but doing that is so common that compilers try to do the 
  expected thing. That shows that compiler optimizers take a great risk doing any optimizations of 
  code with undefined behaviour. There is a lot of [horror stories][horror] when GCC started to 
  follow strict aliasing rules.

  Undefined behaviour restricts the set of valid values (or valid actions), which in turn allows 
  optimizations. But actually any condition in the code has that property. Removing redundant null
  pointer checks is one such example. That realization made me come up with some code samples to 
  test the behaviour of compiler optimizers. 

  1\. And the first primitive sample I put up is below. It doesn't have any undefined behaviour 
  obviously but the result is still quite surprising. Clang, what's up?

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test1( int x ) {
  if( x == 0 )
    return x * 4;
  return 0;
}
</code></pre>
</TD>

<TD class="gcc">
<pre>xorl %eax, %eax</pre>
</TD>

<TD class="clang">
<pre>
leal   (,%rdi,4), %ecx
xorl   %eax, %eax
testl  %edi, %edi
cmovel %ecx, %eax
</pre>
</TD>

<TD class="msc">
<pre>xor eax, eax</pre>
</TD>
</TR>
</TABLE>
</div>

  2\. The idea for the following sample was that: if x equals one then we have integer overflow, 
  which is undefined, so a compiler can just return zero, may be. Actually all are wrapping with
  Clang trying to be exceedingly clever.

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test2( int x ) {
  if( x == 1 )
    return x + INT_MAX;
  return 0;
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
cmpl  $1, %edi
movl  $-2147483648, %edx
movl  $0, %eax
cmove %edx, %eax
</pre></TD>

<TD class="clang">
<pre>
leal   2147483647(%rdi), %ecx
xorl   %eax, %eax
cmpl   $1, %edi
cmovel %ecx, %eax
</pre>
</TD>

<TD class="msc">
<pre>
xor   eax, eax
mov   edx, -2147483648
cmp   ecx, 1
cmove eax, edx
</pre>
</TD>
</TR>
</TABLE>
</div>

  3\. The next sample is interesting in how compilers disagree. If x == INT\_MAX then x + 2 in the
  loop condition wraps and it should not execute. Clang and MSC wrap and optimize it out whereas
  GCC assumes no undefined behaviour, but in the previous code it wrapped just fine.

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test3( int x ) {
  if( x == INT_MAX ) { 
    int r = 0;
    for( int y=x; y < x+2; ++y ) ++r;
    return r;
  }
  return 0;
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
xorl %eax, %eax
cmpl $2147483647, %edi
sete %al
addl %eax, %eax
</pre>
</TD>

<TD class="clang">
<pre>
xorl %eax, %eax
</pre>
</TD>

<TD class="msc">
<pre>
xor eax, eax
</pre>
</TD>
</TR>
</TABLE>
</div>

  4\. Again, integer overflow. If an optimizer assumes no undefined behaviour then x + INT\_MAX 
  in the code below should be positive. MSC is being needlessly clever.

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test4( int x ) {
  if( x > 0 ) {
    return x + INT_MAX < 0 ? 1 : 0;
  }
  return 0;
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
xorl %eax, %eax
</pre>
</TD>

<TD class="clang">
<pre>
xorl %eax, %eax
</pre>
</TD>

<TD class="msc">
<pre>
test ecx, ecx
jle  SHORT $LN2@test4
lea  eax, DWORD PTR [rcx+2147483647]
shr  eax, 31
ret  0
$LN2@test4:
xor  eax, eax
</pre>
</TD>
</TR>
</TABLE>
</div>

  5\. Shifting by more than 30 in the 1 << x is undefined, so our compilers could just return 1.
  Clang comes close.

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test5( int x ) {
  if( 1 << x ) {
    return 31 - x > 0;
  }
  return 1;
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
movl  $1, %eax
movl  %edi, %ecx
sall  %cl, %eax
movl  %eax, %edx
movl  $1, %eax
testl %edx, %edx
je    .L10
movl  $31, %eax
subl  %edi, %eax
testl %eax, %eax
setg  %al
.L10:
movzbl %al, %eax
</pre>
</TD>

<TD class="clang">
<pre>
xorl %eax, %eax
cmpl $31, %edi
setl %al
</pre>
</TD>

<TD class="msc">
<pre>
mov  eax, 1
shl  eax, cl
test eax, eax
je   SHORT $LN2@test5
mov  eax, 31
sub  eax, ecx
xor  ecx, ecx
test eax, eax
setg cl
mov  eax, ecx
ret  0
$LN2@test5:
mov  eax, 1
</pre>
</TD>
</TR>
</TABLE>
</div>

  6\. This is an interesting case. When x != 0 the return value is 0, but when x == 0 we have
  divide by zero which is undefined. What should a compiler optimizer do? Also the expressions for
  _y_ are independent and can be moved around. GCC is smart and only does division when needed, but 
  that has a negative effect of hiding potential problems. MSC is just being awesome.

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test6( int x ) {
  auto y = 16 / x;
  if( x != 0 ) y = 0;
  return y;
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
xorl  %ecx, %ecx
testl %edi, %edi
jne   .L14
movl  $16, %eax
cltd
idivl %ecx
movl  %eax, %ecx
.L14:
movl  %ecx, %eax
</pre>
</TD>

<TD class="clang">
<pre>
xorl    %ecx, %ecx
movl    $16, %eax
xorl    %edx, %edx
idivl   %edi
testl   %edi, %edi
cmovnel %ecx, %eax
</pre>
</TD>

<TD class="msc">
<pre>
xor eax, eax
</pre>
</TD>
</TR>
</TABLE>
</div>

  7\. Really tricky one for a compiler. Accessing a[] out of bounds ( x&gt;1 ) is undefined 
  behaviour and can produce any value (garbage) and other case is covered in a later condition
  that just assigns 0. So, theoretically an optimizer could just return 0.

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test7( int x ) {
  int a[]{1,2};
  auto y = a[x];
  if( x < 2 ) y = 0;
  return y;
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
movslq %edi, %rax
movl   $1, -24(%rsp)
movl   $2, -20(%rsp)
movl   -24(%rsp,%rax,4), %eax
cmpl   $1, %edi
movl   $0, %edx
cmovle %edx, %eax
</pre>
</TD>

<TD class="clang">
<pre>
.L_Z1a:
.long   1
.long   2
movslq  %edi, %rcx
xorl    %eax, %eax
cmpl    $2, %ecx
cmovgel .L_Z1a(,%rcx,4), %eax
</pre>
</TD>

<TD class="msc">
<pre>
xor    edx, edx
movsxd rax, ecx
mov    DWORD PTR a$[rsp], 1
cmp    ecx, 2
mov    DWORD PTR a$[rsp+4], 2
mov    eax, DWORD PTR a$[rsp+rax*4] <!--*-->
cmovl  eax, edx
</pre>
</TD>
</TR>
</TABLE>
</div>

  8\. The next code is often used as an example of optimization opportunity. A compiler optimizer
  can just skip the loop and compute the final value (10 here). Again, GCC is being consistent.
  Clang and MSC check for overflow.

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test8(int x) {
  int ac = 0;
  for( int i = x; i < x+10; i++) ++ac;
  return ac;
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
movl $10, %eax
</pre>
</TD>

<TD class="clang">
<pre>
leal   9(%rdi), %eax
cmpl   %edi, %eax
cmovll %edi, %eax
incl   %eax
subl   %edi, %eax
</pre>
</TD>

<TD class="msc">
<pre>
lea eax, DWORD PTR [rcx+10]
cmp ecx, eax
jge SHORT $LN10@test8
sub eax, ecx
ret 0
$LN10@test8:
xor eax, eax
</pre>
</TD>
</TR>
</TABLE>
</div>

  9\. This one is pretty simple and compilers give warnings (except for MSC). 
  And all return garbage, but see the next sample.

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test9() {
  int a[]{1,2};
  return a[5];
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
xorl %eax, %eax
</pre>
</TD>

<TD class="clang">
<pre>
retq
</pre>
</TD>

<TD class="msc">
<pre>
a$$sroa$72$ = 8
mov eax, DWORD PTR a$$sroa$72$[rsp]
</pre>
</TD>
</TR>
</TABLE>
</div>

  10\. This is just the above code with one unsigned addition. Simple? Not for optimizers. Funny,
  GCC gives the same warning (MSC and Clang silent).

<div class="code"><TABLE><TR><TH>C++ Code</TH><TH>GCC</TH><TH>Clang</TH><TH>MSC</TH></TR>
<TR>
<TD class="cpp">
<pre><code>int test10(unsigned x) {
  int a[]{1,2};
  return a[x/2+2];
}
</code></pre>
</TD>

<TD class="gcc">
<pre>
shrl %edi
movl $1, -24(%rsp)
movl $2, -20(%rsp)
leal 2(%rdi), %eax
movl -24(%rsp,%rax,4), %eax
</pre>
</TD>

<TD class="clang">
<pre>
.L_ZZ1a:
.long   1
.long   2
shrl %edi
movl .L_ZZ1a+8(,%rdi,4), %eax
</pre>
</TD>

<TD class="msc">
<pre>
a$ = 16
shr ecx, 1
add ecx, 2
mov DWORD PTR a$[rsp], 1
mov DWORD PTR a$[rsp+4], 2
mov eax, DWORD PTR a$[rsp+rcx*4] <!--*-->
</pre>
</TD>
</TR>
</TABLE>
</div>


  That's all. [All code][godbolt] is compiled with the latest compilers available in 
  [Compiler Explorer][gcc] in 64 bit mode with O2 and Wall options. The final *ret* in assembly 
  code is omitted.

  The code was produced with the help of the excellent [Compiler Explorer][gcc] service by 
  [Matt Godbolt][matt]. Big thanks to him, it greatly speeds up prototyping. 


<div>
<style>
  div.code td.cpp {
    background-color: #1d1f21;
  }
  div.code td.gcc {
    background-color: #FFF0F0;
  }
  div.code td.clang {
    background-color: #FAFFFA;
  }
  div.code td.msc {
    background-color: #EFEFFF;
  }
  div.code td {
    font-family: monospace;
    white-space: nowrap;
    padding: 0px 15px;
  }
  div.code {
    width: 100%;
  }
  div.code table {
    width: 100%;
  }
  div.code pre {
    margin: 0px;
  }
</style>
</div>


  [godbolt]: https://godbolt.org/g/RZZ68Y "C++ samples: GCC vs Clang"
  [horror]: https://stackoverflow.com/questions/2958633/gcc-strict-aliasing-and-horror-stories "Strict Aliasing Horror"
  [gcc]: https://gcc.godbolt.org "Compiler Explorer"
  [matt]: https://twitter.com/mattgodbolt "Matt Godbolt Twitter"


