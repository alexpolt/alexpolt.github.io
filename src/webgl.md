
##WebGL Blank Template

<div class="webgl" webgl_version="1" webgl_div="shader0">
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
  <div class="canvas">
  <canvas hide class="canvas"></canvas>
  <textarea hide class="vs hidden" spellcheck="false">
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

  vec4 p = vec4( (2.*v_in-1. ), 0, 1 );

  gl_Position = p;
}
  </textarea>
  <textarea hide class="ps hidden" spellcheck="false">
precision highp float;
varying vec2 uvt;
varying vec2 uvb;
uniform float t;
uniform vec2 screen;
const float pi = 3.14159265;

void main() {
  vec2 ar = vec2(screen.x/screen.y, 1);
  float c = smoothstep(.0, .2, cos( 4.*t+10.*pi*length(ar*uvt-ar*.5) ));
  gl_FragColor = vec4(c, c, c, 1);
}
  </textarea>
  <div hide class="help hidden"></div>
  </div>
  <div class="buttons">
  <button title="Reload Shaders" class="reload">Reload</button>
  <button title="Output WebGL Info in Console" class="log">Log</button>
  <button title="Pause Rendering" class="pause">Pause</button>
  <button title="Go Fullscreen" class="fscreen">FS</button>
  </div>
</div>

<div class="clear">
</div>

<script src="js/common.js"></script>
<script src="js/webgl-quad.js"></script>
<script src="js/webgl.js"></script>


