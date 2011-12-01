// PLUGIN: Tumblr

(function( Popcorn, global ) {

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
        base_hostname: "john.io",     // mandatory
        blogId: 123456789,            // Mandatory if requestType is 'blogpost'
        api_key: ew29j2o1mw91m1wom1s9 // Mandatory is requestType is 'blogpost' or 'info'
      } )
  *
  */

  var processBlogPost = {
    text: function( options ) {
      // Make a title that provides a link to the Blog URL
      options.htmlString += "<a href='" + options.post.post_url + "' target='_blank'>" + options.post.title + "</a><br/><br/>";
      // Add whatever html that is inside the blog's body
      options.htmlString += options.post.body;
    },
    photo: function( options ) {
      var width = options.width || 250, defaultSizeIndex = -1, 
          picURIs = [ options.post.photos.length ],
          picCaptions = [ options.post.photos.length ];

      // Finds the correct photo based on specified size, saves URI and Caption]
      for ( var i = 0, len = options.post.photos.length; i < len; i++ ) {
        // Store the current photo object being accessed
        var photo = options.post.photos[ i ];
        
        for ( var k = 0, len2 = photo.alt_sizes.length; k < len2; k++ ) {
          // Store the current alt_sizes object being accessed
          var size = photo.alt_sizes[ k ];

          // See If users desired photo size is in returned JSON
          if ( size.width === width ) {
            picURIs[ i ] = size.url;
            picCaptions[ i ] = photo.caption;
            defaultSizeIndex = 0;
            break;
          } else {
            // Our default size is going to be 250
            if( size.width === 250 ){
              defaultSizeIndex = k;
            }
          }
        }

      // Current means of handling if alt_sizes doesn't have our default image size
      defaultSizeIndex === -1 && Popcorn.error( "Clearly your blog has a picture that is so tiny it isn't even 250px wide. Consider " + 
        " using a bigger picture or try a smaller size." );

      // If a matching photo is never found, use the default size.
      if ( k === photo.alt_sizes.length ) {
        picURIs[ i ] = photo.alt_sizes[ defaultSizeIndex ].url;
      }
    }

    // Finally, all the potential setup is done. Below is the actual code putting everything in our div element
    for ( var m = 0, len3 = picURIs.length; m < len3; m++ ) {
      options.htmlString += picCaptions[ m ] + "<br/> <img src='" + picURIs[ m ] + "' alt='Pic" + i + "' /><br/>";
    }

    options.htmlString += "<br/>" + options.post.caption;

    },
    audio: function( options ) {
      // Artist/Track info is not always returned so checking first.
      // Truth be told I have no idea if this will ever be returned. Their API specified it as responses but no
      // matter how much I tried myself to replicate it in a test I couldn't ever get a response that included
      // this info.
      if ( !options.post.artist ) {
        options.htmlString += "<a href='" + options.post.source_url + "' target='_blank'>" + options.post.source_title + "</a><br/>";
      } else {
        options.htmlString += "Artist: " + options.post.artist + "<br/> <a href='" + options.post.source_url + 
          "' target='_blank' style='float:left;margin:0 10px 0 0;'><img src='" + options.post.album_art + 
          "' alt='" + options.post.album + "'></a><hr/>";
        options.htmlString += options.post.track_number + " - " + options.post.track_name + "<br/>";
      }

      // Obviously the player itself is something that will be displayed either way so it is included outside the check
      options.htmlString += options.post.player + "   " + options.post.plays  + " plays<br/>";
      options.htmlString += options.post.caption;
    },
    video: function( options ) {
      var width = options.width || 400,
          defaultSizeIndex = -1, 
          videoCode;

      for ( var i = 0, len = options.post.player.length; i < len; i++ ) {
      // First try to see if the current index matches the specified width
      // If it doesn't, check if it equals our default width incase user didn't
      // ever specify a width or if their width is never found.

        // Store current player object being accessed
        var video = options.post.player[ i ];

        if ( video.width === width ) {
          videoCode = video.embed_code;
          defaultSizeIndex = 0;
          break;
        } else {
          if( video.width === 400 ) {
            defaultSizeIndex = i;
          }
        }
      }

      // If specified width never found, use default
      if ( i === options.post.player.length ) {
        videoCode = options.post.player[ defaultSizeIndex ].embed_code;
      }

      // Will run if user's size is never found and our default is never found
      defaultSizeIndex === -1 && Popcorn.error( "Specified video size was not found and default was never found. Please try another width." );

      // Finally build the html for the div element
      options.htmlString += videoCode + "<br/>" + options.post.caption;
    },
    chat: function( options ) {
      // Brainstorm up ideas how to make each dialogue object to appear up "better" rather than just all be there at once
      options.htmlString += "<strong><u>" + options.post.title + "</u></strong><br/><br/>";

      for ( var i = 0, len = options.post.dialogue.length; i < len; i++ ) {
        options.htmlString += options.post.dialogue[ i ].label + " " + options.post.dialogue[ i ].phrase + "<br/>";
      }
    },
    quote: function( options ) {
      // Quotes don't come with a title, so for a link to the post I'm going to use the blogname
      options.htmlString += "<a href'" + options.post.post_url + "' target='_blank'>" + options.post.text + "</a><br/><br/>";
      options.htmlString += "<br/>Source: <b>" + options.post.source + "</b>";
    },
    link: function( options ) {
      // Using the blog title as a link to it
      options.htmlString += "<a href='" + options.post.post_url + "' target='_blank'>" + options.post.title + "</a><br/>";
      options.htmlString += options.post.description;
    },
    answer: function( options ) {
      options.htmlString += "Inquirer: <a href='" + options.post.asking_url + "' target='_blank'>" + options.post.asking_name + "</a><br/><br/>";
      options.htmlString += "Question: " + options.post.question + "<br/>";
      options.htmlString += "Answer: " + options.post.answer;
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
          options:[ "INFO", "AVATAR", "BLOGPOST" ],
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
        /* Optional for Photo and Video BlogPosts, defaulted to 250 pixels for photos and 400 for videos if not provided or provided width
        * is not found in their arrays. If multiple videos or photos are in the blogpost then it will use this same size for all of them unless
        * it is not found, which it will then use the default. If default is not present an error will be thrown.
        */
        width: {
          elem: "input",
          type: "number",
          label: "Photo_Width"
        }
      }
    },
    _setup: function( options ) {
      var target = document.getElementById( options.target ), 
          htmlString = "", 
          requestString,
          uri,
          blogHTTPHeader,
          type;
          
      options.htmlString = htmlString;

      // Valid types of retrieval requests
      var validType = function( type ) {
        return ( [ "info", "avatar", "blogpost" ].indexOf( type ) > -1 );
      };

      // Lowercase the types incase user enters it in another way
      options.requestType = options.requestType.toLowerCase();
      options.blogType = ( options.blogType || "" ).toLowerCase();

      // Check if blog url ( base_hostname ) is blank and api_key is included on info and blogpost requestType
      ( !options.base_hostname || ( !options.api_key && ( options.requestType === "info" || options.requestType === "blogpost" ) ) ) &&
        Popcorn.error( "Must provide a blog URL to the plugin and an api_key for Blog Info and Blog Post requests." );

      // Check Request Type
      !validType( options.requestType ) && Popcorn.error( "Invalid tumblr plugin type." );

      // Check if a blogID is supplied
      ( options.requestType === "blogpost" && !options.blogId ) && Popcorn.error( "Error. BlogId required for blogpost requests" );

      // Check if target container exists
      ( !target && Popcorn.plugin.debug ) && Popcorn.error( "Target Tumblr container doesn't exist." );
      
      // Checks if user included any http header in the url and removes it if that's the case as request don't work with it
      uri = options.base_hostname.slice( ( options.base_hostname.indexOf( "/" ) + 2 ), options.base_hostname.length );
      blogHTTPHeader = options.base_hostname.slice( 0, ( options.base_hostname.indexOf( "/" ) + 2 ) );
      options.base_hostname = blogHTTPHeader === "http://" || blogHTTPHeader === "https://" ? uri : options.base_hostname;
      
      // Create seperate container for plugin
      options._container = document.createElement( "div" );
      options._container.id = "tumblrdiv-" + Popcorn.guid();
      options._tumblrdiv = document.createElement( "tumblr:" + options.requestType );
      options._container.appendChild( options._tumblrdiv );

      if ( options.requestType === "avatar" ) {
        options._tumblrdiv.innerHTML = "<img src=" + 'http://api.tumblr.com/v2/blog/' + options.base_hostname + '/avatar/' + options.size + " alt='BlogAvatar' />";
      } else {
        // Construct type based if it's a blogpost or blog info as request string differs
        if ( options.requestType === "blogpost" ) {
          type = "posts/" + options.blogType;
        } else {
          type = "info";
        }
        requestString = "http://api.tumblr.com/v2/blog/" + options.base_hostname + "/" + type + "?api_key=" + options.api_key + "&id=" + options.blogId + 
          "&jsonp=tumblrCallBack";

        Popcorn.getJSONP( requestString, function( data ) {
          if ( data.meta.msg === "OK" ) {
            if ( options.requestType === "blogpost" ) {
              options.post = data.response.posts[ 0 ]; 
              options.data = data;
              var blogType = options.post.type;

              // date is a response type common to all blogposts so it's in here to prevent duplicated code
              options.htmlString = "Date Published: " + options.post.date.slice( 0, options.post.date.indexOf( " " ) ) + "<br/><br/>";

              // Processes information and forms an htmlString based on what the blog type is
              processBlogPost[ blogType ]( options );

              // Check if tags were used for the post, append them to current htmlString
              if ( options.post.tags.length !== 0 ) {
                options.htmlString += "<br/><br/>Tags: " + data.response.posts[ 0 ].tags[ 0 ];
                for ( var i = 1, len = options.post.tags.length; i < len; i++ ) {
                  options.htmlString += ", " + options.post.tags[ i ];
                }
              } else {
                options.htmlString += "<br/><br/>Tags: No Tags Used";
              }
            } else {
              // Blog Info Requests
              options.htmlString += "<a href='" + data.response.blog.url + "' target='_blank'>" + data.response.blog.title + "</a><br/>";
              options.htmlString += data.response.blog.description;
            }
          } else {
            // There was an error somewhere down the line that caused the request to fail.
            Popcorn.error( "Error. Request failed. Status code: " + data.meta.status + " - Message: " + data.meta.msg );
          }

          options._tumblrdiv.innerHTML = options.htmlString;
        }, false );
      }

      options._container.style.display = "none";

      target && target.appendChild( options._container );
    },
    start: function( event, options ){
      if ( options._container ) {
        options._container.style.display = "";
      }
    },
    end: function( event, options ){
      if( options._container ) {
        options._container.style.display = "none";
      }
    },
    _teardown: function( options ){
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
})( Popcorn, this );
