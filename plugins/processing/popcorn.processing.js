// PLUGIN: Processing
/**
* Processing popcorn plug-in
*/
 
(function (Popcorn) {

var scriptLoadingFired = false,
  canvas,
  parentTarget,
  processingInstance,

  loadProcessing = function() {
    if ( !window["Processing"] && !scriptLoadingFired ) {
      scriptLoadingFired = true;
      Popcorn.getScript ( "http://processingjs.org/content/download/processing-js-1.2.1/processing-1.2.1.js");
    }
  };

  Popcorn.plugin( "processing" , function( options ) {
      
    var sketchInstance,
  
    toggle = function( on ) {
      if (canvas) {
        if ( on ) {
          canvas.style.display = "inline";
          processingInstance.loop();
        } else {
          canvas.style.display = "none";
          processingInstance.noLoop();
        }
      } else {
        setTimeout ( function () {
          toggle ( on );
        }, 10 ); 
      }
    };
    
    loadProcessing();
    
    return {
      manifest: {
        about: {
          name: "Popcorn Processing Plugin",
          version: "0.1",
          author: "Christopher De Cairos",
          website: "cadecairos.blogspot.com"
        },
        options: {
          start :   { elem: "input", type: "text", label: "In" },
          end :     { elem: "input", type: "text", label: "Out" },
          control : { elem: "input", type: "text", label: "Control" },
          target :  { elem: "input", type: "text", label: "Target" },
          sketch :  { elem: "input", type: "text", label: "Sketch" },
          func :    { elem: "input", type: "text", label: "Function" }
        }
      },
      _setup: function( options ) {
        var types = { "pause": true, "function": true },
            setup, processingCode, codeReady = false, createCanvas;
            
        
            
        setup = function() {
          if ( window["Processing"] ) {
            if ( !types[ options.control ] ) {
              throw ("popcorn.processing plug-in ERROR: un-recognized control type '" + options.control + "' must be 'pause' or 'function'");
            }
            if (options.start >= options.end ) {
              throw ( "popcorn.processing plug-in ERROR: invalid start and end pause timings '" + options.start + "' must be less than '" + options.end + "'" );
            }
            parentTarget = document.getElementById( options.target );
            if ( !parentTarget ) {
              throw ( "popcorn.processing plug-in ERROR: Target '" + options.target + "' does not exist." );
            } else {
              if ( parentTarget.tagName === "CANVAS" ) {
                canvas = parentTarget;
              } else if ( parentTarget.tagName === "DIV" ) {
                canvas = document.createElement( "canvas" );
                canvas.id = options.target + "Sketch";
                canvas.setAttribute( "data-processing-sources", options.sketch );
                canvas.style.display = "none";
                parentTarget.appendChild( canvas );
              }
              Popcorn.xhr({
                url: options.sketch,
                dataType: "text",
                success: function( responseCode ) {
                  codeReady = true;
                  processingCode = responseCode;
                }
              });
              
              createCanvas = function() {
                if ( codeReady ) {
                  processingInstance = new Processing( canvas, processingCode );
                } else {
                  setTimeout ( createCanvas, 10 );
                }
              };
              createCanvas();
            }
          } else {
            scriptLoadingFired && loadProcessing();
            setTimeout( setup, 10 );
          }
        };
        setup();
      },
      start: function( event, options ) {
        toggle ( true );
      },
      end: function( event, options ) {
        toggle ( false );
      }
    }
  });
})( Popcorn );
