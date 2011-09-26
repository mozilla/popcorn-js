test( "Popcorn Footnote Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 8,
      count = 0,
      setupId,
      footnotediv = document.getElementById( "footnotediv" );

  expect( expects );

  function plus() {
    if ( ++count===expects ) {
      start();
    }
  }

  stop();

  ok( "footnote" in popped, "footnote is a mehtod of the popped instance" );
  plus();

  equals( footnotediv.childElementCount, 0, "initially, there is nothing inside the footnotediv" );
  plus();

  popped.footnote({
    start: 0,
    end: 2,
    text: "This video made exclusively for drumbeat.org",
    target: "footnotediv"
  })
  .footnote({
    start: 2,
    end: 4,
    text: "Visit webmademovies.org for more details",
    target: "footnotediv"
  });

  setupId = popped.getLastTrackEventId();

  popped.exec( 0, function() {
    equals( footnotediv.childElementCount, 2, "footnotediv now has two inner elements" );
    plus();
    equals( footnotediv.children[ 0 ].innerHTML, "This video made exclusively for drumbeat.org", "footnote displaing correct information" );
    plus();
    equals( footnotediv.children[ 0 ].style.display, "inline", "footnote is visible on the page" );
    plus();
  });

  popped.exec( 3, function() {
    equals( footnotediv.children[ 1 ].style.display, "inline", "second footnote is visible on the page" );
    plus();
  });

  popped.exec( 4, function() {
    ok( footnotediv.children[ 1 ].style.display === "none" &&  footnotediv.children[ 0 ].style.display === 'none', "footnote are no longer vidible on the page" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !footnotediv.children[ 1 ], "removed footnote was properly destroyed" );
    plus();
  });
  popped.play().volume( 0 );

});


test( "Popcorn Text Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 2,
      count = 0,
      setupId,
      textdiv = document.getElementById( "textdiv" );

  expect( expects );

  function plus() {
    if ( ++count===expects ) {
      start();
    }
  }

  ok( "text" in popped, "text is a method of the popped instance" );
  plus();

  popped.text({
    start: 5,
    end: 6,
    text: "I am an alias",
    target: "textdiv"
  });

  stop();

  popped.exec( 5, function() {

    equal( textdiv.children[ 0 ].innerHTML, "I am an alias", "I am an alias set by Popcorn.p.text" );
    plus();

    popped.pause();
  }).currentTime( 5 ).play();
});
