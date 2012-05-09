asyncTest( "Popcorn MediaSpawner Plugin", 6, function() {

  var popped = Popcorn( "#video" ),
      eventId,
      youtubediv = document.getElementById( "youtubediv" );

  ok ( "mediaspawner" in popped, "mediaspawner is a method of the popped instance" );

  popped.mediaspawner({
    source: "http://www.youtube.com/watch?v=CXDstfD9eJ0",
    target: "youtubediv",
    start: 1,
    end: 5,
    caption: "This is a test. We are assuming control. We are assuming control."
  })
  .mediaspawner({
    source: {
      controls: "controls",
      type: "audio",
      sources: {
        ogg: {
          src: "../../test/italia.ogg",
          type: "audio/ogg"
        },
        mp4: {
          src: "../../test/italia.mp4",
          type: "audio/mpeg"
        }
      }
    },
    target: "html5audio",
    start: 1,
    end: 5,
    caption: "This is a test. We are assuming control. We are assuming control.<br/>"
  })
  .mediaspawner({
    source: {
      poster: "../../test/poster.png",
      controls: "controls",
      type: "video",
      sources: {
        mp4: {
          id: "mp4",
          src: "../../test/trailer.mp4",
          type: "video/mp4;",
          codecs: "avc1, mp4a"
        },
        ogv: {
          id: "ogv",
          src: "../../test/trailer.ogv",
          type: "video/ogg;",
          codecs: "theora, vorbis"
        }
      }
    },
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

  try {
    pop.mediaspawner({
      source: {
        poster: "../../test/poster.png",
        controls: "controls",
        type: "videe",
        sources: {
          mp4: {
            id: "mp4",
            src: "../../test/trailer.mp4",
            type: "video/mp4;",
            codecs: "avc1, mp4a"
          }
        }
      },
      target: "mediaspawnerdiv",
      start: 1,
      end: 5,
      caption: "This is a test. We are assuming control. We are assuming control.<br/>",
      autoplay: true
    });
  } catch( e ) {
    ok( true, "Invalid HTML Media type specified caught" );
    start();
  }

});
