asyncTest( "Options Check", function() {

  expect( 7 );
  var varz = {
      title: 0,
      byline: 0,
      portrait:0,
      autoplay:1,
      loop:1,
      color: "FFAADD",
      fullscreen: 0
    },
    p2 = Popcorn.vimeo( "#player_1", "http://vimeo.com/11336811", varz );

  p2.listen( "loadeddata", function() {
    var flashvars = $( 'param[name="flashvars"]' ).attr( "value" );

    var splitvars = flashvars.split( "&" );

    for ( var i = 0, len = splitvars.length; i < len; i++ ) {
      var item = splitvars[ i ].split( "=" );
      if ( varz.hasOwnProperty( item[ 0 ] ) ) {
        equal( varz[ item[ 0 ] ], item[ 1 ], item[ 0 ] + " is the expected value" );
      }
    }

    start();
  });

});

asyncTest( "Update Timer", function() {

  var p2 = Popcorn.vimeo( "#player_1", "http://player.vimeo.com/video/11336811" ),
      expects = 16,
      count = 0,
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
      p2.pause();
      start();
    }
  }

  p2.listen( "canplaythrough", function() {
    p2.unlisten( "canplaythrough" );
    ok( true, "'canplaythrough' fired" );
    plus();
  });

  p2.listen( "loadedmetadata", function() {
    p2.unlisten( "loadedmetadata" );
    ok( true, "'loadedmetadata' fired" );
    plus();
  });

  p2.listen( "durationchange", function() {
    p2.unlisten( "durationchange" );
    ok( true, "'durationchange' fired" );
    plus();
  });

  p2.listen( "loadeddata", function() {
    p2.unlisten( "loadeddata" );
    ok( true, "'loadeddata' fired" );
    plus();
  });

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

asyncTest( "Plugin Factory", function() {

  var popped = Popcorn.vimeo( "#player_1", "http://player.vimeo.com/video/11336811" ),
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
      end: function() {

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
    end: function() {

    },
    timeupdate: function() {

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

  popped.currentTime( 0 ).play();

});

asyncTest( "Popcorn vimeo Plugin Url and Duration Tests", function() {
  function plus() {
    if ( ++count == expects ) {
      popcorn.pause();
      start();
    }
  }

  var count = 0,
      expects = 3,
      popcorn = Popcorn.vimeo( "#player_1", "http://player.vimeo.com/video/11336811" );

  expect( expects );

  equal( popcorn.media.id, "player_1", "Video id set" );
  plus();

  equal( popcorn.duration(), 0, "Duration starts as 0");
  plus();

  popcorn.listen( "durationchange", function() {
    notEqual( popcorn.duration(), 0, "Duration has been changed from 0" );
    plus();

    popcorn.pause();
  });

  popcorn.play();
});

asyncTest( "Popcorn vimeo Plugin Url Regex Test", function() {

  var urlTests = [
    { name: "standard",
      url: "http://player.vimeo.com/video/11336811",
      expected: "http://player.vimeo.com/video/11336811"
    },
    { name: "short url",
      url: "http://vimeo.com/11336811",
      expected: "http://vimeo.com/11336811"
    }
  ];

  var count = 0,
      expects = urlTests.length;

  expect( expects );

  Popcorn.forEach( urlTests, function( values, key ) {

    var urlTest = urlTests[ key ],
        popcorn = Popcorn.vimeo( "#player_2", urlTest.url );

    popcorn.listen( "loadeddata", function() {

      equal( popcorn.media.src, urlTest.expected, "Video id is correct for " + urlTest.name + ": " + urlTest.url );
      popcorn.pause();

      count++;
      if ( count === expects ) {

        start();
        popcorn.pause();
      }
    });
  });
});

asyncTest( "Popcorn Vimeo Plugin offsetHeight && offsetWidth Test", function() {

  var popped,
      elem,
      expects = 2,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  popped = Popcorn.vimeo( "#player_3", "http://player.vimeo.com/video/11336811" );

  popped.listen( "loadeddata", function() {
    elem = document.querySelector( "div#player_3 object" );
    equal( elem.height, popped.media.childNodes[0].offsetHeight, "The media object is reporting the correct offsetHeight" );
    plus();
    equal( elem.width, popped.media.childNodes[0].offsetWidth, "The media object is reporting the correct offsetWidth" );
    plus();
  });

});
