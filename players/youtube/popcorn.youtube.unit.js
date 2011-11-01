test("Update Timer", function () {

  QUnit.reset();

  var p2 = Popcorn.youtube( '#video2', 'http://www.youtube.com/watch?v=9oar9glUCL0' ),
      expects = 12,
      count   = 0,
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
      start();
    }
  }

  // These tests come close to 10 seconds on chrome, increasing to 15
  stop();

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

  p2.currentTime(3);

});

test("Plugin Factory", function () {

  QUnit.reset();

  var popped = Popcorn.youtube( '#video2', 'http://www.youtube.com/watch?v=9oar9glUCL0' ),
      methods = "load play pause currentTime mute volume roundTime exec removePlugin",
      expects = 34, // 15*2+2+2. executor/complicator each do 15
      count = 0;

  function plus() {
    if ( ++count == expects ) {
      Popcorn.removePlugin("executor");
      Popcorn.removePlugin("complicator");
      start();
    }
  }

  expect( expects );
  stop( 15000 );

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
        ok( Object.prototype.toString.call(popped.media) === "[object Object]", "video property is a HTML DIV element" );
        plus();

        ok( "data" in this, "executor instance has `data` property" );
        plus();
        ok( Object.prototype.toString.call(popped.data) === "[object Object]", "data property is an object" );
        plus();

        ok( "trackEvents" in this.data, "executor instance has `trackEvents` property" );
        plus();
        ok( Object.prototype.toString.call(popped.data.trackEvents) === "[object Object]", "executor trackEvents property is an object" )
        plus();
      },
      end: function () {

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
      ok( Object.prototype.toString.call(popped.media) === "[object Object]", "video property is a HTMLVideoElement" );
      plus();

      ok( "data" in this, "complicator instance has `data` property" );
      plus();
      ok( Object.prototype.toString.call(popped.data) === "[object Object]", "complicator data property is an object" );
      plus();

      ok( "trackEvents" in this.data, " complicatorinstance has `trackEvents` property" );
      plus();
      ok( Object.prototype.toString.call(popped.data.trackEvents) === "[object Object]", "complicator trackEvents property is an object" )
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
  equals( Popcorn.registry.length, 2, "Two items in the registry");
  plus();

  popped.complicator({
    start: 4,
    end: 5
  });

  popped.currentTime(0).play();

});

test( "Popcorn YouTube Plugin Url and Duration Tests", function() {
  function plus(){
    if ( ++count == expects ) {
      start();
    }
  }

  QUnit.reset();

  var count = 0,
      expects = 3,
      popcorn = Popcorn.youtube( '#video2', 'http://www.youtube.com/watch?v=9oar9glUCL0' );

  expect( expects );
  stop( 10000 );

  equals( popcorn.media.id, 'video2', 'Video id set' );
  plus();

  equals( popcorn.duration(), 0, 'Duration starts as 0');
  plus();

  popcorn.listen( "durationchange", function() {
    notEqual( popcorn.duration(), 0, "Duration has been changed from 0" );
    plus();

    popcorn.pause();
  });

  popcorn.play();
});

test( "Popcorn YouTube Plugin Url Regex Test", function() {

  QUnit.reset();

  var urlTests = [
    { name: 'standard',
      url: 'http://www.youtube.com/watch?v=9oar9glUCL0',
      expected: 'http://www.youtube.com/watch?v=9oar9glUCL0',
    },
    { name: 'share url',
      url: 'http://youtu.be/9oar9glUCL0',
      expected: 'http://youtu.be/9oar9glUCL0',
    },
    { name: 'long embed',
      url: 'http://www.youtube.com/embed/9oar9glUCL0',
      expected: 'http://www.youtube.com/embed/9oar9glUCL0',
    },
    { name: 'short embed 1 (e)',
      url: 'http://www.youtube.com/e/9oar9glUCL0',
      expected: 'http://www.youtube.com/e/9oar9glUCL0',
    },
    { name: 'short embed 2 (v)',
      url: 'http://www.youtube.com/v/9oar9glUCL0',
      expected: 'http://www.youtube.com/v/9oar9glUCL0',
    },
    { name: 'contains underscore',
      url: 'http://www.youtube.com/v/GP53b__h4ew',
      expected: 'http://www.youtube.com/v/GP53b__h4ew',
    },
  ];

  var count = 0,
      expects = urlTests.length;

  expect( expects );
  stop( 10000 );

  Popcorn.forEach( urlTests, function( valuse, key ) {

    var urlTest = urlTests[ key ],
        popcorn = Popcorn.youtube( '#video3', urlTest.url );

    popcorn.listen( "loadeddata", function() {

      equals( popcorn.media.src, urlTest.expected, 'Video id is correct for ' + urlTest.name + ': ' + urlTest.url );
      popcorn.pause();

      count++;
      if ( count === expects ) {

        start();
      }
    });
  });
});

test( "Controls and Annotations toggling", function() {

  QUnit.reset();

  expect( 6 );

  var popcorn = Popcorn.youtube( "#video", "http://www.youtube.com/watch?v=9oar9glUCL0" ),
      targetDiv = document.getElementById( "video" );
      testTarget = targetDiv.querySelector( "object" ).data;

  ok( !/controls/.test( testTarget ), "controls are defaulted to 1 ( displayed )" );
  ok( !/iv_load_policy/.test( testTarget ), "annotations ( iv_load_policy ) are defaulted to ( enabled )" );

  targetDiv.innerHTML = "";

  popcorn = Popcorn.youtube( "#video", "http://www.youtube.com/watch?v=9oar9glUCL0&controls=1&iv_load_policy=1" );

  testTarget = targetDiv.querySelector( "object" ).data;
  ok( /controls=1/.test( testTarget ), "controls is set to 1 ( displayed )" );
  ok( /iv_load_policy=1/.test( testTarget ), "annotations ( iv_load_policy ) is set to 1 ( enabled )" );

  targetDiv.innerHTML = "";

  popcorn = Popcorn.youtube( "#video", "http://www.youtube.com/watch?v=9oar9glUCL0&controls=0&iv_load_policy=3" );
  testTarget = targetDiv.querySelector( "object" ).data;
  ok( /controls=0/.test( testTarget ), "controls is set to 0 ( hidden )" );
  ok( /iv_load_policy=3/.test( testTarget ), "annotations ( iv_load_policy ) is set to 3 ( hidden )" );

});

test( "Player height and width", function() {

  QUnit.reset();

  expect( 4 );

  stop( 10000 );
  var popcorn1 = Popcorn.youtube( "#video4", "http://www.youtube.com/watch?v=9oar9glUCL0" ),
      popcorn2 = Popcorn.youtube( "#video5", "http://www.youtube.com/watch?v=9oar9glUCL0" ),
      readyStatePoll = function() {

        if ( popcorn1.media.readyState !== 4 && popcorn2.media.readyState !== 4 ) {

          setTimeout( readyStatePoll, 10 );
        } else {

          equal( popcorn1.media.children[ 0 ].width, 560, "Youtube player default width is 560" );
          equal( popcorn1.media.children[ 0 ].height, 315, "Youtube player default height is 315" );

          equal( popcorn2.media.children[ 0 ].width, 0, "Youtube player explicit width is 0" );
          equal( popcorn2.media.children[ 0 ].height, 0, "Youtube player explicit height is 0" );
          start();
        }
      };

  readyStatePoll();
});

