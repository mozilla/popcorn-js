// Order matters, and async before sync
QUnit.config.reorder = false;

module( "Popcorn Player" );

test( "Base player methods", 4, function() {

  ok( Popcorn.player, "Popcorn.player function exists" );

  ok( Popcorn.smart, "Popcorn.smart function exists" );

  Popcorn.player( "newplayer" );
  ok( Popcorn.newplayer, "Popcorn.player registers new players" );
  ok( Popcorn.player.registry.newplayer, "newplayers enter Popcorn.player.registry" );

});

asyncTest( "Base player functionality", function() {

  Popcorn.player( "baseplayer" );

  var p2 = Popcorn.baseplayer( "#video" ),
      expects = 12,
      count = 0,
      cueCount = 0,
      // These make sure events are only fired once
      // any second call will produce a failed test
      forwardStart = false,
      forwardEnd = false,
      backwardStart = false,
      backwardEnd = false,
      wrapperRunning = {
        one: false,
        two: false
      };

  function plus() {
    if ( ++count === expects ) {
      // clean up added events after tests
      Popcorn.removePlugin( "forwards" );
      Popcorn.removePlugin( "backwards" );
      Popcorn.removePlugin( "wrapper" );
      p2.removePlugin( "cue" );
      start();
    }
  }

  Popcorn.plugin( "forwards", function() {
    return {
      start: function( event, options ) {

        if ( !options.startFired ) {

          options.startFired = true;
          forwardStart = !forwardStart;
          ok( forwardStart, "forward's start fired" );
          plus();
        }
      },
      end: function( event, options ) {

        if ( !options.endFired ) {

          options.endFired = true;
          forwardEnd = !forwardEnd;
          p2.currentTime( 1 ).play();
          ok( forwardEnd, "forward's end fired" );
          plus();
        }
      }
    };
  });

  p2.forwards({
    start: 3,
    end: 4
  });

  Popcorn.plugin( "backwards", function() {
    return {
      start: function( event, options ) {

        if ( !options.startFired ) {

          options.startFired = true;
          backwardStart = !backwardStart;
          p2.currentTime( 0 ).play();
          ok( true, "backward's start fired" );
          plus();
        }
      },
      end: function( event, options ) {

        if ( !options.endFired ) {

          options.endFired = true;
          backwardEnd = !backwardEnd;
          ok( backwardEnd, "backward's end fired" );
          plus();
          p2.currentTime( 5 ).play();
        }
      }
    };
  });

  p2.backwards({
    start: 1,
    end: 2
  });

  Popcorn.plugin( "wrapper", {
    start: function( event, options ) {

      wrapperRunning[ options.wrapper ] = true;
    },
    end: function( event, options ) {

      wrapperRunning[ options.wrapper ] = false;
    }
  });

  // second instance of wrapper is wrapping the first
  p2.wrapper({
    start: 6,
    end: 7,
    wrapper: "one"
  })
  .wrapper({
    start: 5,
    end: 8,
    wrapper: "two"
  })
  // checking wrapper 2's start
  .cue( 5, function() {

    if ( cueCount === 0 ) {

      cueCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 5" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 5" );
      plus();
    }
  })
  // checking wrapper 1's start
  .cue( 6, function() {

    if ( cueCount === 1 ) {

      cueCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 6" );
      plus();
      ok( wrapperRunning.one, "wrapper one is running at second 6" );
      plus();
    }
  })
  // checking wrapper 1's end
  .cue( 7, function() {

    if ( cueCount === 2 ) {

      cueCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 7" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 7" );
      plus();
    }
  })
  // checking wrapper 2's end
  .cue( 8, function() {

    if ( cueCount === 3 ) {

      cueCount++;
      ok( !wrapperRunning.two, "wrapper two is stopped at second 9" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 9" );
      plus();
    }
  });

  p2.currentTime( 3 ).play();
});

test( "player gets a proper _teardown", 1, function() {

  var teardownCalled = false;

  Popcorn.player( "teardownTester", {
    _teardown: function() {
      teardownCalled = true;
    }
  });

  var pop = Popcorn.teardownTester( "#video" );
  pop.destroy();

  equal( teardownCalled, true, "teardown function was called." );
});

asyncTest( "Popcorn.smart player selector", function() {

  var expects = 11,
      count = 0,
      timeout;

  function plus() {

    if ( ++count == expects ) {
      document.getElementById( "video" ).innerHTML = "";
      start();
    }
  }
  expect( expects );
  Popcorn.player( "spartaPlayer", {
    _canPlayType: function( nodeName, url ) {

      return url === "this is sparta" && nodeName !== "unsupported element";
    }
  });

  Popcorn.player( "neverEverLand" );

  // matching url to player returns true
  ok( Popcorn.spartaPlayer.canPlayType( "div", "this is sparta" ), "canPlayType method succeeds on valid url!" );
  plus();
  ok( Popcorn.spartaPlayer.canPlayType( "unsupported element", "this is sparta" ) === false, "canPlayType method fails on invalid container!" );
  plus();
  ok( !!Popcorn.smart( "#video", "this is sparta" ).media.nodeName, "A player was found for this URL" );
  plus();

  // invalid target throws meaningful error
  try {

    Popcorn.smart( "#non_existing_tag", "this is sparta" );
  } catch ( e ) {

    ok( true, "Popcorn.smart throws exception when target is invalid." );
    plus();
  }

  // not matching url to player returns false
  ok( Popcorn.spartaPlayer.canPlayType( "div", "this is not sparta" ) === false, "canPlayType method fails on invalid url!" );
  plus();
  ok( Popcorn.spartaPlayer.canPlayType( "video", "this is not sparta" ) === false, "canPlayType method fails on invalid url and invalid container!" );
  plus();

  var thisIsNotSparta = Popcorn.smart( "#video", "this is not sparta", {
    events: {
      error: function( e ) {

        clearTimeout( timeout );
        ok( true, "invalid player failed and called error callback" );
        plus();
      }
    }
  });

  // Safari won't pass this test, so we'll just skip it
  // https://bugs.webkit.org/show_bug.cgi?id=88423
  // https://webmademovies.lighthouseapp.com/projects/63272-popcornjs/tickets/1226
  timeout = setTimeout(function() {

    ok( true, "Workaround for Safari regression on error event with error callback test" );
    plus();
  }, 1000 );

  equal( thisIsNotSparta.media.nodeName, "VIDEO", "no player was found for this URL, default to video element" );
  plus();

  // no existing canPlayType function returns undefined
  ok( Popcorn.neverEverLand.canPlayType( "guessing time!", "is this sparta?" ) === undefined, "non exist canPlayType returns undefined" );
  plus();

  Popcorn.player( "somePlayer", {
    _canPlayType: function( nodeName, url ) {

      return url === "canPlayType";
    }
  });

  Popcorn.somePlayer( "#video", "canPlayType", {
    events: {
      canplaythrough: function( e ) {

        ok( true, "canPlayType passed on a valid type" );
        plus();
      }
    }
  }).destroy();

  Popcorn.somePlayer( "#video", "cantPlayType", {
    events: {
      error: function( e ) {

        ok( true, "canPlayType failed on an invalid type" );
        plus();
      }
    }
  }).destroy();

});

asyncTest( "Popcorn.smart - audio and video elements", function() {

  var expects = 2,
      count = 0,
      instanceDiv = document.getElementById( "video" ),
      p;

  function plus() {
    if ( ++count == expects ) {
      start();
    }
  }

  p = Popcorn.smart( "#video",  [ "../../test/italia.ogg", "../../test/silence.mp3" ] );
  equal( instanceDiv.children[ 0 ].nodeName, "VIDEO", "Smart player correctly creates HTML5 media elements" );
  instanceDiv.innerHTML = "";
  p.destroy();
  plus();

  p = Popcorn.smart( "#video", "../../test/trailer.ogv" );
  equal( instanceDiv.children[ 0 ].nodeName, "VIDEO", "Smart player correctly creates video elements" );
  p.destroy();
  plus();

});

asyncTest( "Popcorn.smart - controls off by default as per spec", function() {
  var p1 = Popcorn.smart( "#videoControls", "../../test/trailer.ogv" );

  ok( !p1.controls(), "Video Element has no controls" );
  start();
});

asyncTest( "Popcorn.smart - YouTube wrapper", 1, function() {
  var src = "http://www.youtube.com/watch/?v=nfGV32RNkhw",
    p1 = Popcorn.smart( "#video", src );

  p1.on( "loadedmetadata", function() {
    equal( p1.media.src, src, "Popcorn.smart correctly uses YouTube Wrapper" );
    start();
  });
});

asyncTest( "Popcorn.smart - Vimeo wrapper", 1, function() {

  var src = "http://vimeo.com/12235444",
    p1 = Popcorn.smart( "#video", src );

  p1.on( "loadedmetadata", function() {
    equal( p1.media.currentSrc, src, "Popcorn.smart correctly uses Vimeo Wrapper" );
    start();
  });
});

asyncTest( "Popcorn.smart - Null Video wrapper", 1, function() {

  var src = "#t=,100",
    p1 = Popcorn.smart( "#video", src );

  p1.on( "loadedmetadata", function() {
    equal( p1.media.currentSrc, src, "Popcorn.smart correctly uses Null Video Wrapper" );
    start();
  });
});
