

function load_images (list, cb_loading, cb_loaded) {

  var o = { list: list, data: array(list.length, null), loaded: false, failed: false, failed_src: null };

  foreach( list, function(src,i) {
    console.info( "Image "+src+" loading begin." );
    if( cb_loading ) cb_loading( src );
    var img = new Image();
    img.onerror = function() { 
      console.info( "Image "+src+" loading failed." );
      o.failed = true; o.failed_src = src; 
    };
    img.onload = function() { 
      console.info( "Image "+src+" loading done." );
      if( cb_loaded ) cb_loaded( src );
      o.data[i] = img;
      var loaded = true;
      for( var n=0; n<o.data.length; n++ ) loaded = loaded && !!o.data[n];
      if( loaded ) o.loaded = true;
    };
    img.src = src;
  } );

  return o;
}

function load_obj (list, cb_loading, cb_loaded) {

  var o = { list: list, data: array(list.length, null), loaded: false, failed: false, failed_src: null };

  foreach( list, function(src,i) {
    console.info( "Resource "+src+" loading begin." );
    if( cb_loading ) cb_loading( src );
    var req = new XMLHttpRequest();
    req.responeType = "text";
    req.open( "GET", src );
    req.timeout = 2000;
    req.ontimeout = function() {
      console.info( "Resource "+src+" loading timout of 2 seconds." );
      o.failed = true; o.failed_src = src; 
    };
    req.onerror = function() { 
      var status = req.statusText;
      console.info( "Resource "+src+" loading error with status: " + status );
      o.failed = true; o.failed_src = src; 
    };
    req.onload = function() { 
      cionsole.info( "Resource "+src+" loading done." );
      if( cb_loaded ) cb_loaded( src );
      o.data[i] = req.response;
      var loaded = true;
      for( var n=0; n<o.data.length; n++ ) loaded = loaded && !!o.data[n];
      if( loaded ) o.loaded = true;
    };
  } );

  return o;
}

function load_animation (loader, span, cb) {
  var o = { 
    text: span.innerHTML,
    delay: 250,
    step: 0,
    item: 0,
    tries: 0,
    tries_max: 8,
  };
  fn = function() {
    if( o.step == 0 ) {
      span.innerHTML = "Loading " + loader.list[o.item];
      span.title = "Loading " + loader.list[o.item];
      o.step = 1;
      o.tries = 0;
    } else if( o.step == 1 ) {
      if( loader.data[o.item] ) {
        span.innerHTML = "Loaded " + loader.list[o.item];
        span.title = "Loaded " + loader.list[o.item];
        o.item++;
        if( o.item == loader.list.length ) {
          o.step = 2;
          span.innerHTML = "Loading done";
          span.title = "Ready to run";
        } else o.step = 0;
      } else {
        if( o.tries < o.tries_max ) {
          o.step = 1;
          if( o.tries*2 < o.tries_max ) {
            span.innerHTML = span.innerHTML + ".";
            span.title = span.title + ".";
          }
          o.tries++;
        } else {
          o.step = 2;
        }
      }
    } else if( o.step == 2 ) {
      span.innerHTML = o.text;
      cb();
      return;
    }

    setTimeout( fn, o.delay );
  };

  if( !loader.list.length ) throw "no resources to animate";

  fn ();
}




