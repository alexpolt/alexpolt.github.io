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
  to the polygon. This is easily done with the vertex id (but you can always provide uv's for 
  that). For HLSL SM3.0 the code looks like this:

    //Barycentrics
    static float2 uv01[] = { {0,0}, {1,0}, {0,1} };
    ...
    //No SV_VertexID, so get vertex id from buffer
    out.uv01 = uv01[ vertex_id - 3 * floor(vertex_id/3) ];

  That's all for the vertex shader. The pixel shader part is done in two steps. In the first step
  we use the provided Barycentrics and compute three values: direction of sampling and coverage.
  Picture here will make it easy for you to understand the code of the shader.
  
  <center>![](images/dfaa-algorithm.png)</center>
  
  Here is the shader function:

    static const float pi2 = 2 * 3.1415926;
    
    float2 dfaa( float2 uv01 ) {
      
      float2 uvdx = ddx( uv01 );
      float2 uvdy = ddy( uv01 );
      
      //area - coverage, (steps+1)^2 - total number of samples, rad - radius of sampling
      
      float area=0, steps=4, rad=0.5;

      //sampling and calculating coverage

      for(float y=0; y<=steps; y++) {
        for(float x=0; x<=steps; x++) {
          float2 dxdy = float2( 2*rad*x/steps - rad, 2*rad*y/steps - rad );
          float2 edge = uv01 + uvdx * dxdy.x  + uvdy * dxdy.y;
          // if we are out of the triangle - increase by one the non-coverage
          if( edge.x < 0 || edge.y < 0 || ( edge.x + edge.y ) > 1 ) area++;
        }	
      }
      
      //get coverage
      area = 1 - area / pow(steps+1, 2);
      
      //the next big step is to compute the direction of sampling
      //we get the inverse matrix and compute the edge vectors of the polygon
      //then we break the polygon into three independent parts by medians
      //and get the right edge, then rotate it by 90 degrees
      
      float2 dir;
      float2 uvdx2 = normalize( uvdx ), uvdy2 = normalize( uvdy );
      
      float det = 1 / ( uvdx2.x * uvdy2.y - uvdx2.y * uvdy2.x );
      float2 xydu = det * float2( uvdy2.y, -uvdx2.y );
      float2 xydv = det * float2( -uvdy2.x, uvdx2.x );
      
      float2 z = float2( xydv - xydu );
      if( uv01.y > uv01.x && (uv01.y+2*uv01.x) < 1 ) dir = float2( -xydv.y, xydv.x );
      else if( uv01.x > uv01.y && (uv01.x+2*uv01.y) < 1 ) dir = float2( xydu.y, -xydu.x );
      else dir = float2( z.y, -z.x );
      
      dir = cross( float3(xydu, 0), float3(xydv, 0) ).z > 0 ? dir : -dir;

      //encode direction as an angle
      float dir_atan = atan2( dir.y, dir.x );
      float dir_angle = ( dir_atan < 0 ? dir_atan + pi2 : dir_atan ) / pi2;

      return float2( dir_angle, area );
    }


 As you see, we need 16 bytes of additional information. That's the cost of this method.
 After getting that information in a framebuffer we need to make a fullscreen pass to perform
 antialiasing. We do that by lerping between two colors: current and the one sampled along 
 the computed direction.


    sampler tex0 : register(s0); //diffuse
    sampler tex1 : register(s1); //direction and coverage

    static const float pi2 = 2 * 3.1415926;
    
    float4 main( float2 screenxy : TEXCOORD0 ) : COLOR0 {
    
      float4 color0 = tex2D( tex0, screenxy );
      float2 dfaa = tex2D( tex1, screenxy ).xy;
      float area = dfaa.y;
      //decode direction, angle of 0 is valid, so we need this area > 0 check
      float2 dir = area > 0 ? float2( cos( dfaa.x * pi2 ), sin( dfaa.x * pi2 ) ) : 0;
      float2 sdx = ddx( screenxy );
      float2 sdy = ddy( screenxy );
    
      float4 color1 = tex2D(tex0, screenxy + sdx*dir.x + sdy*dir.y );
    
      float4 color = lerp( color1, color0, area );
     
      return float4( color.rgb, 1 );
    }

 So that's it. I provide a [GitHub repository](https://github.com/alexpolt/DFAA) with the two pixel 
 shaders. I also put there a 32-bit small windows demo. In the demo you can press 'Z' to have a 
 zoomed image. Here is not the best screenshot of the DFAA at work.

 <center>![](images/dfaa-demo.png "DFAA at work")</center> 


 *Would be nice to see DFAA being used in real games.*



