(function( window, Popcorn ) {

  Popcorn.player( "youtube", {
    _canPlayType: function( nodeName, url ) {

      return typeof url === "string" && Popcorn.HTMLYouTubeVideoElement.canPlayType( url ) && nodeName.toLowerCase() !== "video";
    }
  });

  Popcorn.youtube = function( container, url, options ) {

    var media = Popcorn.HTMLYouTubeVideoElement( container );
    media.src = url;
    return Popcorn( media, options );
  };
}( window, Popcorn ));
