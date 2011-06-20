test( "Popcorn YouTube Plugin Event Tests", function() {
  
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
  
  var popcorn = Popcorn( Popcorn.youtube( 'video', "http://www.youtube.com/e/ac7KhViaVqc" ) ),
      count = 0,
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

test( "Popcorn YouTube Plugin Url Regex Test", function() {

  QUnit.reset();

  var urlTests = [
    { name: 'standard',
      url: 'http://www.youtube.com/watch?v=9oar9glUCL0',
      expected: '9oar9glUCL0',
    },
    { name: 'share url',
      url: 'http://youtu.be/9oar9glUCL0',
      expected: '9oar9glUCL0',
    },
    { name: 'long embed',
      url: 'http://www.youtube.com/embed/9oar9glUCL0',
      expected: '9oar9glUCL0',
    },
    { name: 'short embed 1 (e)',
      url: 'http://www.youtube.com/e/9oar9glUCL0',
      expected: '9oar9glUCL0',
    },
    { name: 'short embed 2 (v)',
      url: 'http://www.youtube.com/v/9oar9glUCL0',
      expected: '9oar9glUCL0',
    },
    { name: 'contains underscore',
      url: 'http://www.youtube.com/v/GP53b__h4ew',
      expected: 'GP53b__h4ew',
    },
  ];

  expect( urlTests.length );
  stop( 10000 );

  for ( var t in urlTests ) {

    var urlTest = urlTests[t],
        popcorn = Popcorn( Popcorn.youtube( 'video3', urlTest.url ) );

    equals( popcorn.video.vidId, urlTest.expected, 'Video id is correct for ' + urlTest.name + ': ' + urlTest.url );
    popcorn.pause();

    // Get rid of the youtube object inside the video3, to keep things simple
    var div = document.getElementById('video3');
    div.removeChild(div.firstChild);
  }
  
  start(); 
});

test( "Controls and Annotations toggling", function() {

  QUnit.reset();

  expect( 6 );

  var popcorn = Popcorn( Popcorn.youtube( "video", "http://www.youtube.com/watch?v=9oar9glUCL0" ) ),
      targetDiv = document.getElementById( "video" );
      testTarget = targetDiv.querySelector( "object" ).querySelector( "param:nth-of-type( 4 )" );
  
  ok( /controls=1/.test( testTarget.value ), "controls are defaulted to 1 ( displayed )" );
  ok( /iv_load_policy=1/.test( testTarget.value ), "annotations ( iv_load_policy ) are defaulted to ( enabled )" );
  
  targetDiv.innerHTML = "";
  
  popcorn = Popcorn( Popcorn.youtube( "video", "http://www.youtube.com/watch?v=9oar9glUCL0", { controls: 1, annotations: 1 } ) );
  testTarget = targetDiv.querySelector( "object" ).querySelector( "param:nth-of-type( 4 )" );
  ok( /controls=1/.test( testTarget.value ), "controls is set to 1 ( displayed )" );
  ok( /iv_load_policy=1/.test( testTarget.value ), "annotations ( iv_load_policy ) is set to 1 ( enabled )" );
  
  targetDiv.innerHTML = "";
  
  popcorn = Popcorn( Popcorn.youtube( "video", "http://www.youtube.com/watch?v=9oar9glUCL0", { controls: 0, annotations: 3 } ) );
  testTarget = targetDiv.querySelector( "object" ).querySelector( "param:nth-of-type( 4 )" );
  ok( /controls=0/.test( testTarget.value ), "controls is set to 0 ( hidden )" );
  ok( /iv_load_policy=3/.test( testTarget.value ), "annotations ( iv_load_policy ) is set to 3 ( hidden )" );
   
});

