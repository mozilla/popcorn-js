asyncTest( "Popcorn MediaSpawner Plugin", 6, function() {

  var popped = Popcorn( "#video" ),
      eventId,
      youtubediv = document.getElementById( "youtubediv" );

  ok ( "mediaspawner" in popped, "mediaspawner is a method of the popped instance" );

  popped.mediaspawner({
    source: "http://www.youtube.com/watch?v=CXDstfD9eJ0",
    target: "youtubediv",
    start: 1,
    end: 7,
    caption: "This is a test. We are assuming control. We are assuming control.",
    autoplay: true
  })
  .mediaspawner({
    source: [
      "../../test/italia.ogg",
      "../../test/italia.mp4"
    ],
    target: "html5audio",
    start: 1,
    end: 5,
    caption: "This is a test. We are assuming control. We are assuming control.<br/>"
  })
  .mediaspawner({
    source: [
      "../../test/trailer.mp4",
      "../../test/trailer.ogv"
    ],
    target: "html5video",
    start: 1,
    end: 6,
    caption: "This is a test. We are assuming control. We are assuming control.<br/>"
  })
  .volume( 0 )
  .play();

  eventId = popped.getLastTrackEventId();

  popped.cue( 3, function() {
    // Checks display style is set correctly on startup
    equal( youtubediv.style.display , "", "youtubediv is visible on the page with \"\" display style" );
  });

  // Simply checking if the HTML is present in the div
  popped.cue( 4, function() {
    // Checks if youtubediv has content at specific time
    ok( document.getElementById( "youtubediv" ).innerHTML, "youtubediv is not empty at 0:04 (expected)" );
    // Checks if html5video has content at specific time
    ok( document.getElementById( "html5video" ).innerHTML, "html5video is not empty at 0:04 (expected)" );
    // Checks if html5audio has content at specific time
    ok( document.getElementById( "html5audio" ).innerHTML, "html5audio is not empty at 0:04 (expected)" );
  });

  popped.cue( 5, function() {
    // Checks if the Text Blog Post was successfully destroyed with _teardown
    popped.pause().removeTrackEvent( eventId );
    ok( !document.getElementById( "html5video" ).innerHTML, "html5video type from mediaspawner plugin was properly destroyed" );
    popped.play();
  });

  popped.cue( 6, function() {
    var youtubeInstance = popped.data.running.mediaspawner[ 0 ];
    ok( !youtubeInstance.paused, "Youtube Video is autoplaying" );

    start();
  });
});

asyncTest( "Test Initialized MediaSpawner Blocks throwing Errors", 4, function() {

  Popcorn.plugin.debug = true;

  var pop = Popcorn( "#video" );

  // Tests for thrown Error on emtpy block
  try {
    pop.mediaspawner({});
  } catch( e ) {
    ok( true, "Empty plugin was caught by debugger" );
  }

  // Tests for thrown Error on no media source
  try {
    pop.mediaspawner({
      target: "testsdiv",
      start: 1,
      end: 5
    });
  } catch( e ) {
    ok( true, "No media source successfully caught." );
  }

  // Test for error thrown on no target container
  try {
    pop.mediaspawner({
      source: "http://player.vimeo.com/video/6960892",
      start: 1,
      end: 5
    });
  } catch( e ) {
    ok( true, "No target container specified." );
  }
});

asyncTest( "Overriding default toString", 2, function() {
  var p = Popcorn( "#video" ),
      sourceText = "http://www.youtube.com/watch?v=B-N1yJyrQRY",
      lastEvent;

  function testLastEvent( compareText, message ) {
    lastEvent = p.getTrackEvent( p.getLastTrackEventId() );
    equal( lastEvent.toString(), compareText, message );
  }

  p.mediaspawner({
    source: sourceText 
  });
  testLastEvent( sourceText, "Custom text displayed with toString" );

  p.mediaspawner({});
  testLastEvent( "http://www.youtube.com/watch?v=CXDstfD9eJ0", "Custom text displayed with toString using default" );

  start();
});
