(function( Popcorn ) {

  var setupCalled = 0,
      startCalled = 0,
      endCalled = 0;

  Popcorn.plugin( "footnote", function( options ) {
    return {
      _setup: function() {
          setupCalled++;
        },
      start: function() {
        startCalled++;
      },
      end: function() {
        endCalled++;
      }
    };
  });

  Popcorn.plugin( "googlemap", function( options ) {
    return {
      _setup: function() {
        setupCalled++;
      },
      start: function() {
        startCalled++;
      },
      end: function() {
        endCalled++;
      }
    };
  });

  Popcorn.plugin( "webpage", function( options ) {
    return {
      _setup: function() {
        setupCalled++;
      },
      start: function() {
        startCalled++;
      },
      end: function() {
        endCalled++;
      }
    };
  });

  test( "Timeline-sources Module", function() {

    var count = 0,
        expects = 4,
        p = Popcorn.instances[ 0 ].volume( 0 );

    expect( expects );
    function plus() {
      if ( ++count === expects ) {
        start();
      }
    }

    stop();

    p.exec( 3, function() {
      equal( startCalled, 5, "start was called 5 times from the parsed data" );
      plus();
      p.currentTime( 9 );
    });

    p.exec( 10.5, function() {
      equal( endCalled, 5, "end was called 5 times from the parsed data" );
      plus();
    });

    equal( setupCalled, 5, "setup was called 5 times from the parsed data" );
    plus();

    equal( p.paused(), true, "Only play the media if it was specified to do so" );
    plus();

    p.play();
  });

})( Popcorn );