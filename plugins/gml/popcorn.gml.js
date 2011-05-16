// PLUGIN: GML

(function (Popcorn) {

  var processingLoaded = false;

  var ajax = function ajax(url) {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.setRequestHeader("If-Modified-Since", "Fri, 1 Jan 1960 00:00:00 GMT");
    xhr.send(null);
    // failed request?
    if (xhr.status !== 200 && xhr.status !== 0) { throw ("XMLHttpRequest failed, status code " + xhr.status); }
    return xhr.responseText;
  };

  Popcorn.getScript( "http://processingjs.org/content/download/processing-js-1.1.0/processing-1.1.0.js", function() {

    processingLoaded = true;
  });
  
  /**
*/
  Popcorn.plugin( "gml" , {
      
    /**
*/
    _setup : function( options ) {

      var self = this;
      
      options.endDrawing = options.endDrawing || options.end;
      // create a canvas to put in the target div
      options.container = document.createElement( 'canvas' );

      options.container.style.display = "none";
      options.container.setAttribute( 'id', 'canvas' + options.gmltag );

      if ( document.getElementById( options.target ) ) {
        document.getElementById( options.target ).appendChild( options.container );
      }


      // makes sure both processing.js and the gml player are loaded
      var readyCheck = setInterval(function() {

        if ( !processingLoaded ) {

          return;
        }

        clearInterval(readyCheck);
        Popcorn.getJSONP( "http://000000book.com/data/" + options.gmltag + ".json?callback=", function( data ) {

          new Processing( options.container, ajax( "gmlplayer.js" ) );
          options.pjsInstance = Processing.getInstanceById( 'canvas' + data.id );
          options.pjsInstance.construct( data, options );
          options._running && options.pjsInstance.loop();
        }, false );
      }, 5);
    },
    /**
*/
    start: function( event, options ) {

      options.pjsInstance && options.pjsInstance.loop();
      options.container.style.display = "block";
    },
    /**
*/
    end: function( event, options ) {

      options.pjsInstance && options.pjsInstance.noLoop();
      options.container.style.display = "none";
    }
  });
})( Popcorn );
