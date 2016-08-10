
##Using Macro Kung Fu to Easier Check Function Return Values

  Below is a chopped piece of code from Directx SDK sources.

    hr = g_pd3dDevice->CreateTexture( ... );
    
    if( FAILED( hr ) )
        return hr;
    
    hr = g_pd3dDevice->CreateTexture( ... );
    
    if( FAILED( hr ) )
        return hr;
    
    hr = g_pd3dDevice->CreateTexture( ... );
    
    if( FAILED( hr ) )
        return hr;


  You can do better using some macro magic. First required macro is this:


    #define $numargs_( _1, _2, _3, N, ... ) N
    #define $numargs( ... ) $numargs_( __VA_ARGS__, 3, 2, 1 )


  It returns the number of provided arguments to a macro invocation. We then use that to call
  more specific macro functions like this:


    #define $paste_( $0, $1 ) $0 ## $1
    #define $paste( $0, $1 ) $paste_( $0, $1 )
    
    #define $check1( $macro, $1 ) $macro( $1 );
    #define $check2( $macro, $1, $2 ) $check1( $macro, $1 ) $check1( $macro, $2 )
    #define $check3( $macro, $1, $2, $3 ) $check2( $macro, $1, $2 ) $check1( $macro, $3 )

    #define $checkall_( $macro, $check, ... ) $check( $macro, __VA_ARGS__ )
    #define $checkall( $macro, ... ) $checkall_( $macro, $paste( $check, $numargs(__VA_ARGS__) ), __VA_ARGS__ )

  [Github](https://github.com/alexpolt/poetry/blob/master/macros.h) [Ideone](http://ideone.com/Q9uoPV)


  Now we use it for the above DirectX calls like this:


    $checkall( FAILED
               ,g_pd3dDevice->CreateTexture( ... )
               ,g_pd3dDevice->CreateTexture( ... )
               ,g_pd3dDevice->CreateTexture( ... ) 
             );
    
    // or (from one to three arguments)
    
    $checkall( FAILED,
               ,g_pd3dDevice->CreateTexture( ... )
             );


  Isn't it better? The only imperfection is that line numbers are messed up.


