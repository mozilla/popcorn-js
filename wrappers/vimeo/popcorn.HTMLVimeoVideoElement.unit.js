
var testData = {

  videoSrc: "http://vimeo.com/12235444",
  expectedDuration: 383,

  createMedia: function( id ) {
    return Popcorn.HTMLVimeoVideoElement( id );
  }

};

// Vimeo tends to fail when the iframes live in the qunit-fixture
// div. Simulate the same effect by deleting all iframes under #video
// after each test ends.
var qunitStart = start;
start = function() {
  // Give the video time to finish loading so callbacks don't throw
  setTimeout( function() {
    qunitStart();
    var video = document.querySelector( "#video" );
    while( video.hasChildNodes() ) {
      video.removeChild( video.lastChild );
    }
  }, 500 );
};
