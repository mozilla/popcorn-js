module( "Popcorn Soundcloud Player" );
asyncTest( "Default Attribute Functionality", function () {
  var expects = 5,
      count = 0,
      playerDefault,
      playerOverride,
      target = document.getElementById( "player_2" ),
      members = {
        // HTMLMediaElement members
        "currentTime": 0,
        "readyState": 0,
        "duration": 0,
        "volume": 1,
        "paused": 1,
        "ended": 0,
        "muted": false
      };

  function plus() {
    if ( ++count === expects ) {
      start();
      playerDefault.destroy();
      playerOverride.destroy();
    }
  }

  Popcorn.forEach( members, function () {
    expects++;
  });

  expect( expects );

  playerDefault = Popcorn.soundcloud( target.id, "http://api.soundcloud.com/tracks/12426185" );
  playerOverride = Popcorn.soundcloud( target.id,  "http://api.soundcloud.com/tracks/25857135" );

  playerDefault.on( "load", function() {
    equal( playerDefault.duration(), 315.861, "Duration updated" );
    plus();

    equal( target.children.length, 2, "The container has 2 players" );
    plus();
  });

  playerOverride.on( "load", function() {
    equal( playerOverride.duration(), 217.16, "Duration updated" );
    plus();
  });

  Popcorn.forEach( members, function( val, prop ) {
    var actual = playerDefault[prop];

    if ( typeof playerDefault[prop] === "function" ) {
      actual = playerDefault[prop]();
    }

    equal( actual, val, "player." + prop + " should have default value: '" + val + "'" );
      plus();
    });

    equal( playerOverride.position().width, target.offsetWidth, "Width is correct" );
    plus();
    equal( playerOverride.position().height, target.offsetHeight, "Height is correct" );
    plus();
});

asyncTest( "Player Volume Control", function () {
  var expects = 3,
      count = 0,
      player = Popcorn.soundcloud( "player_1", "http://api.soundcloud.com/tracks/8115502" ),
      targetVolume,
      startVolume;

  function plus() {
    if ( ++count === expects ) {
      start();
      player.destroy();
    }
  }

  expect(expects);

  player.on( "load", function() {
    // VolumeChange is fired shortly after load when the volume is retrieved from the player
    // Defer volume tests until after that has run
    player.on( "volumechange", function() {
      if ( count >= expects ) {
        return;
      }

      equal( player.volume(), targetVolume, "Volume change set correctly" );
      plus();

      if ( targetVolume !== 0 ) {
        targetVolume = 0;
        player.mute( true );
      } else {
        targetVolume = startVolume;
        // Unmute
        player.mute( false );
      }
    });

    player.volume( targetVolume = startVolume = ( player.volume === 1 ? 0.5 : 1 ) );
  });
});

asyncTest( "Popcorn Integration", function () {
  var expects = 4,
      count = 0,
      player = Popcorn.soundcloud( "player_1", "http://api.soundcloud.com/tracks/12643174" );

  function plus() {

    if ( ++count === expects ) {
      start();
      player.destroy();
    }
  }

  expect(expects);

  player.on( "canplaythrough", function() {

    ok( true, "Listen works (load event)" );
    plus();

    player.on( "play", function() {
      ok( true, "Play triggered by popcorn.trigger" );
      plus();

      player.pause();
    });

    player.on( "pause", function() {

      ok( true, "Pause explicitly called" );
      plus();

      player.volume( ( player.volume() === 1 ? 0.5 : 1 ) );
    });

    player.on( "volumechange", function() {
      ok( true, "Volume changed explicitly called" );
      plus();
    });

    player.play();
  });
});

asyncTest( "Events and Player Control", function () {
  var expects = 14,
      count = 0,
      player = Popcorn.soundcloud( "player_1", "http://api.soundcloud.com/tracks/12426185" ),
      targetVolume;

  function plus() {
    if ( ++count === expects ) {
      start();
      player.destroy();
    }
  }

  expect( expects );

  player.on( "load", function() {
    ok( true, "Load was fired" );
    plus();
  });

  player.on( "playing", (function() {
    var hasFired = 0;

    return function() {
      if ( hasFired ) {
        return;
      }

      hasFired = 1;
      ok( true, "Playing was fired" );
      plus();

      equal( player.paused(), false, "Paused is unset" );
      plus();
      player.pause();
    };
  })());

  player.on( "play", (function() {
    var hasFired = 0;

    return function() {
      if ( hasFired ) {
        return;
      }

      hasFired = 1;
      ok( true, "Play was fired" );
      plus();
    };
  })());

  player.on( "durationchange", function() {
    ok( true, "DurationChange was fired" );
    plus();
  });

  player.media.addEventListener( "readystatechange", function() {
    ok( true, "ReadyStateChange was fired" );
    plus();

    equal( player.readyState(), 4, "Ready State is now 4" );
    plus();
  }, false);

  player.on( "pause", function() {

    ok( true, "Pause was fired by dispatch" );
    plus();

    equal( player.paused(), true, "Paused is set" );

    player.play();
    plus();
  });

  player.on( "timeupdate", ( function() {
    var hasFired = 0;

    return function() {
      if ( hasFired ) {
        return;
      }
      hasFired = 1;

      ok( true, "Timeupdate was fired by dispatch" );
      plus();
    };
  })());

  player.on( "volumechange", function() {
    player.off( "volumechange" );
    ok( true, "volumechange was fired by dispatch" );
    plus();
  });

  player.cue( 10, function() {
    // Will trigger a "seeked" event to near end
    player.currentTime( player.duration() - 1 );
  });

  player.on( "canplaythrough", function() {
    ok( true, "Can play through" );
    plus();
  });

  player.on( "seeked", (function() {
    var hasFired = 0;

    return function() {
      if ( hasFired ) {
        return;
      }
      hasFired = 1;
      ok( true, "Seeked was fired" );
      plus();
    };
  })());

  player.on( "ended", function() {

    ok( true, "Media is done playing" );
    plus();

    equal( player.paused(), true, "Paused is set on end" );
    plus();
  });

  var ready = function() {

    player.off( "canplaythrough", ready );
    player.play();
  };

  if ( player.readyState() >= 4 ) {
    ready();
  } else {
    player.on( "canplaythrough", ready );
  }
});
