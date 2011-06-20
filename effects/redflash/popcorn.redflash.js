// EFFECT: Redflash

(function (Popcorn) {
  
  /**
   * Footnote popcorn plug-in 
   * Adds text to an element on the page.
   * Options parameter will need a start, end, target and text.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing 
   * Text is the text that you want to appear in the target
   * Target is the id of the document element that the text needs to be 
   * attached to, this target element must exist on the DOM
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .footnote({
          start: 5, // seconds
          end: 15, // seconds
          text: 'This video made exclusively for drumbeat.org',
          target: 'footnotediv'
        } )
   *
   */
  Popcorn.compose( "redflash" , {
    
    manifest: {
      about:{
        name: "Popcorn Redflash Effect",
        version: "0.1",
        author: "@scottdowne",
        website: "scottdowne.wordpress.com"
      },
      options:{
        effect: true
      }
    },
    _setup: function( options ) {

      console.log( "in effect setup" );
    },
    start: function( event, options ){

      console.log( "in effect start" );
    },
    end: function( event, options ){

      console.log( "in effect end" );
    },
    _teardown: function( options ) {

      console.log( "in effect teardown" );
    }
  });
})( Popcorn );
