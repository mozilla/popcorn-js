// PLUGIN: Wordriver

(function ( Popcorn ) {

  var container = {},
      spanLocation = 0,
      setupContainer = function( target ) {

        container[ target ] = document.createElement( "div" );

        var t = document.getElementById( target );
        t && t.appendChild( container[ target ] );

        container[ target ].style.height = "100%";
        container[ target ].style.position = "relative";

        return container[ target ];
      },
      // creates an object of supported, cross platform css transitions
      span = document.createElement( "span" ),
      prefixes = [ "webkit", "Moz", "ms", "O", "" ],
      specProp = [ "Transform", "TransitionDuration", "TransitionTimingFunction" ],
      supports = {},
      prop;

  document.getElementsByTagName( "head" )[ 0 ].appendChild( span );

  for ( var sIdx = 0, sLen = specProp.length; sIdx < sLen; sIdx++ ) {

    for ( var pIdx = 0, pLen = prefixes.length; pIdx < pLen; pIdx++ ) {

      prop = prefixes[ pIdx ] + specProp[ sIdx ];

      if ( prop in span.style ) {

        supports[ specProp[ sIdx ].toLowerCase() ] = prop;
        break;
      }
    }
  }

  // Garbage collect support test span
  document.getElementsByTagName( "head" )[ 0 ].appendChild( span );

  /**
   * Word River popcorn plug-in
   * Displays a string of text, fading it in and out
   * while transitioning across the height of the parent container
   * for the duration of the instance  (duration = end - start)
   *
   * @param {Object} options
   *
   * Example:
     var p = Popcorn( '#video' )
        .wordriver({
          start: 5,                      // When to begin the Word River animation
          end: 15,                       // When to finish the Word River animation
          text: 'Hello World',           // The text you want to be displayed by Word River
          target: 'wordRiverDiv',        // The target div to append the text to
          color: "blue"                  // The color of the text. (can be Hex value i.e. #FFFFFF )
        } )
   *
   */

  Popcorn.plugin( "wordriver" , {

      manifest: {
        about:{
          name: "Popcorn WordRiver Plugin"
        },
        options: {
          start: {
            elem: "input",
            type: "number",
            label: "Start"
          },
          end: {
            elem: "input",
            type: "number",
            label: "End"
          },
          target: "wordriver-container",
          text: {
            elem: "input",
            type: "text",
            label: "Text",
            "default": "Popcorn.js"
          },
          color: {
            elem: "input",
            type: "text",
            label: "Color",
            "default": "Green",
            optional: true
          }
        }
      },

      _setup: function( options ) {

        options._duration = options.end - options.start;
        options._container = container[ options.target ] || setupContainer( options.target );

        options.word = document.createElement( "span" );
        options.word.style.position = "absolute";

        options.word.style.whiteSpace = "nowrap";
        options.word.style.opacity = 0;

        options.word.style.MozTransitionProperty = "opacity, -moz-transform";
        options.word.style.webkitTransitionProperty = "opacity, -webkit-transform";
        options.word.style.OTransitionProperty = "opacity, -o-transform";
        options.word.style.transitionProperty = "opacity, transform";

        options.word.style[ supports.transitionduration ] = 1 + "s, " + options._duration + "s";
        options.word.style[ supports.transitiontimingfunction ] = "linear";

        options.word.innerHTML = options.text;
        options.word.style.color = options.color || "black";
      },
      start: function( event, options ){

        options._container.appendChild( options.word );

        // Resets the transform when changing to a new currentTime before the end event occurred.
        options.word.style[ supports.transform ] = "";

        options.word.style.fontSize = ~~( 30 + 20 * Math.random() ) + "px";
        spanLocation = spanLocation % ( options._container.offsetWidth - options.word.offsetWidth );
        options.word.style.left = spanLocation + "px";
        spanLocation += options.word.offsetWidth + 10;
        options.word.style[ supports.transform ] = "translateY(" +
          ( options._container.offsetHeight - options.word.offsetHeight ) + "px)";

        options.word.style.opacity = 1;

        // automatically clears the word based on time
        setTimeout( function() {

		      options.word.style.opacity = 0;
        // ensures at least one second exists, because the fade animation is 1 second
		    }, ( ( (options.end - options.start) - 1 ) || 1 ) * 1000 );
      },
      end: function( event, options ){

        // manually clears the word based on user interaction
        options.word.style.opacity = 0;
      },
      _teardown: function( options ) {

        var target = document.getElementById( options.target );
        // removes word span from generated container
        options.word.parentNode && options._container.removeChild( options.word );

        // if no more word spans exist in container, remove container
        container[ options.target ] &&
          !container[ options.target ].childElementCount &&
          target && target.removeChild( container[ options.target ] ) &&
          delete container[ options.target ];
      }
  });

})( Popcorn );
