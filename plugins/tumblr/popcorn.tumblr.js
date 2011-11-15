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
        requestType: 'blogpost',      // mandatory
        target: 'tumblrBlogInfodiv',  // mandatory
        blogId: 123456789             // Mandatory if requestType is 'blogpost'
        api_key: ew29j2o1mw91m1wom1s9 // Mandatory is requestType is 'blogpost' or 'info'
        size: 96                      // Optional
      } )
  *
  */

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
        blogId: { // Required for BLOGPOST requests
          elem: "input",
          type: "number",
          label: "Blog_ID"
        },
        limit: {
          elem: "input",
          type: "number",
          label: "Follower_Limit"
        },
        // Optional for Photo BlogPosts, defaulted to 500 pixels
        photoWidth: {
          elem: "input",
          type: "number",
          label: "Photo_Width"
        }
      }
    },
    _setup: function( options ) {
      var target = document.getElementById( options.target );
      
      // Valid types of retrieval requests
      var validType = function( type ) {
        return ( [ "info", "avatar", "followers", "blogpost" ].indexOf( type ) > -1 );
      };
      
      // Lowercase the types incase user enters it in another way
      options.requestType = options.requestType.toLowerCase();
      options.blogType = ( options.blogType || "" ).toLowerCase();
      
      // Check if blog url ( base_hostname ) is blank
      if( !options.base_hostname || ( !options.api_key && ( options.requestType === "info" || options.requestType === "blogpost" ) ) ){
        throw new Error( "Must provide a blog URL to the plugin and an api key for Blog Info and Blog Post Requests." );
      }
      
      // Check Request Type
      if ( !validType( options.requestType ) ) {
        throw new Error( "Invalid tumblr plugin type." );
      }
      
      // Check if a blogID is supplied
      if( !options.blogId && options.requestType === "blogpost" ){
        throw new Error( "Error. Blog ID required for Blogpost requests." );
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
        options._tumblrdiv.innerHTML = "<img src=" + 'http://api.tumblr.com/v2/blog/' + options.base_hostname + '/avatar/' + options.size + " alt='BlogAvatar' />";
      else if( options.requestType === "followers" )
        options._tumblrdiv.innerHTML = "Followers not yet implemented";
      else {
        // Construct type based if it's a blogpost or blog info as request string differs
        if( options.requestType === "blogpost" )
          type = "posts/" + options.blogType;
        else
          type = "info";
          
        var requestString = "http://api.tumblr.com/v2/blog/" + options.base_hostname + "/" + type + "?api_key=" + options.api_key + "&id=" + options.blogId +
                            "&limit=" + options.limit + "&jsonp=tumblrCallBack";
                            
        Popcorn.getJSONP( requestString, function( data ) {
          var htmlString = "";
          var post = data.response.posts[0];
          
          if( data.meta.msg === "OK" ){ 
            if( options.requestType === "blogpost" ){
              // Date Post was published, common to all blogpost requests
              htmlString = "Date Published: " + post.date.slice( 0, post.date.indexOf( " " ) ) + "<br/><br/>";
            
              if( post.type === "text" ){
                // Make a title that provides a link to the Blog URL
                htmlString += "<a href='" + post.post_url + "' target='_blank'>" + post.title + "</a><br/><br/>";
                // Add whatever html that is inside the blog's body
                htmlString += post.body;
              }
              else if( post.type === "photo" ){
                var mWidth = !options.photoWidth ? "500" : options.photoWidth, i, k;
                var picURLs = [ post.photos.length ]; 
                
                for( i = 0; i < post.photos.length; i++ ){
                  for( k = 0; k < post.photos[i].alt_sizes.length; k++ ){
                    if( post.photos[i].alt_sizes[k].width === mWidth )
                      
                  }
                }
                
              }
              else if( post.type === "quote" ){
                // Quotes don't come with a title, so for a link to the post I'm going to use the blogname
                htmlString += "<a href'" + post.post_url + "' target='_blank'>" + post.text + "</a><br/><br/>";
                htmlString += "<br/>Source: <b>" + post.source + "</b>";
              }
              else if( post.type === "link" ){
                // Using the blog title as a link to it
                htmlString += "<a href='" + post.post_url + "' target='_blank'>" + post.title + "</a><br/><br/>";
                htmlString += post.description; 
              }
              else if( post.type === "chat" ){
                // Brainstorm up ideas how to make each dialogue object to appear up "better" rather than just all be there at once
                htmlString += "To be implemented";
              }
              else if( post.type === "audio" ){  
                // Artist/Track info is not always returned so checking first.
                if( !post.artist ) {
                  console.log( post.artist );
                  htmlString += "<a href='" + post.source_url + "' target='_blank'>" + post.source_title + "</a><br/>";
                }
                else {
                  htmlString += "Artist: " + post.artist + "<br/> <a href='" + post.source_url+ "' target='_blank' style='float:left;margin:0 10px 0 0;'><img src='" + post.album_art + "' alt='" + post.album + "'></a><hr/>";
                  htmlString += post.track_number + " - " + post.track_name + "<br/>";
                }
                
                // Obviously the player itself is something that will be displayed either way so it is included outside the check
                htmlString += post.player + "   " + post.plays  + " plays<br/>";
                htmlString += post.caption;
              }
              else if( post.type === "video" ){
                // Do Stuff
              }
              else if( post.type === "answer" ){
                // Do Stuff
              }
              // Add tags to htmlString, common to all Blogpost requests
              htmlString += "<br/><br/>Tags: ";
              
              // Check first if blog had any tags in the first place  
              if( post.tags.length !== 0 ){
                var i = 0;
                htmlString += post.tags[0];
                for ( i = 1; i < post.tags.length; i++ ){
                  htmlString += ", " + post.tags[i];
                }
              }
              else
                htmlString += "No Tags Used";
            }
            else {
              console.log( "Stuff Goes here for Blog Info Requests" );
            }
          }
          else {
            throw new Error( "Error. Request failed. Status code: " + data.meta.status );
          }
          
          options._tumblrdiv.innerHTML = htmlString;
        }, false );
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