test( "Popcorn wordriver Plugin", function () {
  
  var popped = Popcorn( "#video" ),
      expects = 16, 
      count = 0,
      firstTrack,
      secondTrack,
      wordriverdiv = document.getElementById( "wordriverdiv" );

  expect(expects);
  
  function plus() {
    if ( ++count === expects) {
      start();
    }
  }
  
  stop();
   
  ok ( "wordriver" in popped, "wordriver is a method of the popped instance" );
  plus();
  
  equals ( wordriverdiv.childElementCount, 0, "initially, there is nothing inside the wordriverdiv" );
  plus();
  
  
  popped.wordriver({
		start: 0, // seconds
		end: 2, // seconds
		text: "hello",
		target: "wordriverdiv",
		color: "red"
  });

  firstTrack = popped.getLastTrackEventId();

  popped.wordriver({
		start: 2, // seconds
		end: 4, // seconds
		text: "world",
		target: "wordriverdiv",
		color: "blue"
  })
  .volume(0);

  secondTrack = popped.getLastTrackEventId();

  popped.exec( 0, function() {
    equals( wordriverdiv.children[0].childElementCount, 1, "wordriverdiv now has one inner element" );
    plus();
    equals( wordriverdiv.children[0].children[0].style.opacity, 1, "first word is visible on the page" );
    plus();
    equals( wordriverdiv.children[0].children[0].innerHTML, "hello", "first word content is correct" );
    plus();
    ok( !wordriverdiv.children[0].children[1], "second word does not exist yet" );
    plus();
  });
  
  popped.exec( 2, function() {
    equals( wordriverdiv.children[0].childElementCount, 2, "wordriverdiv now has two inner elements" );
    plus();
    equals( wordriverdiv.children[0].children[0].style.opacity, 0, "first word is not visible on the page" );
    plus();
    equals( wordriverdiv.children[0].children[0].innerHTML, "hello", "first word content is correct" );
    plus();
    equals( wordriverdiv.children[0].children[1].style.opacity, 1, "second word is visible on the page" );
    plus();
    equals( wordriverdiv.children[0].children[1].innerHTML, "world", "second word content is correct" );
    plus();
  });
  
  popped.exec( 4, function() {
    equals( wordriverdiv.children[0].children[0].style.opacity, 0, "first word is not visible on the page" );
    plus();
    equals( wordriverdiv.children[0].children[1].style.opacity, 0, "second word is not visible on the page" );
    plus();

    popped.pause().removeTrackEvent( firstTrack );
    equals( wordriverdiv.children[0].childElementCount, 1, "wordriverdiv now has one inner element" );
    plus();
    equals( wordriverdiv.children[0].children[0].innerHTML, "world", "first word content is changed" );
    plus();

    popped.pause().removeTrackEvent( secondTrack );
    equals( wordriverdiv.childElementCount, 0, "wordriverdiv now has no inner element" );
    plus();
  });
  
  popped.play();

});
