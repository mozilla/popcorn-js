
var testData = {

  videoSrc: "#t=,20",
  expectedDuration: 20,

  createMedia: function( id ) {
    return Popcorn.HTMLNullVideoElement( id );
  }

};
