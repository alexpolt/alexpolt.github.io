
##Lenin

<div class="webgl" webgl_version="1" webgl_div="shader0" init="load_demo">
  <img class="link" src="images/lenin.png" title="Click to show WebGL demo" alt="WebGL demo"/><br/>
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
  var d_max=1; cells=8, lights_max=500, rotate = true;
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



