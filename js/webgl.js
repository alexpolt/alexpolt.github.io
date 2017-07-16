
function webgl_context( canvas, opts ) {
  console.info("Request for a WebGL context.");  
  var ctx = canvas.getContext( "webgl", opts || { } );
  if( !ctx ) ctx = canvas.getContext( "experimental-webgl", opts || { } );
  if( !ctx ) throw "Failed to get a WebGL context. A modern browser is required.";
  var ver = ctx.getParameter( ctx.VERSION );
  if( !ver ) throw "Something wrong with the WebGL context. Try closing the browser and try again.";
  console.log( "WebGL context", ver, "Renderer", ctx.getParameter( ctx.RENDERER ) );
  return ctx;
}

function webgl2_context( canvas, opts ) {
  console.info("Request for a WebGL2 context.");  
  var ctx = canvas.getContext( "webgl2", opts || { } );
  if( !ctx ) ctx = canvas.getContext( "experimental-webgl2", opts || { } );
  if( !ctx ) throw "Failed to get a WebGL2 context. A modern browser is required.";
  var ver = ctx.getParameter( ctx.VERSION );
  if( !ver ) throw "Something wrong with the WebGL context. Try closing the browser and try again.";
  console.log( "WebGL context", ver, "Renderer", ctx.getParameter( ctx.RENDERER ) );
  return ctx;
}

function init_shader_menus() {

  var elems = document.querySelectorAll("div.shader");

  if(elems) {
    
    foreach( elems, function( el ) {

      var c = el.querySelector("canvas");

      if( !c ) throw "no canvas";

      el.onclick = function(e) {

        var t = e.target;

        if( !t ) return;
        if( t.nodeName !== "LI" ) return;
        if( t.classList.contains("close") ) return;

        var attr = e.target.className;
        var c = this.querySelector( "div.canvas" );

        for( let i = 0; i < c.children.length; i++ ) {

          var child = c.children[i];

          if( child.getAttribute( "hide" ) === null ) continue;

          if( child.classList.contains( attr ) ) {
              child.classList.remove( "hidden" );
              if( child.nodeName != "CANVAS" ) {
                var p = el.querySelector("button.pause");
                if( p && p.onclick ) {
                  if(!p.classList.contains("active")) {
                    p.onclick();
                    el.button_paused = true;
                  }
                }
              } else if( el.button_paused ) {
                el.button_paused = false;
                var p = el.querySelector("button.pause");
                p.onclick();
              }
          } else {
              child.classList.add( "hidden" );
          }
        }
      }; 

    } );
  }
}


function loadjs(js,fn) {

  var s = document.createElement("script");
  document.head.appendChild(s);
  s.onload = function() { fn(); };
  s.src = js;
}

var shader_runs = 0;

function resize_shader(d,c) {

  var offw, offw;

  var divc = d.querySelector("div.canvas");

  if( is_fscreen() ) {
    offw = window.innerWidth + "px";
    offh = window.innerHeight + "px";
    console.log("webgl fullscreen mode", offw, offh);
  } else {
    offw = "100%";
    offh = Math.floor( d.offsetWidth ) + "px";
  }

  divc.style.width = offw;
  divc.style.height = offh;

  c.width = divc.clientWidth;
  c.height = divc.clientHeight;
}

function run_shader( args ) {

  var D = document;
  var d = D.querySelector("#" + args.div);
  var c = D.querySelector("#" + args.div + " canvas");
  var r = D.querySelector("#" + args.div + " button.reload");
  var p = D.querySelector("#" + args.div + " button.pause");
  var l = D.querySelector("#" + args.div + " button.log");
  var fs = D.querySelector("#" + args.div + " button.fscreen");
  var vs = D.querySelector("#" + args.div + " textarea.vs");
  var ps = D.querySelector("#" + args.div + " textarea.ps");
  var hp = D.querySelector("#" + args.div + " div.help");
  var close = D.querySelector("#" + args.div + " li.close");

  if( !d || !c ) throw "failed to get canvas with control buttons";
  
  if( d.shader_opts ) d.shader_opts.finish = true;

  var opts = d.shader_opts = { 
    id: shader_runs, canvas: c, pause: false, log: false, time_log: 3 
  };

  assign (opts, args);

  if( !opts.resize ) {
    shader_runs++;
    d.onclick( { target: d.querySelector("li.canvas") } );
  }

  opts.finish = false;

  console.log( "run webgl", opts.id, "with args", opts );

  resize_shader( d, c );

  opts.width = c.width;
  opts.height = c.height;

  console.log("webgl canvas width = %d, height = %d", c.width, c.height );

  if( opts.pause ) 
        p.classList.add("active");
  else  p.classList.remove("active");

  if( opts.log ) 
        l.classList.add("active");
  else  l.classList.remove("active");
 

  if( opts.resize ) {

  }

  if( p ) p.onclick = function() { 
    opts.pause = this.classList.toggle("active"); this.blur(); 
    if( opts.onpause ) opts.onpause( opts.pause );
  };
  if( l ) l.onclick = function() { opts.log = this.classList.toggle("active"); this.blur(); };
  if( r ) r.onclick = function() { 
    delete opts.seed; 
    if( opts.onreload ) opts.onreload();
    run_shader( opts ); 
    this.blur(); 
  };

  if( !d.keyhandler ) {
    d.keyhandler = function(e) {
      //32-space,82-r,65-a,83-s,68-d,87-w,37,38,39,40-left,up,right,down,27-esc,16-shift,17-ctrl
      if( e.target && e.target.nodeName == "TEXTAREA" ) return;
      if( e.keyCode == 32 ) { if( p ) p.onclick(); e.preventDefault(); }
      if( e.keyCode == 82 ) { if( r ) r.onclick(); e.preventDefault(); }
    };
    D.addEventListener( "keydown", d.keyhandler );
  }

  if( !d.windowresize ) {

    d.windowresize = function() {
      var opts = d.shader_opts;
      if( opts && ! opts.resizing ) {
        console.log( "webgl %d resize", opts.id );
        opts.resizing = true;
        setTimeout( function() { 
          opts.resizing = false; 
          opts.resize = true; 
          run_shader( opts ) 
        }, 300 );
      }
    };

    window.addEventListener( "resize", d.windowresize );
  }

  if( !d.windowscroll ) {
    d.windowscroll = function() {
    };
    window.addEventListener( "scroll", d.windowscroll );
  }

  if( fs && support_fscreen() ) {

    fs.onclick = function() { 
      d.onclick( { target: d.querySelector("li.canvas") } );
      request_fscreen( c ); 
      this.blur(); 
    };
    if(! d.fchange ) {
      d.fchange = function() {
        d.windowresize();
      };
      add_fchange( c, d.fchange );
    }
  }

  if( !d.contextlost ) {

    d.contextlost  = function() { 
      var opts = d.shader_opts;
      console.log( "webgl %d context lost", opts.id );
      stop_shader( opts.div );
      var r = confirm("WebGL context was lost. Try again?");
      if( r ) 
        setTimeout( function() {
          opts.resize = true;
          run_shader( opts );
        }, 100 );
      else 
        opts.close();
    };

    c.addEventListener( "webglcontextlost", d.contextlost );
  }

  if( close ) 
    if( opts.close ) close.onclick = opts.close;
    else
      opts.close = close.onclick = function( e ) { 
        e.stopPropagation(); 
        stop_shader( opts.div ); 
        d.classList.toggle( "hidden" );
        if( opts.onclose ) opts.onclose();
      };

  var js = d.getAttribute("js");
  var fn = d.getAttribute("fn");

  if( opts.js && opts.fn ) {

    loadjs( opts.js, function() {

      if( ! window[ opts.fn ] ) throw opts.fn + " not found";

      window[ opts.fn ]( opts );
    } );

  } else if( js && fn ) {

    loadjs( js, function() {

      if( ! window[ fn ] ) throw fn + " not found";

      window[ fn ]( opts );
    } );

  } else if( vs && ps ) {

    opts.vs = vs.value;
    opts.ps = ps.value;

    webgl_quad( opts );

  } else throw "nothing to run";

}

function stop_shader( div ) {

  var D = document;
  var d = D.querySelector("#" + div);
  var c = D.querySelector("#" + div + " canvas");

  if( d.windowresize ) window.removeEventListener( "resize", d.windowresize );
  if( d.windowscroll ) window.removeEventListener( "scroll", d.windowscroll );
  if( d.contextlost ) c.removeEventListener( "webglcontextlost", d.contextlost );
  if( d.fchange ) remove_fchange( c, d.fchange );
  if( d.keyhandler ) D.removeEventListener( "keydown", d.keyhandler );

  d.keyhandler = d.windowresize = d.contextlost = d.fchange = null;

  if( d.shader_opts ) {
    console.log( "finish webgl", d.shader_opts.id );
    d.shader_opts.finish = true;
  } else throw "no shader running";
}

function support_fscreen() {
  return document.webkitFullscreenEnabled || 
          document.mozFullScreenEnabled || 
            document.msFullscreenEnabled;
}

function request_fscreen( el ) {
  if( el.webkitRequestFullscreen ) el.webkitRequestFullscreen();
  else if( el.mozRequestFullScreen ) el.mozRequestFullScreen();
  else if( el.msRequestFullscreen ) el.msRequestFullscreen();
  else throw "fullscreen not supported";
}

function is_fscreen() {
  return document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
            document.msFullscreenElement;
}

function add_fchange( el, fn ) {
  if( el.webkitRequestFullscreen ) document.addEventListener( "webkitfullscreenchange", fn );
  else if( el.mozRequestFullScreen ) document.addEventListener( "mozfullscreenchange", fn );
  else if( el.msRequestFullscreen ) document.addEventListener( "MSFullscreenChange", fn );
  else throw "fullscreen not supported";
}

function remove_fchange( el, fn ) {
  if( el.webkitRequestFullscreen ) document.removeEventListener( "webkitfullscreenchange", fn );
  else if( el.mozRequestFullScreen ) document.removeEventListener( "mozfullscreenchange", fn );
  else if( el.msRequestFullscreen ) document.removeEventListener( "MSFullscreenChange", fn );
  else throw "fullscreen not supported";
}


function add_tabs() {
  var textareas = document.getElementsByTagName('textarea');
  var count = textareas.length;
  for(var i=0;i<count;i++){
      textareas[i].onkeydown = function(e){
          if(e.keyCode==9 || e.which==9){
              e.preventDefault();
              var s = this.selectionStart;
              this.value = this.value.substring(0,this.selectionStart) + "  " + this.value.substring(this.selectionEnd);
              this.selectionStart = s+2; 
              this.selectionEnd = s+2; 
          }
          if(e.keyCode==13 || e.which==13){
            var cursorPos = this.selectionStart;
            var curentLine = this.value.substr(0, this.selectionStart).split("\n").pop();
            var indent = curentLine.match(/^\s*/)[0];
            var value = this.value;
            var textBefore = value.substring(0,  cursorPos );
            var textAfter  = value.substring( cursorPos, value.length );

            e.preventDefault(); // avoid creating a new line since we do it ourself
            this.value = textBefore + "\n" + indent + textAfter;
            setCaretPosition(this, cursorPos + indent.length + 1); // +1 is for the \n              var [m0, m1] = this.value.exec( " " + this.selectionStart + " " );
          }
      }
  }
}

function setCaretPosition(ctrl, pos)
{

    if(ctrl.setSelectionRange)
    {
        ctrl.focus();
        ctrl.setSelectionRange(pos,pos);
    }
    else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}

add_tabs();

function activate_webgl() {

  var ver1 = 0, ver2 = 0, canvas;

  try {
    canvas = document.createElement( "canvas" );
    if( canvas.getContext( "webgl" ) || canvas.getContext( "experimental-webgl" ) ) ver1 = 1;
  } catch(e) { console.error( e ); }

  try {
    canvas = document.createElement( "canvas" );
    if( canvas.getContext( "webgl2" ) || canvas.getContext( "experimental-webgl2" ) ) ver2 = 2;
  } catch(e) { console.error( e ); }

  canvas = null;

  var els = document.querySelectorAll( "div.webgl" );

  foreach( els, function( e ) {

    var ver = e.getAttribute("webgl_version") || 1;

    var div = e.getAttribute("webgl_div");
    var span = e.querySelector( "span" );
    if( !span ) throw "Span not found in div.webgl element";

    if( ver != ver1 && ver != ver2 ) { 
      span.innerHTML = "no WebGL"+ver+" support";
      span.classList.add("nowebgl");
      e.onclick = function(e) { 
        if( e.target && e.target.nodeName != "SPAN" && e.target.nodeName != "IMG" ) return;
        alert("Need WebGL "+ver+" support. Please update your browser."); 
      };
    } else if( div ) {
      e.onclick = function(e) { 
        demo_open.call( this, div );
      };
    }

    var logo = new Image();
    logo.classList.add( "logo" );
    logo.alt = "WebGL Logo";
    logo.title = "WebGL Demo";
    logo.onload = function() {
      if( ! this.width_orig ) this.width_orig = this.width;
      if( ! this.height_orig ) this.height_orig = this.height;
      var img = e.querySelector( "img.link" );
      var ar0 = this.height_orig / this.width_orig;
      var ar1 = img.offsetHeight / img.offsetWidth;
      var k = ar0 / ar1;
      if( k < 1 ) {
        var scale  = 0.75 - ( Math.min( 1, Math.max( k, 0.5 )) - 0.5 );
        this.style.height = "auto";
        this.style.width = Math.round( scale * img.offsetWidth ) + "px";
      } else {
        var scale = 0.5;
        this.style.width = "auto";
        this.style.height = Math.round( scale * img.offsetHeight ) + "px";
      }
      this.classList.remove( "hide" );
    };
    
    var onload = function() {
      if( ! logo.added ) {
        logo.src = "images/webgl300.png";
        logo.classList.add( "logo" );
        logo.classList.add( "hide" );
        e.appendChild( logo );
        logo.added = true;
      } else
        logo.onload();
    };

    var img = e.querySelector( "img.link" );
    img.onload = onload;
    setTimeout( function() {
      if( !logo.added ) img.onload( img );
    }, 100 );

    window.addEventListener( "resize", function() { onload.call(img); } );

  } );

  var tas = document.querySelectorAll( "div.shader div.help" );

  foreach( tas, function( e ) {
    e.innerHTML = "<h3>WebGL Demo Helper</h3><ul class='help'>" + [
      "<b>Keys:</b> <u>space</u> - pause, <u>r</u> - reload;",
      "<b>Predefined uniforms:</b> <u>t</u> - time, <u>screen.xy</u> - screen dimensions, " +
      "<u>frame</u> - frame counter, <u>seed</u> - random number from 0 to 1, " +
      "<u>pass</u> - 2 pass rendering, pass = 0 or 1;",
      "<b>Predefined samplers:</b> <u>prevtex</u> - previous rendered frame, " +
      "<u>fbtex</u> - together with <u>pass</u> uniform allows 2 pass rendering;",
      "<b>Upper buttons:</b> <u>VS</u> - vertex shader, <u>PS</u> - pixel shader, " +
      "<u>Help</u> - this, <u>Close</u> - close demo;",
      "<b>Bottom buttons:</b> <u>Reload</u> - reloads shader, <u>Log</u> - outputs FPS to " +
      "console every 3 seconds, <u>Pause</u> - pauses rendering, <u>FS</u> - activate fullscreen mode;",
   ].map( function( e ) { return "<li>"+e+"</li>"; } ).join("") + "</ul>" +
      "<i>This is a Javscript helper written by me (Alexandr Poltavsky) for WebGL demos.</i>" 
  } );
}


function demo_open( div ) {

  var ctrl = this;

  var r = function( args ) {

    var d = document.querySelector( "div#" + div );
    if( !d ) throw "div " + div + " not found";

    d.classList.remove( "hidden" );
    ctrl.classList.add( "hidden" );

    var opts = { 
      div: div,
      version: ctrl.getAttribute( "webgl_version" ) || 1,
      close: function() { 
        demo_close.call( ctrl, div ); 
        if( opts.onclose ) opts.onclose();
      },
    };

    assign (opts, args);

    run_shader( opts );
  };

  var fn = this.getAttribute( "init" );

  if( fn && window[fn] ) 
       window[fn].call( this, r );
  else r( {} );
}

function demo_close( div ) {

  var d = document.querySelector( "div#" + div );
  if( !d ) throw "div " + div + " not found";
  stop_shader( div );
  d.classList.add( "hidden" );
  this.classList.remove( "hidden" );
  this.querySelector("img.logo").onload();
}


document.addEventListener( "DOMContentLoaded", function() { 
  
  init_shader_menus();

  activate_webgl(); 

} );


