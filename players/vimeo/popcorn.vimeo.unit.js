test( "Update Timer", function() {

  QUnit.reset();

  var p2 = Popcorn.vimeo( "#player_1", "http://player.vimeo.com/video/6960892" ),
      expects = 12,
      count = 0,
      execCount = 0,
      // These make sure events are only fired once
      // any second call will produce a failed test
      forwardStart  = false,
      forwardEnd    = false,
      backwardStart = false,
      backwardEnd   = false,
      wrapperRunning = { one: false, two: false, };

  function plus() {
    if ( ++count === expects ) {
      // clean up added events after tests
      Popcorn.removePlugin( "forwards" );
      Popcorn.removePlugin( "backwards" );
      Popcorn.removePlugin( "wrapper" );
      p2.removePlugin( "exec" );
      p2.pause();
      start();
    }
  }

  // These tests come close to 10 seconds on chrome, increasing to 15
  stop();

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

  p2.currentTime( 3 );

});

test( "Plugin Factory", function() {

  QUnit.reset();

  var popped = Popcorn.vimeo( "#player_1", "http://player.vimeo.com/video/6960892" ),
      methods = "load play pause currentTime mute volume roundTime exec removePlugin",

      // 15*2+2+2. executor/complicator each do 15
      expects = 34,
      count = 0;

  function plus() {
    if ( ++count == expects ) {
      Popcorn.removePlugin( "executor" );
      Popcorn.removePlugin( "complicator" );
      popped.pause();
      start();
    }
  }

  expect( expects );
  stop( 15000 );

  Popcorn.plugin( "executor", function() {

    return {

      start: function() {
        var self = this;

        // These ensure that a popcorn instance is the value of `this` inside a plugin definition

        methods.split( /\s+/g ).forEach( function( k, v ) {
          ok( k in self, "executor instance has method: " + k );

          plus();
        });

        ok( "media" in this, "executor instance has `media` property" );
        plus();
        ok( Object.prototype.toString.call( popped.media ) === "[object Object]", "video property is a HTML DIV element" );
        plus();

        ok( "data" in this, "executor instance has `data` property" );
        plus();
        ok( Object.prototype.toString.call( popped.data ) === "[object Object]", "data property is an object" );
        plus();

        ok( "trackEvents" in this.data, "executor instance has `trackEvents` property" );
        plus();
        ok( Object.prototype.toString.call( popped.data.trackEvents ) === "[object Object]", "executor trackEvents property is an object" )
        plus();
      },
      end: function() {

      }
    };

  });

  ok( "executor" in popped, "executor plugin is now available to instance" );
  plus();
  equals( Popcorn.registry.length, 1, "One item in the registry");
  plus();

  popped.executor({
    start: 1,
    end: 2
  });

  Popcorn.plugin( "complicator", {

    start: function( event ) {

      var self = this;

      // These ensure that a popcorn instance is the value of `this` inside a plugin definition

      methods.split( /\s+/g ).forEach( function( k, v ) {
        ok( k in self, "complicator instance has method: " + k );

        plus();
      });

      ok( "media" in this, "complicator instance has `media` property" );
      plus();
      ok( Object.prototype.toString.call( popped.media ) === "[object Object]", "video property is a HTMLVideoElement" );
      plus();

      ok( "data" in this, "complicator instance has `data` property" );
      plus();
      ok( Object.prototype.toString.call( popped.data ) === "[object Object]", "complicator data property is an object" );
      plus();

      ok( "trackEvents" in this.data, " complicatorinstance has `trackEvents` property" );
      plus();
      ok( Object.prototype.toString.call( popped.data.trackEvents ) === "[object Object]", "complicator trackEvents property is an object" )
      plus();
    },
    end: function() {

    },
    timeupdate: function() {

    }
  });

  ok( "complicator" in popped, "complicator plugin is now available to instance" );
  plus();
  equals( Popcorn.registry.length, 2, "Two items in the registry");
  plus();

  popped.complicator({
    start: 4,
    end: 5
  });

  popped.currentTime( 0 ).play();

});

test( "Popcorn vimeo Plugin Url and Duration Tests", function() {
  function plus() {
    if ( ++count == expects ) {
      popcorn.pause();
      start();
    }
  }

  QUnit.reset();

  var count = 0,
      expects = 3,
      popcorn = Popcorn.vimeo( "#player_1", "http://player.vimeo.com/video/6960892" );

  expect( expects );
  stop( 10000 );

  equals( popcorn.media.id, "player_1", "Video id set" );
  plus();

  equals( popcorn.duration(), 0, "Duration starts as 0");
  plus();

  popcorn.listen( "durationchange", function() {
    notEqual( popcorn.duration(), 0, "Duration has been changed from 0" );
    plus();

    popcorn.pause();
  });

  popcorn.play();
});

test( "Popcorn vimeo Plugin Url Regex Test", function() {

  QUnit.reset();

  var urlTests = [
    { name: "standard",
      url: "http://player.vimeo.com/video/6960892",
      expected: "http://player.vimeo.com/video/6960892",
    },
    { name: "short url",
      url: "http://vimeo.com/6960892",
      expected: "http://vimeo.com/6960892",
    }
  ];

  var count = 0,
      expects = urlTests.length;

  expect( expects );
  stop( 10000 );

  Popcorn.forEach( urlTests, function( values, key ) {

    var urlTest = urlTests[ key ],
        popcorn = Popcorn.vimeo( "#player_2", urlTest.url );

    popcorn.listen( "loadeddata", function() {

      equals( popcorn.media.src, urlTest.expected, "Video id is correct for " + urlTest.name + ": " + urlTest.url );
      popcorn.pause();

      count++;
      if ( count === expects ) {

        start();
        popcorn.pause();
      }
    });
  });
});
