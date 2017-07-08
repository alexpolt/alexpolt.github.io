
##Lenin

<div class="webgl" webgl_version="1" webgl_div="shader0" init="lenin">
  <img class="link" src="images/webgl-blank.png" title="Click to show WebGL demo" alt="WebGL demo"/><br/>
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
  <textarea hide class="vs hidden" spellcheck="false">
attribute vec3 v_in;
attribute vec3 vn_in;
varying vec3 vn;
uniform mat3 cam;
uniform vec3 campos;
uniform float t;
uniform vec2 screen;

void main() {

  vn = cam * vn_in;

  vec3 p = cam*v_in+campos;
  float far = 10000.0;
  float near = 1.0;
  float z = p.z;
  p.x = p.x * screen.y/screen.x;
  p.z = far*(p.z-near)/(far-near);
  gl_Position = vec4(p,z);
}
  </textarea>
  <textarea hide class="ps hidden" spellcheck="false">
precision highp float;
varying vec3 vn;
uniform float t;
const float pi = 3.14159265;

void main() {
  vec3 light0 = normalize(vec3(0,5,-10));
  float c = dot( light0, vn );
  gl_FragColor = vec4(c, c, c, 1);
}
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

<script src="js/common.js"></script>
<script src="js/loader.js"></script>
<script src="js/math.js"></script>
<script src="js/camera.js"></script>
<script src="js/webgl-quad.js"></script>
<script src="js/webgl.js"></script>

<script>
/*
  var b0 = new Float32Array([-0.5,-0.5,0, 0.5,-0.5,0, 0,0.5,0]);
  b0.attrib_size = 3;
  var b1 = new Float32Array([0,0,-1, 0,0,-1, 0,0,-1]);
  b1.attrib_size = 3;
*/

  var r = load_resources( ["webgl/lenin2dec2.obj"], {} );

  function test() {
    console.log( "loded", this.loaded );
   var reg = /^v\s+([-.\d]+)\s+([-.\d]+)\s+([-.\d]+)/gm;
   var m = reg.exec( r.data[0] );
   console.log(m,m[0],m[1],m[2],m[3]);
  }

  function lenin (cb) {
    var b = load_buffers();
    var div = this.getAttribute("webgl_div");
    var canvas = document.querySelector( "div#"+div+" canvas" );
    var cam = camera_create( { canvas: canvas, nobind: false, personal: false, pos: vec3(0,0,500), speed: 10 } );
    var opts = {
      bgcolor: [ 1, 1, 1, 1 ],
      buffers: { v_in: b[0], vn_in: b[1] },
      draw_size: b[0].length/3,
      uniforms: { cam: function(){ return cam.get_m(); }, campos: function(){ return cam.get_pos(); } },
      onreload: function() { cam.reset_m(); },
      onclose: function() { camera_remove(cam); },
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


