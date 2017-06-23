
##Solid Angle and Perspective

  When light is registered in a human eye or a digital camera, it is the accumulation of all the
  light from a cone subtending a [solid angle][sa] whose size depends on the resolution of the 
  sensor (retina or image sensor). It also means that the perspective in images is created as a 
  result of a cone extending with distance. Now, interesting question is what is the difference 
  between perspective in computer graphics and the real world.

  ![](images/solid-angle.png "Perspective Difference in a Digital Camera and Human Eye")

  In the drawing above on the left is how light is registered in an image sensor of a digital
  camera. On the right is a human eye. The striped bar is an object at a constant distance.
  The rays are being cast at regular angles simulating the solid angle. 
  
  Because the form of the image sensor and retina is different the rays on the left cut increasing
  areas of the sensor while on the right the resulting intervals are approximately equal. As a 
  result we should expect different final perceived image. Note that we don't really notice this 
  because we only have 100% of visual acuity at a small window in the center - [foveal system][f] - 
  that is only 2&deg; in size. Here is a *WebGl2* demo that tries to simulate the behaviour. 

  Also this is a good place to recommend two books on visual perception: 
  [Sensation and Perception: An Integrated Approach][book1] by Harvey Richard Schiffman and
  [Sensation and Perception][book2] by E. Bruce Goldstein.


<div class="shader" id="shader0" js="" fn="" style="width: 70%">
<ul><li class="canvas">Canvas</li><li class="vs">VS</li><li class="ps">PS</li></ul>
<canvas class="canvas"></canvas>
<textarea class="vs" spellcheck="false">
#version 300 es

layout(location=0) in vec2 v_in;
layout(location=1) in vec2 uv_in;

out vec2 uv;

uniform float t;

void main() {

  uv = v_in;

  gl_Position = vec4( vec2( 2.0 * v_in - 1.0 ), 0, 1 );
}
</textarea>
<textarea class="ps" spellcheck="false">
#version 300 es

precision highp float;

in vec2 uv;

uniform float t;

layout(location=0) out vec4 C;

const float pi14 = 3.14159265/4.0;

void main() {

  vec4 uvn = vec4( uv * 2.0 - 1.0, 1, 0 );

  vec4 ray;
  
  if( fract( t / 2.0 ) > 0.5 ) 

    ray = vec4( sin( abs(uvn.x) * pi14 ), uvn.y, cos( uvn.x * pi14 ), 0 );

  else
    
    ray = vec4( uvn.x, uvn.y, 1, 0 );

  vec4 color = vec4( 14, 29, 25, 255 ) / 255.0;

  vec4 p = ray * ( 100.0 / ray.z );

  if( p.y >= .0 && p.y <= 50. ) {
   
    float k = cos( p.x )*0.25+0.75;

    color = vec4(k,k,k,1);
  }

  C = color;
}
</textarea>
<button class="reload">Reload</button>
<button class="log">Log</button>
<button class="pause">Pause</button>
</div>

<script src="js/webgl-quad.js"></script>
<script src="js/webgl.js"></script>

<script>
  run_shader('shader0');
</script>

  
  [sa]: https://en.wikipedia.org/wiki/Solid_angle "Solid Angle"
  [f]: https://en.wikipedia.org/wiki/Peripheral_vision "Peripheeral Vision"
  [book1]: https://www.amazon.com/Sensation-Perception-Harvey-Richard-Schiffman/dp/0471249300 "Sensation and Perception: An Integrated Approach"
  [book2]: https://www.amazon.com/Sensation-Perception-CourseMate-Printed-Access/dp/1133958494 "Sensation and Perception"


