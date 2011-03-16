// PLUGIN: FLICKR

(function (Popcorn) {
  /**
   * Flickr popcorn plug-in 
   * Appends a users Flickr images to an element on the page.
   * Options parameter will need a start, end, target and userid.
   * Optional parameters are numberofimages, height, width, padding, and border
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Userid is the id of who's Flickr images you wish to show
   * Tags is a mutually exclusive list of image descriptor tags
   * Target is the id of the document element that the images are
   *  appended to, this target element must exist on the DOM
   * Numberofimages specify the number of images to retreive from flickr, defaults to 8
   * Height the height of the component, defaults to '50px'
   * Width the width of the component, defaults to '50px'
   * Padding number of pixels between images, defaults to '5px'
   * Border border size in pixels around images, defaults to '0px'
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .footnote({
          start:          5,                 // seconds, mandatory
          end:            15,                // seconds, mandatory
          userid:         '35034346917@N01', // optional
          tags:           'dogs,cats',       // optional
          numberofimages: '8',               // optional
          height:         '50px',            // optional
          width:          '50px',            // optional
          padding:        '5px',             // optional
          border:         '0px',             // optional
          target:         'flickrdiv'        // mandatory
        } )
   *
   */
  Popcorn.plugin( "flickr" , {

      manifest: {
        about:{
          name:    "Popcorn Flickr Plugin",
          version: "0.1.1",
          author:  "Scott Downe, Steven Weerdenburg",
          website: "http://scottdowne.wordpress.com/"
        },
        options:{
          start   : {elem:'input', type:'number', label:'In'},
          end     : {elem:'input', type:'number', label:'Out'},
          userid  : {elem:'input', type:'text',   label:'Source'},
          tags    : {elem:'input', type:'text',   label:'Tags'},
          target  :  'Flickr-container',
          height  : {elem:'input', type:'text', label:'Height'},
          width   : {elem:'input', type:'text', label:'Width'},
          padding : {elem:'input', type:'text', label:'Padding'},
          border  : {elem:'input', type:'text', label:'Border'},
          numberofimages : {elem:'input', type:'text', label:'Number of Images'}
        }
      },

      _setup: function( options ) {
        options.container = document.createElement( 'div' );
        options.container.style.display = "none";
        
        if ( document.getElementById( options.target ) ) {
          document.getElementById( options.target ).appendChild( options.container );
        }
        
        var height  = options.height || "50px",
            width   = options.width || "50px",
            count   = options.numberofimages || 4,
            padding = options.padding || "5px",
            tags    = options.tags || "",
            userid  = options.userid || "",
            border  = options.border || "0px",
            uri = "http://api.flickr.com/services/feeds/photos_public.gne?";
        
        if ( userid ) {
          uri += "id="+userid+"&";
        }
        
        if ( tags ) {
          uri += "tags="+tags+"&";
        }

        uri += "lang=en-us&format=json&jsoncallback=flickr";
        
        Popcorn.xhr.getJSONP( uri, function( data ) {
          options.container.innerHTML = "<p style='padding:" + padding + ";'>" + data.title + "<p/>";
          
          Popcorn.forEach( data.items, function ( item, i ) {
            if ( i < count ) {
              var link = document.createElement('a');
              link.setAttribute( 'href', item.link );
              link.setAttribute( "target", "_blank" );
              var image = document.createElement( 'img' );
              image.setAttribute( 'src', item.media.m );
              image.setAttribute( 'height', height );
              image.setAttribute( 'width', width );
              image.setAttribute( 'style', 'border:' + border + ';padding:' + padding );
              link.appendChild( image );
              
              options.container.appendChild( link );
            } else {
              return false;
            }
          });
        });
      },
      /**
       * @member Flickr 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function( event, options ) {
        options.container.style.display = "inline";
      },
      /**
       * @member Flickr 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function( event, options ) {
        options.container.style.display = "none";
      }
    });

})( Popcorn );
