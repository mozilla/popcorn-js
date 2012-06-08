test( "Popcorn Code Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 12,
      count = 0,
      frames = 0,
      codeDiv = document.getElementById( "code-div" ),
      hasCheckedFrame = false;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "code" in popped, "code is a method of the popped instance" );
  plus();

  equal( codeDiv.innerHTML, "", "initially, there is nothing inside the code-div" );
  plus();

  popped.code({
    start: 0,
    end: 2,
    onStart: function( options ) {
      ok( this instanceof Popcorn, "this instanceof Popcorn, onStart" );
      plus();
    },
    onEnd: function( options ) {
      ok( this instanceof Popcorn, "this instanceof Popcorn, onEnd" );
      plus();
    }
  });

  popped.code({
    start: 0,
    end: 2,
    onStart: function( options ) {
      codeDiv.innerHTML = "Test 1 - onStart (no onEnd)";
      ok( true, "Test 1 onStart was run." );
      plus();
    }
  });

  popped.code({
    start: 2,
    end: 4,
    onStart: function( options ) {
      codeDiv.innerHTML = "Test 2 - onStart";
      ok( true, "Test 2 onStart was run." );
      plus();
    },
    onEnd: function ( options ) {
      codeDiv.innerHTML = "Test 2 - onEnd";
      ok( true, "Test 2 onEnd was run." );
      plus();
    }
  });

  popped.code({
    start: 4,
    end: 6,
    onStart: function( options ) {
      codeDiv.innerHTML = "Test 3 - onStart [Frames: ";
      ok( true, "Test 3 onStart was run." );
      plus();
    },
    onFrame: function ( options ) {

      if ( !hasCheckedFrame ) {
        hasCheckedFrame = true;
        ok( this instanceof Popcorn, "this instanceof Popcorn, onFrame" );
        plus();
      }
      codeDiv.innerHTML += ".";
      frames++;
    },
    onEnd: function ( options ) {
      codeDiv.innerHTML += "] Test 3 - onEnd";
      ok( true, "Test 3 onEnd was run." );
      plus();
      ok( frames > 1, "Test 3 onFrames was run." );
      plus();
      popped.pause();
    }
  });

  // empty track events should be safe
  Popcorn.plugin.debug = false;
  popped.code({});

  // debug should log errors on empty track events
  Popcorn.plugin.debug = true;
  try {
    popped.code({});
  } catch( e ) {
    ok( true, "empty event was caught by debug" );
    plus();
  }

  popped.volume( 0 );
  popped.play();
});
