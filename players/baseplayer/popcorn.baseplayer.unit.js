module("Popcorn Base Player");
test("API", function () {

  var expects = 17,
      count = 0,
      player = Popcorn.baseplayer(),
      members = {
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
        'events' : 'object',
        'load' : 'function',
        'play' : 'function',
        'pause' : 'function',
        'timeupdate' : 'function',
        'addEventListener' : 'function',
        'dispatchEvent' : 'function'
      };
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  stop( 10000 );
  
  Popcorn.forEach( members, function ( type, prop ) {
    ok( typeof player[prop] === type, "player." + prop + " is type: " + type );
    plus();
  });
});

test("Default Functionality", function () {
  var expects = 5,
      count = 0,
      player = Popcorn.baseplayer(),
      popcorn = Popcorn( player );
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  stop( 1000 );
      
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

test("Extension and Method Overriding", function () {
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
