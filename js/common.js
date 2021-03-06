
var show_error = true;

window.addEventListener( "error", function( e ) {
  var ask = "\nShow more errors?";
  if( show_error )
    show_error = confirm( e.message + "\nat file " + e.filename + ", line " + e.lineno + ask );
} );

if( Float32Array && Float32Array.prototype.fill === undefined ) {
  Float32Array.prototype.fill = function( a, value, from, to ) {
    from = from || 0;
    to = to || a.length;
    for( var i = from; i < to; i++ ) a[i] = value;
  };
}

function foreach ( arr, fn ) {
  var l = arr.length;
  for( var i=0; i < l; i++) fn( arr[ i ], i );
}

function assign ( to, from ) {
  for(var n in from) {
    if( from.hasOwnProperty(n) ) {
      to[n] = from[n];
    }
  }
  return to;
}

function array ( size, defval ) {
  var a=[];
  for( var i=0; i<size; i++ ) a.push( defval );
  return a;
}

function delegate ( o, fn ) {
  return function() {
      return fn.apply( o, arguments );
  };
}

function dump ( o ) {
  return JSON.stringify( o, null, 2 );
}

function is_mobile () {
  return  /iPhone|iPad|iPod|Android|Windows Phone/i.test(navigator.userAgent);
}


