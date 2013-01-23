
var testData = {

  videoSrc: "http://www.youtube.com/watch/?v=nfGV32RNkhw",
  expectedDuration: 151,

  createMedia: function( id ) {
    return Popcorn.HTMLYouTubeVideoElement( id );
  },

  // We need to test YouTube's URL params, which not all
  // wrappers mimic.  Do it as a set of tests specific
  // to YouTube.
  playerSpecificAsyncTests: function() {

    asyncTest( "YouTube 01 - autoplay, loop params", 4, function() {

      var video = testData.createMedia( "#video" );

      video.addEventListener( "loadedmetadata", function onLoadedMetadata() {
        video.removeEventListener( "loadedmetadata", onLoadedMetadata, false );
        equal( video.autoplay, true, "autoplay is set via param" );
        equal( video.loop, true, "loop is set via param" );
        start();
      }, false);

      equal( video.autoplay, false, "autoplay is initially false" );
      equal( video.loop, false, "loop is initially false" );

      video.src = testData.videoSrc + "&autoplay=1&loop=1";

    });

    asyncTest( "YouTube 02 - _canPlaySrc", 6, function() {

      ok( Popcorn.HTMLYouTubeVideoElement._canPlaySrc( "http://youtube.com/watch/v/6v3jsVivU6U?format=json" ), "youtube can play url in this format: http://youtube.com/watch/v/6v3jsVivU6U?format=json" );
      ok( Popcorn.HTMLYouTubeVideoElement._canPlaySrc( "http://www.youtube.com/v/M3r2XDceM6A&amp;fs=1" ), "youtube can play url in this format: http://www.youtube.com/v/M3r2XDceM6A&amp;fs=1" );
      ok( Popcorn.HTMLYouTubeVideoElement._canPlaySrc( "youtube.com/v/M3r2XDceM6A&fs=1" ), "youtube can play url in this format: youtube.com/v/M3r2XDceM6A&fs=1" );
      ok( Popcorn.HTMLYouTubeVideoElement._canPlaySrc( "www.youtube.com/v/M3r2XDceM6A&amp;fs=1" ), "youtube can play url in this format: www.youtube.com/v/M3r2XDceM6A&amp;fs=1" );
      ok( !Popcorn.HTMLYouTubeVideoElement._canPlaySrc( "http://www.youtube.com" ), "Youtube can't play http://www.youtube.com without a video id" );
      ok( !Popcorn.HTMLYouTubeVideoElement._canPlaySrc( "www.youtube.com" ), "Youtube can't play www.youtube.com without a video id" );
      start();
    });

  }
};

// YouTube tends to fail when the iframes live in the qunit-fixture
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
