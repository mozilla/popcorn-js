// PLUGIN: Processing
/**
* Processing popcorn plug-in
*/
 
(function (Popcorn) {

  var processingLoaded = false,
  
    toggle = function( on, options ) {
      var pcorn = options.popcornInstance,
          instance = options.pjsInstance,
          canvas = options.canvas;
      if ( canvas && options.isReady ) {
        if ( on ) {
          canvas.style.display = "inline";
          !pcorn.media.paused && instance.loop();
        } else {
          canvas.style.display = "none";
          instance.noLoop();
        }
      } else {
        setTimeout ( function() {
          toggle ( on, options );
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
        options.canvas.id = options.target + "Sketch" + +new Date();
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
        if ( codeReady && window.Processing ) {
          options.pjsInstance = new Processing( options.canvas, processingCode );
          popcorn.listen( "pause", function () {
            if ( options.canvas.style.display === "inline" ) {
              options.pjsInstance.noLoop();
            }
          } );
          popcorn.listen( "play", function() {
            if ( options.canvas.style.display === "inline" ) {
              options.pjsInstance.loop();
            }
          });
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
          control : { elem: "input", type: "text", label: "Control" },
          target :  { elem: "input", type: "text", label: "Target" },
          sketch :  { elem: "input", type: "text", label: "Sketch" },
          func :    { elem: "input", type: "text", label: "Function" }
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
        options.popcornInstance = this;
      },
      
      start: function( event, options ) {
        toggle ( true, options );
      },
      
      end: function( event, options ) {
        toggle ( false, options );
      }
    };
  });
}( Popcorn ));
