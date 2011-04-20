test( "Popcorn YouTube Plugin Event Tests", function() {

  var popcorn = Popcorn( Popcorn.youtube( 'video', "http://www.youtube.com/e/ac7KhViaVqc" ) );
  
  function plus(){ 
    if ( ++count == expects ) {
      start(); 
    }
  }
  
  QUnit.reset();
  
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
    'playing',
    'pause',
    'ended'
  ];
  
  var count = 0,
      eventCount = 0,
      added = [],
      set1Executed = false,
      set2Executed = false,
      set3Executed = false,
      expects = expectedEvents.length + 5,
      listeners = [];
      
  stop( 15000 );
  expect(expects);
  
  popcorn.volume(1); // is muted later
  
  // check time sync
  popcorn.exec(2, function() {
    ok( popcorn.currentTime() >= 2, "Check time synchronization." );
    plus();
  });
  popcorn.exec(49, function() {
    ok( popcorn.currentTime() >= 49, "Check time synchronization." );
    plus();
  });
  popcorn.exec(40, function() {
    ok( false, "This should not be run." );
  });

  
  // register each events
  for ( var i in expectedEvents ) {
    (function( event ) {
      // skip same listeners already added
      for ( var i in added ) {
        if ( added[i] == event ) {
          return;
        }
      }
      
      listeners.push( {
        evt: event,
        fn: popcorn.listen( event, function() {
          eventCount++;
          var expected = expectedEvents.shift();
          if ( expected == event ) {
            ok( true, "Event: "+event + " is fired." );
            plus();
          } else {
            ok( false, event + " is fired unexpectedly, expecting: " + expected );
          }
        })
      });
      added.push( event );
    })( expectedEvents[i] );
  }
  
  // Cleanup
  listeners.push( popcorn.listen( "ended", function() {
    Popcorn.forEach( listeners, function ( obj ) {
      popcorn.unlisten( obj.evt, obj.fn );
    });
  }));

  // operations set1
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
  popcorn.listen( 'seeked', function() {
    if ( set3Executed ) {
      return;
    }
    
    popcorn.volume(0.5);
    
    popcorn.mute();
    equals( popcorn.volume(), 0, "Muted" );
    plus();
    
    popcorn.mute();
    ok( popcorn.volume() !== 0, "Not Muted" );
    plus();
    
    equals( popcorn.volume(), 0.5, "Back to volume of 1" );
    plus();

    set3Executed = true;
  });
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
      popcorn = Popcorn( Popcorn.youtube( 'video2', 'http://www.youtube.com/watch?v=9oar9glUCL0' ) );
      
  expect( expects );
  stop( 10000 );
  
  equals( popcorn.video.vidId, '9oar9glUCL0', 'Video id set' );
  plus();
  
  equals( popcorn.duration(), 0, 'Duration starts as 0');
  plus();
  
  popcorn.listen( "durationchange", function() {
    notEqual( 0, popcorn.duration(), "Duration has been changed from 0" );
    plus();
    
    popcorn.pause();
  });
  
  popcorn.play();
});
