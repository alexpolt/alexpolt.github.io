##Introducing DFAA antialiasing algorithm

  Aliasing is a longstanding problem in computer graphics. To date a lot of different 
  algorithms have been developed. These are just some of them: SSAA, MSAA, CSAA, MLAA, FXAA etc.
  
  In graphics we have to deal with spatial aliasing. Here is a depiction (sorry for quality):


  <center>![](images/spatial-aliasing.png)</center>


  You can see from the second and third examples in the figure that having proper pixel color 
  can provide important information to our brain. This becomes even more crucial in VR.
  Thinking about aliasing in that direction got me to an interesting idea: what 
  if we somehow store the geometry information of the polygon and reuse it in a pixel shader?

  After iterating through a number of options (store edge equations in some form) I
  realized that all we need is already available to us: derivatives coupled with Barycentric
  coordinates. I have already been toying with the [0,0], [1,0], [0,1] coordinate system 
  in the past, and I know other people also used it for things like wireframe rendering.

  So, the first step in the DFAA algorithm is to assign the Barycentric coordinate system
  to the polygon. For non-indexed geometry this is done with the vertex id (or you can always 
  provide uv's for that). For HLSL SM3.0 the code looks like this:


    //Barycentrics
    static float2 uv01[] = { {0,0}, {1,0}, {0,1} };
    ...
    //No SV_VertexID in SM3.0 , so get vertex id from buffer, it should be sequential
    out.uv01 = uv01[ 3 * frac(vertex_id/3) ];

  For indexed geometry SV_VertexID won't work (unless your vertices are in strips), so we need
  to either use a geometry shader or generate a vertex id buffer. I provide a function template
  for this. You can use it to generate the vertex ids at runtime like this:


    auto vertex_id_buffer = generate_vertex_ids<float>( index_buffer, tris_count/3 );


  Here is a sample how it works: [ideone](http://ideone.com/iiB3xw). The code: [Github](https://github.com/alexpolt/DFAA/blob/master/generate-vertex-ids.h)  
  You may end up having some number of triangles with wrong uv01 mapping (if there are loops in the 
  mesh), but that is not critical to DFAA (no or partial AA there).

  The **pixel shader part** is done in two steps. In the first step we use the provided Barycentrics 
  (that should be used with *noperspective* modifier) and compute two values: direction of sampling 
  and coverage. Picture here will make it easy for you to understand the code of the shader.


  <center>![](images/dfaa-algorithm.png)</center>


  Here is the first pass shader function:


    static const float pi2 = 2*3.1415926;
    
    
    //Implementation of the DFAA algorithm
    //should be fed with a [0,0],[1,0],[0,1] UV
    //returns one byte with packed direction and coverage
    
    
    static float rad = 0.5; //rad - radius of sampling, 0.5 means half-pixel
    static float steps = 3; //(steps+1)^2 - total number subsamples for coverage computation
    
    //uv01 should be with 'noperspective' modifier (though it seems to have no impact)

    float DFAA( float2 uv01 ) {
      
      float2 uvdx = ddx( uv01 );
      float2 uvdy = ddy( uv01 );
      
      float area=0;
      
      //compute non-coverage
      
      for(float y=0; y<=steps; y++) {
        for(float x=0; x<=steps; x++) {
          float2 dxdy = float2( 2*rad*x/steps - rad, 2*rad*y/steps - rad );
          float2 edge = uv01 + uvdx * dxdy.x  + uvdy * dxdy.y;
          // if we are out of the triangle - increase by one the non-coverage
          if( edge.x < 0 || edge.y < 0 || ( edge.x + edge.y ) > 1 ) area++;
        } 
      }
      
      //get actual coverage
      area = 1 - area / pow(steps+1, 2);
      
      //the next big step is to compute the direction of sampling
      //we get the inverse matrix and compute the edge vectors of the polygon
      //then we break the polygon into three independent parts by medians
      //and get the right edge, then rotate it by 90 degrees
      
      float2 dir;
      float2 uvdx2 = normalize( uvdx ), uvdy2 = normalize( uvdy );
      
      //matrix inverse
      float det = 1 / ( uvdx2.x * uvdy2.y - uvdx2.y * uvdy2.x );
      float2 xydu = det * float2( uvdy2.y, -uvdx2.y );
      float2 xydv = det * float2( -uvdy2.x, uvdx2.x );
      
      //choosing the edge using triangle medians
      float2 z = float2( xydv - xydu );
      if( uv01.y > uv01.x && (uv01.y+2*uv01.x) < 1 ) dir = float2( -xydv.y, xydv.x );
      else if( uv01.x > uv01.y && (uv01.x+2*uv01.y) < 1 ) dir = float2( xydu.y, -xydu.x );
      else dir = float2( z.y, -z.x );
      
      //so that we don't have to worry about winding of uv's
      dir = cross( float3(xydu, 0), float3(xydv, 0) ).z > 0 ? dir : -dir;
      
      //encode direction as an angle
      float dir_atan = atan2( dir.y, dir.x );
      float dir_angle = ( dir_atan < 0 ? dir_atan + pi2 : dir_atan ) / pi2;
      
      //pack into one byte
      float dfaa =  ( floor(15*dir_angle)*16 + 15*area ) / 255;
      
      return dfaa;
    
    }


  As you see, all we need is **1 byte** of information per pixel. That's the cost of this method.
  After getting that information in a framebuffer we need to make a fullscreen pass to perform
  antialiasing. We do that by lerping between two colors: current and the one sampled along 
  the computed direction and using computed coverage info.


    //pixel to display and packed DFAA in alpha
    sampler tex0 : register(s0); 
    
    static const float pi2 = 2*3.1415926;

    //defines used by DFAA
    #define dfaa_screen_texture tex0
    #define dfaa_tex2D tex2D
    
    //DFAA: performs fetch, unpack and lerp
    float3 DFAA( float2 screenxy ) {
    
      float4 color0 = dfaa_tex2D( dfaa_screen_texture, screenxy );
      float dfaa_packed = color0.a;
      
      //unpack
      float dir_angle = floor(255*dfaa_packed/16)/15;
      float2 dir = float2( cos( dir_angle * pi2 ), sin( dir_angle * pi2 ) );
      float area = frac(255*dfaa_packed/16)*16/15;
      
      float2 sdx = ddx( screenxy );
      float2 sdy = ddy( screenxy );
      
      float4 color1 = color0;
      
      //only do fetch if necessary (edge pixels)
      if( area > 0 && area < 1 ) 
        color1 = dfaa_tex2D( dfaa_screen_texture, screenxy + sdx*dir.x + sdy*dir.y );
      
      return lerp( color1, color0, area ).rgb;
    }


  So that's it. I provide a [GitHub repository](https://github.com/alexpolt/DFAA) with the two pixel 
  shaders. I also put there a small Windows demo and a RenderMonkey project. In the RenderMonkey
  project you have convenient knobs on the right to turn on/off DFAA and see the difference.

  Here is a zoomed in screenshot of the DFAA at work.


  <center>![](images/dfaa-demo.png "DFAA at work")</center> 


  It seems like that approach could also help improve shadow quality. Would be nice to see DFAA 
  being used in real games.



