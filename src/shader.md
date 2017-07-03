
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

    //starting with OpenGL 3.1 (GLSL 1.4) there is inverse(...) intrinsic

  Okay. The first step is done. Now we need to find the location of uv=[0,0] on screen. Remember
  that uv is an interpolated barycentric, so we can use the above uv2scr to find the screen space
  position of the shaded fragment within the primitive. Then we subtract that from the global 
  screen space fragment position (gl\_FragCoord or SV\_POSITION) to get the desired result:

    vec2 pos_tri = gl\_FragCoord.xy - uv2scr*uv;

  Below is a WebGL demonstration. On the sides of the triangle are screen dimensions of its edges
  together with screen position of the origin point. Three digits are printed so make sure your
  browser window is reasonable in size. Most of the code in pixel shader is for outputting the 
  text in the right place. To pause rotation just hit space bar.

<div class="webgl" webgl_version="1" webgl_div="shader0" init="run_demo(cb);">
  <img class="link" src="images/triangle-info.png" title="Click to show WebGL demo" alt="WebGL demo"/><br/>
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

    function run_demo( cb ) {
      var imgfont = new Image();
      imgfont.onload = function() {
        var imgbg = new Image();
        var bgtex = "images/triangle-info-bg.png";
        imgbg.onerror = function() { alert( "Failed to load '"+bgtex+"' texture" ); };
        imgbg.onload = function() {
          cb( { bgcolor: [ 1, 1, 1, 1 ], 
                textures: { 
                  font: { tex2d: 1, format: "RGB", magf: "NEAREST", minf: "NEAREST", 
                          genmipmap: 0, data: imgfont },
                  bg: { tex2d: 1, format: "RGB", magf: "LINEAR", minf: "LINEAR_MIPMAP_LINEAR",
                        genmipmap: 1, data: imgbg },
                },
                extensions: [ "OES_standard_derivatives" ]
              } );
          };
        imgbg.src = bgtex;
      };
      var fonttex = "images/fixedfont.png";
      imgfont.onerror = function() { alert( "Failed to load '"+fonttex+"' texture" ); };
      imgfont.src = fonttex;
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

<textarea class="hidden" id="shader0vs">
attribute vec2 v_in;
attribute vec2 uv_in;
attribute float vid_in;
varying vec2 uvt;
varying vec2 uvb;
uniform float t;
uniform vec2 screen;
void main() {
  uvt = v_in;
  uvb = uv_in;
  float ar = screen.y/screen.x;
  vec4 p = vec4(0,0,0,1);
  float tt = fract(t/32.);
  float a = 2.*3.14159265*tt;
  mat2 m = mat2( vec2(cos(a),sin(a)), vec2(-sin(a),cos(a)) );
  if( vid_in < 3. ) {
    p = vec4( m*vec2( 1.4*v_in-.7 ), 0, 1 );
    p.x = p.x * ar;
  }
  gl_Position = p;
}
</textarea>
<textarea class="hidden" id="shader0ps">
#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec2 uvt;
varying vec2 uvb;
uniform float t;
uniform vec2 screen;
uniform sampler2D font;
uniform sampler2D bg;

const float numd = 4.;

float print_coords( vec2, vec2 );
float compute_digit( float, vec2 );
float load_digit( float, vec2 );
bool inbox( inout vec2, vec4 );
mat2 inverse( mat2 );

void main() {

  vec2 uvdx = dFdx( uvb );
  vec2 uvdy = dFdy( uvb );
  mat2 scr2uv = mat2( uvdx, uvdy );
  mat2 uv2scr = inverse( scr2uv );
  vec2 pos_tri = gl_FragCoord.xy - uv2scr*uvb;
  
  vec2 uv;
  float c = .0;
  
  uv = uvb;
  vec4 boxu = vec4( 0.5, 0.9, .0, .1 );
  if( inbox( uv, boxu ) ) {
    c = print_coords( uv2scr[0], uv );
  }

  uv = uvb;
  vec4 boxv = vec4( 0., 0.1, .5, .9 );
  if( inbox( uv, boxv ) ) {
    uv.xy = uv.yx;
    uv.y = 1.-uv.y;
    c = print_coords( uv2scr[1], uv );
  }

  uv = uvb;
  vec4 boxcx = vec4( 0, 0.2, .0, .1 );
  if( inbox( uv, boxcx ) ) {
    c = compute_digit( pos_tri.x, uv );
  }

  uv = uvb;
  vec4 boxcy = vec4( 0., 0.1, .11, .31 );
  if( inbox( uv, boxcy ) ) {
    uv.xy = uv.yx;
    uv.y = 1.-uv.y;
    c = compute_digit( pos_tri.y, uv );
  }

  
  vec4 color = texture2D( bg, uvb );
  if( c > .0 )
    color = vec4(1,1,1,1);
  gl_FragData[0] = color;
}

float compute_digit( float n, vec2 uv ) {
  float digit = floor(numd*uv.x);
  uv.x = fract(numd*uv.x);
  if( digit == .0 ) {
    if( n < .0 ) return load_digit( 15., uv );
    else return load_digit( 14., uv );
  }
  digit = digit - 1.;
  float d = abs(n)/pow(10.,numd-1.);
  for( float n = .0; n < numd-1.; n++ ) {
    if(n <= digit) d = 10.*fract(d);
    else break;
  }
  return load_digit( floor(d), uv );
}

float load_digit( float d, vec2 uv ) {
  float line = 4.;
  vec2 luv = vec2( fract(d/line), floor(d/line)/line );
  luv = luv+uv/line;
  return texture2D( font, luv ).r;
}

bool inbox( inout vec2 uv, vec4 box ) {
  float s0 = sign(uv.x-box.x)+sign(box.y-uv.x);
  float s1 = sign(uv.y-box.z)+sign(box.w-uv.y);
  if( s0*s1 > .0 ) {
    uv.x = (uv.x-box.x)/(box.y-box.x);
    uv.y = (uv.y-box.z)/(box.w-box.z);
    return true;
  } 
  return false;
}

float print_coords( vec2 coords, vec2 uv ) {
  float dd = 2.*numd + 1.;
  float d = floor(dd*uv.x);
  float c = .0;
  if( d < numd ) {
    vec2 uv2 = vec2( fract(dd*uv.x/numd), uv.y );
    c = compute_digit( coords.x, uv2 );
  } else if( d == numd ) {
    vec2 uv2 = vec2( fract(dd*uv.x), uv.y );
    c = load_digit( 11., uv2 );
  } else {
    vec2 uv2 = vec2( fract((dd*uv.x-1.-numd)/numd), uv.y );
    c = compute_digit( coords.y, uv2 );
  }
  return c;
}

mat2 inverse( mat2 m ) {
  vec2 uvdx = m[0];
  vec2 uvdy = m[1];
  float D = 1.0 / ( uvdx.x*uvdy.y - uvdx.y*uvdy.x );
  vec2 xydu = vec2( uvdy.y, -uvdx.y ) * D;
  vec2 xydv = vec2( -uvdy.x, uvdx.x ) * D;
  return mat2( xydu, xydv );
}
</textarea>


</div>

  [a]: #triangle
  [b]: #derivatives
  [c]: #lights
  [d]: #noperspective
  [bar]: barycentric.html "Barycentric Coordinates"


