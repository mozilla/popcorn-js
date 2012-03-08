asyncTest( "Player play, pause, autoplay", function() {

  var count = 0,
      expects = 4,
      orderCheck1 = 0,
      orderCheck2 = 0,
      pop1, pop2, pop3, pop4;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {

      pop1.destroy();
      pop2.destroy();
      pop3.destroy();
      pop4.destroy();

      start();
    }
  }

  pop1 = Popcorn.youtube( "#video6", "http://www.youtube.com/watch?v=nfGV32RNkhw" );

  pop1.listen( "canplaythrough", function() {

    pop1.play();

    equal( pop1.media.paused, false, "popcorn 1 plays" );
    plus();
  });

  pop2 = Popcorn.youtube( "#video7", "http://www.youtube.com/watch?v=nfGV32RNkhw" );

  pop2.listen( "canplaythrough", function() {

    equal( pop2.media.paused, true, "popcorn 2 pauses" );
    plus();
  });

  pop3 = Popcorn.youtube( "#video8", "http://www.youtube.com/watch?v=nfGV32RNkhw&autoplay=0" );

  pop3.listen( "canplaythrough", function() {

    equal( pop3.media.paused, true, "popcorn 3 autoplay off paused" );
    plus();
  });

  pop4 = Popcorn.youtube( "#video9", "http://www.youtube.com/watch?v=nfGV32RNkhw&autoplay=1" );

  pop4.listen( "canplaythrough", function() {

    equal( pop4.media.paused, false, "popcorn 4 is autoplaying" );
    plus();
  });
});

asyncTest("Update Timer", function () {

  var p2 = Popcorn.youtube( '#video2', 'http://www.youtube.com/watch?v=nfGV32RNkhw' ),
      expects = 12,
      count   = 0,
      execCount = 0,
      // These make sure events are only fired once
      // any second call will produce a failed test
      forwardStart  = false,
      forwardEnd    = false,
      backwardStart = false,
      backwardEnd   = false,
      wrapperRunning = { one: false, two: false };

  function plus() {
    if ( ++count === expects ) {
      // clean up added events after tests
      Popcorn.removePlugin( "forwards" );
      Popcorn.removePlugin( "backwards" );
      Popcorn.removePlugin( "wrapper" );
      p2.removePlugin( "exec" );
      p2.destroy();
      start();
    }
  }

  Popcorn.plugin( "forwards", function () {
    return {
      start: function ( event, options ) {

        if ( !options.startFired ) {

          options.startFired = true;
          forwardStart = !forwardStart;
          ok( forwardStart, "forward's start fired" );
          plus();
        }
      },
      end: function ( event, options ) {

        if ( !options.endFired ) {

          options.endFired = true;
          forwardEnd = !forwardEnd;
          p2.currentTime(1).play();
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

  Popcorn.plugin( "backwards", function () {
    return {
      start: function ( event, options ) {

        if ( !options.startFired ) {

          options.startFired = true;
          backwardStart = !backwardStart;
          ok( true, "backward's start fired" );
          plus();
        }
      },
      end: function ( event, options ) {

        if ( !options.endFired ) {

          options.endFired = true;
          backwardEnd = !backwardEnd;
          ok( backwardEnd, "backward's end fired" );
          plus();
          p2.currentTime( 0 ).play();
        }
      }
    };
  });

  p2.backwards({
    start: 1,
    end: 2
  });

  Popcorn.plugin( "wrapper", {
    start: function ( event, options ) {

      wrapperRunning[ options.wrapper ] = true;
    },
    end: function ( event, options ) {

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
  .exec( 5, function() {

    if ( execCount === 0 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 5" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 5" );
      plus();
    }
  })
  // checking wrapper 1's start
  .exec( 6, function() {

    if ( execCount === 1 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 6" );
      plus();
      ok( wrapperRunning.one, "wrapper one is running at second 6" );
      plus();
    }
  })
  // checking wrapper 1's end
  .exec( 7, function() {

    if ( execCount === 2 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 7" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 7" );
      plus();
    }
  })
  // checking wrapper 2's end
  .exec( 8, function() {

    if ( execCount === 3 ) {

      execCount++;
      ok( !wrapperRunning.two, "wrapper two is stopped at second 9" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 9" );
      plus();
    }
  });

  p2.exec( 3, function() {

    p2.play();
  });

  p2.volume( 0 ).currentTime(3);

});

asyncTest("Plugin Factory", function () {

  var popped = Popcorn.youtube( '#video2', 'http://www.youtube.com/watch?v=nfGV32RNkhw' ),
      methods = "load play pause currentTime mute volume roundTime exec removePlugin",
      expects = 34, // 15*2+2+2. executor/complicator each do 15
      count = 0;

  function plus() {
    if ( ++count == expects ) {
      Popcorn.removePlugin("executor");
      Popcorn.removePlugin("complicator");
      popped.destroy();
      start();
    }
  }

  expect( expects );

  Popcorn.plugin("executor", function () {

    return {

      start: function () {
        var self = this;

        // These ensure that a popcorn instance is the value of `this` inside a plugin definition

        methods.split(/\s+/g).forEach(function (k,v) {
          ok( k in self, "executor instance has method: " + k );

          plus();
        });

        ok( "media" in this, "executor instance has `media` property" );
        plus();
        ok( typeof popped.media === "object", "video property is a HTML DIV element" );
        plus();

        ok( "data" in this, "executor instance has `data` property" );
        plus();
        ok( typeof popped.data === "object", "data property is an object" );
        plus();

        ok( "trackEvents" in this.data, "executor instance has `trackEvents` property" );
        plus();
        ok( typeof popped.data.trackEvents === "object", "executor trackEvents property is an object" );
        plus();
      },
      end: function () {

      }
    };

  });

  ok( "executor" in popped, "executor plugin is now available to instance" );
  plus();
  equal( Popcorn.registry.length, 1, "One item in the registry");
  plus();

  popped.executor({
    start: 1,
    end: 2
  });

  Popcorn.plugin("complicator", {

    start: function ( event ) {

      var self = this;

      // These ensure that a popcorn instance is the value of `this` inside a plugin definition

      methods.split(/\s+/g).forEach(function (k,v) {
        ok( k in self, "complicator instance has method: " + k );

        plus();
      });

      ok( "media" in this, "complicator instance has `media` property" );
      plus();
      ok( typeof popped.media === "object", "video property is a HTMLVideoElement" );
      plus();

      ok( "data" in this, "complicator instance has `data` property" );
      plus();
      ok( typeof popped.data === "object", "complicator data property is an object" );
      plus();

      ok( "trackEvents" in this.data, " complicatorinstance has `trackEvents` property" );
      plus();
      ok( typeof popped.data.trackEvents === "object", "complicator trackEvents property is an object" );
      plus();
    },
    end: function () {

      //start();

    },
    timeupdate: function () {
    }
  });

  ok( "complicator" in popped, "complicator plugin is now available to instance" );
  plus();
  equal( Popcorn.registry.length, 2, "Two items in the registry");
  plus();

  popped.complicator({
    start: 4,
    end: 5
  });

  popped.volume( 0 ).currentTime( 0 ).play();

});

asyncTest( "Popcorn YouTube Plugin Url and Duration Tests", function() {

  var count = 0,
      expects = 3,
      popcorn = Popcorn.youtube( '#video2', 'http://www.youtube.com/watch?v=nfGV32RNkhw' );

  function plus(){

    if ( ++count == expects ) {
      popcorn.destroy();
      start();
    }
  }

  expect( expects );

  equal( popcorn.media.id, 'video2', 'Video id set' );
  plus();

  popcorn.listen( "durationchange", function() {

    notEqual( popcorn.duration(), 0, "Duration has been changed from 0" );
    plus();

    popcorn.pause();
  });

  equal( popcorn.media.id, 'video2', 'Video id set' );
  plus();

  popcorn.volume( 0 ).play();
});

asyncTest( "Popcorn YouTube Plugin Url Regex Test", function() {

  var urlTests = [
    { name: 'standard',
      url: 'http://www.youtube.com/watch?v=nfGV32RNkhw',
      expected: 'http://www.youtube.com/watch?v=nfGV32RNkhw'
    },
    { name: 'share url',
      url: 'http://youtu.be/nfGV32RNkhw',
      expected: 'http://youtu.be/nfGV32RNkhw'
    },
    { name: 'long embed',
      url: 'http://www.youtube.com/embed/nfGV32RNkhw',
      expected: 'http://www.youtube.com/embed/nfGV32RNkhw'
    },
    { name: 'short embed 1 (e)',
      url: 'http://www.youtube.com/e/nfGV32RNkhw',
      expected: 'http://www.youtube.com/e/nfGV32RNkhw'
    },
    { name: 'short embed 2 (v)',
      url: 'http://www.youtube.com/v/nfGV32RNkhw',
      expected: 'http://www.youtube.com/v/nfGV32RNkhw'
    },
    { name: 'contains underscore',
      url: 'http://www.youtube.com/v/GP53b__h4ew',
      expected: 'http://www.youtube.com/v/GP53b__h4ew'
    }
  ];

  var count = 0,
      i = 11,
      expects = urlTests.length;

  expect( expects );

  Popcorn.forEach( urlTests, function( value, key ) {

    var urlTest = urlTests[ key ],
        popcorn = Popcorn.youtube( "#video" + i++, urlTest.url );

    popcorn.listen( "loadeddata", function() {

      equal( popcorn.media.src, urlTest.expected, "Video id is correct for " + urlTest.name + ": " + urlTest.url );
      popcorn.pause();

      popcorn.destroy();

      if ( ++count === expects ) {

        start();
      }
    }).volume( 0 );
  });
});

asyncTest( "Controls and Annotations toggling", function() {

  var count = 0,
      expects = 6,
      testTarget = "",
      targetDiv;

  function plus(){
    if ( ++count == expects ) {
      start();
    }
  }

  expect( expects );

  var popcorn1 = Popcorn.youtube( "#video", "http://www.youtube.com/watch?v=nfGV32RNkhw" );

  popcorn1.listen( "loadeddata", function() {
    
    targetDiv = document.getElementById( "video" );
    testTarget = targetDiv.querySelector( "object" ).getAttribute( "data-youtube-player" );

    popcorn1.volume( 0 );

    ok( !/controls/.test( testTarget ), "controls are defaulted to 1 ( displayed )" );
    plus();
    ok( !/iv_load_policy/.test( testTarget ), "annotations ( iv_load_policy ) are defaulted to ( enabled )" );
    plus();

    popcorn1.destroy();

    var popcorn2 = Popcorn.youtube( "#video", "http://www.youtube.com/watch?v=nfGV32RNkhw&controls=1&iv_load_policy=1" );
    popcorn2.listen( "loadeddata", function() {
      
      targetDiv = document.getElementById( "video" );
      testTarget = targetDiv.querySelector( "object" ).getAttribute( "data-youtube-player" );

      popcorn2.volume( 0 );

      ok( /controls=1/.test( testTarget ), "controls is set to 1 ( displayed )" );
      plus();
      ok( /iv_load_policy=1/.test( testTarget ), "annotations ( iv_load_policy ) is set to 1 ( enabled )" );
      plus();

      popcorn2.destroy();
      
      var popcorn3 = Popcorn.youtube( "#video", "http://www.youtube.com/watch?v=nfGV32RNkhw&controls=0&iv_load_policy=3" );
      popcorn3.listen( "loadeddata", function() {
        
        targetDiv = document.getElementById( "video" );
        testTarget = targetDiv.querySelector( "object" ).getAttribute( "data-youtube-player" );

        popcorn3.volume( 0 );

        ok( /controls=0/.test( testTarget ), "controls is set to 0 ( hidden )" );
        plus();
        ok( /iv_load_policy=3/.test( testTarget ), "annotations ( iv_load_policy ) is set to 3 ( hidden )" );
        plus();

        popcorn3.destroy();
      });
    });
  });
});

asyncTest( "Player height and width", function() {

  expect( 4 );

  var popcorn1 = Popcorn.youtube( "#video4", "http://www.youtube.com/watch?v=nfGV32RNkhw" ),
      popcorn2 = Popcorn.youtube( "#video5", "http://www.youtube.com/watch?v=nfGV32RNkhw" ),
      readyStatePoll = function() {

        if ( popcorn1.media.readyState !== 4 && popcorn2.media.readyState !== 4 ) {

          setTimeout( readyStatePoll, 10 );
        } else {

          equal( popcorn1.media.children[ 0 ].width, 560, "Youtube player default width is 560" );
          equal( popcorn1.media.children[ 0 ].height, 315, "Youtube player default height is 315" );

          equal( popcorn2.media.children[ 0 ].getAttribute( "width" ), 0, "Youtube player explicit width is 0" );
          equal( popcorn2.media.children[ 0 ].getAttribute( "height" ), 0, "Youtube player explicit height is 0" );

          popcorn1.destroy();
          popcorn2.destroy();
          start();
        }
      };

  popcorn1.volume( 0 );
  popcorn2.volume( 0 );

  readyStatePoll();
});

asyncTest( "Popcorn Youtube Plugin offsetHeight && offsetWidth Test", function() {

  var popped,
      elem,
      expects = 2,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {

      popped.destroy();
      start();
    }
  }

  popped = Popcorn.youtube( "#video6", "http://www.youtube.com/watch?v=nfGV32RNkhw" );

  var runner = function() {
    popped.volume( 0 );
    elem = document.querySelector( "div#video6 object" );
    equal( elem.height, popped.media.offsetHeight, "The media object is reporting the correct offsetHeight" );
    plus();
    equal( elem.width, popped.media.offsetWidth, "The media object is reporting the correct offsetWidth" );
    plus();
  };

  if ( popped.readyState >= 2 ) {
    runner();
  } else {
    popped.listen( "loadeddata", runner);
  }
});

asyncTest( "Player Errors", function() {

  expect( 1 );

  var pop = Popcorn.youtube( "#video4", "http://www.youtube.com/watch?v=abcdefghijk", {
    events: {
      error: function() {

        ok( true, "error trigger by invalid URL" );
        pop.destroy();
        start();
      }
    }
   });
});

asyncTest( "YouTube ended event", function() {

  expect( 1 );

  var pop = Popcorn.youtube( "#video10", "http://www.youtube.com/watch?v=nfGV32RNkhw" );

  pop.listen( "ended", function() {
    ok( true, "YouTube is successfully firing the ended event" );
    start();
  });
  pop.play( 150 );
});

asyncTest( "youtube player gets a proper _teardown", function() {
  
  var count = 0,
      expects = 1;

  function plus() {
    if ( ++count === expects ) {

      start();
    }
  }

  expect( expects );

  var popcorn = Popcorn.youtube( "#video9", "http://www.youtube.com/watch?v=nfGV32RNkhw" );
  popcorn.listen( "loadeddata", function() {

    popcorn.destroy();
    equal( popcorn.media.children.length, 0, "" );
    plus();
  });
});


asyncTest( "Youtube ready state events", function() {

  var popped,
      expects = 4,
      count = 0,
      state = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {

      start();
    }
  }

  expect( expects );

  var popcorn = Popcorn.youtube( "#video9", "http://www.youtube.com/watch?v=nfGV32RNkhw" );
  popcorn.listen( "loadeddata", function() {

    popcorn.destroy();
    equal( popcorn.media.children.length, 0, "" );
    plus();
  });

  popped = Popcorn.youtube( "#video6", "http://www.youtube.com/watch?v=nfGV32RNkhw", {
    events: {
      canplaythrough: function( e ) {

        equal( state++, 2, "canplaythrough fired first" );
        plus();
      },
      loadedmetadata: function( e ) {

        equal( state++, 0, "loadedmetadata fired third" );
        plus();
      },
      loadeddata: function( e ) {

        equal( state++, 1, "loadeddata fired last" );
        plus();
      },
    }
  });

});
