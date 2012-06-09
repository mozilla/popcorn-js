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

  equal( footnotediv.childElementCount, 0, "initially, there is nothing inside the footnotediv" );
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
    equal( footnotediv.childElementCount, 2, "footnotediv now has two inner elements" );
    plus();
    equal( footnotediv.children[ 0 ].innerHTML, "This video made exclusively for drumbeat.org", "footnote displaing correct information" );
    plus();
    equal( footnotediv.children[ 0 ].style.display, "inline", "footnote is visible on the page" );
    plus();
  });

  popped.exec( 3, function() {
    equal( footnotediv.children[ 1 ].style.display, "inline", "second footnote is visible on the page" );
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
