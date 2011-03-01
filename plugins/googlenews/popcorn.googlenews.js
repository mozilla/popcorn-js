// PLUGIN: Google News

(function (Popcorn) {
  var scriptLoaded = false;

  Popcorn.getScript( "http://www.google.com/jsapi", function() {
    google.load("elements", "1", {packages : ["newsshow"], callback: function() {scriptLoaded = true;}});
  });

  /**
   */
  Popcorn.plugin( "googlenews" , {

      manifest: {
        about:{
          name:    "Popcorn Google News Plugin",
          version: "0.1",
          author:  "Scott Downe",
          website: "http://scottdowne.wordpress.com/"
        },
        options:{
          start    : {elem:'input', type:'text', label:'In'},
          end      : {elem:'input', type:'text', label:'Out'},
          target   : 'news-container',
          topic     : {elem:'select', type:'text', label:'Type'}
        }
      },
      _setup : function( options ) {

        options.container = document.createElement( 'div' );
        if ( document.getElementById( options.target ) ) {
          document.getElementById( options.target ).appendChild( options.container );
        }

        var readyCheck = setInterval(function() {
          if ( !scriptLoaded ) {
            return;
          }
          clearInterval(readyCheck);

          var newsShow = new google.elements.NewsShow( options.container, {
            format : "300x250",
            queryList : [
              { q: options.topic || "Top Stories" }
            ]
          } );

        }, 5);

        options.container.style.display = "none";

      },
      /**
       * @member googlenews 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function( event, options ){
        options.container.setAttribute( 'style', 'display:inline' );
      },
      /**
       * @member googlenews 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function( event, options ){
        options.container.setAttribute( 'style', 'display:none' );
      }

  });

})( Popcorn );
