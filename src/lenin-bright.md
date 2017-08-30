
##Dynamic Lighting using Primitive ID: Lessons Learned

  One day I had an idea to implement dynamic lighting by aggregating and providing lights per face
  in the pixel shader. The shader was then going to sample it from a texture using primitive ID
  (gl\_PrimitiveID/SV\_PrimitiveID). I thought it could be quite efficient due to coherent warp 
  execution. Below is the result:

  <center><a href="images/lenin-popping-marked.jpg" onclick="event.preventDefault()">
  <img onclick="this.src = this.src.indexOf('marked') > 0 ? 'images/lenin-popping.jpg' : 'images/lenin-popping-marked.jpg'" 
    src="images/lenin-popping.jpg" class="img35"/>
  </a></center>

  Do you spot a problem on the image? Click the image for the answer. There is an initial WebGL 
  [demo][] where you can see it happening, just rotate the model. Being blissfully unaware of the 
  cause of this I set out to quickly solve it. And failed. This post aims to describe what went 
  wrong and how I solved it.
  
  No matter how hard I tried I could not completely remove this popping effect. I noticed that
  it becomes more intense when increasing the number of lights or effective radius.
  [Arseny Kapoulkine][twitter] suggested in a discussion that I really should do it per vertex 
  rather than per face. I tried and added a button to the demo with a label "Per face/Per 
  vertex". In the lighting equation (really a hack and not physically based) I use the normal 
  so the quality dropped, but popping went away. That was an indication of where to look.

  Turns out, if we dealing with hundreds of lights then providing smooth lighting is very hard. 
  Let's assume we have lights A, B, C, and D (the pic below):

  <center><img src="images/lights0.png"></center>

  As we can see, every light affects every point in space. That means in order to calculate 
  the first approximation (no indirect lighting) to the real physical amount of incoming light 
  we need to go through every light. With hundreds of lights this isn't practical and various 
  clustering techniques are used.

  <center><img src="images/lights1.png"></center>

  In the image above the horizontal lines show the effective radius of the light. It's used
  for clustering. In many lights cases one such cluster can easily exceed, say, 50 lights, 
  meaning clustering alone is not enough. At first it might seem that increasing the number
  of clusters will reduce the number of lights per cluster but mostly it won't:

  <center><img src="images/lights2.png"></center>

  Now it will become clear what caused popping and why it is so hard to solve in general.
  In the demo I generate a couple hundreds of lights and place them into a 3D volume. Then,
  on every frame, I use the center of a face to sample into that volume and prepare per face
  light lists which are then uploaded into a float texture. A single cell/cluster could easily
  be more than 50 lights so I had to put a limit on it. Now imagine a limit of 16 lights. That 
  means that we pick lights as if by chance. Yes, we can sort them and reduce the resulting error, 
  but when the true number of lights is 2x or 4x greater we have no silver bullet. And that is
  the source of our problem.

  We can try to remove popping by increasing the per face light limit and it works but it's slow.
  Adding more clusters just makes lighting smoother but not cheaper. One working option is to 
  reduce the effective radius of lights. It works but defeats the purpose of good lighting.
  Is there a general effective solution? And the answer is yes.

  As I said in the beginning, switching to per vertex lighting made popping much less apparent.
  And it turns out the answer is **interpolation**. Interpolation is essential to texturing. 
  Textures are discrete values, just as the lighting situation I described, and interpolation 
  makes it appear as a continuous function which we sample. That means what we need is to calculate 
  lighting for nearby clusters and use [filtering][].

  Below is the resulting WebGL demo. Since it's not easy to combine per face lighting with 
  filtering, I switched to clustered lighting: lights are put into clusters based on an effective 
  radius and uploaded into a float 3D texture (really a 2D texture). The shader samples 8 nearby
  clusters and does trilinear filtering. There is still an option to do lighting per pixel or 
  per vertex. The model in the demo is a statue of [Vladimir Ilyich][lenin].


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
uniform float t;

const float lsize = 12.;

const float pi = 3.14159265;

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

  float v = mod(x,5.);

  if(v==0.) return colors[0];
  if(v==1.) return colors[1];
  if(v==2.) return colors[2];
  if(v==3.) return colors[3];
  return colors[4];
}

vec3 light(vec3 cell, vec3 pos, vec3 vn ) {
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
    kd = 4. * pow(kd, 2.) / pow( d, 14.);
    c = c + kd * getc(l.w);
  }
  return c;
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

    float cells = opts.x, distmax = opts.z;
    vec3 p = pos/distmax*.5 + .5;
    vec3 cell = floor(p*cells-.5);
    vec3 off = fract(p*cells+.5);

    vec3 c0 = light( cell + vec3(0,0,0), pos, vn );
    vec3 c1 = light( cell + vec3(1,0,0), pos, vn );
    vec3 c01 = mix(c0,c1,off.x);
    vec3 c2 = light( cell + vec3(0,1,0), pos, vn );
    vec3 c3 = light( cell + vec3(1,1,0), pos, vn );
    vec3 c23 = mix(c2,c3,off.x);
    vec3 c03 = mix(c01,c23,off.y);

    vec3 d0 = light( cell + vec3(0,0,1), pos, vn );
    vec3 d1 = light( cell + vec3(1,0,1), pos, vn );
    vec3 d01 = mix(d0,d1,off.x);
    vec3 d2 = light( cell + vec3(0,1,1), pos, vn );
    vec3 d3 = light( cell + vec3(1,1,1), pos, vn );
    vec3 d23 = mix(d2,d3,off.x);
    vec3 d03 = mix(d01,d23,off.y);

    vec3 c = mix(c03,d03,off.z);

    const float gamma = 1./2.2;
    c = pow(c, vec3(gamma));
    color = c;
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

const float lsize = 12.;

uniform vec3 opts;
uniform float vmode;
uniform float t;
uniform sampler2D ltex;

float round(float v){ return floor(v+.5); }

vec3 getc(float x) {

  vec3 colors[5];

  colors[0]=vec3(70, 90, 70)/255.;
  colors[1]=vec3(80, 60, 100)/255.;
  colors[2]=vec3(180, 50, 80)/255.;
  colors[3]=vec3(70, 80, 100)/255.;
  colors[4]=vec3(180, 60, 40)/255.;

  float v = mod(x,5.);

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
    kd = 4. * pow(kd, 2.0) / pow(d, 14.);
    c = c + kd * getc(l.w);
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
  var d_max=0.0, cells=16, lights_max=250, rotate = true;
  var lights, lradius = 4./cells;
  var lpercell=12, lsort=true, vmode=false;
  var per_frame=0, ltexw, ltexh, ltex, ltexupdate=false;

  if( sqrt(cells) - floor(sqrt(cells)) ) throw "cells is not a square number";

  function lenin (cb) {

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
    };

    var but_nlights = document.getElementById( "setnlights" );
    var nlights = document.getElementById( "nlights" );
    nlights.value = lights_max;
    but_nlights.onclick = function() {
      var n = parseInt( nlights.value, 10 );
      if( n === NaN || n < 0 || n > 1000 ) alert( "wrong value" );
      else {
        but_nlights.innerHTML = "Please wait...";
        but_nlights.disabled = true;
        setTimeout( function() {
          lights_max = n;
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

        if( per_frame && frame%per_frame == 0 ) {
          load_lights( true );
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

  function load_lights(animate) {

    var v = vec4(), ldir = vec4(), pxh = 0.5*1.0/cells;

    if( !animate ) {
      console.info( "computing lights clusters: ", Math.pow(cells,3)*lights_max, "loop iterations" );
      lights=[];
    }

    var lights_data = array( Math.pow(cells,3), null ).map( function(){ return []; } );
  
    for(var n=0; n<lights_max; n++) {    

      var l;

      if( !animate )
        lights.push( l = vec4( Math.random(), Math.random(), Math.random(), n ) );
      else
        l = lights_animate( lights[n] );

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
        if( lsort || lights_data[idx].length < lpercell ) {
          l.dist_to_cell = d;
          lights_data[idx].push( l );
        }
      }
      
    }

    if( lsort ) {
      
      if( !animate ) console.info( "sorting lights in cells" );

      foreach( lights_data, function(e,i){
        e.sort( function(a,b) { return a.dist_to_cell - b.dist_to_cell; } );
      } );
    }

    if( !ltex )
      ltex = new Float32Array( Math.pow( cells, 3 ) * lpercell * 4 );
    else
      ltex.fill(0);

    var zsqrt = round( sqrt( cells ) );
    var stride = cells*lpercell*zsqrt*4;
    ltexw = cells*zsqrt*lpercell;
    ltexh = cells*zsqrt;

    for(var z=0; z<cells; z++)
    for(var y=0; y<cells; y++)
    for(var x=0; x<cells; x++) {
      var zx = z % zsqrt, zy = floor( z / zsqrt );
      var idx = z*cells*cells+y*cells+x;
      foreach( lights_data[idx], function(e,i) {
        if( i >= lpercell ) return;
        var offx = zx*cells, offy = zy*cells;
        for( var n=0; n < 4; n++ ) 
          ltex[(y+offy)*stride+(x+offx)*lpercell*4+i*4+n] = e[n];
      } );
    }
  }

  var vel = vec4(0, 0.0*per_frame, 0, 0), velo = vec4();
  var vela = Math.PI/2048.*per_frame, velc = Math.cos( vela ), vels = Math.sin( vela );
  var velm = mat4( vec4(velc,0,vels,0), vec4(0,1,0,0), vec4(-vels,0,velc,0), vec4(0,0,0,0) );


  function lights_animate(l) {
    var n = l[3];
    add( l, l, vel );
    vclear( velo );
    vmul( velo, velm, l );
    wrapv( velo );
    vcopy( l, velo );
    l[3] = n;
    return l;
  }

</script>

</div>


[shader]: shader.html
[lenin]: lenin.html "Vladymir Lenin"
[demo]: lenin-lights.html "Vladymir Lenin in Lights WebGL Demo"
[pop]: images/lenin-popping.jpg "Lenin Lights WebGL Demo" 
[pop2]: images/lenin-popping-marked.jpg "Lenin Lights WebGL Demo" 
[twitter]: https://twitter.com/zeuxcg "Arseny Kapoulkine Twitter"
[eq]:https://en.wikipedia.org/wiki/Rendering_equation "Rendering Equation"
[filtering]:https://en.wikipedia.org/wiki/Upsampling "Upsampling"


