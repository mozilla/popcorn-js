
var testData = {

  videoSrc: "http://vimeo.com/12235444",
  expectedDuration: 382.502,

  createMedia: function( id ) {
    return Popcorn.HTMLVimeoVideoElement( id );
  },

  // We need to test Vimeo's URL params, which not all
  // wrappers mimic.  Do it as a set of tests specific
  // to Vimeo.
  playerSpecificAsyncTests: function() {

    asyncTest( "Vimeo 01 - autoplay, loop params", 4, function() {

      var video = testData.createMedia( "#video" );

      video.addEventListener( "loadedmetadata", function onLoadedMetadata() {
        video.removeEventListener( "loadedmetadata", onLoadedMetadata, false );
        equal( video.autoplay, true, "autoplay is set via param" );
        equal( video.loop, true, "loop is set via param" );
        start();
      }, false);

      equal( video.autoplay, false, "autoplay is initially false" );
      equal( video.loop, false, "loop is initially false" );

      video.src = testData.videoSrc + "?autoplay=1&loop=1";

    });

  },

  playerSpecificSyncTests: function() {

    // Testing the id property inherited from MediaElementProto
    test( "Vimeo 01 - id property accessible on wrapper object", 1, function() {

      var video = testData.createMedia( "#video" );

      ok( video.id, "id property on wrapper object isn't null" );
    });

    // Testing the style property inherited from MediaElementProto
    test( "Vimeo 02 - style property accessible on wrapper object", 1, function() {

      var video = testData.createMedia( "#video" );

      ok( video.style, "Style property on wrapper object isn't null" );
    });
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
