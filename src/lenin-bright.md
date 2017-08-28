
##Dynamic Lighting using Primitive ID

  Never thought of using gl\_PrimitiveID (SV\_PrimitiveID) for anything but recently realized that
  lights can be grouped for a primitive and iterated over in the pixel shader. I decided to cook up
  a WebGL Demo showing this (in WebGL1 I have to supply primitive id in a buffer and use float 
  textures for light parameters). 
  
  The lights are clustered into a 3D array of 25x25x25 depending on the distance from a cell. 
  Handreds of lights are randomly put into the array. During a frame a dynamic float 
  texture is updated: for every face we load the lights from the precomputed array (based on the 
  face's center point) and write them into the texture. In the shader we compute the uv using the 
  primitive id and sample it for each light. The lights are not animated to minimize per frame 
  computations. Also JavaScript performance varies between browsers, as an instance take a look
  at a [division test][d] (try it in different browsers). I noticed that my desktop Chrome is 
  2 times slower at divides than desktop Firefox.
  
  While it sounds quite simple, it actually was problematic to fight popping. It is really hard
  to find the best combination of the number of lights per cluster and the number of lights in
  the shader. Also difficult is to find parameters for the lighting equation so it looks good.
  And I want to note that I'm not doing physically correct lighting here, just something that
  works, very hacky.

  Also the lighting can be done **per vertex** instead of **per face**. To see the difference 
  I have added a button at the bottom (there are also buttons for rotation and fullscreen). 
  The great advantage of per vertex is no popping, but at the cost of quality. And it can be 
  surprising, but performance might be worse (I'm not sure, needs to be measured).

  So here is the summary: it is certainly possible to do dynamic lighting using primitive ID but 
  benefits are questionable: too many lights are needed to be provided per face to eliminate 
  popping (in the pixel shader I use a maximum of 32 lights per face). If not for lighting then 
  primitive id can also be used to do the [tri info trick][a] without using barycentrics: we can 
  use it to reference into index/vertex buffers and do all the transformations by hand in the 
  shader.


<div class="webgl" webgl_version="1" webgl_div="shader0" init="load_demo">
  <img class="link" src="images/lenin.png" title="Click to show WebGL demo" alt="WebGL demo"/><br/>
  <span>Click to show WebGL demo</span>
</div>

<div class="shader hidden" id="shader0" js="" fn="">
  <ul class="close">
    <li title="Info" class="help">?</li>
    <li title="Close Demo" class="close">Close</li>
  </ul>
  <ul class="menu">
    <li title="WebGL Canvas" class="canvas">Canvas</li>
    <li title="Vertex Shader" class="vs">VS</li>
    <li title="Pixel Shader" class="ps">PS</li>
  </ul>
  <div class="canvas">
  <canvas hide class="canvas"></canvas>
  <textarea hide class="vs hidden" spellcheck="false">//<!--
precision highp float;
attribute vec3 v_in;
attribute vec3 vn_in;
attribute float vid_in;

varying vec3 pos;
varying vec3 vn;
varying vec3 color;

uniform mat3 cam;
uniform vec3 campos;
uniform vec2 screen;
uniform vec3 opts;

const float pi = 3.14159265;

uniform float vmode;
uniform vec2 ltexsize;
uniform sampler2D ltex;

float round(float v){ return floor(v+.5); }
float md(float a, float b){ return round( b*fract(a/b) ); }

vec3 getc(float x) {
  
  vec3 colors[5];

  colors[0]=vec3(70, 90, 70)/255.;
  colors[1]=vec3(80, 60, 100)/255.;
  colors[2]=vec3(180, 50, 80)/255.;
  colors[3]=vec3(70, 80, 100)/255.;
  colors[4]=vec3(180, 60, 40)/255.;

  float v = md(x,5.);

  if(v==0.) return colors[0];
  if(v==1.) return colors[1];
  if(v==2.) return colors[2];
  if(v==3.) return colors[3];
  return colors[4];
}

void main() {

  vec3 ar = vec3(1);
  if( screen.x > screen.y ) 
    ar = vec3(screen.y/screen.x,1,1);
  else
    ar = vec3(1,screen.x/screen.y,1);
  vn = cam*vn_in;
  vec3 p = cam*v_in;
  pos = p;
  p = p+campos;
  float far = 10000.0;
  float near = 1.0;
  float z = p.z;
  p = ar * p;
  p.z = far*(z-near)/(far-near);
  gl_Position = vec4(p,z);


  if( vmode == 1. ) {

    vec3 norm = normalize(vn);
    color = vec3(0,0,0);
  }
}
//-->
  </textarea>
  <textarea hide class="ps hidden" spellcheck="false">//<!--
precision highp float;
varying vec3 pos;
varying vec3 vn;
varying vec3 color;

const float pi = 3.14159265;

const float lsize = 8.;

uniform vec3 opts;
uniform float vmode;
uniform float t;
uniform sampler2D ltex;

float round(float v){ return floor(v+.5); }
float md(float a, float b){ return round( b*fract(a/b) ); }
vec3 md(vec3 a, vec3 b){ return a; }

vec3 getc(float x) {

  vec3 colors[5];

  colors[0]=vec3(70, 90, 70)/255.;
  colors[1]=vec3(80, 60, 100)/255.;
  colors[2]=vec3(180, 50, 80)/255.;
  colors[3]=vec3(70, 80, 100)/255.;
  colors[4]=vec3(180, 60, 40)/255.;

  float v = md(x,5.);

  if(v==0.) return colors[0];
  if(v==1.) return colors[1];
  if(v==2.) return colors[2];
  if(v==3.) return colors[3];
  return colors[4];
}

vec3 light(vec3 cell) {
  float cells = opts.x, lpercell = opts.y, distmax = opts.z;
  float zsqrt = sqrt( cells ), texl = cells * zsqrt;
  cell = clamp(cell,.0,cells-1.);
  vec3 n = normalize(vn);
  vec3 p = pos/distmax*.5 + .5;
  vec2 pxh = vec2( .5/texl/lpercell, .5/texl );
  vec2 px = vec2( 1./texl/lpercell, 0 );
  vec2 zoff = vec2( mod(cell.z,zsqrt), floor( cell.z/zsqrt ) );
  vec2 uv = ( cell.xy + zoff*cells ) / texl;

  vec3 c = vec3(0,0,0);

  for(float i=.0; i < lsize; i++ ) {
    vec4 l = texture2D( ltex, uv+i*px+pxh );
    if( l.w == .0 ) break;
    vec3 ldir = l.xyz-p;
    float d = 1.+length(ldir);
    float kd = abs( dot(normalize(ldir), n) );
    float s = smoothstep(0.,0.5,cos(t));
    kd = (s*2.+2.) * pow(kd, 2.) / pow( d, 14.);
    c = c + kd * getc(l.w + (s*2.+2.)*t);
  }
  return c;
}

void main() {

  if( vmode == 1. ) {
    gl_FragColor = vec4(color, 1);
    return;
  }

  float cells = opts.x, distmax = opts.z;
  vec3 p = pos/distmax*.5 + .5;
  vec3 cell = floor(p*cells-.5);
  vec3 off = fract(p*cells+.5);
  
  vec3 c0 = light( cell );
  vec3 c1 = light( cell + vec3(1,0,0));
  vec3 c01 = mix(c0,c1,off.x);
  vec3 c2 = light( cell + vec3(0,1,0));
  vec3 c3 = light( cell + vec3(1,1,0));
  vec3 c23 = mix(c2,c3,off.x);
  vec3 c03 = mix(c01,c23,off.y);
  
  vec3 d0 = light( cell + vec3(0,0,1));
  vec3 d1 = light( cell + vec3(1,0,1));
  vec3 d01 = mix(d0,d1,off.x);
  vec3 d2 = light( cell + vec3(0,1,1));
  vec3 d3 = light( cell + vec3(1,1,1));
  vec3 d23 = mix(d2,d3,off.x);
  vec3 d03 = mix(d01,d23,off.y);
  
  vec3 c = mix(c03,d03,off.z);

  const float gamma = 1./2.2;
  c = pow(c, vec3(gamma));

  gl_FragColor = vec4(c, 1);
}
//-->
  </textarea>
  <div hide class="help hidden"></div>
  </div>
  <div class="buttons">
  <button title="Reload Shaders" class="reload">Reload</button>
  <button title="Output WebGL Info in Console" class="log">Log</button>
  <button title="Pause Rendering" class="pause">Pause</button>
  <button title="Go Fullscreen" class="fscreen">FS</button>
  <button title="Rotate/Dont Rotate" id="rot" class="active">Rotate</button>
  <button title="Lighting Per Face/Per Vertex" id="vmode">Per face</button>
  <input type="text" size="2" title="Number of Lights" value="300" id="nlights">
  <button title="Set the Number of Lights" id="setnlights">Ok</button>
  </div>
</div>

<div class="clear">
</div>

  By the way, have you recognized who's that statue rotating? If not then here is some [info][l].


<div>

<script src="js/common.js"></script>
<script src="js/loader.js"></script>
<script src="js/math.js"></script>
<script src="js/camera.js"></script>
<script src="js/webgl-quad.js"></script>
<script src="js/webgl.js"></script>


<script>

  var loader_lenin;

  function load_demo (cb) {

    var span = this.querySelector("span");
    var div = this;

    if( !loader_lenin || 
          loader_lenin.failed || 
            !loader_lenin.loaded )

      loader_lenin = load_resources( ["webgl/lenin2dec4k.obj"], {} );

    loader_lenin.delay = 500;
    loader_lenin.span_text = "Computing lights, please wait...";
    loader_lenin.span_title = "Please wait";

    var fn = function(){ 
      if( loader_lenin.failed ) 
        alert("Loading " + loader_lenin.failed_src + " failed. Try realoading the page.");
      else if( ! loader_lenin.loaded ) 
        alert("Resources not loaded. Check console output (ctrl+shift+j or F12) and try reloading the page.");
      else {
        loader_lenin.step=2;
        lenin.call ( div, cb );
      }
    };

    load_animation (loader_lenin, span, fn);
  }

  var vv, vb, nb, fcb, idb;
  var d_max=0.0, cells=16, lights_max=150, rotate = true;
  var lights, lradius = 1./4.;
  var lpercell=8, lsort=true, vmode=false;
  var per_frame=10, ltexw, ltexh, ltex, ltexupdate=false;

  if( sqrt(cells) - floor(sqrt(cells)) ) throw "cells is not a square of two";

  function lenin (cb) {

    if( is_mobile() ) {
      alert( "Warning! Best viewed on desktop!" );
      lights_max = 200;
      cells = 10;
      per_frame = 32;
    }

    if( vb === undefined ) {

      load_buffers();
    }

    load_lights();

    var div = this.getAttribute("webgl_div");
    var canvas = document.querySelector( "div#"+div+" canvas" );

    rotate = true;
    
    var but_rot = document.getElementById( "rot" );
    but_rot.classList.add("active");
    but_rot.onclick = function() { 
      rotate = this.classList.toggle("active"); this.blur(); 
    };

    var cam = camera_create( { element: canvas.parentNode, nobind: false, personal: false, pos: vec3(0,0,400), speed: 10 } );
    var a=-Math.PI/2048.0, c=Math.cos(a), s=Math.sin(a);
    var mrot = mat3(vec3(c,0,s),vec3(0,1,0),vec3(-s,0,c));
    var camm = mat3();
    
    var but_vmode = document.getElementById( "vmode" );
    but_vmode.onclick = function() { 
      if( !this.vmode ) {
        this.innerHTML = "Per vertex";
        vmode = this.vmode = true;
      } else {
        this.innerHTML = "Per face";
        vmode = this.vmode = false;
      }
      this.blur();
      this.disabled = true;
      setTimeout( function() { but_vmode.disabled = false; }, 500 );
      load_lights();
      ltexupdate = true;
    };

    var but_nlights = document.getElementById( "setnlights" );
    var nlights = document.getElementById( "nlights" );
    nlights.value = lights_max;
    but_nlights.onclick = function() {
      var n = parseInt( nlights.value, 10 );
      if( n === NaN || n < 0 || n > 1000 ) alert( "wrong value" );
      else {
        lights_max = n;
        but_nlights.innerHTML = "Please wait...";
        but_nlights.disabled = true;
        setTimeout( function() {
          load_lights();
          ltexupdate = true;
          but_nlights.innerHTML = "Ok";
          but_nlights.disabled = false;
        }, 100 );
      }
    };

    var opts = {
      bgcolor : [.95, .95, .95, 1],
      buffers : {v_in: vb, vn_in: nb, vid_in: idb},
      draw_size : vb.length/3,
      uniforms : {
        opts: [cells,lpercell,d_max],
        cam: function(){ return cam.get_m(); }, 
        campos: function(){ return cam.get_pos(); },
        vmode: function(){ return [vmode]; },
      },
      textures : { 
        ltex: { tex2d: 1, width: ltexw, height: ltexh, format: "RGBA", type: "FLOAT",
                  minf:"NEAREST", magf:"NEAREST", genmipmap: 0, 
                  data: function(frame,dt) { 
                          if( frame === undefined || ltexupdate ) { 
                            ltexupdate = false;
                            return ltex;
                          }
                          return null;
                        },
               },
      },
      extensions : [ "OES_texture_float" ],
      onreload : function() { cam.reset_m(); },
      onclose : function() { camera_remove(cam); },
      onpause : function(s) { cam.pause(s); },
      onframe : function(frame,dt) {
        if( !cam.paused && rotate ) {
          mcopy( camm, cam.m );
          mclear( cam.m );
          mmul( cam.m, camm, mrot );
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
    var vv = vec3();
    
    for(var i=0; i<f.length; i++) {

      for(var t=0; t<3; t++) {
        vv[t] = vb[i*3+t] = v[ (f[i]-1)*3+t ];
        nb[i*3+t] = vn[ (f[i]-1)*3+t ];
      }

      d_max = Math.max( d_max, len(vv) );

      idb[i] = i;
    }

  }

  function load_lights() {

    lights = array( Math.pow(cells,3), null ).map( function(){ return []; } );

    var v = vec4(), ldir = vec4();

    console.info( "computing lights clusters: ", lights.length*lights_max, "loop iterations" );
  
    var pxh = 0.5*1.0/cells;

    for(var n=0; n<lights_max; n++) {    

      var l = vec4( Math.random(), Math.random(), Math.random(), n );

      for(var z=0; z<cells; z++)
      for(var y=0; y<cells; y++)
      for(var x=0; x<cells; x++) {
        v[0] = x/cells+pxh; 
        v[1] = y/cells+pxh; 
        v[2] = z/cells+pxh;
        v[3] = n;
        sub(ldir, l, v);
        var d = len(ldir);
        if( d > lradius ) continue;
        var idx = z*cells*cells+y*cells+x;
        if( lights[idx].length < lpercell ) {
          l.dist_to_cell = d;
          lights[idx].push( l );
        }
      }
      
    }

    if( lsort ) {

      console.info( "sorting lights in cells" );

      foreach( lights, function(e){
        e.sort( function(a,b) { return a.dist_to_cell - b.dist_to_cell; } );
      } );
    }

    var zsqrt = round( sqrt( cells ) );
    var stride = cells*lpercell*zsqrt*4;
    ltex = new Float32Array( Math.pow( cells, 3 ) * lpercell * 4 );
    ltexw = cells*zsqrt*lpercell;
    ltexh = cells*zsqrt;

    for(var z=0; z<cells; z++)
    for(var y=0; y<cells; y++)
    for(var x=0; x<cells; x++) {
      var zx = z % zsqrt, zy = floor( z / zsqrt );
      var idx = z*cells*cells+y*cells+x;
      foreach( lights[idx], function(e,i) {
        var offx = zx*cells, offy = zy*cells;
        for( var n=0; n < 4; n++ ) 
          ltex[(y+offy)*stride+(x+offx)*lpercell*4+i*4+n] = e[n];
      } );
    }
  }


</script>

</div>


[a]: shader.html
[l]: lenin.html "Vladymir Lenin"
[d]: https://jsfiddle.net/ed8rccow/6/ "The Division Perfomance Test"

