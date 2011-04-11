// PLUGIN: TWITTER

(function (Popcorn) {
  var scriptLoading = false;

  /**
   * Twitter popcorn plug-in 
   * Appends a Twitter widget to an element on the page.
   * Options parameter will need a start, end, target and source.
   * Optional parameters are height and width.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Src is the hash tag or twitter user to get tweets from
   * Target is the id of the document element that the images are
   *  appended to, this target element must exist on the DOM
   * Height is the height of the widget, defaults to 200
   * Width is the width of the widget, defaults to 250
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .twitter({
          start:          5,                // seconds, mandatory
          end:            15,               // seconds, mandatory
          src:            '@stevesong',     // mandatory, also accepts hash tags
          height:         200,              // optional
          width:          250,              // optional
          target:         'twitterdiv'      // mandatory
        } )
   *
   */

  Popcorn.plugin( "twitter" , {

      manifest: {
        about:{
          name:    "Popcorn Twitter Plugin",
          version: "0.1",
          author:  "Scott Downe",
          website: "http://scottdowne.wordpress.com/"
        },
        options:{
          start   : {elem:'input', type:'number', label:'In'},
          end     : {elem:'input', type:'number', label:'Out'},
          src     : {elem:'input', type:'text',   label:'Source'},
          target  : 'Twitter-container',
          height  : {elem:'input', type:'number', label:'Height'},
          width   : {elem:'input', type:'number', label:'Width'}
        }
      },

      _setup: function( options ) {

        if ( !window.TWTR && !scriptLoading ) {
          scriptLoading = true;
          Popcorn.getScript("http://widgets.twimg.com/j/2/widget.js");
        }

        // setup widget div that is unique per track
        options.container = document.createElement( 'div' ); // create the div to store the widget
        options.container.setAttribute('id', Popcorn.guid()); // use this id to connect it to the widget
        options.container.style.display = "none"; // display none by default
        if ( document.getElementById( options.target ) ) {
          document.getElementById( options.target ).appendChild( options.container ); // add the widget's div to the target div
        }
        // setup info for the widget
        var src     = options.src || "",
            width   = options.width || 250,
            height  = options.height || 200,
            profile = /^@/.test( src ),
            hash    = /^#/.test( src ),
            widgetOptions = {
              version: 2,
              id: options.container.getAttribute( 'id' ),  // use this id to connect it to the div
              rpp: 30,
              width: width,
              height: height,
              interval: 6000,
              theme: {
                shell: {
                  background: '#ffffff',
                  color: '#000000'
                },
                tweets: {
                  background: '#ffffff',
                  color: '#444444',
                  links: '#1985b5'
                }
              },
              features: {
                loop: true,
                timestamp: true,
                avatars: true,
                hashtags: true,
                toptweets: true,
                live: true,
                scrollbar: false,
                behavior: 'default'
              }
            };

        // create widget
        var isReady = function( that ) {
          if ( window.TWTR ) {
            if ( profile ) {

              widgetOptions.type = "profile";

              new TWTR.Widget( widgetOptions ).render().setUser( src ).start();

            } else if ( hash ) {

              widgetOptions.type = "search";
              widgetOptions.search = src;
              widgetOptions.subject = src;

              new TWTR.Widget( widgetOptions ).render().start();

            }
          } else {
            setTimeout( function() {
              isReady( that );
            }, 1);
          }
        };

        isReady( this );
      },

      /**
       * @member Twitter 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function( event, options ) {
        options.container.style.display = "inline";
      },

      /**
       * @member Twitter 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function( event, options ) {
        options.container.style.display = "none";
      }
    });

})( Popcorn );
