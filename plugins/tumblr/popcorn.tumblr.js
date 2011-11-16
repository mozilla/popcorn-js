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
      var target = document.getElementById( options.target );
      
      // Valid types of retrieval requests
      var validType = function( type ) {
        return ( [ "info", "avatar", "blogpost" ].indexOf( type ) > -1 );
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
          
          if( data.meta.msg === "OK" ){ 
            if( options.requestType === "blogpost" ){
              var post = data.response.posts[0], n = post.type;
              
              // Date Post was published, common to all blogpost requests
              htmlString = "Date Published: " + post.date.slice( 0, post.date.indexOf( " " ) ) + "<br/><br/>";
              
              switch( n ) {
                case "text":
                  // Make a title that provides a link to the Blog URL
                  htmlString += "<a href='" + post.post_url + "' target='_blank'>" + post.title + "</a><br/><br/>";
                  // Add whatever html that is inside the blog's body
                  htmlString += post.body;
                  break;
                
                case "photo":
                  var width = !options.width ? 250 : options.width, defaultSizeIndex = -1;
                  var picURIs = [ post.photos.length ], picCaptions = [ post.photos.length ];
              
                  // Finds the correct photo based on specified size, saves URI and Caption
                  for( var i in post.photos ){
                    for( var k in post.photos[ i ].alt_sizes ){            
                      // See If users desired photo size 
                      if( post.photos[ i ].alt_sizes[ k ].width === width ){
                        picURIs[ i ] = post.photos[ i ].alt_sizes[ k ].url;
                        picCaptions[ i ] = post.photos[ i ].caption;
                        defaultSizeIndex = 0;
                        break;
                      }
                      else 
                        // Our default size is going to be 250
                        if( post.photos[ i ].alt_sizes[ k ].width === 250 )
                          defaultSizeIndex = k; 
                        
                      k++;       
                    }
                  
                    // Current means of handling if alt_sizes doesn't have our default image size
                    if( defaultSizeIndex === -1 )
                      throw new Error( "Clearly your blog has a picture that is so tiny it isn't even 100px wide. Consider using a bigger" +
                                       " picture or try a smaller size." );
                  
                    // If a matching photo is never found, use the default size.
                    if( k === post.photos[ i ].alt_sizes.length )
                      picURIs[ i ] = post.photos[ i ].alt_sizes[ defaultSizeIndex ].url;
                  
                    i++;
                  }
                
                  // Finally, all the potential setup is done. Below is the actual code putting everything in our div element
                  for( m in picURIs ){
                    htmlString += picCaptions[ m ] + "<br/> <img src='" + picURIs[ m ] + "' alt='Pic" + i + "' /><br/>";
                    m++;
                  }
                
                  htmlString += "<br/>" + post.caption;
                  break;
                
                case "quote":
                  // Quotes don't come with a title, so for a link to the post I'm going to use the blogname
                  htmlString += "<a href'" + post.post_url + "' target='_blank'>" + post.text + "</a><br/><br/>";
                  htmlString += "<br/>Source: <b>" + post.source + "</b>";
                  break;
                  
                case "audio":
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
                  break;
                  
                case "link":
                  // Using the blog title as a link to it
                  htmlString += "<a href='" + post.post_url + "' target='_blank'>" + post.title + "</a><br/>";
                  htmlString += post.description;
                  break;
                
                case "chat":
                  // Brainstorm up ideas how to make each dialogue object to appear up "better" rather than just all be there at once
                  htmlString += "<strong><u>" + post.title + "</u></strong><br/><br/>";
                  
                  for ( i in post.dialogue )
                    htmlString += post.dialogue[ i ].label + " " + post.dialogue[ i ].phrase + "<br/>";

                  break;
                  
                case "video":
                  var width = !options.photoWidth ? 400 : options.photoWidth, defaultSizeIndex = -1, i = 0;
                  var videoCode;
                
                  for( i in post.player ){
                    // First try to see if the current index matches the specified width
                    // If it doesn't, check if it equals our default width incase user didn't 
                    // ever specify a width or if their width is never found.
                    if ( post.player[ i ].width === width ){
                      videoCode = post.player[ i ].embed_code;
                      defaultSizeIndex = 0;
                      break;
                    }
                    else
                      if( post.player[ i ].width === 400 )
                          defaultSizeIndex = i;
                                          
                    i++; 
                  }
                
                  console.log( i );
                  // If specified width never found, use default
                  if( i === post.player.length )
                    videoCode = post.player[ defaultSizeIndex ].embed_code;
                
                  // Will run if user's size is never found and our default is never found
                  if( defaultSizeIndex === -1 )
                    throw new Error( "Specified video size was not found and default was never found. Please try another width." );
                  
                  // Finally build the html for the div element
                  htmlString += videoCode + "<br/>" + post.caption; 
                  break;
                  
                case "answer":
                  htmlString += "Inquirer: <a href='" + post.asking_url + "' target='_blank'>" + post.asking_name + "</a><br/><br/>";
                  htmlString += "Question: " + post.question + "<br/>";
                  htmlString += "Answer: " + post.answer;
                  break;
                  
                default:
                  console.log( "It's working!" );
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
              // Blog Info Requests
              htmlString += "<a href='" + data.response.blog.url + "' target='_blank'>" + data.response.blog.title + "</a><br/>";
              htmlString += data.response.blog.description;
            }
          }
          else {
            throw new Error( "Error. Request failed. Status code: " + data.meta.status + " - Message: " + data.meta.msg );
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