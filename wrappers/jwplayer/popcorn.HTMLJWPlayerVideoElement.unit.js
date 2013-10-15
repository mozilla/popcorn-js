
var testData = {

  videoSrc: "../../test/trailer.mp4",
  expectedDuration: 64.544,

  createMedia: function( id ) {
    return Popcorn.HTMLJWPlayerVideoElement( id );
  }
};
