// PLUGIN: FLICKR

(function (Popcorn) {

  /**
   * Twitter popcorn plug-in 
   * Appends a Twitter widget to an element on the page.
   * Options parameter will need a start, end, target and source.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Src is the hash tag or twitter user to get tweets from
   * Target is the id of the document element that the images are
   *  appended to, this target element must exist on the DOM
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

      _setup: function( options ) {

        // setup widget div that is unique per track
        options.container = document.createElement( 'div' ); // create the div to store the widget
        options.container.setAttribute('id', Popcorn.guid()); // use this id to connect it to the widget
        options.container.style.display = "none"; // display none by default
        document.getElementById( options.target ).appendChild( options.container ); // add the widget's div to the target div

        // setup info for the widget
        var src  = options.src || "",
            width = options.width || 250,
            height  = options.height || 200,
            profile = /^@/.test( src ),
            hash = /^#/.test( src );

        // create widget
        if ( profile ) {

          var widget = new TWTR.Widget({
            version: 2,
            type: 'profile',
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
          }).render().setUser( src.replace( /^@/, "" ) ).start();

        } else if ( hash ) {    
      
          var widget = new TWTR.Widget({
            version: 2,
            type: 'search',
            id: options.container.getAttribute( 'id' ),  // use this id to connect it to the div
            search: src,
            subject: src,
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
          }).render().start();

        }
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
