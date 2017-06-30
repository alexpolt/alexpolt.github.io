
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

<div class="webgl" webgl_version="1" webgl_div="shader0">
  <h1>WebGL</h1>
  <img src="images/webgl300.png" title="Click to show WebGL demo" alt="Click to show WebGL demo"/><br/>
  <span>Click to show WebGL demo</span>
</div>

<div class="shader hidden" id="shader0" js="" fn="" style="width: 60%">
  <ul class="close">
    <li title="Info" class="help">?</li>
    <li title="Close Demo" class="close">Close</li>
  </ul>
  <ul class="menu">
    <li title="WebGL Canvas" class="canvas">Canvas</li>
    <li title="Vertex Shader" class="vs">VS</li>
    <li title="Pixel Shader" class="ps">PS</li>
  </ul>
  <canvas hide class="canvas"></canvas>
  <textarea hide class="vs hidden" spellcheck="false" fromid="shader0vs"></textarea>
  <textarea hide class="ps hidden" spellcheck="false" fromid="shader0ps"></textarea>
  <div hide class="help hidden"></div>
  <div class="buttons">
  <button title="Reload Shaders" class="reload">Reload</button>
  <button title="Output WebGL Info in Console" class="log">Log</button>
  <button title="Pause Rendering" class="pause">Pause</button>
  <button title="Go Fullscreen" class="fscreen">FS</button>
  </div>
  <div class="clear"></div>
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

<textarea class="hidden" id="shader0vs">
attribute vec2 v_in;
attribute vec2 uv_in;
attribute float vid_in;
varying vec2 uv;
uniform float t;
void main() {
  uv = v_in;
  gl_Position = vec4( vec2( 2.0 * v_in - 1.0 ), 0, 1 );
}
</textarea>
<textarea class="hidden" id="shader0ps">
precision highp float;
varying vec2 uv;
uniform float t;
void main() {
  float tt = fract( t / 10. );
  vec4 c = vec4(  cos( ( uv.x*uv.y + uv.y + 5.*tt ) * 3.), 
                  cos( ( 3.*uv.y*uv.x + 7.*tt ) * 2.0 ), 
                  cos( tt*(1.-uv.x-uv.y)*3. ), 1 );
  gl_FragData[0] = c*vec4( .5, .5, .5, 1 ) + vec4( .5, .5, .5, 0 );
}
</textarea>


</div>

  [a]: #triangle
  [b]: #derivatives
  [c]: #lights
  [d]: #noperspective
  [bar]: barycentric.html "Barycentric Coordinates"


