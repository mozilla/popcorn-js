(function( window, Popcorn ) {

  Popcorn.player( "soundcloud", {
    _canPlayType: function( nodeName, url ) {
      return ( typeof url === "string" &&
               Popcorn.HTMLSoundCloudAudioElement._canPlaySrc( url ) &&
               nodeName.toLowerCase() !== "audio" );
    }
  });

  Popcorn.soundcloud = function( container, url, options ) {
    if ( typeof console !== "undefined" && console.warn ) {
      console.warn( "Deprecated player 'soundcloud'. Please use Popcorn.HTMLSoundCloudAudioElement directly." );
    }

    var media = Popcorn.HTMLSoundCloudAudioElement( container ),
        popcorn = Popcorn( media, options );

    // Set the src "soon" but return popcorn instance first, so
    // the caller can get get error events.
    setTimeout( function() {
      media.src = url;
    }, 0 );

    return popcorn;
  };

}( window, Popcorn ));
