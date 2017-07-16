
function webgl_quad( opts ) {
  'use strict';

  try{

  var ver = opts.version || 1;

  var gl = ver == 2 ? webgl2_context( opts.canvas ) : webgl_context( opts.canvas );

  var width = gl.drawingBufferWidth, height = gl.drawingBufferHeight;

  if( opts.extensions ) {
    foreach( opts.extensions, function(ext) {
      if( ! gl.getExtension( ext ) ) 
        throw "extension " + ext + " not supported";
    } );
  }

  gl.viewport( 0, 0, width, height );
  gl.enable( gl.DEPTH_TEST );
  gl.disable( gl.CULL_FACE );

  var time_start, time_log, dt_pause, frame = 0;

  var program0 = gl.createProgram();

  compile_program( gl, program0, opts.vs, opts.ps );

  var attribs = { "v_in": 0, "uv_in": 1, "vid_in": 2, "vn_in": 3 };
  
  for( var n in attribs )
    gl.bindAttribLocation( program0, attribs[n], n );

  gl.linkProgram( program0 );
  if( ! gl.getProgramParameter( program0, gl.LINK_STATUS ) ) throw gl.getProgramInfoLog( program0 );

  if( gl.isContextLost() ) {
    var event = document.createEvent('Event');
    event.initEvent("webglcontextlost", true, true);
    opts.canvas.dispatchEvent( event );
  }

  if( opts.seed === undefined ) opts.seed = Math.random();

  var uniforms_s = [], uniforms_p = [], uniforms_d = [];
  var predefined = { t : "time", screen : "screen", frame: "frame", seed: "seed" };

  opts.uniforms = opts.uniforms || {};

  for( var n in predefined ) 
    if( ! opts.uniforms[ n ] ) opts.uniforms[ n ] = predefined[ n ];

  for( var u in opts.uniforms ) {
    
    var ul = gl.getUniformLocation( program0, u );

    if( ul === null && typeof opts.uniforms[u] !== "string" ) { 
      console.warn( "uniform %s not found", u ); 
      continue; 
    }

    var uo = { name: u, value: opts.uniforms[u], loc: ul };

    if( typeof opts.uniforms[u] == "function" ) { 
      if( opts.uniforms[u].matrix_size ) uo.matrix_size = opts.uniforms[u].matrix_size;
      uniforms_d.push( uo );
    } else if( typeof opts.uniforms[u] == "string" ) uniforms_p.push( uo );
    else if( Array.isArray( opts.uniforms[u] ) ) uniforms_s.push( uo );
    else throw "uniform type "+(typeof opts.uniforms[u])+
                " not supported, only an 1 to 4 array, predefined string or function";
  }

  var fb, fbtex, rb;
  var fbtexloc = gl.getUniformLocation( program0, "fbtex" );
  var passloc = gl.getUniformLocation( program0, "pass" );

  if( fbtexloc ) {
    fbtex = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, fbtex );
    if( opts.hdr )
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F_EXT, width, height, 0, gl.RGBA, gl.FLOAT, null );  
    else 
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );  
    set_tex_parameters( gl, gl.NEAREST, gl.NEAREST );
    rb = gl.createRenderbuffer();
    gl.bindRenderbuffer( gl.RENDERBUFFER, rb );
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height );
    fb = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, fb );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbtex, 0 );
    gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rb );
    if ( gl.checkFramebufferStatus( gl.FRAMEBUFFER ) != gl.FRAMEBUFFER_COMPLETE ) 
      throw "framebuffer incomplete";
    gl.bindFramebuffer( gl.FRAMEBUFFER, null );
  }

  var textures = [];

  if( fbtexloc ) {
    var canvas_tmp = document.createElement("canvas");
    canvas_tmp.height = canvas_tmp.width = 1;
    canvas_tmp.getContext("2d").clearRect( 0, 0, 1, 1 );
    textures.push( { name: "fbtex", value: canvas_tmp } );
  }

  if( opts.textures )
    for( var t in opts.textures ) 
      textures.push( { name: t, value: opts.textures[ t ] } );

  foreach( textures, function( e, sampler ) {
    var t = e.name;

    var texloc = gl.getUniformLocation( program0, t );

    if( !texloc ) {
      console.warn( "sampler %s not found", t );
      return;
    }

    var tex = e.texture = gl.createTexture();

    gl.bindTexture( gl.TEXTURE_2D, tex );

    if( typeof e.value === "object" && e.value.tex2d ) {

      var data;

      if( typeof e.value.data === "function" ) 
            data = e.value.data();
      else  data = e.value.data;

      set_texture( gl, e.value, data );

    } else {

      gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, e.value );
      set_tex_parameters( gl, gl.LINEAR, gl.LINEAR_MIPMAP_LINEAR );
      gl.generateMipmap( gl.TEXTURE_2D );
    }
    
    uniforms_s.push( { integer: true, name: t, loc: texloc, value: [sampler] } );
  } );

  var prevtex;
  var prevtexloc = gl.getUniformLocation( program0, "prevtex" );
  if( prevtexloc ) {
    prevtex = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, prevtex );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );  
    set_tex_parameters( gl, gl.NEAREST, gl.NEAREST );
    uniforms_s.push( { integer: true, name: "prevtex", loc: prevtexloc, value: [ textures.length ] } );
    textures.push( { name: "prevtex", texture: prevtex } );
  }

  opts.buffers_quad = {
    v_in: new Float32Array( [ 0.0,0.0, 0.0,1.0, 1.0,0.0, 1.0,0.0, 0.0,1.0, 1.0,1.0, ] ),
    uv_in: new Float32Array( [    0,0,     0,1,     1,0,     1,0,     0,1,     0,0, ] ),
    vid_in: new Float32Array( [     0,       1,       2,       3,       4,       5 ] ),
  };

  opts.buffers_quad.v_in.attrib_size = 2;
  opts.buffers_quad.uv_in.attrib_size = 2;
  opts.buffers_quad.vid_in.attrib_size = 1;

  opts.draw_size = opts.draw_size || 6;
  opts.draw_type = gl[opts.draw_type] || gl.TRIANGLES;

  var bgc = opts.bgcolor || [0,0,0,1];

  var presented = false, frame = 0, frame_log = 0;

  function loop(t) {

    if( opts.finish ) return;

    requestAnimationFrame( loop );

    t = t / 1000.0;

    if( time_start === undefined ) time_start = t; 
    if( time_log === undefined ) time_log = t;

    var dt = t - time_start;

    if( opts.pause && presented ) { if( dt_pause === undefined ) dt_pause = dt; return; }

    if( dt_pause !== undefined ) { 
      
      time_start = t - dt_pause; 
      dt = dt_pause; 
      dt_pause = undefined; 
      opts.resize = false; 
    }

    if( opts.resize ) { 
      
      opts.resize = false; 
      dt = opts.dt; 
      time_start = t - dt; 
    }

    if( opts.onframe ) opts.onframe( frame, dt );

    opts.dt = dt;

    gl.useProgram( program0 );

    foreach( textures, function( t, i ) { 
      gl.activeTexture( gl.TEXTURE0 + i );
      gl.bindTexture( gl.TEXTURE_2D, t.texture );
      if( typeof t.value === "object" && t.value.tex2d ) {
        if( typeof t.value.data === "function" ) {
          var data = t.value.data(frame,dt);
          if( data ) set_texture_subdata( gl, t.value, data );
        }
      }
     } );
    
    foreach( uniforms_s, function( u ) { set_uniform( gl, u, u.value ); } );
    foreach( uniforms_p, function( u ) { 
      if( u.value === "time" ) { set_uniform( gl, u, [dt] ); } 
      else if( u.value === "screen" ) { set_uniform( gl, u, [opts.width, opts.height] ); } 
      else if( u.value === "frame" ) { set_uniform( gl, u, [frame] ); } 
      else if( u.value === "seed" ) { set_uniform( gl, u, [opts.seed] ); } 
    } );
    foreach( uniforms_d, function( u ) { set_uniform( gl, u, u.value() ); } );

    if( fb ) {
      if( passloc ) set_uniform( gl, { loc: passloc }, [0] );

      gl.bindFramebuffer( gl.FRAMEBUFFER, fb );
      gl.clearColor( bgc[0], bgc[1], bgc[2], bgc[3] );
      gl.clearDepth( 1 );
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

      set_buffers( gl, opts.buffers || opts.buffers_quad, attribs );

      gl.drawArrays( opts.draw_type, 0, opts.draw_size );

      if( passloc ) set_uniform( gl, { loc: passloc }, [1] );
      gl.bindFramebuffer( gl.FRAMEBUFFER, null );
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_2D, fbtex );
      set_uniform( gl, { integer: true, loc: fbtexloc }, [0] );
    }

    gl.clearColor( bgc[0], bgc[1], bgc[2], bgc[3] );
    gl.clearDepth( 1 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    if( prevtexloc && frame == 0 ) {
      var prevbind = gl.getParameter( gl.TEXTURE_BINDING_2D );
      gl.bindTexture( gl.TEXTURE_2D, prevtex );
      gl.copyTexImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, width, height, 0 );
      gl.bindTexture( gl.TEXTURE_2D, prevbind );
    }

    if( fb ) {
      set_buffers( gl, opts.buffers_quad, attribs );
      gl.drawArrays( gl.TRIANGLES, 0, 6 );
    } else {
      set_buffers( gl, opts.buffers || opts.buffers_quad, attribs );
      gl.drawArrays( opts.draw_type, 0, opts.draw_size );
    }

    if( prevtexloc ) {
      gl.bindTexture( gl.TEXTURE_2D, prevtex );
      gl.copyTexImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, width, height, 0 );
    }

    if( gl.isContextLost() ) {
      var event = document.createEvent('Event');
      event.initEvent("webglcontextlost", true, true);
      opts.canvas.dispatchEvent( event );
    }

    presented = true;

    if( opts.onpresent ) opts.onpresent( frame, dt );

    frame++;

    if( opts.log ) { 
      var dt = t - time_log;
      if( dt >= opts.time_log ) {
        var fps = ( frame - frame_log ) / dt;
        console.log( "webgl %d, time = %s, fps = %s", opts.id, t.toFixed(3), fps.toFixed(2) ); 
        if( uniforms_s.length ) console.log( "static uniforms %o", uniforms_s );
        if( uniforms_p.length ) console.log( "predefined uniforms %o", uniforms_p );
        if( uniforms_d.length ) console.log( "dynamic uniforms %o", uniforms_d );
        frame_log = frame;
        time_log = t;
      }
    }

   };

  requestAnimationFrame( loop );

  } catch(e){ console.error(e); alert(e); }

}


function set_uniform( gl, u, value ) {

  if( u.integer )
    switch( value.length ) {
      case 1: gl.uniform1iv( u.loc, value ); break;
      case 2: gl.uniform2iv( u.loc, value ); break;
      case 3: gl.uniform3iv( u.loc, value ); break;
      case 4: gl.uniform4iv( u.loc, value ); break;
      default: throw "uniformi " + u.name + " value array length not supported";
    } 
  else if( u.matrix_size )
    switch( u.matrix_size ) {
      case 2: gl.uniformMatrix2fv( u.loc, false, value ); break;
      case 3: gl.uniformMatrix3fv( u.loc, false, value ); break;
      case 4: gl.uniformMatrix4fv( u.loc, false, value ); break;
      default: throw "uniformMatrix " + u.name + " value array length not supported";
    } 
  else
    switch( value.length ) {
      case 1: gl.uniform1fv( u.loc, value ); break;
      case 2: gl.uniform2fv( u.loc, value ); break;
      case 3: gl.uniform3fv( u.loc, value ); break;
      case 4: gl.uniform4fv( u.loc, value ); break;
      default: throw "uniformf " + u.name + " value array length not supported";
    } 
}

function set_texture(gl,o,data) {
  gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, !!o.flip );
  if( ! o.format ) throw "format in teximage2d textures is required";
  if( ! data ) throw "data in teximage2d textures is required";
  var ifmt = o.iformat || o.format;
  var type = o.type || "UNSIGNED_BYTE";
  var magf = o.magf || "LINEAR";
  var minf = o.minf || "LINEAR";
  if( o.width )
    gl.texImage2D( gl.TEXTURE_2D, 0, gl[ifmt], o.width, o.height, 0, gl[o.format], gl[type], data );
  else
    gl.texImage2D( gl.TEXTURE_2D, 0, gl[ifmt], gl[o.format], gl[type], data );
  set_tex_parameters( gl, gl[magf], gl[minf] );
  if( o.genmipmap ) gl.generateMipmap( gl.TEXTURE_2D );
}

function set_texture_subdata(gl,o,data) {

  var ifmt = o.iformat || o.format;
  var type = o.type || "UNSIGNED_BYTE";
  var magf = o.magf || "LINEAR";
  var minf = o.minf || "LINEAR";
  if( o.width )
    gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, o.width, o.height, gl[o.format], gl[type], data );
  else
    gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, gl[o.format], gl[type], data );
}

function set_tex_parameters( gl, magfilter, minfilter ) {

  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magfilter );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minfilter );
  //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
  //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
}

function compile_program( gl, program0, shader0str, shader1str ) {

  var shader0 = gl.createShader( gl.VERTEX_SHADER );
  gl.shaderSource( shader0, shader0str );
  gl.compileShader( shader0 );
  if( ! gl.getShaderParameter( shader0, gl.COMPILE_STATUS ) ) throw gl.getShaderInfoLog( shader0 );
  gl.attachShader( program0, shader0 )

  var shader1 = gl.createShader( gl.FRAGMENT_SHADER );
  gl.shaderSource( shader1, shader1str );
  gl.compileShader( shader1 );
  if( ! gl.getShaderParameter( shader1, gl.COMPILE_STATUS ) ) throw gl.getShaderInfoLog( shader1 );
  gl.attachShader( program0, shader1 )
}


function set_buffers(gl, buffers, attribs) {

  for( var n in buffers ) {

    var b = buffers[n];

    if( !b || !b.length ) {
      console.warn ("buffer",n,"is not valid",b);
      continue;
    }

    if( attribs[n] === undefined ) {
      console.warn ("attribute",n,"is not standard, should be one of",attribs);
      continue;
    }
    
    if( ! b.gl_buffer ) {
      b.gl_buffer = gl.createBuffer ();
      gl.bindBuffer (gl.ARRAY_BUFFER, b.gl_buffer);
      gl.bufferData (gl.ARRAY_BUFFER, b, gl.STATIC_DRAW);
    } else {
      gl.bindBuffer (gl.ARRAY_BUFFER, b.gl_buffer);
    }

    gl.vertexAttribPointer (attribs[n], b.attrib_size ? b.attrib_size : 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray (attribs[n]);
  }
}



