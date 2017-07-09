
function foreach( arr, fn ) {
  var l = arr.length;
  for( var i=0; i < l; i++) fn( arr[ i ], i );
}

function assign( to, from ) {
  for(var n in from) {
    if( from.hasOwnProperty(n) ) {
      to[n] = from[n];
    }
  }
  return to;
}

function array(size,defval){
  var a=[];
  for(var i=0; i<size; i++) a.push(defval);
  return a;
}

function delegate( o, fn ) {
  return function() {
      return fn.apply( o, arguments );
  };
}

function dump( o ) {
  return JSON.stringify( o, null, 2 );
}

