
##Shader Tricks: Retrieving Triangle Location and Edges in Pixel Shader and More

  In this post I'm going to talk about:

  * [Getting triangle (primitive) location in screen space and its edge vectors.][a]

  * [Non-perspective shading in WebGL][d]

  * [Using partial derivatives for peeking into another shader.][b]

  * [Many lights with the help of a primitive id][c]

<!-- end list -->

  <a name="triangle"></a>

###Triangle Info

  Every once in while there is a need to get full info about the rasterized primitive in a pixel
  shader: location in screen space and edge vectors. And it's an easy thing with the help of 
  barycentrics. Check out a [blog post][bar] I made on them with a Javascript interactive demo.

  So the first step is to take partial derivatives (I use GLSL syntax but it's easy to translate
  to HLSL):

    vec2 uvdx = dFdx( uv );
    vec2 uvdy = dFdy( uv );
    mat2 scr2uv = mat2( uvdx, uvdy );

  <img src="images/barycentric-small.png" align="right"/>

  uv - is interpolated barycentrics, uvdx and uvdy form a 2x2 matrix that takes from screen space
  to barycentric space. Taking the inverse of that matrix produces a matrix that transforms uv
  coordinates to screen space. Because a uv of [1,0] is one edge of the triangle and [0,1] is 
  another, this inverse matrix has as its columns (or rows, depending on your math) the edge
  vectors. 


    float D = 1.0 / ( uvdx.x*uvdy.y - uvdx.y*uvdy.x );
    vec2 xydu = vec2( uvdy.x, -uvdx.y ) * D;
    vec2 xydv = vec2( -uvdy.x, uvdx.y ) * D;
    mat2 uv2scr = mat2( xydu, xydv );

    //In GLSL you can just use inverse( scr2uv )

  Okay. The first step is done. Now we need to find the location of uv=[0,0] on screen. Remember
  that uv is an interpolated barycentric, so we can use the above uv2scr to find the screen space
  position of the shaded fragment within the primitive. Then we subtract that from the global 
  screen space fragment position (gl\_Position or SV\_POSITION) to get the desired result:

    vec2 pos_tri = gl\_Position.xy - uv2scr*uv;

<div class="demo" style="clear:both;width:60%">
  <a href="javascript: void(0)" onclick="demo(0, this)">Click to open/close the WebGL2 demo</a>
</div>

<div class="shader" id="shader0" js="" fn="" style="width: 60%; display: none">
<ul><li class="canvas">Canvas</li><li class="vs">VS</li><li class="ps">PS</li></ul>
<canvas class="canvas"></canvas>
<textarea class="vs" spellcheck="false">
#version 300 es
layout(location=0) in vec2 v_in;
layout(location=1) in vec2 uv_in;
out vec2 uv;
uniform float t;
void main() {
  uv = v_in;
  gl_Position = vec4( vec2( 2.0 * v_in - 1.0 ), 0, 1 );
}
</textarea>
<textarea class="ps" spellcheck="false">
#version 300 es
precision highp float;
in vec2 uv;
uniform float t;
layout(location=0) out vec4 C;
void main() {
  C = vec4( uv.x, uv.y, 1.-uv.x-uv.y, 1 );
}
</textarea>
<button class="reload">Reload</button>
<button class="log">Log</button>
<button class="pause">Pause</button>
</div>


  <a name="derivatives"></a>

  Derivatives.

  <a name="lights"></a>

  Lights.

<div>
  <script src="js/webgl-quad.js"></script>
  <script src="js/webgl.js"></script>
  <script>
    var demo_flag = [0,0,0];
    var demo_js = ["webgl/shader-tricks0.js","",""];
    var demo_div = ["shader0","shader1","shader3"];

    function demo(n,el) {

      if( ! demo_flag[n] ) {
        demo_flag[n] = 1;
        var c = document.querySelector( "div#" + demo_div[n] );
        c.style.display = 'block';
        run_shader( demo_div[n] );
      } else {
        demo_flag[n] = 0;
        stop_shader( demo_div[n] );
        var c = document.querySelector( "div#" + demo_div[n] );
        c.style.display = 'none';
      }

      return undefined;
    }
  </script>

  <style>
    div.demo {
      text-align: center;
      border:1px solid black;
      margin: 5px auto;
      background-color: #ede1e1;
      font-size: 90%;
      font-weight: bold;
    }
  </style>
</div>

  [a]: #triangle
  [b]: #derivatives
  [c]: #lights
  [d]: #noperspective
  [bar]: barycentric.html "Barycentric Coordinates"


