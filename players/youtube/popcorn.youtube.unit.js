var ytReady = false,
    popcorn = Popcorn( Popcorn.youtube( 'video' ) );

popcorn.listen( "load", function onYouTubePlayerReady() {
  ytReady = true;
});

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
    'volumechange',
    'volumechange',
    'volumechange',
    'playing',
    'pause',
    'ended'
  ];

  var expectedEventCount = expectedEvents.length;
  expect(expectedEventCount + 5);

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

  // operations set1
  var set1Executed = false;
  popcorn.listen( 'playing', function() {
    // prevent double calling
    if ( set1Executed ) {
      return;
    }

    // toggle volume 1 second after playing
    setTimeout(function() {
      popcorn.volume(0.5);
    }, 1000);

    // pause 3 seconds after playing
    setTimeout(function() {
      popcorn.pause();
    }, 3000);

    set1Executed = true;
  });

  // begin the test
  popcorn.play();
  
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
  
  // operations set3
  var set3Executed = false;
  popcorn.listen( 'seeked', function() {
    if ( set3Executed ) {
      return;
    }
    
    popcorn.volume(1);
    
    popcorn.mute();
    equals( popcorn.volume(), 0, "Muted" );
    
    popcorn.mute();
    ok( popcorn.volume() !== 0, "Not Muted" );
    equals( popcorn.volume(), 1, "Back to volume of 1" );

    set3Executed = true;
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

test( "Popcorn YouTube Plugin Url and Duration Tests", function() {
  function plus(){ 
    if ( ++count == expects ) {
      start(); 
    }
  }
  
  QUnit.reset();
  
  var count = 0,
      expects = 4,
      rawTube = Popcorn.youtube( 'video', 'http://www.youtube.com/watch?v=9oar9glUCL0' );
      
  expect( expects );
  stop( 5000 );
  
  equals( rawTube.vidId, '9oar9glUCL0', 'Video id set' );
  plus();
  
  equals( rawTube.duration, Number.MAX_VALUE, 'Duration starts as Max Value');
  plus();
  
  rawTube.addEventListener( "playing", function() {
    notEqual( rawTube.duration, Number.MAX_VALUE, "Duration has been changed from max value" );
    plus();
    notEqual( rawTube.duration, 0, "Duration is non-zero" );
    plus();
    
    rawTube.pause();
  });
  
  rawTube.play();
  
});