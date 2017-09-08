
##Procrastination

  Who hasn't experienced procrastination? [Wikipedia page][p] says that 90% of college students
  suffer from it and it greatly impacts their performances. Some software developers can't even 
  continue doing their daily duties and even a vacation doesn't help. It's a very serious problem.

  As I note in my blog post on [motivation and meaning of life][m] we are extremely emotional 
  beings. Almost all we do in everyday life is driven by emotions. You love something, hate, you're
  passionate, or you have ambitions, envy someone, angry about something - all that are emotions.
  Sure, some are less driven by emotions than others, and those more rational tend to be more
  effective in life.

  Lately I've been experiencing procrastination and I was like, "What the hell! How do I deal
  with it? How do I get back to normal functioning"? And one day I got the answer: emotions!
  More precisely the shortage of it. It's just my own theory but I really believe that's what
  prevents us from getting to work. Compare it to listening to a song again and again, the
  experiences are pretty similar. The key to fight procrastinations is to realize that the
  emotions are still there, we just have to look more carefully. Or another way to put this,
  there is much more content in the thing you want to do than in anything else.

  Also I just realized that one good way to add emotions into work is to have a partner. Working
  together, either in a pair or in a team, could be the key to greater productivity. It is not
  surprising that the vast majority of successful sturtups are founded by two or more people.
  Might also be a good idea for students.

  Here is also a shader I wrote to help procrastinate. :)


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

  [p]: https://en.wikipedia.org/wiki/Procrastination "Procrastination"
  [m]: motivation.html "The Meaning of Life"


