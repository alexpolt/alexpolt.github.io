
function webgl_quad( opts ) {
  'use strict';

  try{
    
  var gl = webgl_context( opts.canvas );

  var is_pause = opts.pause || function() { return false; };

  var time_start, dt_pause, frame = 0;

  var program0 = gl.createProgram();

  var shader0str = opts.vs;

  var shader0 = gl.createShader( gl.VERTEX_SHADER );
  gl.shaderSource( shader0, shader0str );
  gl.compileShader( shader0 );
  if( ! gl.getShaderParameter( shader0, gl.COMPILE_STATUS ) ) throw gl.getShaderInfoLog( shader0 );
  gl.attachShader( program0, shader0 )

  var shader1str = opts.ps;

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

    //if( dt > 20 ) return;
    
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


