

var camera_imp = {
  mousemove: function(e) {

    if( !this.rotate ) return;

    if( !this.mx_prev ) {
      this.mx_prev = e.clientX;
      this.my_prev = e.clientY;
    }

    this.movex = e.clientX - this.mx_prev;
    this.movey = e.clientY - this.my_prev;

    this.mx_prev = e.clientX;
    this.my_prev = e.clientY;

    if( this.rotate ) {
      if( ! e instanceof Touch ) e.preventDefault();
      if( this.movex != 0 ) this.rotate_y( this.movex );
      if( this.movey != 0 ) this.rotate_x( this.movey );
    }
  },
  mouseup: function(e) {
    this.rotate = false;
  },
  mousedown: function(e) {
    if( this.paused ) return;
    this.rotate = true;
    this.clickx = e.pageX - e.target.offsetLeft;
    this.clicky = e.pageY - e.target.offsetTop;
    this.mbutton = e.button;
  },
  touchstart: function(e) {
    if( this.paused ) return;
    this.mousedown( e.touches[0] );
    e.preventDefault();
  },
  touchend: function(e) {
    this.mouseup( e.touches[0] );
  },
  touchmove: function(e) {
    this.mousemove( e.touches[0] );
  },
  contextmenu: function(e) {
    if( this.nocontextmenu ) {
      e.preventDefault();
    }
  },
  keydown: function(e) {
    var p = 0;
    //32-space,82-r,65-a,83-s,68-d,87-w,37,38,39,40-left,up,right,down,27-esc,16-shift,17-ctrl
    switch( e.keyCode ) {
      case 87: this.move(vec3(0,0, this.speed)); p=1; break;
      case 83: this.move(vec3(0,0,-this.speed)); p=1; break;
      case 65: this.move(vec3(-this.speed,0,0)); p=1; break;
      case 68: this.move(vec3( this.speed,0,0)); p=1; break;
      default:;
    }
    if( p ) e.preventDefault();
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
  },
  move: function(v) { 
    if( !this.paused ) 
      this.pos = add(this.pos,v); 
  },
  get_m: function() {
    return this.m.reduce( function(r,e) { return r.concat(e); } );
  },
  get_pos: function() { return this.pos;  },
  reset_m: function() {
      this.m = mat3(vec3(1,0,0),vec3(0,1,0),vec3(0,0,1));
  },
  reset_pos: function() {
      this.pos = this.pos_orig; 
  },
  pause: function(s) { this.paused = s; }
};

function camera_create( opts ) {

  opts = opts || {};

  if( typeof opts.element == "string" )
    opts.element = document.getElementById( opts.element );

  var o = assign( opts, camera_imp );

  if( !o.m ) o.reset_m();

  if( opts.pos ) 
        opts.pos_orig = opts.pos;
  else  opts.pos_orig = vec3(0, 0, opts.personal ? -1 : 1);

  if( !o.pos ) o.reset_pos();
  if( !o.speed ) o.speed = 0.125;

  o.paused = false;
  o.rotate = false;
  o.prerotate = false;
  if( !o.nocontextmenu ) o.nocontextmenu = true;
  
  o.m_rot_x = [];
  o.m_rot_y = []; 
  o.delta_max = 5.0;

  for(var i=.0; i<=o.delta_max*2.0; i++) {
    var a = (i-o.delta_max)/o.delta_max*Math.PI/32.0;
    var c = Math.cos(a), s = Math.sin(a);
    o.m_rot_x.push( mat3(vec3(1,0,0), vec3(0,c,-s), vec3(0,s,c), vec3(0,0,0)) );
    o.m_rot_y.push( mat3(vec3(c,0,s), vec3(0,1,0), vec3(-s,0,c), vec3(0,0,0)) );
  }

  if( !o.nobind ) {
    o.delegates = [ delegate(o,o.mousemove), delegate(o,o.keydown), delegate(o,o.mouseup),
                    delegate(o,o.mousedown),delegate(o,o.contextmenu),
                    delegate(o,o.touchstart), delegate(o,o.touchend), delegate(o,o.touchmove)
                  ];
    document.addEventListener( "mousemove", o.delegates[0] );
    document.addEventListener( "keydown", o.delegates[1] );
    document.addEventListener( "mouseup", o.delegates[2] );
    document.addEventListener( "touchend", o.delegates[6] );
    document.addEventListener( "touchmove", o.delegates[7] );
    if( o.element ) {
      o.element.addEventListener( "mousedown", o.delegates[3] );
      o.element.addEventListener( "contextmenu", o.delegates[4] );
      o.element.addEventListener( "touchstart", o.delegates[5] );
    }
  }

  return o;
}

function camera_remove( cam ) {
  var o = cam;
  if( !o.nobind ) {
    document.removeEventListener( "mousemove", o.delegates[0] );
    document.removeEventListener( "keydown", o.delegates[1] );
    document.removeEventListener( "mouseup", o.delegates[2] );
    document.removeEventListener( "touchend", o.delegates[6] );
    document.removeEventListener( "touchmove", o.delegates[7] );
    if( o.element ) {
      o.element.removeEventListener( "mousedown", o.delegates[3] );
      o.element.removeEventListener( "contextmenu", o.delegates[4] );
      o.element.removeEventListener( "touchstart", o.delegates[5] );
    }
  }
}



