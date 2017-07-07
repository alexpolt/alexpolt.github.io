

function load_images( list ) {

  var r = new Array( list.length );
  var o = { images: r, loaded: false, failed: false, failed_src: null };

  foreach( list, function(src,i) {
    console.info( "Image "+src+" loading begin." );
    var img = new Image();
    img.onerror = function() { 
      console.info( "Image "+src+" loading failed." );
      o.failed = true; o.failed_src = src; 
    };
    img.onload = function() { 
      console.info( "Image "+src+" loading done." );
      o.images[i] = img;
      var loaded = true;
      for( var n=0; n<o.images.length; n++ ) loaded = loaded && !!o.images[n];
      if( loaded ) o.loaded = true;
    };
    img.src = src;
  } );

  return o;
}

function load_obj( url ) {
  var req = new XMLHttpRequest();
  var o = { buffer: null, failed: false, loaded: true };
  req.responeType = "text";
  req.open( "GET", url );
  req.onerror = function() {};
  req.onload = function() {
  };
  return o;
}

