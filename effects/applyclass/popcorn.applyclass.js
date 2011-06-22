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

  var toggleClass = function( event, options ) {

    var idx = 0, len = 0, elements;

    Popcorn.forEach( options.classes, function( key, val ) {

      elements = [];

      if ( key === "parent" ) {

        elements[ 0 ] = document.querySelectorAll("#" + options.target )[ 0 ].parentNode;
      } else {

        elements = document.querySelectorAll("#" + options.target + " " + key );
      }

      for ( idx = 0, len = elements.length; idx < len; idx++ ) {

        var element = elements[ idx ];

        element.classList.toggle( val );
      }
    });
  };

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
        options.classes[ item[ 0 ] ] = item[ 1 ] || "";
      }
    },
    start: toggleClass,
    end: toggleClass
  });
})( Popcorn );
