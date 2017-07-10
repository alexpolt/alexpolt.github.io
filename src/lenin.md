
##Vladimir Ilyich

  Vladimir Ilyich is often used in Russia to refer to [Vladimir Lenin][v], a great russian 
  revolutionary, who had an immence impact on the course of history. Today [communism][c] is 
  mostly view in negative light, but, truth to be told, it is the socialists (bolsheviks) in the 
  previous century who raised the questions of equality and social justice.

  I was doing a [lights demo][d] and as a result made a WebGL rotating statue of Valimir Lenin.
  Best viewed in fullscreen.


<div class="webgl" webgl_version="1" webgl_div="shader0" init="load_demo">
  <img class="link" src="images/lenin-bronze.png" title="Click to show WebGL demo" alt="WebGL demo"/><br/>
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
varying vec3 vn;
uniform mat3 cam;
uniform vec3 campos;
uniform float t;
uniform vec2 screen;

void main() {

  float a = t/16., c = cos(-a), s = sin(-a);
  mat3 m = mat3( vec3(c, 0, s), vec3(0, 1, 0), vec3(-s, 0, c) );

  vn = cam*m*vn_in;

  vec3 p = cam*m*v_in+campos;
  float far = 10000.0;
  float near = 1.0;
  float z = p.z;
  p.x = p.x * screen.y/screen.x;
  p.z = far*(p.z-near)/(far-near);
  gl_Position = vec4(p,z);
}
//-->
  </textarea>
  <textarea hide class="ps hidden" spellcheck="false">//<!--
precision highp float;
varying vec3 vn;
uniform float t;
const float pi = 3.14159265;

void main() {
  vec3 c = vec3(227,103,0)/255.;
  vec3 light0 = normalize(vec3(0,5,-10));
  vec3 cam = vec3(0,0,-1);
  vec3 norm = normalize(vn);
  float kd = clamp( .0, .25, dot( light0, norm ));
  float ks = clamp( .0, 1., dot( .5*(cam+light0), norm ));
  ks = pow( ks, 6. );
  gl_FragColor = vec4( c*ks+c*kd, 1);
}
  
//-->
  </textarea>
  <div hide class="help hidden"></div>
  <div class="buttons">
  <button title="Reload Shaders" class="reload">Reload</button>
  <button title="Output WebGL Info in Console" class="log">Log</button>
  <button title="Pause Rendering" class="pause">Pause</button>
  <button title="Go Fullscreen" class="fscreen">FS</button>
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

  var r;

  function load_demo (cb) {

    var span = this.querySelector("span");
    var div = this;

    if( !r || r.failed || !r.loaded )
      
      r = load_resources( ["webgl/lenin2dec2.obj"], {} );
      
    r.delay = 500;

    var fn = function(){ 
      if( r.failed ) 
        alert("Loading " + r.failed_src + " failed. Try realoading the page.");
      else if( ! r.loaded ) 
        alert("Resources not loaded. Check console output (ctrl+shift+j or F12) and try reloading the page.");
      else {
        div.load_animation = true;
        lenin.call ( div, cb );
      }
    };
    
    if( ! this.load_animation )
      load_animation (r, span, fn);
    else fn ();
  }

  function lenin (cb) {
    var b = load_buffers();
    var div = this.getAttribute("webgl_div");
    var canvas = document.querySelector( "div#"+div+" canvas" );
    var cam = camera_create( { canvas: canvas, nobind: false, personal: false, pos: vec3(0,0,450), speed: 10 } );
    var opts = {
      bgcolor: [.95, .95, .95, 1],
      buffers: {v_in: b[0], vn_in: b[1]},
      draw_size: b[0].length/3,
      uniforms: { cam: function(){ return cam.get_m(); }, campos: function(){ return cam.get_pos(); } },
      onreload: function() { cam.reset_m(); },
      onclose: function() { camera_remove(cam); },
      onpause: function(s) { cam.pause(s); },
    };
    opts.uniforms.cam.matrix_size = 3;
    cb (opts);
  }

  function load_buffers() {
    var m, v=[], vn=[], f=[];
    var reg = /^v\s+([-.\d]+)\s+([-.\d]+)\s+([-.\d]+)/gm;
    while( (m = reg.exec( r.data[0])) !== null ) v.push( m[1], m[2], m[3] );

    reg = /^vn\s+([-.\d]+)\s+([-.\d]+)\s+([-.\d]+)/gm;
    while( (m = reg.exec( r.data[0])) !== null ) vn.push( m[1], m[2], m[3] );

    reg = /^f\s+(\d+)\/\/\d+\s+(\d+)\/\/\d+\s+(\d+)\/\/\d+/gm;
    while( (m = reg.exec( r.data[0])) !== null ) f.push( m[1], m[2], m[3] );

    var b0 = new Float32Array( f.length*3 ), b1 = new Float32Array( f.length*3 );

    for(var i=0; i<f.length; i++) {
      for(var t=0; t<3; t++) {
        b0[i*3+t] = v[ (f[i]-1)*3+t ];
        b1[i*3+t] = vn[ (f[i]-1)*3+t ];
      }
    }
    return [b0,b1];
  }
</script>

</div>


  [v]: https://en.wikipedia.org/wiki/Vladimir_Lenin "Vladimir Lenin"
  [b]: https://en.wikipedia.org/wiki/Bolsheviks "Bolsheviks"
  [d]: http://alexpolt.github.io/shader.html#lights "Lighting using gl_PrimitiveID"
  [c]: https://en.wikipedia.org/wiki/Communism "Communism"


