// PLUGIN: Google News

(function (Popcorn) {
  
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
        var newsShow = new google.elements.NewsShow( options.container, {
          format : "300x250",
          queryList : [
            { q: options.topic || "Top Stories" }
          ]
        } );
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
