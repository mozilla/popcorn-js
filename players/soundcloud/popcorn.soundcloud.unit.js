module( "Popcorn Soundcloud Player" );

asyncTest( "API", function () {

  var expects = 0,
      count = 0,
      player = Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood" ),
      members = {
        // HTMLMediaElement members
        'readyState' : 'number',
        'currentTime' : 'number',
        'duration' : 'number',
        'paused' : 'number',
        'ended' : 'number',
        'volume' : 'number',
        'muted' : 'function',
        'playbackRate' : 'number',
        'loop' : 'undefined',
        'load' : 'function',
        'play' : 'function',
        'pause' : 'function',
        'timeupdate' : 'function',
        'src' : 'string',
        
        // DOMElement members
        'addEventListener' : 'function',
        'dispatchEvent' : 'function',
        'getBoundingClientRect' : 'function',
        'width' : 'string',
        'height' : 'string',
        'top' : 'number',
        'left' : 'number',
        'offsetLeft' : 'number',
        'offsetTop' : 'number',
        'offsetHeight' : 'number',
        'offsetWidth' : 'number',
        
        // Helper functions and members
        'setVolume' : 'function',
        'setCurrentTime' : 'function',
        'timeupdate' : 'function',
        'registerPopcornWithPlayer' : 'function'
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
  
  Popcorn.forEach( members, function ( type, prop ) {
    ok( typeof player[prop] === type, "player." + prop + " is type: '" + player[prop] + "', should be '" + type + "'" );
    plus();
  });
});

asyncTest( "Default Attribute Functionality", function () {
  var expects = 4,
      count = 0,
      playerDefault,
      playerOverride,
      members = {
        // HTMLMediaElement members
        'currentTime' : 0,
        'readyState' : 0,
        'duration' : 0,
        'volume' : 1,
        'paused' : 1,
        'ended' : 0,
        'muted' : false,
        'playbackRate' : 1,
        'src' : 'http://soundcloud.com/forss/flickermood',
        
        // DOMElement members
        'height' : '81px',
        'top' : 0,
        'left' : 0,
        'offsetHeight' : 81,
      };
      
  function plus() {
    if ( ++count === expects ) {
      start();
      cleanup();
    }
  }
  
  Popcorn.forEach( members, function () {
    expects++;
  });
  
  expect( expects );
  
  playerDefault = Popcorn.soundcloud( "player_2", "http://soundcloud.com/forss/flickermood" );
  playerOverride = Popcorn.soundcloud( "player_2",  "http://soundcloud.com/forss/journeyman", {
    height: "100px",
    width: '90%'
  });
  
  playerDefault.addEventListener( "load", function() {
    equal( playerDefault.duration, 213.89, "Duration updated" );
    plus();

    equal( document.getElementById( "player_2" ).children.length, 2, "The container has 2 players" );
    plus();

  });
  
  Popcorn.forEach( members, function ( val, prop ) {
    var actual = playerDefault[prop];
    
    if ( typeof playerDefault[prop] === 'function' ) {
      actual = playerDefault[prop]();
    }
    
    equal( actual, val, "player." + prop + " should have default value: '" + val + "'" );
    plus();
  });
  
  equal( playerOverride.width, "90%", "Width has been overridden" );
  plus();
  
  equal( playerOverride.height, "81px", "Height has been overridden to 100px, but set back again to 81px" );
  plus();
});

asyncTest( "Player Volume Control", function () {
  var expects = 3,
      count = 0,
      player = Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood" ),
      targetVolume,
      startVolume;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  player.addEventListener( "load", function() {
    // VolumeChange is fired shortly after load when the volume is retrieved from the player
    // Defer volume tests until after that has run
    player.addEventListener( "volumechange", function() {
      if ( count >= expects ) {
        return;
      }
      
      equal( player.volume, targetVolume, "Volume change set correctly" );
      plus();
      
      if ( targetVolume !== 0 ) {
        targetVolume = 0;
        player.mute();
      } else {
        targetVolume = startVolume;
        // Unmute
        player.mute();
      }
    });
    
    player.volume = targetVolume = startVolume = ( player.volume === 1 ? 0.5 : 1 );
  });
});

asyncTest( "Testing Comments", function() {
  var expects = 0,
      count = 0,
      cmtDate = new Date(),
      comment,
      players = {
        player1: Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood" ),
        player2: Popcorn.soundcloud( "player_2", "http://soundcloud.com/forss/flickermood", {
          api: {
            commentdiv: "commentOutput",
            commentformat: function( comment ) {
              return comment.text
            }
          }
        }),
        player3: Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood" )
      }
      // Expecteed comment output
      commentOutput = {
        player1: function() {
          return '<div><a href="Hyperlink">'
                + '<img width="16px height="16px" src="Image"></img>'
                + 'User 1</a> at 0.03 1 hour ago'
                + '<br />Hi</span>';
        },
        player2: function() {
          return "Hi";
        },
        player3: function() {
          return "User 1 @ 3: Hi";
        }
      };
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  // Set comment date to 1 hour ago
  cmtDate.setTime( cmtDate.getTime() - 3600000 );
  
  comment = {
    start: 3,
    date: cmtDate,
    text: "Hi",
    user: {
      name: "User 1",
      profile: "Hyperlink",
      avatar: "Image"
    }
  };
  
  players["player1"].addComment( comment );
  players["player2"].addComment( comment );
  players["player3"].addComment( comment, function( comment ) {
    return comment.user.name + " @ " + comment.start + ": "+ comment.text; 
  });
  
  Popcorn.forEach( players, function () {
    // 1 comment per player
    expects++;
  });
  
  expect( expects );
  
  Popcorn.forEach( players, function ( player, name ) {
    equal( player._comments[0].display(), commentOutput[name](), name + " formatted as expected" );
    plus();
  });
});

asyncTest( "Popcorn Integration", function () {
  var expects = 4,
      count = 0,
      player = Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood" );
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  player.addEventListener( "load", function() {
    ok( true, "Listen works (load event)" );
    plus();
    
    player.addEventListener( "play", function() {
      ok( true, "Play triggered by popcorn.trigger" );
      plus();
      
      player.pause();
    });
    
    player.addEventListener( "pause", function() {
      ok( true, "Pause explicitly called" );
      plus();
      
      player.volume = ( player.volume === 1 ? 0.5 : 1 );
    });
    
    player.addEventListener( "volumechange", function() {
      ok( true, "Volume changed explicitly called" );
      plus();
    });
    
    player.play();
    
  });
});

asyncTest( "Events and Player Control", function () {
  var expects = 14,
      count = 0,
      player = Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood" ),
      targetVolume;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  player.addEventListener( "load", function() {
    ok( true, "Load was fired" );
    plus();
  });
  
  player.addEventListener( "playing", function() {
    ok( true, "Playing was fired" );
    plus();
    
    equal( player.paused, 0, "Paused is unset" );
    plus();
  });
  
  player.addEventListener( "play", ( function() {
    var hasFired = 0;
    
    return function() {
      if ( hasFired ) {
        return;
      }
      
      hasFired = 1;
      
      ok( true, "Play was fired" );
      plus();
    }
  })());
  
  player.addEventListener( "durationchange", function() {
    ok( true, "DurationChange was fired" );
    plus();
  });
  
  player.addEventListener( "readystatechange", function() {
    ok( true, "ReadyStateChange was fired" );
    plus();
    
    equal( player.readyState, 3, "Ready State is now 3" );
    plus();
    
    player.pause();
  });
  
  player.addEventListener( "pause", function() {
    ok( true, "Pause was fired by dispatch" );
    plus();
    
    equal( player.paused, 1, "Paused is set" );
    plus();
  });
  
  player.addEventListener( "timeupdate", ( function() {
    var hasFired = 0;
    
    return function() {
      if ( hasFired ) {
        return;
      }
      hasFired = 1;
      
      ok( true, "Timeupdate was fired by dispatch" );
      plus();
    }
  })());
  
  player.addEventListener( "volumechange", function() {
    ok( true, "volumechange was fired by dispatch" );
    plus();
  });
  
  player.addEventListener( "canplaythrough", function() {
    ok( true, "Can play through" );
    plus();
    
    // Will trigger a "seeked" event to near end
    player.currentTime = player.duration - 1;
  });
  
  player.addEventListener( "seeked", function() {
    ok( true, "Seeked was fired" );
    plus();
    
    player.dispatchEvent( "play" );
  });  
  
  player.addEventListener( "ended", function() {
    ok( true, "Media is done playing" );
    plus();
    
    equal( player.paused, 1, "Paused is set on end" );
    plus();
  });
  
  player.play();
});
