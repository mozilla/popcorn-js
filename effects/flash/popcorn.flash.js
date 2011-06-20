// EFFECT: flash

(function (Popcorn) {

  /**
   * Flash effect 
   * Adds a coloured flash to the background of plugins.
   * Optional parameters are flashcolor, which accepts a css colour. Defaults to red.
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .footnote({
          start: 5, // seconds
          end: 15, // seconds
          text: 'This video made exclusively for drumbeat.org',
          target: 'footnotediv',
          effect: 'flash',
          flashcolor: "green"
        } )
   *
   */

  var startFunction = Popcorn.nop,
      endFunction = Popcorn.nop;

  Popcorn.getScript( "http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
    startFunction = function( event, options ) {

      $( options.redDiv ).css( "display", "inline" ).css( "left", 0 ).fadeOut( 250 );
    };
  });

  Popcorn.compose( "flash" , {
    
    manifest: {
      about:{
        name: "Popcorn flash Effect",
        version: "0.1",
        author: "@scottdowne",
        website: "scottdowne.wordpress.com"
      },
      options:{
        effect: true
      }
    },
    _setup: function( options ) {

      options.redDiv = document.createElement( "span" );
      options.redDiv.style.position = "absolute";
      options.redDiv.style.opacity = 0.8;
      options.redDiv.style.backgroundColor = options.flashcolor || "red";
      options.redDiv.style.height = "100%";
      options.redDiv.style.width = "100%";
      options.redDiv.style.zindex = options._container.style.zIndex + 1;
      options.redDiv.style.display = "none";

      options._container.style.position = "relative";
      options._container.appendChild( options.redDiv );
    },
    start: function( event, options ) {

      startFunction.call( this, event, options );
    },
    _teardown: function( options ) {

      options.redDiv.parentNode && options._container.removeChild( options.redDiv );
    }
  });
})( Popcorn );
