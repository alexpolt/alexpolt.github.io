
function is_array ( a ) {
  return a.length !== undefined;
}

function is_typed_array ( a ) {
  return ArrayBuffer ? ArrayBuffer.isView( a ) : false;
}

function vcopy ( a, b ) {
  for( var i=0; i < a.length; i++ ) a[i] = b[i];
  return a;
}

function mcopy ( a, b ) {
  for( var y=0; y < a.length; y++ ) 
    for( var x=0; x < a[y].length; x++ ) 
      a[y][x] = b[y][x];
  return a;
}

function vclear ( a ) {
  a.fill( 0 );
}

function mclear ( a ) {
  for( var y=0; y < a.length; y++ ) vclear( a[y] );
}


function vec ( size ) { 
  var args = Array.prototype.slice.call( arguments, 1 );
  var a = Float32Array ? new Float32Array( size ) : new Array( size );
  for( var i=0; i<size; i++ ) {
    a[i] = i < args.length && args[i] !== undefined ? args[i] : 0.;
  }
  return a;
}

function vec4 ( x, y, z, w ) { return vec( 4, x, y, z, w ); }
function vec3 ( x, y, z ) { return vec( 3, x, y, z ); }
function vec2 ( x, y ) { return vec( 2, x, y ); }

function mat ( size ) { 
  var args = Array.prototype.slice.call( arguments, 1 );
  var a = array( size, null );
  for( var i=0; i < size; i++ ) {
    if( i < args.length && is_array( args[i] ) ) {
      a[i] = args[i];
    } else {
      a[i] = args.length < i*size+size ? vec( size ) : 
              vec.apply( null, [ size ].concat( args.slice( i*size, i*size+size ) ) );
    }
  }
  return a;
}

function mat4 () {
  return mat.apply( null, [4].concat( Array.prototype.slice.call ( arguments ) ) ); }
function mat3 () {
  return mat.apply( null, [3].concat( Array.prototype.slice.call ( arguments ) ) ); }
function mat2 () {
  return mat.apply( null, [2].concat( Array.prototype.slice.call ( arguments ) ) ); }

function sub ( o, p0, p1 ) {
  if( !o ) o = vec( p0.length );
  for( var i=0; i<p0.length; i++ ) o[i] = p0[i] - p1[i];
  return o;
}

function add ( o, p0, p1 ) { 
  if( !o ) o = vec( p0.length );
  for(var i=0; i < p0.length; i++) o[i] = p0[i] + p1[i];
  return o;
}

function mul ( o, p0, v ) { 
  if( !o ) o = vec( p0.length );
  for( var i=0; i<p0.length; i++ ) o[i] = p0[i] * v[i];
  return o;
}

function mulv ( o, p0, v ) { 
  if( !o ) o = vec( p0.length );
  for( var i=0; i<p0.length; i++ ) o[i] = p0[i] * v;
  return o;
}

function muladd ( o, p0, v ) {
  for( var i=0; i<p0.length; i++ ) o[i] += p0[i] * v[i];
  return o;
}

function muladdv ( o, p0, v ) {
  for( var i=0; i<p0.length; i++ ) o[i] += p0[i] * v;
  return o;
}

function dot ( p0, p1 ) { 
  var s = vec(1);
  for( var i=0; i<p0.length; i++ ) s[0] += p0[i] * p1[i];
  return s[0];
}

function norm ( v0 ) { return mul( v0, 1.0/Math.sqrt( dot( v0, v0 ) ) ); }
function len ( v0 ) { return Math.sqrt( dot( v0, v0 ) ); }

function abs ( v ) { return Math.abs(v); }
function neg ( v ) { return -v; }
function floor ( v ) { return Math.floor(v); }
function ceil ( v ) { return Math.ceil(v); }
function round ( v ) { return Math.round(v); }
function clamp ( v, min, max ) { return Math.max( min, Math.min( max, v ) ); }

function absv ( v ) { for( var i=0; i < v.length; i++ ) v[i] = Math.abs(v[i]); return v; }
function negv ( v ) { for( var i=0; i < v.length; i++ ) v[i] = -v[i]; return v; }
function floorv ( v ) { for( var i=0; i < v.length; i++ ) v[i] = Math.floor(v[i]); return v; }
function ceilv ( v ) { for( var i=0; i < v.length; i++ ) v[i] = Math.ceil(v[i]); return v; }
function roundv ( v ) { for( var i=0; i < v.length; i++ ) v[i] = Math.round(v[i]); return v; }
function clampv ( v, min, max ) { 
  for( var i=0; i < v.length; i++ ) v[i] = Math.max( min, Math.min(max, v[i]) ); return v; }

function vmul( o, m, v ) {

  if( m.length != v.length ) {
    console.error( m, v );
    throw "vmul matrix dimension mismatch";
  }

  if( !o ) o = vec( m[0].length );

  for( var x=0; x < m.length; x++ ) {

    muladdv( o, m[x], v[x] );
  }

  return o;
}

function mmul( m, m0, m1 ) {

  if( m0.length != m1[0].length ) {
    console.error( m0, m1 );
    throw "mmul matrix dimension mismatch";
  }

  var cols = m1.length;

  if( !m ) m = mat( cols );

  for( var y=0; y < cols; y++ ) {

    var m1c = m1[y];

    for( var x=0; x < m0.length; x++ ) {
      var m0c = m0[x];
      var v = m1c[x];
      muladdv( m[y], m0c, v );
    }
  }

  return m;
}


