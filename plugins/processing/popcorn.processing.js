// PLUGIN: Processing
/**
* Processing popcorn plug-in
*/
 
(function (Popcorn) {

  var scriptLoadingFired = false,
  canvas,
  parentTarget,
  processingInstance,
  processingLoaded = false,

  loadProcessing = function() {
    if ( !scriptLoadingFired ) { 
      if ( window.Processing ) {
        processingLoaded = true;
        return;
      }
      scriptLoadingFired = true;
      Popcorn.getScript ( "http://processingjs.org/content/download/processing-js-1.2.1/processing-1.2.1.js" );
    }
  };

  Popcorn.plugin( "processing" , function( options ) {
      
    var sketchInstance,
  
    toggle = function( on ) {
      if ( canvas ) {
        if ( on ) {
          canvas.style.display = "inline";
          processingInstance.loop();
        } else {
          canvas.style.display = "none";
          processingInstance.noLoop();
        }
      } else {
        setTimeout ( function() {
          toggle ( on );
        }, 10 ); 
      }
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
          control : { elem: "input", type: "text", label: "Control" },
          target :  { elem: "input", type: "text", label: "Target" },
          sketch :  { elem: "input", type: "text", label: "Sketch" },
          func :    { elem: "input", type: "text", label: "Function" }
        }
      },
      
      _setup: function( options ) {
        var types = { "pause": true, "function": true },
            processingCode, codeReady = false, createCanvas,
            
        init = function() {
          if ( window.Processing ) {
            parentTarget = document.getElementById( options.target );
            if ( parentTarget.tagName === "CANVAS" ) {
              canvas = parentTarget;
            } else if ( parentTarget.tagName === "DIV" ) {
              canvas = document.createElement( "canvas" );
              // +new Date() is used here to create unique id's for canvas' within the same div.
              canvas.id = options.target + "Sketch" + +new Date();
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
          } else {
            !processingLoaded && loadProcessing();
            setTimeout( init, 10 );
          }
        };

        init();
      },
      
      start: function( event, options ) {
        toggle ( true );
      },
      
      end: function( event, options ) {
        toggle ( false );
      }
    };
  });
}( Popcorn ));
