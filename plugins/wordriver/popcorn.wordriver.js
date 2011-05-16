// PLUGIN: Wordriver

(function (Popcorn) {

  var container = {},
      spanLocation = 0,
      knownSpeaker = false,
      knownIndex = 0,
      unknownIndex = 0,
      setupContainer = function( target ) {
  
        container[ target ] = document.createElement( "div" );
        document.getElementById( target ).appendChild( container[ target ] );
        
        container[ target ].style.height = "100%";
        container[ target ].style.position = "relative";
        
        return container[ target ];
      };

  Popcorn.plugin( "wordriver" , {
    
      manifest: {},

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

        options.word.style.MozTransitionDuration =
          options.word.style.webkitTransitionDuration = 
          options.word.style.OTransitionDuration = 
          options.word.style.transitionDuration = 1 + "s, " + options._duration + "s";

        options.word.style.MozTransitionTimingFunction =
          options.word.style.webkitTransitionTimingFunction =
          options.word.style.OTransitionTimingFunction =
          options.word.style.transitionTimingFunction = "linear";

        options.word.innerHTML = options.text;
        options.word.style.color = options.color || "black";
      },
      start: function( event, options ){

        options._container.appendChild( options.word );

        // Resets the transform when changing to a new currentTime before the end event occurred.
        options.word.style.MozTransform =
          options.word.style.webkitTransform =
          options.word.style.OTransform =
          options.word.style.transform = "";

        options.word.style.fontSize = ~~( 30 + 20 * Math.random() ) + "px";
        spanLocation = spanLocation % ( options._container.offsetWidth - options.word.offsetWidth );
        options.word.style.left = spanLocation + "px";
        spanLocation += options.word.offsetWidth + 10;

        options.word.style.MozTransform =
          options.word.style.webkitTransform =
          options.word.style.OTransform =
          options.word.style.transform = "translateY(" + ( document.getElementById( options.target ).offsetHeight - options.word.offsetHeight ) + "px)";
        
        options.word.style.opacity = 1;

        // automatically clears the word based on time
        setTimeout( function() {

		      options.word.style.opacity = 0;
        // ensures at least one second exists, because the fade animation is 1 second
		    }, ( ( (options.end - options.start) - 1 ) || 1 ) * 1000 )

      },
      end: function( event, options ){

        // manually clears the word based on user interaction
        options.word.style.opacity = 0;
      }
  });

})( Popcorn );
