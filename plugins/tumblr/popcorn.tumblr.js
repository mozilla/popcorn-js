// PLUGIN: Tumblr

(function ( Popcorn, global ) {

  /**
  * Tumblr Popcorn Plugin.
  * Adds elements to the page from selected blog.
  * Start is the time that you want this plug-in to execute
  * End is the time that you want this plug-in to stop executing
  * ApiKey is the API key registered with Tumblr for use with their API.
  *  The ApiKey is required for Blog Info and to retrieve published blog
  *  posts.
  *
  * Test tumblr site is here: http://tumblrplugin.tumblr.com/
  *
  * @param {Object} options
  *  
  * Example:
    var p = Popcorn('#video')
      .tumblr({
        start: 5,                     // seconds, mandatory
        end: 15,                      // seconds, mandatory
        requestType: 'avatar',        // mandatory
        target: 'tumblrBlogInfodiv',  // mandatory
        size: 96                      // Optional
      } )
  *
  */
  
  tumblrCallBack = function ( data ) {
    if( data.avatar_url ){
      var _image;
      
      _image = document.createElement( "img" );
      _image = document.
    }
  };

  Popcorn.plugin( "tumblr" , {
    manifest: {
      about: {
        name: "Popcorn Tumblr Plugin",
        version: "0.1",
        author: "Matthew Schranz, @mjschranz",
        website: "mschranz.wordpress.com"
      },
      options: {
        requestType: {
          elem: "select", 
          options:[ "INFO", "AVATAR", "FOLLOWERS", "BLOGPOST" ], 
          label: "Type_Of_Plugin" 
        },
        target: "tumblr-container",
        start: {
          elem: "input", 
          type: "number", 
          label: "Start_Time" 
        },
        end: {
          elem: "input", 
          type: "number", 
          label: "End_Time"
        },
        base_hostname: {
          elem: "input", 
          type: "text",
          label: "User_Name"
        },
        api_key: {
          elem: "input",
          type: "text",
          label: "Application_Key"
        },
        // optional parameters:
        size: {
          elem: "select", 
          options: [ 16, 24, 30, 40, 48, 64, 96, 128, 512 ], 
          label: "avatarSize"
        },
        blogType: {
          elem: "select",
          options: [ "TEXT", "QUOTE", "LINK", "PHOTO", "VIDEO", "AUDIO", "ANSWER" ],
          label: "Blog_Type"
        },
        // Required for BLOGPOST requests
        blogId: {
          elem: "input",
          type: "number",
          label: "Blog_ID"
        },
        tag: {
          elem: "input",
          type: "text",
          label: "Blog_Tag"
        },
        limit: {
          elem: "input",
          number: "number",
          label: "Follower_Limit"
        } 
      }
    },
    _setup: function( options ) {
      var target = document.getElementById( options.target );
      
      // Valid types of retrieval requests
      var validType = function( type ) {
        return ( [ "info", "avatar", "followers", "blogpost" ].indexOf( type ) > -1 );
      };
      
      // Valid sizes for Avatar retrival requests
      var validSize = function( size ) {
        return ( [ 16, 24, 30, 40, 48, 64, 96, 128, 512 ].indexOf( type ) > -1 );
      };
      
      // If retrieval is for a blog, check if it's a valid type
      var validBlogType = function( bType ) {
        return ( [ "TEXT", "QUOTE", "LINK", "PHOTO", "VIDEO", "AUDIO", "ANSWER" ].indexOf( bType ) > -1 );
      };
      
      // Default Type is avatar
      if ( !validType( options.requestType ) ) {
        throw new Error( "Invalid tumblr plugin type." );
      }
      else if (  !validBlogType( options.blogType ) ) {
        throw new Error( "Invalid Blog Type." );
      }
      
      /*
       * For now commenting out so I can see if tumblr API will set their specified default on its own.
      // Default is 64
      if ( !validSize( _size ) ) {
        _size = 64;
      }
      */
      
      if ( !target && Popcorn.plugin.debug ) {
          throw new Error( "Target Tumblr container doesn't exist" );
      }
      target && target.appendChild( options._container );
      
      // For now only getting the Avatar retrieval working so I know what I'm doing
      Popcorn.getJSONP( "http://api.tumblr.com/v2/blog/" + options.base_hostname + "/avatar&jsonp=tumblrCallBack", tumblrCallBack, false );    
    },
    start: function( event, options ){
      options._container.style.display = "inline";
    },
    end: function( event, options ){
      options._container.style.display = "none";
      options._container.innerHTML = "";
    },
    _teardown: function( options ){
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
})( Popcorn, this );