

var camera_imp = {
  mousemove: function(e) {
    if( ! this.mx_prev ) {
      this.mx_prev = e.clientX;
      this.my_prev = e.clientY;
    }
    this.movex = e.clientX - this.mx_prev;
    this.movey = e.clientY - this.my_prev;
    this.mx_prev = e.clientX;
    this.my_prev = e.clientY;

    if( this.rotate ) {
      if( this.movex != 0 ) this.rotate_y( this.movex );
      if( this.movey != 0 ) this.rotate_x( this.movey );
    }
  },
  mouseup: function(e) {
    this.rotate = false;
  },
  mousedown: function(e) {
    this.clickx = e.pageX - e.target.offsetLeft;
    this.clicky = e.pageY - e.target.offsetTop;
    this.mbutton = e.button;
    this.rotate = true;
  },
  contextmenu: function(e) {
    e.preventDefault();
  },
  keydown: function(e) {
  },
  keyup: function(e) {
  },
  rotate_x: function(delta) {
    var d = clamp( delta+this.delta_max, 0, this.delta_max*2 );
    if( this.personal ) {
    } else {
      this.m = mul( this.m_rot_x[d], this.m );
    }
  },
  rotate_y: function(delta) {
    var d = clamp( delta+this.delta_max, 0, this.delta_max*2 );
    this.m = mul( this.m_rot_y[d], this.m );
  }
};

function camera_create( opts ) {

  opts = opts || {};

  if( typeof opts.canvas == "string" )
    opts.canvas = document.getElementById( opts.canvas );

  var o = Object.assign( opts, camera_imp );

  o.m = mat4(vec4(1,0,0,0),vec4(0,1,0,0),vec4(0,0,1,0),vec4(0,0,0,1));

  o.m_rot_x = [];
  o.m_rot_y = []; 
  o.delta_max = 5.0;

  for(var i=.0; i<=o.delta_max*2.0; i++) {
    var a = (i-o.delta_max)/o.delta_max*Math.PI/32.0;
    var c = Math.cos(a), s = Math.sin(a);
    o.m_rot_x.push( mat4(vec4(1,0,0,0), vec4(0,c,-s,0), vec4(0,s,c,0), vec4(0,0,0,1)) );
    o.m_rot_y.push( mat4(vec4(c,0,s,0), vec4(0,1,0,0), vec4(-s,0,c,0), vec4(0,0,0,1)) );
  }

  if( !o.nobind ) {
    document.addEventListener( "mousemove", delegate( o, o.mousemove ) );
    document.addEventListener( "keydown", delegate( o, o.keydown ) );
    document.addEventListener( "mouseup", delegate( o, o.mouseup ) );
    if( o.canvas ) {
      o.canvas.addEventListener( "mousedown", delegate( o, o.mousedown ) );
      o.canvas.addEventListener( "contextmenu", delegate( o, o.contextmenu ) );
    }
  }

  return o;
}

function camera_remove( cam ) {
  var o = cam;
  if( !o.nobind ) {
    document.removeEventListener( "mousemove", delegate( o, o.mousemove ) );
    document.removeEventListener( "keydown", delegate( o, o.keydown ) );
    document.removeEventListener( "mouseup", delegate( o, o.mouseup ) );
    if( o.canvas ) {
      o.canvas.removeEventListener( "mousedown", delegate( o, o.mousedown ) );
      o.canvas.removeEventListener( "contextmenu", delegate( o, o.contextmenu ) );
    }
  }
}



