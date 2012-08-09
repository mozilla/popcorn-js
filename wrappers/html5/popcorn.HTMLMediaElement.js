/**
 * The HTMLVideoElement and HTMLAudioElement are wrapped media elements
 * that are created within a DIV, and forward their properties and methods
 * to a wrapped object.
 */
(function( Popcorn, document ) {

  function canPlaySrc( src ) {
    // We can't really know based on URL.
    return "maybe";
  }

  function wrapMedia( id, mediaType ) {
    var parent = typeof id === "string" ? document.querySelector( id ) : id,
      media = document.createElement( mediaType );

    parent.appendChild( media );

    // Add the helper function _canPlaySrc so this works like other wrappers.
    media._canPlaySrc = canPlaySrc;

    return media;
  }

  Popcorn.HTMLVideoElement = function( id ) {
    return wrapMedia( id, "video" );
  };
  Popcorn.HTMLVideoElement._canPlaySrc = canPlaySrc;


  Popcorn.HTMLAudioElement = function( id ) {
    return wrapMedia( id, "audio" );
  };
  Popcorn.HTMLAudioElement._canPlaySrc = canPlaySrc;

}( Popcorn, window.document ));
