test("Popcorn Vimeo Plugin", function () {
  function makeHandler( evtName ) {
    return( function() {
      var count = 0;
      return function() {
        count++;
        
        if ( count === 1 ) {
          ok( true, "Event '"+evtName+"' is supported" );
          plus();
        }
      }
    })();
  }
  
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  var popped = Popcorn( Popcorn.vimeo( "player_1", "http://vimeo.com/11127501" ) ),
      expects = 22,
      playCount = 0,
      pauseCount = 0,
      count = 0,
      events = {
        "durationchange": makeHandler( "durationchange" ),
        "play": makeHandler( "play" ),
        "loadstart": function() {
          (makeHandler( "loadstart" ))();
          this.play();
        },
        "readystatechange": makeHandler( "readystatechange" ),
        "volumechange": (function() {
          var timesCalled = 0;
          
          return function() {
            timesCalled++;
            
            if (timesCalled === 1) {
              ok( true, "Volume changed event works" );
              plus();
              
              equals( popped.volume(), 0, "Volume correctly set" );
              plus();
              
              ok( popped.video.muted(), "Muted set when player volume 0" );
              plus();
              
              popped.volume( 0.333 );
            } else if ( timesCalled === 2 ) {
              ok( !popped.video.muted(), "Unmuted when volume not 0" );
              plus();
              
              popped.mute();
            } else if ( timesCalled === 3 ) {
              ok( popped.video.muted(), "Mute mutes when volume is non-zero" );
              plus();
              
              popped.mute();
            } else if ( timesCalled === 4 ) {
              equals( popped.volume(), 0.333, "Mute unmutes to last volume" );
              plus();
              
              popped.exec( 4, function() {
                popped.video.unload();
              });
            }
          };
        })(),
        "emptied": makeHandler( "emptied" ),
        "ended": 0,
        "pause": (function() {
          var timesCalled = 0;
          
          return function() {
            timesCalled++;
            
            if ( timesCalled === 1 ) {
              ok( true, "Pause event works" );
              plus();
              ok( popped.video.paused, "Pause attribute set" );
              plus();
              popped.play();
            }
          };
        })(),
        "playing": (function() {
          var timesCalled = 0;
          
          return function() {
            timesCalled++;
            
            if ( timesCalled === 1 ) {
              ok( true, "Play event works" );
              plus();
              
              ok( true, "Video autoplay attribute works" );
              plus();
              
              ok( !popped.video.paused, "Player paused attribute not set" );
              plus();
              
              popped.exec( 5, function() {
                popped.currentTime( 0 );
                popped.pause();
              });
            } else if ( timesCalled === 2 ) {
              ok( true, "Popcorn play function works" );
              plus();
              popped.volume( 0 );
            }
          };
        })(),
        "progress": makeHandler( "progress" ),
        "seeked": makeHandler( "seeked" ),
        "timeupdate": makeHandler( "timeupdate" )
      };
  
  expect( expects );
  
  stop( 20000 );
  
  ok( "vimeo" in Popcorn, "Vimeo is a method of Popcorn" );
  plus();
  
  equals( popped.video.initialTime, 0, "Player initial time is 0" );
  plus();
  
  Popcorn.plugin( "timingTest", {
    start: function ( event, options ) {
      ok( true, "Popcorn plugin started" );
      plus();
    },
    end: function ( event, options ) {
      ok( true, "Popcorn plugin stopped" );
      plus();
    }
  });
  
  popped.timingTest({
    start: 3, // seconds
    end: 4, // seconds
  });
  
  popped.listen( "load", function() {
    ok ( this.video.swfObj.id === popped.video.swfObj.id, "Correctly kept track of 'this'" );
    plus();
    
    Popcorn.forEach( events, function( fn, evtName ) {
      fn && popped.listen( evtName, fn );
    });
    
    // Queue load
    // Load event will play when beginning to load
    popped.load();
  });
});
