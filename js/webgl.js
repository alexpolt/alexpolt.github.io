
function webgl_context( canvas, opts ) {
  var ctx = canvas.getContext( "webgl2", opts || { alpha: false } );
  return ctx;
}


function init_shader_menus() {

  var elems = document.querySelectorAll("div.shader");

  if(elems) {
    
    elems.forEach( function(el) {

      var c = el.querySelector("canvas");

      if( !c ) throw "no canvas";

      el.onclick = function(e) {

        if( e.target.nodeName !== "LI" ) return;

        var attr = e.target.getAttribute("class");

        for( let i = 0; i < this.children.length; i++ ) {

          var child = this.children[i];

          if( child.nodeName === "CANVAS" || child.nodeName === "TEXTAREA" ) {

            if( child.className !== attr ) 
                  child.style.display = "none";
            else  child.style.display = "block";
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

function run_shader( args ) {

  var D = document;
  var d = D.querySelector("#" + args.div);
  var c = D.querySelector("#" + args.div + " canvas");
  var r = D.querySelector("#" + args.div + " button.reload");
  var p = D.querySelector("#" + args.div + " button.pause");
  var l = D.querySelector("#" + args.div + " button.log");

  if( !d || !c || !r || !p || !l ) throw "failed to get canvas with control buttons";
  
  if( d.shader_opts ) d.shader_opts.finish = true;

  var opts = d.shader_opts = { 
    id: shader_runs++, canvas: c, finish: false, pause: false, log: false, time_log: 3 
  };

  for( var prop in args ) opts[ prop ] = args[ prop ];

  console.log( "run webgl", opts.id, "with args", args );

  d.onclick( { target: d.querySelector("li.canvas") } );

  if( d.windowresize ) {
    window.removeEventListener( "resize", d.windowresize );
    c.removeEventListener( "webglcontextlost", d.contextlost );
    d.windowresize = null;
    d.contextlost = null;
  }

  var woff = c.offsetWidth;
  var hpx = c.style.height = woff + "px";

  var pr = window.devicePixelRatio || 1.0;
  c.width = c.clientWidth * pr;
  c.height = c.clientHeight * pr;

  var ta = d.querySelectorAll("textarea");
  if( ta ) ta.forEach( function(e) { e.style.height = hpx; } );

  if( ! d.windowresize ) {
    d.windowresize = function() { 
      console.log( "webgl %d resize",opts.id ); 
      args.resize = true; 
      run_shader( args ); 
    };
    window.addEventListener( "resize", d.windowresize );
    d.contextlost  = function() { 
      console.log( "webgl %d context lost", otps.id ); 
      run_shader( args ); 
    };
    c.addEventListener( "webglcontextlost", d.contextlost );
  }

  if( !args.resize ) {
    p.classList.remove("active");
    l.classList.remove("active");
  } else {
    opts.pause = p.classList.contains("active");
    opts.log = l.classList.contains("active");
    args.resize = false;
  }

  p.onclick = function() { opts.pause = this.classList.toggle("active"); };
  l.onclick = function() { opts.log = this.classList.toggle("active"); };
  r.onclick = function() { run_shader( args ); };

  var vs = D.querySelector("#" + args.div + " textarea.vs");
  var ps = D.querySelector("#" + args.div + " textarea.ps");
  var js = d.getAttribute("js");
  var fn = d.getAttribute("fn");

  if( args.js && args.fn ) {

    loadjs( args.js, function() {

      if( ! window[ args.fn ] ) throw args.fn + " not found";

      window[ args.fn ]( opts );
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

  if( d.shader_opts ) {
    d.shader_opts.finish = true;
  } else throw "no shader running";
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

