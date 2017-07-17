
##Dynamic Lighting using Primitive ID

  Never thought of using gl\_PrimitiveID (SV\_PrimitiveID) for anything but recently realized that
  lights can be grouped for a primitive and iterated over in the pixel shader. I decided to cook up
  a WebGL Demo showing this (in WebGL1 I have to supply primitive id in a buffer and use float 
  textures for light parameters). 
  
  The lights are clustered into a 3D array of 25x25x25 depending on the distance from a cell. 
  The total number of lights is 400 randomly put into the array. During a frame a dynamic float 
  texture is updated: for every face we load the lights from the precomputed array (based on the 
  face's center point) and write them into the texture. In the shader we compute the uv using the 
  primitive id and sample it for each light. The lights are not animated to minimize per frame 
  computations. Also JavaScript performance varies between browsers, as an instance take a look
  at a [division test][d] (try it in different browsers). I noticed that my Chrome is 2 times 
  slower at divides that Firefox.
  
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
varying float pid;

uniform mat3 cam;
uniform vec3 campos;
uniform vec2 screen;
uniform float dmax;

const float pi = 3.14159265;
const float lperface = 48.;

uniform float vmode;
uniform vec2 ltexsize;
uniform sampler2D ltex;

float round(float v){ return floor(v+.5); }

vec3 getc(float x) {
  
  vec3 colors[5];

  colors[0]=vec3(70, 90, 70)/255.;
  colors[1]=vec3(80, 60, 100)/255.;
  colors[2]=vec3(180, 50, 80)/255.;
  colors[3]=vec3(70, 80, 100)/255.;
  colors[4]=vec3(180, 60, 40)/255.;

  float v = floor( fract(abs(x)*333.)*5. );

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
  pid = floor( vid_in/3. + 0.05 );
  vec3 p = cam*v_in;
  pos = p/dmax;
  p = p+campos;
  float far = 10000.0;
  float near = 1.0;
  float z = p.z;
  p = ar * p;
  p.z = far*(z-near)/(far-near);
  gl_Position = vec4(p,z);


  if( vmode == 1. ) {

    vec3 norm = normalize(vn);
    vec2 px = 1./ltexsize;
    vec2 uv = vec2( fract(lperface*round(vid_in)/ltexsize.x)+.5*px.x,
              floor(lperface*round(vid_in)/ltexsize.x)/ltexsize.y+.5*px.y);
    float kd = 1., n = .0;
    vec3 c = vec3(0,0,0);
    for(float i=.0; i<lperface; i++ ) {
      vec4 l = texture2DLod( ltex, uv+i*vec2(px.x,0), 0. );
      if( l.w == .0 ) break;
      n++;
      vec3 ldir = l.xyz-pos;
      float d = 1.+length(ldir);
      kd = abs(dot(normalize(ldir),norm));
      kd = 6.0 * pow(kd, 1.75) / pow( d, 18.);
      vec3 col = getc(l.x);
      c = c+col*kd;
    }
    float gamma = 1./2.2;
    color = pow(c, vec3(gamma));
  }
}
//-->
  </textarea>
  <textarea hide class="ps hidden" spellcheck="false">//<!--
precision highp float;
varying vec3 pos;
varying vec3 vn;
varying vec3 color;
varying float pid;

const float pi = 3.14159265;
const float lperface = 48.;

uniform float vmode;
uniform vec2 ltexsize;
uniform sampler2D ltex;

float round(float v){ return floor(v+.5); }

vec3 getc(float x) {
  
  vec3 colors[5];

  colors[0]=vec3(70, 90, 70)/255.;
  colors[1]=vec3(80, 60, 100)/255.;
  colors[2]=vec3(180, 50, 80)/255.;
  colors[3]=vec3(70, 80, 100)/255.;
  colors[4]=vec3(180, 60, 40)/255.;

  float v = floor( fract(abs(x)*333.)*5. );

  if(v==0.) return colors[0];
  if(v==1.) return colors[1];
  if(v==2.) return colors[2];
  if(v==3.) return colors[3];
  return colors[4];
}

void main() {

  if( vmode == 1. ) {
    gl_FragColor = vec4(color,1);
    return;
  }

  vec3 norm = normalize(vn);
  vec2 px = 1./ltexsize;
  vec2 uv = vec2( fract(lperface*round(pid)/ltexsize.x)+.5*px.x,
            floor(lperface*round(pid)/ltexsize.x)/ltexsize.y+.5*px.y);
  float kd = 1., n = .0;
  vec3 c = vec3(0,0,0);
  for(float i=.0; i<lperface; i++ ) {
    vec4 l = texture2D( ltex, uv+i*vec2(px.x,0) );
    if( l.w == .0 ) break;
    n++;
    vec3 ldir = l.xyz-pos;
    float d = 1.+length(ldir);
    kd = abs(dot(normalize(ldir),norm));
    kd = 6.0 * pow(kd, 1.75) / pow( d, 18.);
    vec3 col = getc(l.x);
    c = c+col*kd;
  }
  float gamma = 1./2.2;
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
  var d_max=0.0; cells=20, lights_max=400, rotate = true;
  var lights, lradius = 1.0/cells*8;
  var lperface=48, lsort=true, vmode=false;
  var per_frame=10, ltexw, ltexh, ltex, ltexupdate=false;

  function lenin (cb) {

    if( is_mobile() ) {
      alert( "Warning! Best viewed on desktop!" );
      lights_max = 100;
      cells = 10;
      per_frame = 20;
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
      compute_lights(cam);
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
        ltexsize: [ltexw,ltexh],
        cam: function(){ return cam.get_m(); }, 
        campos: function(){ return cam.get_pos(); },
        vmode: function(){ return [vmode]; },
        dmax: [d_max],
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
        if( !cam.paused && rotate ) cam.m = mul( cam.m, mrot );
        if( cam.rotate || frame%per_frame == 0 ) {
          compute_lights(cam);
          ltexupdate = true;
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
    vv = new Float32Array( f.length*3 );
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

      d_max = Math.max( d_max, len([vb[i*3],vb[i*3+1],vb[i*3+2]]) );

      if( i > 0 && fci == 0 ) face_center( i-3, fc );

      idb[i] = i;
    }

    face_center( i-3, fc );

    for(var i=0; i<vb.length; i++) vv[i] = vb[i]/d_max;
    for(var i=0; i<fcb.length; i++) fcb[i] = fcb[i]/d_max;

    var s = Math.ceil( Math.sqrt( fcb.length * lperface ) );
    ltexw = Math.floor( (s+lperface-1)/lperface ) * lperface;
    ltexh = s;
    ltex = new Float32Array( ltexw * ltexh * 4 );
  }

  function face_center ( f, fc ) {
    for(var i=0; i<3; i++) {
      fcb[f+i] = (fc[i] + fc[i+3] + fc[i+6])/3.;
    }
  }

  function load_lights() {

    lights = array( Math.pow(cells,3), null ).map( function(){ return []; } );

    var v = vec3(), ldir = vec3(), cell_max=0, cell_min = 10000;

    console.info( "computing lights clusters: ", lights.length*lights_max, "loop iterations" );
  
    var pxh = 0.5*1.0/cells;

    for(var n=0; n<lights_max; n++) {    

      var lz = Math.random(), 
          ly = Math.random(), 
          lx = Math.random(), 
          lw = 1.;


      for(var z=0; z<cells; z++)
      for(var y=0; y<cells; y++)
      for(var x=0; x<cells; x++) {
        v[0] = lx-x/cells-pxh; v[1] = ly-y/cells-pxh; v[2] = lz-z/cells-pxh;
        var d = 1.+len(v);
        var kd = 4.0 * Math.pow(0.7, 1.75) / Math.pow(d, 18);
        if( kd < 1./512. ) continue;
        var l = vec4( lx*2.-1., ly*2.-1., lz*2.-1., lw );
        l.dist_to_cell = d;
        var idx = z*cells*cells+y*cells+x;
        lights[idx].push( l );
        if( lights[idx].length > cell_max ) cell_max = lights[idx].length;
      }
      
    }

    if( lsort ) {

      console.info( "sorting lights in cells" );

      for(var z=0.; z<cells; z++) {
      for(var y=0.; y<cells; y++) {
      for(var x=0.; x<cells; x++) {
        var idx = z*cells*cells+y*cells+x;
        lights[idx].sort( function(a,b) { return a.dist_to_cell - b.dist_to_cell; } );
        if( lights[idx].length < cell_min ) cell_min = lights[idx].length;
      }}}
    }

    console.info( "max lights per cell = ", cell_max, ", min = ", cell_min );
  }

  function compute_lights(cam) {

    var v = vec3(), logged = 0, lmin=[];

    clear(ltex,.0);

    var sz = vmode ? idb.length : fcb.length/3;

    for(var i=0; i<sz; i++) {
      if( vmode ) {
        v[0] = vv[i*3]; v[1] = vv[i*3+1]; v[2] = vv[i*3+2];
      } else {
        v[0] = fcb[i*3]; v[1] = fcb[i*3+1]; v[2] = fcb[i*3+2];
      }

      v = mul( cam.m, v );

      var x = Math.floor( cells*(.5+.5*v[0]) ), 
          y = Math.floor( cells*(.5+.5*v[1]) ), 
          z = Math.floor( cells*(.5+.5*v[2]) );

      if( x < 0 ) x = 0;
      if( y < 0 ) y = 0;
      if( z < 0 ) z = 0;
      if( x >= cells ) x = cells-1;
      if( y >= cells ) y = cells-1;
      if( z >= cells ) z = cells-1;

      var idx = z*cells*cells+y*cells+x;
      var l = lights[idx];
      var size = Math.min(lperface,l.length);

      for(var n=0; n<size; n++) {
        ltex[i*4*lperface+n*4+0] = l[n][0];
        ltex[i*4*lperface+n*4+1] = l[n][1];
        ltex[i*4*lperface+n*4+2] = l[n][2];
        ltex[i*4*lperface+n*4+3] = l[n][3];
      }
    }
  }

</script>

</div>


[a]: shader.html
[l]: lenin.html "Vladymir Lenin"
[d]: https://jsfiddle.net/ed8rccow/6/ "The Division Perfomance Test"

