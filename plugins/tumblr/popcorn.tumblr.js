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
      var _htmlString;
      
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
        // optional parameters:
        api_key: { // Required for Blog Info and Blog Post retrievals
          elem: "input",
          type: "text",
          label: "Application_Key"
        },
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
        blogId: { // Required for BLOGPOST requests
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
      
      // If retrieval is for a blog, check if it's a valid type
      var validBlogType = function( bType ) {
        return ( [ "text", "quote", "link", "photo", "video", "audio", "answer" ].indexOf( bType ) > -1 );
      };
      
      options.requestType = options.requestType.toLowerCase();
      options.blogType = ( options.blogType || "" ).toLowerCase();
      
      if ( !validType( options.requestType ) ) {
        throw new Error( "Invalid tumblr plugin type." );
      }
      
      if ( !validBlogType( options.blogType ) && options.requestType === "blogpost" ) {
        throw new Error( "Invalid Blog Type." );
      }
      
      if ( !target && Popcorn.plugin.debug ) {
        throw new Error( "Target Tumblr container doesn't exist" );
      }
      
      options._container = document.createElement( "div" );
      options._container.id = "tumblrdiv-" + Popcorn.guid();
      options._tumblrdiv = document.createElement( "tumblr:" + options.requestType );
      options._container.appendChild( options._tumblrdiv );
      
      if( options.requestType === "avatar" )
        options._tumblrdiv.innerHTML = "<img src=" + 'http://api.tumblr.com/v2/blog/' + options.base_hostname + '/avatar/' + options.size + "alt='BlogAvatar' />";
      else {
        Popcorn.getJSONP( "http://api.tumblr.com/v2/blog/" + options.base_hostname + "/avatar&jsonp=tumblrCallBack", tumblrCallBack, false );
      }
      
      options._container.style.display = "none";
      
      target && target.appendChild( options._container ); 
    },
    start: function( event, options ){
      options._container.style.display = "";
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