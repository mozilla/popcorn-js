/**
 * The HTMLVideoElement and HTMLAudioElement are wrapped media elements
 * that are created within a DIV, and forward their properties and methods
 * to a wrapped object.
 */
(function( Popcorn, document ) {

  function wrapMedia( id, mediaType ) {
    var parent = typeof id === "string" ? document.querySelector( id ) : id,
      media = document.createElement( mediaType );

    parent.appendChild( media );
    return media;
  }

  Popcorn.HTMLVideoElement = function( id ) {
    return wrapMedia( id, "video" );
  };

  Popcorn.HTMLAudioElement = function( id ) {
    return wrapMedia( id, "audio" );
  };

}( Popcorn, window.document ));
