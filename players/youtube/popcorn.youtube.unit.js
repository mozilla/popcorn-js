var ytReady = false;
function onYouTubePlayerReady() {
  ytReady = true;
}

test( "Popcorn YouTube Plugin Startup", function() {
  var time = 0,
      wait = 100,
      timeout = 10000;
      
  // wait for YouTube to start
  stop( timeout + wait );

  // run in an interval check if YouTube has started
  var interval = setInterval(function() {
    time += wait;

    if ( ytReady ) {
      start();
      ok( true, "YouTube has started." );
      clearInterval( interval );
      return;
    }

    if ( time > timeout ) {
      ok( false, "YouTube cannot be started." );
      clearInterval( interval );
    }
  }, wait);
});

test( "Popcorn YouTube Plugin Event Tests", function() {
  if ( !ytReady ) {
    ok( false, "YouTube did not start." );
    return;
  }

  var popcorn = Popcorn( new Popcorn.youtube( 'video' ) );
  popcorn.volume(1); // is muted later
  
  // check time sync
  popcorn.exec(2, function() {
    ok( popcorn.currentTime() >= 2, "Check time synchronization." );
  });
  popcorn.exec(49, function() {
    ok( popcorn.currentTime() >= 49, "Check time synchronization." );
  });
  popcorn.exec(40, function() {
    ok( false, "This should not be run." );
  });

  // events must be fired in this order
  var expectedEvents = [
    'play',
    'loadeddata',
    'playing',
    'volumechange',
    'pause',
    'play',
    'playing',
    'seeked',
    'playing',
    'pause',
    'ended'
  ];

  var expectedEventCount = expectedEvents.length;
  expect(expectedEventCount + 2);

  // register each events
  var eventCount = 0;
  var added = [];
  for ( var i in expectedEvents ) {
    (function( event ) {
      // skip same listeners already added
      for ( var i in added ) {
        if ( added[i] == event ) {
          return;
        }
      }
      
      popcorn.listen( event, function() {
        eventCount++;
        var expected = expectedEvents.shift();
        if ( expected == event ) {
          ok( true, event + " is fired." );
        } else {
          ok( false, event + " is fired, expecting: " + expected );
        }
      });
      added.push( event );
    })( expectedEvents[i] );
  }

  // begin the test
  popcorn.play();

  // operations set1
  var set1Executed = false;
  popcorn.listen( 'playing', function() {
    // prevent double calling
    if ( set1Executed ) {
      return;
    }

    // toggle volume 1 second after playing
    setTimeout(function() {
      popcorn.volume(0);
    }, 1000);

    // pause 3 seconds after playing
    setTimeout(function() {
      popcorn.pause();
    }, 3000);

    set1Executed = true;
  });

  // operations set2
  var set2Executed = false;
  popcorn.listen( 'pause', function() {
    if ( set2Executed ) {
      return;
    }

    // continue to play
    setTimeout(function() {
      popcorn.play();
    }, 500);

    // seek to the end
    setTimeout(function() {
      popcorn.currentTime(48);
    }, 1000);

    set2Executed = true;
  });

  var time = 0,
      wait = 100,
      timeout = 15000;

  stop( timeout + wait );
  var interval = setInterval( function() {
    time += wait;
    if ( time > timeout ) {
      clearInterval( interval );
      return;
    }
    if ( eventCount == expectedEventCount ) {
      start();
      clearInterval( interval );
    }
  }, wait );
});

