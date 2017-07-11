

function load_images (list, cb) {

  var o = { list: list, data: array(list.length, null), loaded: false, failed: false, failed_src: null };

  cb = cb || {};
  
  foreach( list, function(src,i) {
    console.info( "Image "+src+" loading begin." );
    if( cb.loading ) cb.loading.call(o, src, i);
    var img = new Image();
    img.onerror = function() { 
      console.info( "Image "+src+" loading failed." );
      o.failed = true; o.failed_src = src; 
      if( cb.error ) cb.error.call(o, src, i);
    };
    img.onload = function() { 
      console.info( "Image "+src+" loading done." );
      o.data[i] = img;
      if( cb.loaded ) cb.loaded.call(o, src, i);
      var loaded = true;
      for( var n=0; n<o.data.length; n++ ) loaded = loaded && !!o.data[n];
      if( loaded ) {
        o.loaded = true;
        if( cb.success ) cb.success.call(o);
      }
    };
    img.src = src;
  } );

  return o;
}

function load_resources (list, cb) {

  var o = { list: list, data: array(list.length, null), loaded: false, failed: false, failed_src: null };

  cb = cb || {};

  foreach( list, function(src,i) {
    console.info( "Resource "+src+" loading begin." );
    var req = new XMLHttpRequest();
    if( req.responseType )
      req.responseType = "text";
    else
      req.overrideMimeType("text/plain");
    req.open( "GET", src );
    req.timeout = 2000;
    req.ontimeout = function() {
      console.info( "Resource "+src+" loading timout of 2 seconds." );
      o.failed = true; o.failed_src = src; 
      if( cb.error ) cb.error.call(o, src, i);
    };
    req.onerror = function() { 
      var s = req.statusText;
      console.info( "Resource "+src+" loading error with status: " + s );
      o.failed = true; o.failed_src = src;
      if( cb.error ) cb.error.call(o, src, i);
    };
    req.onload = function() { 
      console.info( "Resource "+src+" loading done." );
      o.data[i] = req.response;
      if( cb.loaded ) cb.loaded.call(o, src, i);
      var loaded = true;
      for( var n=0; n<o.data.length; n++ ) loaded = loaded && !!o.data[n];
      if( loaded ) {
        o.loaded = true;
        if( cb.success ) cb.success.call(o);
      }
    };
    if( cb.loading ) cb.loading.call(o, src, i);
    req.send();
  } );

  return o;
}

function load_animation (loader, span, cb) {
  var o = { 
    text: span.innerHTML,
    delay: loader.delay || 250,
    step: loader.step || 0,
    item: 0,
    tries: 0,
    tries_max: loader.tries_max || 8,
    span_text: loader.span_text || undefined,
    span_title: loader.span_title || undefined,
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
          o.delay = 100;
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
          o.delay = 0;
        }
      }
    } else if( o.step == 2 ) {
      o.step = 3;
      if( o.span_text ) {
        span.innerHTML = o.span_text;
        span.title = o.span_title;
      }
    } else if( o.step == 3 ) {
      cb();
      span.innerHTML = o.text;
      return;
    }

    setTimeout( fn, o.delay );
  };

  if( !loader.list.length ) throw "no resources to animate";

  fn ();
}




