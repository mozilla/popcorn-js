module( "Popcorn Base Player" );
test( "API", function () {

  var expects = 0,
      count = 0,
      player = Popcorn.baseplayer(),
      members = {
        // HTMLMediaElement members
        'readyState' : 'number',
        'currentTime' : 'number',
        'duration' : 'number',
        'paused' : 'number',
        'ended' : 'number',
        'volume' : 'number',
        'muted' : 'number',
        'playbackRate' : 'number',
        'autoplay' : 'undefined',
        'loop' : 'undefined',
        'load' : 'function',
        'play' : 'function',
        'pause' : 'function',
        'timeupdate' : 'function',
        
        // DOMElement members
        'addEventListener' : 'function',
        'dispatchEvent' : 'function',
        'getBoundingClientRect' : 'function',
        'width' : 'number',
        'height' : 'number',
        'offsetWidth' : 'number',
        'offsetHeight' : 'number',
        'offsetTop' : 'number',
        'offsetLeft' : 'number',
        'offsetParent' : 'undefined',
        
        // Helper functions and members
        '_events' : 'object',
        '_resource' : 'undefined',
        '_container' : 'undefined',
        'getStyle' : 'function',
        'extractContainerValues' : 'function'
      };
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  Popcorn.forEach( members, function () {
    expects++;
  });
  
  expect( expects );
  stop( 10000 );
  
  Popcorn.forEach( members, function ( type, prop ) {
    ok( typeof player[prop] === type, "player." + prop + " is type: " + type );
    plus();
  });
});

test( "Default Functionality", function () {
  var expects = 7,
      count = 0,
      player = Popcorn.baseplayer(),
      dimensions,
      expectedVals = {
        left: 220,
        top: 260,
        width: 300,
        height: 250
      };
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  player._resource = document.getElementById('player_1');
  dimensions = player.getBoundingClientRect();
  
  Popcorn.forEach( expectedVals, function() {
    expects+= 2;
  });
  
  expect( expects );
  stop( 1000 );
  
  Popcorn.forEach( expectedVals, function( val, prop ) {
    equals( player.getStyle( prop ), val+'px', "Style '" + prop + "' correctly got" );
    plus();
    
    equals( dimensions[prop], val, "Bounding Client " + prop + " works" );
    plus();
  });
  
  equals( dimensions.right, expectedVals.left + expectedVals.width, "Bounding Client right works" );
  plus();
  equals( dimensions.bottom, expectedVals.top + expectedVals.height, "Bounding Client bottom works" );
  plus();
  
  player.addEventListener( 'timeupdate', function( evt, caller ) {
    ok( true, "Time update called" );
    plus();
    
    equals( player, this, "'this' is kept as player" );
    plus();
    
    equals( player, caller, "caller is kept as player" );
    plus();
    
    ok( evt instanceof window.Event, "Event object passed in" );
    plus();
    
    ok( evt.type === 'timeupdate', "Event object is type 'timeupdate'" );
    plus();
    
    player.pause();
  });
  
  player.play();
});


test( "Extension and Method Overriding", function () {
  var expects = 4,
      count = 0,
      player = Popcorn.baseplayer(),
      playerForPopcorn = Popcorn.baseplayer(),
      popcorn;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  stop( 4000 );
  
  Popcorn.extend( player, {
    load: function() {
      ok( true, "Load overridden" );
      plus();
    },
    timeupdate: function() {
      ok( true, "Timeupdate overridden" );
      plus();
      
      // Must dispatch event so event listeners can work!
      this.dispatchEvent("timeupdate");
      
      // We don't want to cue custom timing loop using setTimeout because we only want this to run once
    }
  });
  
  player.addEventListener( "timeupdate", function() {
    ok( true, "Timeupdate event dispatched!" );
    plus();
  });
  
  popcorn = Popcorn( playerForPopcorn )
            .exec( 2, function() {
              ok( true, "Exec triggereed from popcorn after 2 seconds" );
              plus();
            });
  
  player.load();
  player.play();
  
  // Each player will define its own criteria for when readyState should be changed
  // No logic in base player for this, so we must do it manually so popcorn will be able to cue track events
  playerForPopcorn.readyState = 2;
  popcorn.play();
});
