
##Shader Tricks: Retrieving Triangle Location and Edges in Pixel Shader and More

  In this post I'm going to talk about:

  * [Getting triangle (primitive) location in screen space and its edge vectors][a]

  * [Non-perspective interpolation in WebGL][d]

  * [Using partial derivatives for peeking into another shader][b]

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
    vec2 xydu = vec2( uvdy.y, -uvdx.y ) * D;
    vec2 xydv = vec2( -uvdy.x, uvdx.x ) * D;
    mat2 uv2scr = mat2( xydu, xydv );

    //starting with OpenGL 3.1 (GLSL 1.4) there is inverse(...) intrinsic

  Okay. The first step is done. Now we need to find the location of uv=[0,0] on screen. Remember
  that uv is an interpolated barycentric, so we can use the above uv2scr to find the screen space
  position of the shaded fragment within the primitive. Then we subtract that from the global 
  screen space fragment position (gl\_FragCoord or SV\_POSITION) to get the desired result:

    vec2 pos_tri = gl_FragCoord.xy - uv2scr*uv;

  Below is a WebGL demonstration. On the sides of the triangle are screen dimensions of its edges
  together with screen position of the origin point. Three digits are printed so make sure your
  browser window is reasonable in size. Most of the code in pixel shader is for outputting the 
  text in the right place. To pause rotation just hit space bar.

<div class="webgl" webgl_version="1" webgl_div="shader0" init="load_demo_tri">
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

  Retrieving tri info is helpful in [DFAA][e] antialiasing: the edge vectors are used to determine
  sampling direction.


<a name="noperspective"></a>

###Non-perspective interpolation in WebGL

  In WebGL (both 1 and 2) there is no _noperspective_ qualifier and that's a problem because our
  barycentric coordinates need to be interpolated in screen space linearly. No worries, it can be 
  done by hand: we need to multiply by gl\_Position.w in the vertex shader and then divide by 
  1\gl\_FragCoord.w in the pixel shader (if the z is constant then we don't need to do anything).
  This effectively has the same effect as _noperspective_ interpolation.


<a name="derivatives"></a>

###Using partial derivatives for peeking into another shader

  Derivatives can be exploited to peek into what's happening in a neighbor fragment.

    float value;
    float value_in_right_fragment = value + dFdx( value );
    float value_in_up_fragment = value + dFdy( value ); 
    //up in OpenGL, down in DirectX

  While this looks alluring it has a number of problems. First, it's limited to right and up 
  fragments. Second, derivatives are calculated for a quad of fragments ( 2x2 ), so it essentially 
  halves the resolution. If you have linear data then it is all, obviously, no problem. 
  Another problem we have to check for out-of-primitive fragments and it can be done with 
  barycentrics (by checking for u&gt;=0, v&gt;=0, u+v &lt;=1 in neighbor fragments).


<div>

  <script src="js/common.js"></script>
  <script src="js/loader.js"></script>
  <script src="js/math.js"></script>
  <script src="js/camera.js"></script>
  <script src="js/webgl-quad.js"></script>
  <script src="js/webgl.js"></script>

  <script>
    var images = ["images/fixedfont.png", "images/triangle-info-bg.png"];

    var loader_img = load_images( images );

    function run_demo_tri (cb) {
      var opts = {
            bgcolor: [ 1, 1, 1, 1 ], 
            textures: { 
              font: { tex2d: 1, format: "RGB", magf: "NEAREST", minf: "NEAREST", 
                      genmipmap: 0, flip: 1, data: loader_img.data[0] },
              bg: { tex2d: 1, format: "RGB", magf: "LINEAR", minf: "LINEAR_MIPMAP_LINEAR",
                    genmipmap: 1, flip: 1, data: loader_img.data[1] },
            },
            extensions: [ "OES_standard_derivatives" ]
          };
      cb (opts);
    }

    function load_demo_tri(cb) {
      var span = this.querySelector("span");
      var div = this;
      var fn = function(){ 
        if( loader_img.failed ) 
          alert("Loading texture " + loader_img.failed_src + " failed. Try realoading the page.");
        else if( ! loader_img.loaded ) 
          alert("Textures not loaded. Check console output (ctrl+shift+j or F12) and try reloading the page.");
        else {
          div.load_animation = true;
          run_demo_tri (cb);
        }
      };
      if( ! this.load_animation )
        load_animation (loader_img, span, fn);
      else fn ();
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

<textarea class="hidden" id="shader0vs">//<!--
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

  vec4 p = vec4(0,0,0,1);
  float ar = screen.y/screen.x;
  float tt = fract(t/32.);
  float a = 2.*3.14159265*tt;

  mat2 m = mat2( vec2(cos(a),sin(a)), vec2(-sin(a),cos(a)) );

  if( vid_in < 3. ) {

    p = vec4( m*vec2( 1.4*v_in-.7 ), 0, 1 );
    p.x = p.x * ar;
  }

  gl_Position = p;
}
//-->
</textarea>
<textarea class="hidden" id="shader0ps">//<!--
#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec2 uvt;
varying vec2 uvb;
uniform sampler2D font;
uniform sampler2D bg;

float print_coords( vec2, vec2 );
float compute_digit( float, vec2 );
float load_digit( float, vec2 );
bool inbox( inout vec2, vec4 );
mat2 inverse( mat2 );

const float numd = 4.;

void main() {

  //getting tri info
  vec2 uvdx = dFdx( uvb );
  vec2 uvdy = dFdy( uvb );
  mat2 scr2uv = mat2( uvdx, uvdy );
  mat2 uv2scr = inverse( scr2uv );
  vec2 pos_tri = gl_FragCoord.xy - uv2scr*uvb;

  //the rest is printing digits
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
//-->
</textarea>


</div>


<a name="lights"></a>

###Many lights with the help of a primitive id

  Never thought of using gl\_PrimitiveID (SV\_PrimitiveID) for anything but recently realized that
  lights can be grouped for a primitive and iterated over in the pixel shader. I decided to cook up
  a WebGL Demo showing this (in WebGL1 I have to supply primitive id in a buffer and use float 
  textures for light parameters). 
  
  Below is the result. Well, before you click on the demo let me tell you that the experiment was 
  a fiasco. Good lighting is hard, good dynamic lighting is a sign of great expertise. So I have
  created a 3D array of lights and during rendering I go through each face and fill a float
  texture with light positions. In the shader I reference those by a face id. The trouble is, 
  you probably guess, to get seamless light coverage. It is a great problem by itself but here it
  is inherent in the technique. You can see that very clearly in the demo.

  So here is the summary: you can't really do dynamic primitive based lighting using primitive id. 
  May be it's just my crappy coding skill and you can point me to a good demo. I'd be thankful.
  Still you can use primitive id to do the [tri info trick][a] above: use it to reference into 
  index/vertex buffers and do all the transformations by hand.


<div class="webgl" webgl_version="1" webgl_div="shader1" init="load_demo_lenin">
  <img class="link" src="images/lenin.png" title="Click to show WebGL demo" alt="WebGL demo"/><br/>
  <span>Click to show WebGL demo</span>
</div>

<div class="shader hidden" id="shader1" js="" fn="" style="width: 60%">
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
  <textarea hide class="vs hidden" spellcheck="false">//<!--
attribute vec3 v_in;
attribute vec3 vn_in;
attribute float vid_in;
varying vec3 pos;
varying vec3 vn;
varying float pid;
uniform mat3 cam;
uniform vec3 campos;
uniform float t;
uniform vec2 screen;
uniform float dmax;

void main() {

  vn = cam*vn_in;
  pid = floor( vid_in/3. );
  vec3 p = cam*v_in;
  pos = p/dmax;
  p = p+campos;
  float far = 10000.0;
  float near = 1.0;
  float z = p.z;
  p.x = p.x * screen.y/screen.x;
  p.z = far*(z-near)/(far-near);
  gl_Position = vec4(p,z);
}
//-->
  </textarea>
  <textarea hide class="ps hidden" spellcheck="false">//<!--
precision highp float;
varying vec3 pos;
varying vec3 vn;
varying float pid;

const float pi = 3.14159265;
const float lperface = 16.;

uniform float t;
uniform float lsort;
uniform vec2 ltexsize;
uniform sampler2D ltex;


vec3 getc(float x) {
  vec3 colors[5];
  colors[0]=vec3(155, 55, 55)/255.;
  colors[1]=vec3(70, 60, 80)/255.;
  colors[2]=vec3(120, 60, 80)/255.;
  colors[3]=vec3(80, 60, 30)/255.;
  colors[4]=vec3(122, 101, 64)/255.;

  float v = floor( fract(abs(x)*7.)*5. );
  if(v==0.) return colors[0];
  if(v==1.) return colors[1];
  if(v==2.) return colors[2];
  if(v==3.) return colors[3];
  return colors[4];
}

void main() {
  vec3 norm = normalize(vn);
  vec2 px = 1./ltexsize;
  vec2 uv = vec2( fract(lperface*pid/ltexsize.x)+.5*px.x,
            floor(lperface*pid/ltexsize.x)/ltexsize.y+.5*px.y);
  float ka = .0, n = .0;
  vec3 c = vec3(0,0,0);
  for(float i=.0; i<lperface; i++ ) {
    vec4 l = texture2D( ltex, uv+i*vec2(px.x,0) );
    if( l.w == .0 ) continue;
    n++;
    vec3 ldir = l.xyz-pos;
    float d = 1.+length(ldir);
    float kd = 0.;
    if( lsort == 0. ) 
      kd = 1./(1.5*d+1.5*d*d);
    else 
      kd = 1./(0.75*d+0.25*n*d*d);
    kd = kd * abs(dot(normalize(ldir),norm));
    vec3 col = getc(l.x);
    c = c+col*kd;
  }
  gl_FragColor = vec4(c, 1);
}
//-->
  </textarea>
  <div hide class="help hidden"></div>
  <div class="buttons">
  <button title="Reload Shaders" class="reload">Reload</button>
  <button title="Output WebGL Info in Console" class="log">Log</button>
  <button title="Pause Rendering" class="pause">Pause</button>
  <button title="Go Fullscreen" class="fscreen">FS</button>
  <button title="Sort/Not Sort Lights" id="lsort" class="active">Sort</button>
  <button title="Rotate/Dont Rotate" id="rot" class="active">Rotate</button>
  </div>
  <div class="clear"></div>
</div>


  By the way, have you recognized who's that statue rotating? If not then here is some [info][l].


<div>

<script>
  var loader_lenin;

  function load_demo_lenin (cb) {

    var span = this.querySelector("span");
    var div = this;

    if( !loader_lenin || 
          loader_lenin.failed || 
            !loader_lenin.loaded )

      loader_lenin = load_resources( ["webgl/lenin2dec2.obj"], {} );

    loader_lenin.delay = 500;

    var fn = function(){ 
      if( loader_lenin.failed ) 
        alert("Loading " + loader_lenin.failed_src + " failed. Try realoading the page.");
      else if( ! loader_lenin.loaded ) 
        alert("Resources not loaded. Check console output (ctrl+shift+j or F12) and try reloading the page.");
      else {
        div.load_animation = true;
        lenin.call ( div, cb );
      }
    };

    if( ! this.load_animation )
      load_animation (loader_lenin, span, fn);
    else fn ();
  }

  var vb, nb, fcb, idb;
  var d_max=1; cells=8, lights_max=500, rotate=true;
  var lights=array(Math.pow(cells,3), null).map( function(){ return []; } );
  var lperface=16, lsorted=lperface*3, lsort=true;
  var per_frame=5, ltexw, ltexh, ltex;

  function lenin (cb) {

    load_buffers();
    load_lights();

    var div = this.getAttribute("webgl_div");
    var canvas = document.querySelector( "div#"+div+" canvas" );

    lsort = rotate = true;

    var but_lsort = document.getElementById( "lsort" );
    but_lsort.onclick = function() { 
      lsort = this.classList.toggle("active"); this.blur(); 
    };
    
    var but_rot = document.getElementById( "rot" );
    but_rot.onclick = function() { 
      rotate = this.classList.toggle("active"); this.blur(); 
    };

    var cam = camera_create( { canvas: canvas, nobind: false, personal: false, pos: vec3(0,0,400), speed: 10 } );
    var a=-Math.PI/1024., c=Math.cos(a), s=Math.sin(a);
    var mrot = mat3(vec3(c,0,s),vec3(0,1,0),vec3(-s,0,c));

    compute_lights(cam);
    
    var opts = {
      bgcolor : [.95, .95, .95, 1],
      buffers : {v_in: vb, vn_in: nb, vid_in: idb},
      draw_size : vb.length/3,
      uniforms : {
        ltexsize: [ltexw,ltexh],
        cam: function(){ return cam.get_m(); }, 
        campos: function(){ return cam.get_pos(); },
        dmax: [d_max],
        lsort: function() { return [lsort]; },
      },
      textures : { 
        ltex: { tex2d: 1, width: ltexw, height: ltexh, format: "RGBA", type: "FLOAT",
                  minf:"NEAREST", magf:"NEAREST", genmipmap: 0, 
                  data: function(frame,dt) { 
                          if( frame%per_frame == 0 ) return ltex;
                          return null;
                        },
               },
      },
      extensions : [ "OES_texture_float" ],
      onreload : function() { cam.reset_m(); },
      onclose : function() { camera_remove(cam); },
      onpause : function(s) { cam.pause(s); },
      onpresent : function(frame,dt) {
        if( !cam.paused ) {
          if( rotate ) cam.m = mul( cam.m, mrot );
          if(frame%per_frame == 0) compute_lights(cam);
        }
      },
    };
    opts.uniforms.cam.matrix_size = 3;
    cb (opts);
  }

  function load_buffers() {
    var m, v=[], vn=[], f=[];
    var reg = /^v\s+([-.\d]+)\s+([-.\d]+)\s+([-.\d]+)/gm;
    while( (m = reg.exec( loader_lenin.data[0])) !== null )
      v.push( parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]) );

    reg = /^vn\s+([-.\d]+)\s+([-.\d]+)\s+([-.\d]+)/gm;
    while( (m = reg.exec( loader_lenin.data[0])) !== null )
      vn.push( parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]) );

    reg = /^f\s+(\d+)\/\/\d+\s+(\d+)\/\/\d+\s+(\d+)\/\/\d+/gm;
    while( (m = reg.exec( loader_lenin.data[0])) !== null )
      f.push( parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]) );

    vb = new Float32Array( f.length*3 );
    nb = new Float32Array( f.length*3 );
    idb = new Float32Array( f.length );
    idb.attrib_size = 1;
    fcb = new Float32Array( f.length );
    var fc = array(9,.0);
    var i;
    for(i=0; i<f.length; i++) {
      var fci = i%3;
      for(var t=0; t<3; t++) {
        fc[fci*3+t] = vb[i*3+t] = v[ (f[i]-1)*3+t ];
        nb[i*3+t] = vn[ (f[i]-1)*3+t ];
      }
      if( i > 0 && fci == 0 ) {
        face_center( i-3, fc );
      }
      idb[i] = i;
    }
    face_center( i-3, fc );
  }

  function face_center ( f, fc ) {
    for(var i=0; i<3; i++) {
      fcb[f+i] = (fc[i] + fc[i+3] + fc[i+6])/3.;
    }
    d_max = Math.max ( d_max, len([fcb[f],fcb[f+1],fcb[f+2]]) );
  }

  function load_lights() {

    for(var i=0;i<fcb.length;i++) fcb[i] = fcb[i]/d_max;

    for(var n=0; n<lights_max; n++) {
      
      var z = Math.random(), 
          y = Math.random(), 
          x = Math.random(), 
          w = 1.;//Math.random();

      var idx = Math.floor(z*cells)*cells*cells + 
                Math.floor(y*cells)*cells + 
                Math.floor(x*cells);

      lights[idx].push( vec4(x*2.-1.,y*2.-1.,z*2.-1.,w) );
      
    }

    var s = Math.ceil( Math.sqrt( fcb.length/3 ) );
    ltexw = lperface * s;
    ltexh = s;

    ltex = new Float32Array( ltexw * ltexh * 4 );
  }

  function compute_lights(cam) {
    var v = vec3(), logged = 0, lmin=[];
    clear(ltex,.0);
    for(var i=0; i<fcb.length/3; i++) {
      v[0] = fcb[i*3]; v[1] = fcb[i*3+1]; v[2] = fcb[i*3+2];
      v = mul( cam.m, v );
      var x = Math.floor( cells*(.5+.5*v[0]) ), 
          y = Math.floor( cells*(.5+.5*v[1]) ), 
          z = Math.floor( cells*(.5+.5*v[2]) );
      var asize = 0;
      lmin.length = lsorted;
      clear( lmin, null );
      for(var zz=Math.max(0,z-1); zz<=Math.min(cells-1,z+1); zz++)
      for(var yy=Math.max(0,y-1); yy<=Math.min(cells-1,y+1); yy++)
      for(var xx=Math.max(0,x-1); xx<=Math.min(cells-1,x+1); xx++) {
        var ls = lights[ zz*cells*cells+yy*cells+xx ];
        for(var t=0; t<ls.length; t++ ) {
          var l = ls[t];
          if( asize < lmin.length ) {
            if( lsort ) 
              l.dmin = len(sub(v,l));
            lmin[ asize++ ] = l;
          }
        }
      }
      if(asize) {
        if( lsort ) {
          lmin.length = asize;
          lmin.sort( function(a,b) { return a.dmin-b.dmin; } );
        }
        for(var n=0; n<Math.min(asize,lperface); n++) {
          ltex[i*4*lperface+n*4+0] = lmin[n][0];
          ltex[i*4*lperface+n*4+1] = lmin[n][1];
          ltex[i*4*lperface+n*4+2] = lmin[n][2];
          ltex[i*4*lperface+n*4+3] = lmin[n][3];
        }
      }
    }
  }

</script>

</div>


  [a]: #triangle
  [b]: #derivatives
  [c]: #lights
  [d]: #noperspective
  [e]: dfaa.html "DFAA Antialiasing Algorithm"
  [bar]: barycentric.html "Barycentric Coordinates"
  [l]: lenin.html "Vladymir Lenin"


