(function( window, Popcorn ) {

  var canPlayType = function( nodeName, url ) {
    return ( typeof url === "string" &&
             Popcorn.HTMLYouTubeVideoElement._canPlaySrc( url ) );
  };

  Popcorn.player( "youtube", {
    _canPlayType: canPlayType
  });

  Popcorn.youtube = function( container, url, options ) {
    if ( typeof console !== "undefined" && console.warn ) {
      console.warn( "Deprecated player 'youtube'. Please use Popcorn.HTMLYouTubeVideoElement directly." );
    }

    var media = Popcorn.HTMLYouTubeVideoElement( container ),
        popcorn = Popcorn( media, options );

    // Set the src "soon" but return popcorn instance first, so
    // the caller can listen for error events.
    setTimeout( function() {
      media.src = url;
    }, 0 );

    return popcorn;
  };

  Popcorn.youtube.canPlayType = canPlayType;

}( window, Popcorn ));
