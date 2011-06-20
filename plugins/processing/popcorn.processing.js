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

(function ( Popcorn ) {

  var processingLoaded = false,

    toggle = function( on, options ) {
      var instance = options.pjsInstance,
          canvas = options.canvas;
          
      if ( canvas && options.isReady ) {
        if ( on ) {
          canvas.style.display = "inline";
          !this.media.paused && instance.loop();
        } else {
          canvas.style.display = "none";
          instance.noLoop();
        }
      } else {
        setTimeout (function() {
          toggle.call( this, on, options );
        }, 10 );
      }
    },

    load = function() {
      Popcorn.getScript( "http://processingjs.org/content/download/processing-js-1.2.1/processing-1.2.1.js", function() {
        processingLoaded = true;
      });
    };

  load();

  Popcorn.plugin( "processing" , function ( options ) {

    var init = function( context ) {
      var popcorn = context,
      initProcessing,
      parentTarget = document.getElementById( options.target );
      
      if ( parentTarget.tagName === "CANVAS" ) {
        options.canvas = parentTarget;
      } else if ( parentTarget.tagName === "DIV" ) {
        options.canvas = document.createElement( "canvas" );
        // +new Date() is used here to create unique id's for canvas' within the same div.
        options.canvas.id = options.target + "Sketch" + ( +new Date() );
        options.canvas.setAttribute( "data-processing-sources", options.sketch );
        parentTarget.appendChild( options.canvas );
      }
      options.canvas.style.display = "none";
      Popcorn.xhr({
        url: options.sketch,
        dataType: "text",
        success: function( responseCode ) {
          codeReady = true;
          processingCode = responseCode;
          initProcessing();
        }
      });

      initProcessing = function() {
        var addListeners = function() {
          popcorn.listen( "pause", function () {
            if ( options.canvas.style.display === "inline" ) {
              options.pjsInstance.noLoop();
            }
          });
          popcorn.listen( "play", function() {
            if ( options.canvas.style.display === "inline" ) {
              options.pjsInstance.loop();
            }
          });
        };
        
        if ( codeReady && window.Processing ) {
          options.pjsInstance = new Processing( options.canvas, processingCode );
          popcorn.listen( "seeking", function() {
            if ( options.canvas.style.display === "inline" && options.noPause ) {
              options.pjsInstance.loop();
            }
          });
          
          options.noPause = options.noPause || false;
          !options.noPause && addListeners();          
          options.isReady = true;
        } else {
          setTimeout ( initProcessing, 10 );
        }
      };
    };

    return {

      manifest: {
        about: {
          name: "Popcorn Processing Plugin",
          version: "0.1",
          author: "Christopher De Cairos, Benjamin Chalovich",
          website: "cadecairos.blogspot.com, ben1amin.wordpress.org"
        },
        options: {
          start :   { elem: "input", type: "text", label: "In" },
          end :     { elem: "input", type: "text", label: "Out" },
          target :  { elem: "input", type: "text", label: "Target" },
          sketch :  { elem: "input", type: "text", label: "Sketch" },
          noPause : { elem: "select", options: [ "TRUE", "FALSE" ], label: "No Loop" }
        }
      },

      _setup: function( options ) {

        var processingCode,
            codeReady = false,
            self = this,

        readyCheck = function() {
          if ( !processingLoaded ) {
            load();
          }
        };
        readyCheck();
        init( self );
      },

      start: function( event, options ) {
        toggle.call( this, true, options );
      },

      end: function( event, options ) {
        toggle.call( this, false, options );
      }
    };
  });
}( Popcorn ));
