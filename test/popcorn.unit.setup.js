if ( !window[ "console" ] ) {
  jQuery.getScript( "https://getfirebug.com/firebug-lite-debug.js" );
}

(function( global ) {

  //  Store the number of global properties that exist prior to Popcorn API definition
  var Setup = {
    hasRun: false,
    globalSize: 0,
    globalCache: [],
    globalDiff: []
  };

  Setup.getGlobalSize = function() {

    var size = 0, prop;

    for ( prop in window ) {
      if ( prop !== "_firebug" ) {
        size++;

        if ( !Setup.hasRun ) {
          Setup.globalCache.push( prop );
        } else {
          if ( Setup.globalCache.indexOf( prop ) === -1 ) {
            Setup.globalDiff.push( prop );
          }
        }
      }
    }

    //  account for self
    size++;

    //  Store the number of global properties internally
    if ( !Setup.globalSize ) {
      Setup.globalSize = size;
    }

    if ( !Setup.hasRun ) {
      Setup.hasRun = true;
    }

    return size;
  };

  Setup.eventset = "loadstart progress suspend emptied stalled play pause " +
                   "loadedmetadata loadeddata waiting playing canplay canplaythrough " +
                   "seeking seeked timeupdate ended ratechange durationchange volumechange";

  Setup.events = Setup.eventset.split(/\s+/g);

  global.Setup = Setup;

})( window );

Setup.getGlobalSize();