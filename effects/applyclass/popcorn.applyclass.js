// EFFECT: applyclass

(function (Popcorn) {

  /**
   * apply css class to jquery selector
   * selector is relative to plugin target's id
   * so .overlay is actually jQuery( "#target .overlay")
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
          effect: 'applyclass',
          applyclass: 'selector: class'
        })
   *
   */

  var startFunction = Popcorn.nop,
      applyFunction = function() {

        if ( !window.jQuery ) {

          Popcorn.getScript( "http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js", applyFunction );
          return;
        }

        startFunction = function( event, options ) {

          Popcorn.forEach( options.classes, function( val, key ) {

            var obj;
            if ( key === "parent" ) {

              obj = jQuery("#" + options.target ).parent();
            } else {

              obj = jQuery("#" + options.target + " " + key );
            }

            obj.addClass( val );
            setTimeout( function() {

              obj.removeClass( val );
            }, 250 );
          });
        };
      };

  applyFunction();

  Popcorn.compose( "applyclass", {
    
    manifest: {
      about: {
        name: "Popcorn applyclass Effect",
        version: "0.1",
        author: "@scottdowne",
        website: "scottdowne.wordpress.com"
      },
      options: {}
    },
    _setup: function( options ) {

      options.classes = {};

      var array = options.applyclass.replace( /\s/g, "" ).split( "," ),
          item = [],
          idx = 0, len = array.length;

      for ( ; idx < len; idx++ ) {

        item = array[ idx ].split( ":");
        options.classes[ item[ 0 ] ] = item[ 1 ];
      }
    },
    start: function( event, options ) {

      startFunction.call( this, event, options );
    }
  });
})( Popcorn );
