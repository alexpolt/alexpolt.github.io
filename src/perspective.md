
##Solid Angle and Perspective

  When light is registered in a human eye or a digital camera, it is the accumulation of all the
  light from a cone subtending a [solid angle][sa] whose size depends on the resolution of the 
  sensor (retina or image sensor). It also means that the perspective in images is created as a 
  result of a cone extending with distance. Now, interesting question is what is the difference 
  between perspective in computer graphics and the real world.

  ![](images/solid-angle.png "Perspective Difference in a Digital Camera and Human Eye")

  In the drawing above on the left is how light is registered in an image sensor of a digital
  camera. On the right is a human eye. The striped bar is an object at a constant z distance.
  The rays are being cast at regular angles simulating the solid angle. 
  
  Because the form of the image sensor and retina is different the rays on the left cut increasing
  areas of the sensor while on the right the resulting intervals are approximately equal. As a 
  result we should expect different final perceived image. Note that we don't really notice this 
  because we only have 100% of visual acuity at a small window in the center - [foveal system][f] - 
  that is only 2&deg; in size. Here is a *WebGl* demo that tries to simulate the behaviour. 

  Also this is a good place to recommend two books on visual perception: 
  [Sensation and Perception: An Integrated Approach][book1] by Harvey Richard Schiffman and
  [Sensation and Perception][book2] by E. Bruce Goldstein.


<div class="webgl" webgl_version="1" webgl_div="shader0">
  <img class="link" src="images/perspective.png" title="Click to show WebGL demo" alt="WebGL demo"/><br/>
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
varying vec2 uv;
uniform float t;
void main() {
  uv = v_in;
  gl_Position = vec4( vec2( 2.0 * v_in - 1.0 ), 0, 1 );
}
  </textarea>
  <textarea hide class="ps hidden" spellcheck="false">
precision highp float;
varying vec2 uv;
uniform float t;
uniform vec2 screen;
const float pi14 = 3.14159265/4.0;

void main() {

  vec4 uvn = vec4( uv * 2.0 - 1.0, 1, 0 );
  
  vec4 ray;
  
  if( fract( t / 2.0 ) > 0.5 ) {
    ray = vec4( sin( abs(uvn.x) * pi14 ), 0, cos( uvn.x * pi14 ), 0 );
    ray = ray / ray.z;
  } else
    ray = vec4( uvn.x, uvn.y, 0, 0 );
    
  vec4 color = vec4( 222, 222, 222, 255 ) / 255.0;
  float f = screen.x / 8.;
  
  if( uv.y >= .35 && uv.y < .65 ) {
    float k = step( .25, cos( ray.x*f ) );
    k = 0.25 + 0.4*k;
    color = vec4(k,k,k,1);
  }
  
  gl_FragData[0] = color;
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

  
  [sa]: https://en.wikipedia.org/wiki/Solid_angle "Solid Angle"
  [f]: https://en.wikipedia.org/wiki/Peripheral_vision "Peripheeral Vision"
  [book1]: https://www.amazon.com/Sensation-Perception-Harvey-Richard-Schiffman/dp/0471249300 "Sensation and Perception: An Integrated Approach"
  [book2]: https://www.amazon.com/Sensation-Perception-CourseMate-Printed-Access/dp/1133958494 "Sensation and Perception"


