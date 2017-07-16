
##Conway's Game of Life in One Pixel Shader

  Got my little hacky WebGL framework working and wrote a [Game of Life][g] shader.
  It uses previous frame as a source to compute current one. You can hack on the shader yourself
  by clicking a "PS" (Pixel Shader) button. To start try adjusting the _cell_ variable - it controls
  the field scale, _fstep_ variable is a frame divider - use it to slow down the processing, then
  click reload button (or press r key) to apply changes..


<div class="webgl" webgl_version="1" webgl_div="shader0">
  <img class="link" src="images/game-of-life.png" title="Click to show WebGL demo" alt="WebGL demo"/><br/>
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
  <textarea hide class="vs hidden" spellcheck="false" fromid="shader0vs">
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
  <textarea hide class="ps hidden" spellcheck="false" fromid="shader0ps">
precision highp float;
varying vec2 uv;
uniform float frame;
uniform sampler2D prevtex;
uniform vec2 screen;
uniform float seed;

float life();

const float cell = 80.;
const float fstep = 4.;
const float density = 0.1;

vec2 cells = vec2( cell, cell );
vec2 px;
vec2 uv2;

void main() {
  vec2 ar = vec2(1);
  if( screen.x > screen.y )
    ar = vec2( screen.x/screen.y, 1 );
  else 
    ar = vec2( 1, screen.y/screen.x );
  cells = floor( ar*cells );
  px = 1./cells;
  uv2 = floor(cells*uv)/cells+.5*px;
  float k = 0.;
  if( frame < 20 )
    k = step( 1.-density, sin( 1000.*cos( 700.*( 700.*uv2.x + uv2.y + 100.*seed ) ) ) );
  else if( fract(frame/fstep) == .0 ) k = life();
  else k = texture2D( prevtex, uv2 ).x;
  gl_FragData[0] = vec4( k, k, k, 1 );
}

float life() {

  float alive = .0;
  float c = texture2D( prevtex, uv2 ).x;
  for( float y = -1.; y <= 1.; y++ ) {
  for( float x = -1.; x <= 1.; x++ ) {
    vec2 o = px * vec2( x, y );
    float k = abs(x)+abs(y);
    float v = texture2D( prevtex, uv2+o ).x;
    alive += k == .0 ? .0 : v;
  }
  }
  if( c == .0 && alive == 3. ) return 1.;
  if( c == 1. && alive < 2. ) return .0;
  if( c == 1. && alive > 3. ) return .0;
  if( c == 1. ) return 1.;
  return .0;
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


<div>

  <script src="js/common.js"></script>
  <script src="js/webgl.js"></script>
  <script src="js/webgl-quad.js"></script>

</div>

  [g]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life "Conways Game of Life"  

  
