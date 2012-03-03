/**
 * Processing Popcorn Plug-In
 *
 * This plugin adds a Processing.js sketch to be added to a target div or canvas.
 *
 * Options parameter needs to specify start, end, target and  sketch attributes
 * -Start is the time [in seconds] that you want the sketch to display and start looping.
 * -End is the time [in seconds] you want the sketch to become hidden and stop looping.
 * -Target is the id of the div or canvas you want the target sketch to be displayed in. ( a target that is a div will have a canvas created and placed inside of it. )
 * -Sketch specifies the filename of the Procesing code to be loaded into Processing.js
 * -noLoop [optional] specifies whether a sketch should continue to loop when the video is paused or seeking.
 *
 * @param {Object} options
 *
 * Example:
 var p = Popcorn( "#video" )
 .processing({
   start: 5,
   end: 10,
   target: "processing-div",
   sketch: "processingSketch.pjs",
   noLoop: true
 });
 *
 */

(function( Popcorn ) {

  Popcorn.plugin( "processing", function( options ) {

    var init = function( context ) {

      function scriptReady( options ) {
        var addListeners = function() {
          context.listen( "pause", function() {
            if ( options.canvas.style.display === "inline" ) {
              options.pjsInstance.noLoop();
            }
          });
          context.listen( "play", function() {
            if ( options.canvas.style.display === "inline" ) {
              options.pjsInstance.loop();
            }
          });
        };

        if ( options.sketch ) {

          Popcorn.xhr({
            url: options.sketch,
            dataType: "text",
            success: function( responseCode ) {

              options.codeReady = false;

              var s = Processing.compile( responseCode );
              options.pjsInstance = new Processing( options.canvas, s );
              options.seeking = false;
              ( options._running && !context.media.paused && options.pjsInstance.loop() ) || options.pjsInstance.noLoop();

              context.listen( "seeking", function() {
                 options._running && options.canvas.style.display === "inline" && options.noPause && options.pjsInstance.loop();
              });

              options.noPause = options.noPause || false;
              !options.noPause && addListeners();
              options.codeReady = true;
            }
          });
        } else if ( Popcorn.plugin.debug ) {

          throw new Error( "Popcorn.Processing: options.sketch is undefined" );
        }
      }

      if ( !window.Processing ) {
        Popcorn.getScript( "//cloud.github.com/downloads/processing-js/processing-js/processing-1.3.6.min.js", function() {
          scriptReady( options );
        });
      } else {
        scriptReady( options );
      }

    };

    return {

      _setup: function( options ) {

        options.codeReady = false;

        options.parentTarget = document.getElementById( options.target );

        if ( !options.parentTarget && Popcorn.plugin.debug ) {
          throw new Error( "target container doesn't exist" );
        }

        var canvas = document.createElement( "canvas" );
        canvas.id = Popcorn.guid( options.target + "-sketch" );
        canvas.style.display = "none";
        options.canvas = canvas;

        options.parentTarget && options.parentTarget.appendChild( options.canvas );

        init( this );
      },

      start: function( event, options ) {

        options.codeReady && !this.media.paused && options.pjsInstance.loop();
        options.canvas.style.display = "inline";

      },

      end: function( event, options ) {

        options.pjsInstance && options.pjsInstance.noLoop();
        options.canvas.style.display = "none";
      },

      _teardown: function( options ) {
        options.pjsInstance && options.pjsInstance.exit();
        options.parentTarget && options.parentTarget.removeChild( options.canvas );
      }
    };
  },
  {
    about: {
      name: "Popcorn Processing Plugin",
      version: "0.1",
      author: "Christopher De Cairos, Benjamin Chalovich",
      website: "cadecairos.blogspot.com, ben1amin.wordpress.org"
    },
    options: {
      start: {
        elem: "input",
        type: "text",
        label: "In"
      },
      end: {
        elem: "input",
        type: "text",
        label: "Out"
      },
      target: {
        elem: "input",
        type: "text",
        label: "Target"
      },
      sketch: {
        elem: "input",
        type: "url",
        label: "Sketch"
      },
      noPause: {
        elem: "select",
        options: [ "TRUE", "FALSE" ],
        label: "No Loop",
        optional: true
      }
    }
  });
}( Popcorn ));
