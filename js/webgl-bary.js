
function webgl0( opts ) {
  'use strict';

  try{
    
  var gl = webgl_context( opts.canvas );

  var is_pause = opts.pause || function() { return false; };

  var time_start, dt_pause, frame = 0;

  var program0 = gl.createProgram();

  var shader0str = 
  '#version 300 es \n\
  layout(location=0) in vec2 vin; \n\
  layout(location=1) in vec2 uvin; \n\
  out vec2 uv; \n\
  uniform float t; \n\
  void main() { \n\
    mat2 m = mat2(cos(t), sin(t), -sin(t), cos(t)); \n\
    gl_Position = vec4( vec2(2.0*vin-1.0) * m, 0,1); \n\
    uv = uvin; \n\
  } \n\
  ';

  var shader0 = gl.createShader( gl.VERTEX_SHADER );
  gl.shaderSource( shader0, shader0str );
  gl.compileShader( shader0 );
  if( ! gl.getShaderParameter( shader0, gl.COMPILE_STATUS ) ) throw gl.getShaderInfoLog( shader0 );
  gl.attachShader( program0, shader0 )

  var shader1str = 
  '#version 300 es \n\
  precision highp float; \n\
  in vec2 uv; \n\
  uniform float t; \n\
  layout(location=0) out vec4 color; \n\
  void main() { \n\
    vec2 uvdx = dFdx( uv ); \n\
    vec2 uvdy = dFdy( uv ); \n\
    float d = uvdx.x*uvdy.y-uvdx.y*uvdy.x; \n\
    if( d != 0.0 ) d = 1.0 / d; \n\
    vec2 xydu = vec2( uvdy.y, -uvdx.y ) * d; \n\
    vec2 xydv = vec2( -uvdy.x, uvdx.x ) * d; \n\
    vec2 p0 = gl_FragCoord.xy - ( uv.x * xydu + uv.y * xydv ); \n\
    vec2 p1 = abs(uv.x * xydu + uv.y * xydv); \n\
    color = vec4(p1.x/640.0,p1.y/480.0,0,1); \n\
  } \n\
  ';

  var shader1 = gl.createShader( gl.FRAGMENT_SHADER );
  gl.shaderSource( shader1, shader1str );
  gl.compileShader( shader1 );
  if( ! gl.getShaderParameter( shader1, gl.COMPILE_STATUS ) ) throw gl.getShaderInfoLog( shader1 );
  gl.attachShader( program0, shader1 )

  gl.linkProgram( program0 );
  if( ! gl.getProgramParameter( program0, gl.LINK_STATUS ) ) throw gl.getProgramInfoLog( program0 );

  var uniform0 = gl.getUniformLocation( program0, "t" );

  var vb0data = new Float32Array( [
    0.0,0.0, 0.0,1.0, 1.0,0.0, 1.0,0.0, 0.0,1.0, 1.0,1.0, 
    0.0,0.0, 0,1, 1,0, 1,0, 0,1, 0,0, 
  ] );

  var vb0 = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vb0 );
  gl.bufferData( gl.ARRAY_BUFFER, vb0data, gl.STATIC_DRAW );

  gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0 );
  gl.vertexAttribPointer( 1, 2, gl.FLOAT, false, 0, 12*4 );
  gl.enableVertexAttribArray(0);
  gl.enableVertexAttribArray(1);
  gl.bindAttribLocation( program0, 0, "vin" );
  gl.bindAttribLocation( program0, 1, "uvin" );

  function loop(t) {

    if( typeof time_start === 'undefined' ) time_start = t; 

    var dt = ( t - time_start ) / 1000.0;

    if( dt > 20 ) return;
    
    requestAnimationFrame( loop );

    if( is_pause() ) { if( dt_pause === undefined ) dt_pause = dt; return; }

    if( dt_pause !== undefined ) { time_start = t - dt_pause*1000.0; dt = dt_pause; dt_pause = undefined; }
    
    gl.clearColor( 0, 0, 0, 0 );
    gl.clearDepth( 1 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.useProgram( program0 );
    gl.uniform1f( uniform0, dt );
    gl.drawArrays( gl.TRIANGLES, 0, 6 ); 
  };

  requestAnimationFrame( loop );

}catch(e){alert(e);}  

}


