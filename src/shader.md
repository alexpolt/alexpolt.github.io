
##Shader Tricks: Retrieving Triangle Location and Edges in Pixel Shader and More

  In this post I'm going to talk about:

  * [Getting triangle (primitive) location in screen space and its edge vectors.][a]

  * [Non-perspective interpolation in WebGL][d]

  * [Using partial derivatives for peeking into another shader.][b]

  * [Many lights with the help of a primitive id][c]

<!-- end list -->

  <a name="triangle"></a>

###Triangle Info

  <a href="barycentric.html">
  <img src="images/barycentric-screenspace.png" style="display:block;float:right"/>
  </a>

  Every once in while there is a need to get full info about the rasterized primitive in a pixel
  shader: location in screen space and edge vectors. And it's an easy thing with the help of 
  barycentrics. Check out a [blog post][bar] I made on them with a Javascript interactive demo.

  So the first step is to take partial derivatives (I use GLSL syntax but it's easy to translate
  to HLSL):

<div class="clear">
</div>

    vec2 uvdx = dFdx( uv );
    vec2 uvdy = dFdy( uv );
    mat2 scr2uv = mat2( uvdx, uvdy );

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
  <a href="javascript: void(0)" onclick="demo('shader0')">Click to open/close the WebGL2 demo</a>
</div>

<div class="shader hidden" id="shader0" js="" fn="" style="width: 60%">
<ul class="close"><li class="close">Close</li></ul>
<ul><li class="canvas">Canvas</li><li class="vs">VS</li><li class="ps">PS</li></ul>
<canvas class="canvas"></canvas>
<textarea class="vs hidden" spellcheck="false" fromid="shader0vs"> </textarea>
<textarea class="ps hidden" spellcheck="false" fromid="shader0ps"> </textarea>
<div class="buttons clear">
<button title="Reload Shaders" class="reload">Reload</button>
<button title="Output WebGL Info in Console" class="log">Log</button>
<button title="Pause Rendering" class="pause">Pause</button>
<button title="Go Fullscreen" class="fscreen">FS</button>
</div>
</div>


  <a name="noperspective"></a>

  Non-perspective interpolation.

  <a name="derivatives"></a>

  Derivatives.

  <a name="lights"></a>

  Lights.


<div>

  <script src="js/webgl.js"></script>
  <script src="js/webgl-quad.js"></script>

  <script>

    function demo( div ) {

     var c = document.querySelector( "div#" + div );

     if( !c ) throw "div " + div + " not found";

     if( c.classList.contains( "hidden" ) ) {

        var img0 = new Image();
        img0.src = "images/barycentric-small.png";
        c.classList.remove( "hidden" );
        run_shader( { div: div, uniforms: { "t": "time", "screen": "screen" }, textures: { tex0 : img0 } } );
        
      } else {

        stop_shader( div );
        c.classList.add( "hidden" );
      }

      return undefined;
    }

    document.addEventListener( "DOMContentLoaded", function() {

      var tas = document.querySelectorAll("div.shader textarea");

      if( tas ) foreach( tas, function( e ) {

        var fromid = e.getAttribute( "fromid" );

        if( fromid ) {
          var from = document.getElementById( fromid );
          if( !from || from.nodeName !== "TEXTAREA" ) throw "id " + fromid +" not found";
          e.value = from.value;
        }

      } );

    } );
  </script>

  <style>
    div.demo {
      text-align: center;
      border:1px solid black;
      margin: 10px auto;
      background-color: #ede1e1;
      font-size: 90%;
      font-weight: bold;
    }
  </style>

<textarea class="hidden" id="shader0vs">
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
<textarea class="hidden" id="shader0ps">
#version 300 es
precision highp float;
in vec2 uv;
uniform float t;
layout(location=0) out vec4 C;
void main() {
  float tt = fract( t / 10. );
  vec4 c = vec4(  cos( ( uv.x*uv.y + uv.y + 5.*tt ) * 3.), 
                  cos( ( 3.*uv.y*uv.x + 7.*tt ) * 2.0 ), 
                  cos( tt*(1.-uv.x-uv.y)*3. ), 1 );
  C = c*vec4( .5, .5, .5, 1 ) + vec4( .5, .5, .5, 0 );
}
</textarea>

</div>


  [a]: #triangle
  [b]: #derivatives
  [c]: #lights
  [d]: #noperspective
  [bar]: barycentric.html "Barycentric Coordinates"


