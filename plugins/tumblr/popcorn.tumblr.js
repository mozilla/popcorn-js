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
  var htmlString = "",
    tumblrCallBack = function ( data ) {
      if( data.response.posts[0] )
        htmlString = "Test";
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
        return ( [ "text", "quote", "link", "photo", "video", "audio", "answer", "" ].indexOf( bType ) > -1 );
      };
      
      // Lowercase the types incase user enters it in another way
      options.requestType = options.requestType.toLowerCase();
      options.blogType = ( options.blogType || "" ).toLowerCase();
      
      // Check Request Type
      if ( !validType( options.requestType ) ) {
        throw new Error( "Invalid tumblr plugin type." );
      }
      
      // If Request is BLOGPOST, check if it's a valid blog type
      if ( !validBlogType( options.blogType ) && options.requestType === "blogpost" ) {
        throw new Error( "Invalid Blog Type." );
      }
      
      // Check if target container exists
      if ( !target && Popcorn.plugin.debug ) {
          throw new Error( "Target Tumblr container doesn't exist" );
      }
      
      options._container = document.createElement( "div" );
      options._container.id = "tumblrdiv-" + Popcorn.guid();
      options._tumblrdiv = document.createElement( "tumblr:" + options.requestType );
      options._container.appendChild( options._tumblrdiv );
      
      // If it's an avatar request, simply set the innerHTML to an img element with the src as the request URL
      if( options.requestType === "avatar" )
        options._tumblrdiv.innerHTML = "<img src=" + 'http://api.tumblr.com/v2/blog/' + options.base_hostname + '/avatar/' + options.size + "alt='BlogAvatar' />";
      else if( options.requestType === "followers" )
        options._tumblrdiv.innerHTML = "Followers not yet implemented";
      else {
        var type;
        
        // Construct type based if it's a blogpost or blog info as request string differs
        if( options.requestType === "blogpost" )
          type = "posts/" + options.blogType;
        else
          type = "info";
          
        var requestString = "http://api.tumblr.com/v2/blog/" + options.base_hostname + "/" + type + "?" + options.api_key + "&id=" + options.blogId +
                            "&tag=" + options.tag + "&limit=" + options.limit + "&jsonp=tumblrCallBack";
                            
        Popcorn.getJSONP( requestString, tumblrCallBack, false );
        
        options._tumblrdiv.innerHTML = htmlString;
      }
      
      options._container.style.display = "none";
      
      target && target.appendChild( options._container ); 
    },
    start: function( event, options ){
      options._container.style.display = "";
    },
    end: function( event, options ){
      options._container.style.display = "none";
    },
    _teardown: function( options ){
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
})( Popcorn, this );