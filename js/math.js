
function vec4() { 
  var args = arguments;
  var a=array(4,.0);
  return !args.length ? a : a.map( function(e,i){ 
    return i < args.length ? args[i] : e;
  });
}

function mat4() { 
  var args = arguments;
  var a = array( 4, array(4, .0) );
  return !args.length ? a : a.map( function(e,i){ 
    if( Array.isArray( args[0] ) ) {
      return args[i] ? args[i] : e;
    } else {
      return args.length < i*4+4 ? e : vec4.apply( null, Array.prototype.slice.call(args,i*4,i*4+4) );
    }
  });
}

function sub(p0,p1) { return p0.map( function(e,i){ return e-p1[i]; } ); }
function add(p0,p1) { return p0.map( function(e,i){ return e+p1[i]; } ); }
function mul(p0,v) { 
  if( Array.isArray(p0) && Array.isArray(p0[0]) && Array.isArray(v) ) return mmul(p0,v);
  if( typeof p0 === "number" && Array.isArray(v) ) 
    return mul(v,p0);
  else
    return p0.map( function(e) { return e*v; } ); 
}
function dot(p0,p1) { 
  return p0.map( function(e,i){ return e*p1[i]; } ).reduce( function(s,e){ return s+e; } ); 
}
function norm(v0) { return mul(v0, 1.0/Math.sqrt( dot( v0, v0 ) ) ); }
function len(v0) { return Math.sqrt( dot( v0, v0 ) ); }

function abs(v) { return doop(v, function(e){ return Math.abs(e); }); }
function neg(v) { return doop(v, function(e){ return -e; }); }
function clamp(v,min,max) { return doop(v, function(e) { return Math.max(min,Math.min(max, e)); }); }
function doop(v, op) {
  if( Array.isArray(v) ) return v.map(op);
  return op(v); 
}


function mmul( m0, m1 ) {
  var isa = Array.isArray(m1[0]);
  var cols = isa ? m1.length : 1;
  var m = array(cols, array(m0[0].length,.0));

  for( var y=0; y<cols; y++) {
    var m1c = isa ? m1[y] : m1;
    for( var x=0; x<m0.length; x++) {
      var m0c = m0[x];
      var v = m1c[x];
      m[y] = add(m[y], mul( m0c, v ));
    }
  }
  return isa ? m : m[0];
}


