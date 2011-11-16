test( "Popcorn wordriver Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 17,
      count = 0,
      firstTrack,
      secondTrack,
      wordriverdiv = document.getElementById( "wordriverdiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "wordriver" in popped, "wordriver is a method of the popped instance" );
  plus();

  equals( wordriverdiv.childElementCount, 0, "initially, there is nothing inside the wordriverdiv" );
  plus();

  popped.wordriver({
		start: 0,
		end: 2,
		text: "hello",
		target: "wordriverdiv",
		color: "red"
  });

  firstTrack = popped.getLastTrackEventId();

  popped.wordriver({
		start: 2,
		end: 4,
		text: "world",
		target: "wordriverdiv",
		color: "blue"
  });

  secondTrack = popped.getLastTrackEventId();

  popped.wordriver({
		start: 20,
		end: 24,
		text: "nothing here",
		target: "wordriverdiv",
		color: "green"
  })
  .volume( 0 );

  popped.exec( 0, function() {
    equals( wordriverdiv.children[ 0 ].childElementCount, 1, "wordriverdiv now has one inner element" );
    plus();
    equals( wordriverdiv.children[ 0 ].children[ 0 ].style.opacity, 1, "first word is visible on the page" );
    plus();
    equals( wordriverdiv.children[ 0 ].children[ 0 ].innerHTML, "hello", "first word content is correct" );
    plus();
    ok( !wordriverdiv.children[ 0 ].children[ 1 ], "second word does not exist yet" );
    plus();
  });

  popped.exec( 2, function() {
    equals( wordriverdiv.children[ 0 ].childElementCount, 2, "wordriverdiv now has two inner elements" );
    plus();
    equals( wordriverdiv.children[ 0 ].children[ 0 ].style.opacity, 0, "first word is not visible on the page" );
    plus();
    equals( wordriverdiv.children[ 0 ].children[ 0 ].innerHTML, "hello", "first word content is correct" );
    plus();
    equals( wordriverdiv.children[ 0 ].children[ 1 ].style.opacity, 1, "second word is visible on the page" );
    plus();
    equals( wordriverdiv.children[ 0 ].children[ 1 ].innerHTML, "world", "second word content is correct" );
    plus();
  });

  popped.exec( 4, function() {
    equals( wordriverdiv.children[ 0 ].children[ 0 ].style.opacity, 0, "first word is not visible on the page" );
    plus();
    equals( wordriverdiv.children[ 0 ].children[ 1 ].style.opacity, 0, "second word is not visible on the page" );
    plus();

    popped.pause().removeTrackEvent( firstTrack );
    equals( wordriverdiv.children[ 0 ].childElementCount, 1, "wordriverdiv now has one inner element" );
    plus();
    equals( wordriverdiv.children[ 0 ].children[ 0 ].innerHTML, "world", "first word content is changed" );
    plus();

    popped.pause().removeTrackEvent( secondTrack );
    equals( wordriverdiv.childElementCount, 0, "wordriverdiv now has no inner element, even though one still exists, but was never called" );
    plus();
  });

  // empty track events should be safe
  popped.wordriver({});

  // debug should log errors on empty track events
  Popcorn.plugin.debug = true;
  try {
    popped.wordriver({});
  } catch( e ) {
    ok( true, "empty event was caught by debug" );
    plus();
  }

  popped.play();

});
