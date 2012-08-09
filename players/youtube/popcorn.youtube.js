(function( window, Popcorn ) {

  Popcorn.player( "youtube", {
    _canPlayType: function( nodeName, url ) {
      return ( typeof url === "string" &&
               Popcorn.HTMLYouTubeVideoElement.canPlayType( url ) &&
               nodeName.toLowerCase() !== "video" );
    }
  });

  Popcorn.youtube = function( container, url, options ) {
    if ( typeof console !== "undefined" && console.warn ) {
      console.warn( "Deprecated player 'youtube'. Please use Popcorn.HTMLYouTubeVideoElement directly." );
    }

    var media = Popcorn.HTMLYouTubeVideoElement( container ),
        popcorn = Popcorn( media, options );

    // Set the src "soon" but return popcorn instance first, so
    // the caller can get get error events.
    setTimeout( function() { media.src = url; }, 0 );

    return popcorn;
  };
}( window, Popcorn ));
