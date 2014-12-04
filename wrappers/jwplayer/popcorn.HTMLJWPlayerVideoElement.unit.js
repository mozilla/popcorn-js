
var testData = {

  videoSrc: "../../test/trailer.mp4",
  expectedDuration: 64.544,

  createMedia: function( id ) {
    pop = Popcorn.HTMLJWPlayerVideoElement( id );
    pop.autoplay = true;
    return pop;
  }
};
