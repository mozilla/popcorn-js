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
      var post = options.post,
          link = document.createElement( "a" ),
          linkText = document.createTextNode( post.title ),
          linkDiv = document.createElement( "div" );

      link.setAttribute( "href", post.post_url );
      link.appendChild( linkText );
      linkDiv.appendChild( link );
      linkDiv.innerHTML += post.body;
      options._container.appendChild( linkDiv );

    },
    photo: function( options ) {
      var width = options.width || 250, defaultSizeIndex = -1,
          picCaptions = [ options.post.photos.length ],
          picURIs = [ options.post.photos.length ],
          picDiv = document.createElement( "div" ),
          pic = document.createElement( "img" ),
          post = options.post;

      // Finds the correct photo based on specified size, saves URI and Caption]
      for ( var i = 0, len = post.photos.length; i < len; i++ ) {
        // Store the current photo object being accessed
        var photo = post.photos[ i ],
            photoSizes = photo.alt_sizes;

        for ( var k = 0, len2 = photoSizes.length; k < len2; k++ ) {
          // Store the current alt_sizes object being accessed
          var size = photoSizes[ k ];

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
        if ( k === photoSizes.length ) {
          picURIs[ i ] = photoSizes[ defaultSizeIndex ].url;
        }
      }

      // Finally, all the potential setup is done. Below is the actual code putting everything in our div element
      for ( var m = 0, len3 = picURIs.length; m < len3; m++ ) {
        picDiv.innerHTML += picCaptions[ m ] + "<br/>";
        pic.setAttribute( "src", picURIs[ m ] );
        pic.setAttribute( "alt", "Pic" + m );
        picDiv.appendChild( pic );
        picDiv.innerHTML += "<br/>";
      }
      picDiv.innerHTML += "<br/>" + post.caption;
      options._container.appendChild( picDiv );
    },
    audio: function( options ) {
      var artistDiv = document.createElement( "div" ),
          artistLink = document.createElement( "a" ),
          post = options.post;
      // Artist/Track info is not always returned so checking first.
      // Truth be told I have no idea if this will ever be returned. Their API specified it as responses but no
      // matter how much I tried myself to replicate it in a test I couldn't ever get a response that included
      // this info.
      if ( !post.artist ) {
        var artistText = document.createTextNode( post.source_title );

        artistLink.setAttribute( "href", post.source_url );
        artistLink.appendChild( artistText );
        artistDiv.appendChild( artistLink );
        artistDiv.innerHTML += "<br/>";
      } else {
        var artistImage = document.createElement( "img" );

        artistDiv.innerHTML += "Artist: " + post.artist + "<br/>";
        artistLink.setAttribute( "href", post.source_url );

        // Construct Image
        artistImage.setAttribute( "src", post.album_art );
        artistImage.setAttribute( "alt", post.album );

        // Set Image for link, append to div
        artistLink.appendChild( artistImage );
        artistDiv.appendChild( artistLink );

        // Construct rest of plain old text
        artistDiv.innerHTML += "<hr/>" + post.track_number + " - " + post.track_name + "<br/>";
      }
      // Obviously the player itself is something that will be displayed either way so it is included outside the check
      artistDiv.innerHTML += post.player + "   " + post.plays + "plays<br/>" + post.caption;
      options._container.appendChild( artistDiv );
    },
    video: function( options ) {
      var width = options.width || 400,
          defaultSizeIndex = -1,
          post = options.post,
          videoDiv = document.createElement( "div" ),
          videoCode;

      for ( var i = 0, len = post.player.length; i < len; i++ ) {
      // First try to see if the current index matches the specified width
      // If it doesn't, check if it equals our default width incase user didn't
      // ever specify a width or if their width is never found.

        // Store current player object being accessed
        var video = post.player[ i ];

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
        videoCode = post.player[ defaultSizeIndex ].embed_code;
      }

      // Will run if user's size is never found and our default is never found
      defaultSizeIndex === -1 && Popcorn.error( "Specified video size was not found and default was never found. Please try another width." );

      // Finally build the html for the div element
      videoDiv.innerHTML += videoCode + "<br/>" + post.caption;
      options._container.appendChild( videoDiv );
    },
    chat: function( options ) {
      var post = options.post,
          dialogue,
          chatDiv = document.createElement( "div" );

      // Brainstorm up ideas how to make each dialogue object to appear up "better" rather than just all be there at once
      chatDiv.innerHTML += "<strong><u>" + post.title + "</u></strong><br/><br/>";

      for ( var i = 0, len = post.dialogue.length; i < len; i++ ) {
        dialogue = post.dialogue[ i ];
        chatDiv.innerHTML += dialogue.label + " " + dialogue.phrase + "<br/>";
      }

      // Append it to the parent container
      options._container.appendChild( chatDiv );
    },
    quote: function( options ) {
      var quoteDiv = document.createElement( "div" ),
          quoteLink = document.createElement( "a" ),
          post = options.post,
          quoteLinkText = document.createTextNode( post.text );

      // Quotes don't come with a title, so for a link to the post I'm going to use the blogname
      quoteLink.setAttribute( "href", post.post_url );
      quoteLink.appendChild( quoteLinkText );

      // Append link, finish adding in plain text
      quoteDiv.appendChild( quoteLink );
      quoteDiv.innerHTML += "<br/><br/>Source: <b>" + post.source + "</b>";

      // Append div to parent container
      options._container.appendChild( quoteDiv );
    },
    link: function( options ) {
      var linkDiv = document.createElement( "div" ),
          link = document.createElement( "a" ),
          post = options.post,
          linkText = document.createTextNode( post.title );

      // Using the blog title as a link to it
      link.setAttribute( "href", post.post_url );
      link.appendChild( linkText );
      linkDiv.appendChild( link );
      linkDiv.innerHTML += "<br/>" + post.description;

      // Append to parent container
      options._container.appendChild( linkDiv );
    },
    answer: function( options ) {
      var answerDiv = document.createElement( "div" ),
          link = document.createElement( "a" ),
          post = options.post,
          linkText = document.createTextNode( post.asking_name );

      answerDiv.innerHTML = "Inquirer: ";
      link.setAttribute( "href", post.asking_url );
      link.appendChild( linkText );
      answerDiv.appendChild( link );
      answerDiv.innerHTML += "<br/><br/>Question: " + post.question + "<br/>Answer: " + post.answer;

      // Append to parent container
      options._container.appendChild( answerDiv );
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
          label: "Request Type"
        },
        target: "tumblr-container",
        start: {
          elem: "input",
          type: "number",
          label: "Start"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End"
        },
        base_hostname: {
          elem: "input",
          type: "text",
          label: "User Name",
          "default": "https://citriccomics.tumblr.com"
        },
        // optional parameters:
        api_key: { // Required for Blog Info and Blog Post retrievals
          elem: "input",
          type: "text",
          label: "API key",
          optional: true
        },
        size: {
          elem: "select",
          options: [ 16, 24, 30, 40, 48, 64, 96, 128, 512 ],
          label: "Avatar Size",
          optional: true
        },
        blogId: { // Required for BLOGPOST requests
          elem: "input",
          type: "number",
          label: "Blog Id",
          optional: true
        },
        /* Optional for Photo and Video BlogPosts, defaulted to 250 pixels for photos and 400 for videos if not provided or provided width
        * is not found in their arrays. If multiple videos or photos are in the blogpost then it will use this same size for all of them unless
        * it is not found, which it will then use the default.
        */
        width: {
          elem: "input",
          type: "text",
          label: "Photo Width",
          optional: true
        }
      }
    },
    _setup: function( options ) {
      var target = document.getElementById( options.target ),
          requestString,
          uri,
          blogHTTPHeader,
          uriNoHeader,
          uriFinal,
          type,
          that = this;

      // Valid types of retrieval requests
      var validType = function( type ) {
        return ( [ "info", "avatar", "blogpost" ].indexOf( type ) > -1 );
      };

      options.requestType = options.requestType || "";
      // Lowercase the types incase user enters it in another way
      options.requestType = options.requestType.toLowerCase();

      options.base_hostname = options.base_hostname || "";

      // Checks if user included any http header in the url and removes it if that's the case as request don't work with it
      uri = options.base_hostname.slice( ( options.base_hostname.indexOf( "/" ) + 2 ), options.base_hostname.length );
      blogHTTPHeader = options.base_hostname.slice( 0, ( options.base_hostname.indexOf( "/" ) + 2 ) );
      uriNoHeader = blogHTTPHeader === "http://" || blogHTTPHeader === "https://" ? uri : options.base_hostname;
      if ( uriNoHeader.indexOf( "/" ) > -1 ){
        uriNoHeader = uriNoHeader.slice( 0, uriNoHeader.indexOf( "/" ) );
      }
      options.base_hostname = uriNoHeader;

      // Create seperate container for plugin
      options._container = document.createElement( "div" );
      options._container.id = "tumblrdiv-" + Popcorn.guid();

      if ( options.requestType === "avatar" ) {
        options._container.innerHTML = "<img src=" + 'http://api.tumblr.com/v2/blog/' + options.base_hostname + '/avatar/' + options.size + " alt='BlogAvatar' />";
      } else {
        // Construct type based if it's a blogpost or blog info as request string differs
        if ( options.requestType === "blogpost" ) {
          type = "posts";
        } else {
          type = "info";
        }
        requestString = "http://api.tumblr.com/v2/blog/" + options.base_hostname + "/" + type + "?api_key=" + options.api_key + "&id=" + options.blogId +
          "&jsonp=?";

        if ( options.base_hostname && options.base_hostname !== "" && options.api_key && options.blogId ) {

          Popcorn.getJSONP( requestString, function( data ) {
            if ( data.meta.msg === "OK" ) {
              var commonDiv = document.createElement( "div" );
              if ( options.requestType === "blogpost" ) {
                options.post = data.response.posts[ 0 ];
                var blogType = options.post.type,
                    post = options.post,
                    tags = post.tags;

                // date is a response type common to all blogposts so it's in here to prevent duplicated code
                commonDiv.innerHTML = "Date Published: " + options.post.date.slice( 0, options.post.date.indexOf( " " ) ) + "<br/>";
                // Check if tags were used for the post, append them to commonDiv
                if ( tags.length !== 0 ) {
                  commonDiv.innerHTML += "Tags: " + tags[ 0 ];
                  for ( var i = 1, len = tags.length; i < len; i++ ) {
                    commonDiv.innerHTML += ", " + tags[ i ];
                  }
                } else {
                  commonDiv.innerHTML += "Tags: No Tags Used";
                }
                // commonDiv is appended at two points because of the difference in how the information
                // is constructed between blogposts and bloginfo
                options._container.appendChild( commonDiv );

                // Processes information and forms an information div based on what the blog type is
                processBlogPost[ blogType ]( options );
              } else {
                // Blog Info Requests
                var link = document.createElement( "a" ),
                    blogInfo = data.response.blog,
                    linkText = document.createTextNode( blogInfo.title );

                link.setAttribute( "href", blogInfo.url );
                link.appendChild( linkText );
                commonDiv.appendChild( link );
                commonDiv.innerHTML += blogInfo.description;
                options._container.appendChild( commonDiv );
              }
            }
          }, false );
        }
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
