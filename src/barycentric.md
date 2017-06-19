

##Barycentric Coordinates

  If we take a look at a [Wikipedia article][b] on barycentric coordinates we'll see that the
  description is very long-winded and not that easy to grasp. As a result many graphics 
  programmer have a vague understanding of how barycentric coordinates work and why they are 
  very useful.

  What we need to understand is that the edges of a triangle on a plane form a 2D vector space.
  Lets call it a uv-space. We can take the edge vectors of the triangle and form a matrix 
  that takes us from this uv-space. As you can see, a _u_ coordinate of 1 will transform to A
  point, a _v_ equal to 1 will get us to B, by adding translation we get a point in the triangle: 
  <b>P = (A-C)\*u + (B-C)\*v + C = A\*u + B\*v + C\*(1-u-v)</b>.

  <center>![][img0]</center>

  Another way of looking at it as an equation for a plane in 3D: 
  <b>Z = (w0-w2)\*u + (w1-w2)\*v + w2 = w0\*u + w1\*v + w2\*(1-u-v)</b>, which is used for 
  interpolating any value across the triangle. By adding the constraint <b>u + v &lt;= 1</b> we 
  limit the domain to the triangle.

  As easy it is to find the barycentrics given a triangle: we just take the inverse of the matrix
  and get to the uv-space as seen in the drawing. Usually in different articles the barycentric 
  coordinates are found through normalized triangle area. But it doesn't matter because the 
  resulting math is the same.

  <center>![][img1]</center>

  And finding the inverse of a 2x2 matrix is really easy. Now, because it just happens that
  barycentric coordinates are equal to normalized triangle areas (picture below), we can use that
  fact to find a distance to edge ([trilinear coordinates][t]): <b>d = 2 * u * A / |B - C|</b>,
  where A - the triangle area. This can be used for antialiasing as in [DFAA][d].

  <center>![][img2]</center>

  <a name="barycentrics-in-shader"></a>

  So how do we get barycentric coordinates in a shader? There is no gl\_Barycentric or similar.
  Actually, on GCN there is an [intrinsic][i] (there you will also find a link to a great
  presentation by Michal Drobot). In other cases we have the following options:

  * For non-indexed geometry provide UVs with vertices. Or we can just take vertex id and index 
  into an array {{0,0},{1,0},{0,1}} by using index % 3.

  * Use a geometry shader.

  * For indexed geometry things are more involved: we need to map vertices to 0,1 or 2 (to index 
  into a shader uv-array). Sometimes it's not possible, when geometry is highly optimized and
  a lot of vertices are shared. But because we just need 2 bits we can pack another mapping into
  the same byte avoding mapping conflict. In the shader you'll have to unpack and use partial
  derivatives (on a flag) to decide what mapping is correct.

<!-- close list md bug -->

  And to finish, here is a JavaScript demo. Drag the points to see how the barycentrics change.


<div style="width: 70%;border:1px solid silver;margin:10px auto;">
  <canvas id="bar" style="display:block;width:100%;"></canvas>
  <script>
    try{

    var c = document.getElementById("bar");
    var pr = window.devicePixelRatio || 1.0;
    var h = Math.round( 3.0/4.0 * ( parseInt( c.clientWidth ) + 2.0*pr ) );
    c.width = Math.round( c.clientWidth * pr );   
    c.height = Math.round( h * pr );

    var mx, my;
    var points=[[-0.8,-0.8], [0.5,-0.5], [-0.2,0.75]];
    var w = c.width, h = c.height, wh = w/2, hh = h/2;
    var P=[0,0];
    var CP=[];


    c.onmousemove = function(e) {
      mx = e.pageX - e.target.offsetLeft;
      my = e.pageY - e.target.offsetTop;
      if( CP ) {
        CP[0] = mx/w*2.0-1.0;
        CP[1] = 1.0-my/h*2.0;
      }
    };

    c.onmousedown = function(e) {
      var mx = e.pageX - e.target.offsetLeft;
      var my = e.pageY - e.target.offsetTop;
      var points_ = points.concat([P]);
      points_.forEach( function( p_ ) {
        var p = T(p_);
        if( abs(p[0]-mx) < 10 && abs(p[1]-my) < 5 ) CP = p_;
      } );
    };

    c.onmouseup = function(e) {
      CP = null;
    };

    var ctx = c.getContext("2d");

    requestAnimationFrame(draw);

    var t_begin;

    function draw(t) {
      if( t_begin === undefined ) t_begin = t;
      var dt = ( t - t_begin ) / 1000.0;

      ctx.clearRect( 0, 0, w, h );
      ctx.font = "120% sans-serif"

      ctx.lineWidth = 2;
      var v0 = sub( points[1], points[0] );
      var v1 = sub( points[2], points[0] );
      var uvo = T( add( points[0], add( mul(v0,0.02), mul(v1,0.02) ) ) );
      var uv1 = T( add( points[0], add( mul(v0,0.95), mul(v1,0.02) ) ) );
      var uv2 = T( add( points[0], add( mul(v0,0.02), mul(v1,0.95) ) ) );
      ctx.beginPath();
      ctx.moveTo( uvo[0], uvo[1] );
      ctx.lineTo( uv1[0], uv1[1] );
      ctx.moveTo( uvo[0], uvo[1] );
      ctx.lineTo( uv2[0], uv2[1] );
      ctx.strokeStyle = "darkred";
      ctx.stroke();
      ctx.closePath();

      ctx.fillText( "u", uv1[0], uv1[1] );
      ctx.fillText( "v", uv2[0], uv2[1] );

      ctx.lineWidth = 1;
      ctx.fillStyle = "silver";
      ctx.strokeStyle = "silver";
      ctx.fillRect( w/2, 0, 1, h );
      ctx.fillRect( 0, h/2, w, 1 );

      ctx.fillStyle = "black";
      ctx.strokeStyle = "black";

      ctx.beginPath();
      ctx.moveTo( T(points[2])[0], T(points[2])[1] );

      points.forEach( function( p_ ) {
        var p = T( p_ );
        ctx.fillText( "["+p_[0].toFixed(2)+","+p_[1].toFixed(2)+"]", p[0], p[1]-4 );
        ctx.lineTo( p[0], p[1] );
        ctx.fillRect( p[0]-2, p[1]-2, 6, 6 );
      } );
      ctx.stroke();
      ctx.closePath();

      ctx.fillStyle = "darkred";
      var p = T(P);
      ctx.fillRect( p[0]-2, p[1]-2, 6, 6 );

      var b = barycentric();
      ctx.fillText( "["+b[0].toFixed(2)+","+b[1].toFixed(2)+"]", p[0], p[1]-4 );

      requestAnimationFrame(draw);
    }

    function T( p ) { return [ (p[0]*0.5+0.5)*w, (0.5-p[1]*0.5)*h ]; }
    function abs( v ) { return Math.abs( v ); }
    function sub(p0,p1) { return [ p0[0]-p1[0], p0[1]-p1[1] ]; }
    function add(p0,p1) { return [ p0[0]+p1[0], p0[1]+p1[1] ]; }
    function mul(p0,v) { return [ p0[0]*v, p0[1]*v ]; }

    function barycentric() {
      var v0 = sub( points[1], points[0] );
      var v1 = sub( points[2], points[0] );
      var p = sub( P, points[0] );
      var d = v0[0]*v1[1]-v0[1]*v1[0];
      if(d != 0) {
        return [ v1[1]/d * p[0] - v1[0]/d*p[1], -v0[1]/d*p[0]+v0[0]/d*p[1] ];
      } else console.log("barycentric error: determinant is zero");
    }

    }catch(e){alert(e);}
  </script>
</div>


  [b]: https://en.wikipedia.org/wiki/Barycentric_coordinate_system "Barycentric Coordinate System"
  [t]: https://en.wikipedia.org/wiki/Trilinear_coordinates "Trilinear Coordinate System"
  [d]: dfaa.html "DFAA Antialiasing Algorithm"
  [i]: http://gpuopen.com/gaming-product/barycentrics12-dx12-gcnshader-ext-sample/ "GCN Barycentrics extension"
  [img0]: images/barycentric.png "Barycentric Coordynate System"
  [img1]: images/barycentric-math.png "Finding Barycentric Coordinates Math"
  [img2]: images/trilinear.png "Finding Distance to Edge"




