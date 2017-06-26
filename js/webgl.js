
function foreach( arr, fn ) {
  var l = arr.length;
  for( var i=0; i < l; i++) fn( arr[ i ], i );
}

function webgl_context( canvas, opts ) {
  
  var ctx = canvas.getContext( "webgl2", opts || { alpha: false } );

  if( !ctx ) throw "Failed to get a WebGL2 context. A modern browser is required.";

  return ctx;
}


function init_shader_menus() {

  var elems = document.querySelectorAll("div.shader");

  if(elems) {
    
    foreach( elems, function( el ) {

      var c = el.querySelector("canvas");

      if( !c ) throw "no canvas";

      el.onclick = function(e) {

        if( e.target.nodeName !== "LI" ) return;

        var attr = e.target.className;

        for( let i = 0; i < this.children.length; i++ ) {

          var child = this.children[i];

          if( child.nodeName === "CANVAS" || child.nodeName === "TEXTAREA" ) {
            if( child.classList.contains( attr ) ) 
              child.classList.remove( "hidden" );
            else
              child.classList.add( "hidden" );
          }
        }

      }; 
    } );
  }
}

init_shader_menus();

function loadjs(js,fn) {

  var s = document.createElement("script");
  document.head.appendChild(s);
  s.onload = function() { fn(); };
  s.src = js;
}

var shader_runs = 0;

function resize_shader(d,c,vs,ps) {
   var offw, offw;

  d.onclick( { target: d.querySelector("li.canvas") } );

  if( is_fscreen() ) {
    offw = window.innerWidth + "px";
    offh = window.innerHeight + "px";
    c.style.width = offw;
    console.log("webgl fullscreen", offw, offh);
  } else {
    c.style.width = '100%';
    offw = Math.round( c.offsetWidth );
    offh = offw + "px";
  }

  c.style.height = offh;
  if( vs ) vs.style.height = offh;
  if( ps ) ps.style.height = offh;
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
  var close = D.querySelector("#" + args.div + " li.close");

  if( !d || !c ) throw "failed to get canvas with control buttons";
  
  if( d.shader_opts ) d.shader_opts.finish = true;

  var opts = d.shader_opts = { 
    id: shader_runs, canvas: c, pause: false, log: false, time_log: 3 
  };

  for( var prop in args ) opts[ prop ] = args[ prop ];

  if( !opts.resize ) shader_runs++;

  opts.finish = false;

  console.log( "run webgl", opts.id, "with args", opts );

  resize_shader( d, c, vs, ps );

  var pr = window.devicePixelRatio || 1.0;
  var cw = c.clientWidth, ch = c.clientHeight;
  c.width = cw * pr;
  c.height = ch * pr;

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

  if( p ) p.onclick = function() { opts.pause = this.classList.toggle("active"); };
  if( l ) l.onclick = function() { opts.log = this.classList.toggle("active"); };
  if( r ) r.onclick = function() { run_shader( args ); };

  if( fs && support_fscreen() ) {

    fs.onclick = function() { request_fscreen( c ); };
  }

  if( !d.windowresize ) {

    d.windowresize = function() {
      resize_shader( d, c, vs, ps );
      var opts = d.shader_opts;
      if( opts && ! opts.resizing ) {
        console.log( "webgl %d resize", opts.id );
        opts.resizing = true;
        setTimeout( function() { 
          opts.resizing = false; 
          opts.resize = true; 
          run_shader( opts ) 
        }, 500 );
      }
    };

    window.addEventListener( "resize", d.windowresize );
  }

  if( !d.contextlost ) {

    d.contextlost  = function() { 
      var opts = d.shader_opts;
      console.log( "webgl %d context lost", opts.id );
      stop_shader( opts.div );
      setTimeout( function() {
        opts.resize = true;
        run_shader( opts );
      }, 500 );
    };

    c.addEventListener( "webglcontextlost", d.contextlost );
  }

  if( close ) 
    if( opts.close ) 
      close.onclick = opts.close;
    else
      close.onclick = function( e ) { 
        e.stopPropagation(); 
        stop_shader( opts.div ); 
        d.classList.toggle( "hidden" );
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
  if( d.contextlost ) c.removeEventListener( "webglcontextlost", d.contextlost );
  if( d.fschange ) remove_fchange( d.fschange );

  d.windowresize = d.contextlost = d.fschange = null;

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

function add_fchange( fn ) {
  if( el.webkitRequestFullscreen ) document.addEventListener( "webkitfullscreenchange", fn );
  else if( el.mozRequestFullScreen ) document.addEventListener( "mozfullscreenchange", fn );
  else if( el.msRequestFullscreen ) document.addEventListener( "MSFullscreenChange", fn );
  else throw "fullscreen not supported";
}

function remove_fchange( fn ) {
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


