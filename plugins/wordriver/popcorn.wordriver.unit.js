test( "Popcorn wordriver Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 16,
      count = 0,
      firstTrack,
      secondTrack,
      firstCue,
      secondCue,
      thirdCue,
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

  equal( wordriverdiv.childElementCount, 0, "initially, there is nothing inside the wordriverdiv" );
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

  popped.cue( 0, function() {
    var child = wordriverdiv.children[ 0 ],
        subChildren = child.children;

    // need to do this here because we fire the event
    // as soon as we can, as it starts at 0
    firstCue = popped.getLastTrackEventId();
    equal( child.childElementCount, 1, "wordriverdiv now has one inner element" );
    plus();
    equal( subChildren[ 0 ].style.opacity, 1, "first word is visible on the page" );
    plus();
    equal( subChildren[ 0 ].innerHTML, "hello", "first word content is correct" );
    plus();
    ok( !subChildren[ 1 ], "second word does not exist yet" );
    plus();
    popped.removeTrackEvent( firstCue );
  });

  popped.cue( 2, function() {
    var child = wordriverdiv.children[ 0 ],
        subChildren = child.children;

    equal( child.childElementCount, 2, "wordriverdiv now has two inner elements" );
    plus();
    equal( subChildren[ 0 ].style.opacity, 0, "first word is not visible on the page" );
    plus();
    equal( subChildren[ 0 ].innerHTML, "hello", "first word content is correct" );
    plus();
    equal( subChildren[ 1 ].style.opacity, 1, "second word is visible on the page" );
    plus();
    equal( subChildren[ 1 ].innerHTML, "world", "second word content is correct" );
    plus();
    popped.removeTrackEvent( secondCue );
  });

  secondCue = popped.getLastTrackEventId();

  popped.cue( 4, function() {
    var child = wordriverdiv.children[ 0 ],
        subChildren = child.children;

    equal( subChildren[ 0 ].style.opacity, 0, "first word is not visible on the page" );
    plus();
    equal( subChildren[ 1 ].style.opacity, 0, "second word is not visible on the page" );
    plus();

    popped.pause().removeTrackEvent( firstTrack );
    equal( child.childElementCount, 1, "wordriverdiv now has one inner element" );
    plus();
    equal( subChildren[ 0 ].innerHTML, "world", "first word content is changed" );
    plus();

    popped.pause().removeTrackEvent( secondTrack );
    equal( wordriverdiv.childElementCount, 0, "wordriverdiv now has no inner element, even though one still exists, but was never called" );
    plus();
    popped.removeTrackEvent( thirdCue );
  });

  thirdCue = popped.getLastTrackEventId();

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.wordriver({});

  popped.play();
});
