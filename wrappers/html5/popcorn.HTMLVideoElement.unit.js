
// Find a suitable video source for this browser.
var videoSource = (function() {

  var v = document.createElement( "video" ),
    sources = [
      {
        type: "video/webm",
        file: "../../test/trailer.webm"
      },
      {
        type: "video/mp4",
        file: "../../test/trailer.mp4"
      },
      {
        type: "video/ogg",
        file: "../../test/trailer.ogv"
      }
    ],
    source,
    sourcesLength = sources.length;

  while( sourcesLength-- ) {
    source = sources[ sourcesLength ];
    if( v.canPlayType( source.type ) !== "" ) {
      return source;
    }
  }

  throw "No Supported Media Types found for this browser.";

}());


var testData = {

  videoSrc: videoSource.file,
  videoType: videoSource.type,
  expectedDuration: 64.544,

  createMedia: function( id ) {
    return Popcorn.HTMLVideoElement( id );
  }

};
