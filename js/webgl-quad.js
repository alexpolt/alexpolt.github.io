
function webgl_quad( opts ) {
  'use strict';

  try{
    
  var gl = webgl_context( opts.canvas );

  gl.viewport( 0, 0, opts.canvas.width, opts.canvas.height );

  var time_start, time_log, dt_pause, frame = 0;

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

  var uniforms_s = [], uniforms_p = [], uniforms_d = [];
  
  if( opts.uniforms ) {
    for( var u in opts.uniforms ) {
      var ul = gl.getUniformLocation( program0, u );
      if( ul === null ) { console.warn( "uniform %s not found", u ); continue; }
      var uo = { name: u, value: opts.uniforms[u], loc: ul };
      if( typeof opts.uniforms[u] == "function" ) uniforms_d.push( uo );
      else if( typeof opts.uniforms[u] == "string" ) uniforms_p.push( uo );
      else if( Array.isArray( opts.uniforms[u] ) ) uniforms_s.push( uo );
      else throw "uniform type "+(typeof opts.uniforms[u])+
                  " not supported, only an 1 to 4 array, predefined string or function";
    }
  }

  var uniform0 = gl.getUniformLocation( program0, "t" );

  var vb0data = new Float32Array( [
    0.0,0.0, 0.0,1.0, 1.0,0.0, 1.0,0.0, 0.0,1.0, 1.0,1.0,
    0,0,     0,1,     1,0,     1,0,     0,1,     0,0,
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

    if( opts.finish ) return;

    requestAnimationFrame( loop );

    t = t / 1000.0;

    if( time_start === undefined ) time_start = t; 
    if( time_log === undefined ) time_log = t;

    var dt = t - time_start;
   
    if( opts.pause ) { if( dt_pause === undefined ) dt_pause = dt; return; }

    if( dt_pause !== undefined ) { time_start = t - dt_pause; dt = dt_pause; dt_pause = undefined; }
    
    gl.clearColor( 0, 0, 0, 0 );
    gl.clearDepth( 1 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.useProgram( program0 );

    uniforms_s.forEach( function( u ) { set_uniform( gl, u.loc, u.value ); } );
    uniforms_p.forEach( function( u ) { 
      if( u.value === "time" ) { set_uniform( gl, u.loc, [dt] ); }
    } );
    uniforms_d.forEach( function( u ) { set_uniform( gl, u.loc, u.value() ); } );

    gl.drawArrays( gl.TRIANGLES, 0, 6 ); 

    frame++;

    if( opts.log ) { 
      var dt = t - time_log;
      if( dt >= opts.time_log ) {
        var fps = frame / dt;
        console.log( "webgl %d, time = %s, fps = %s", opts.id, t.toFixed(3), fps.toFixed(2) ); 
        if( uniforms_s.length ) console.log( "static uniforms %o", uniforms_s );
        if( uniforms_p.length ) console.log( "predefined uniforms %o", uniforms_p );
        if( uniforms_d.length ) console.log( "dynamic uniforms %o", uniforms_d );
        frame = 0;
        time_log = t;
      }
    }

   };

  requestAnimationFrame( loop );

  }catch(e){alert(e);}  

}


function set_uniform( gl, loc, value ) {

  switch( value.length ) {
    case 1: gl.uniform1fv( loc, value ); break;
    case 2: gl.uniform2fv( loc, value ); break;
    case 3: gl.uniform3fv( loc, value ); break;
    case 4: gl.uniform4fv( loc, value ); break;
    default: throw "uniform " + u.name + " size not supported";
  } 
}



