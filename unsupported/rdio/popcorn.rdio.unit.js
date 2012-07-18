test( "Popcorn Rdio Plugin", function() {
  var popped = Popcorn( "#video" ),
      expects = 11,
      count = 0,
      setupId,
      rdiodiv = document.getElementById( "rdiodiv" ),
      rdiodiv2 = document.getElementById( "rdiodiv2" ),
      rdiodiv3 = document.getElementById( "rdiodiv3" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "rdio" in popped, "rdio is a method of the popped instance" );
  plus();

  equal( rdiodiv2.innerHTML, "", "initially, there is nothing inside the rdiodiv" );
  plus();

  popped.rdio({
    start: 2,
    end: 4,
    target: "rdiodiv",
    artist: "Erykah Badu",
    album: "Baduizm",
    type: "album"
  })
  .rdio({
    start: 2,
    end: 7,
    target: "rdiodiv",
    person: "scottyhons",
    id: 236475,
    playlist: "Toronto Music",
    type: "playlist"
  })
  .rdio({
    start: 4,
    end: 7,
    target: "rdiodiv2",
    artist: "Radiohead",
    album: "some album",
    type: "album"
  })
  .rdio({
    start: 5,
    end: 8,
    target: "rdiodiv3",
    person: "",
    id: "",
    playlist: "",
    type: "playlist"
  });
  setupId = popped.getLastTrackEventId();
  popped.exec( 2, function() {
    equal( rdiodiv.childElementCount, 2, "rdiodiv now has two inner elements" );
    plus();
    equal( rdiodiv.children[ 0 ].style.display , "inline", "Erykah Badu div is visible on the page" );
    plus();
  });

  popped.exec( 3, function() {
    equal( rdiodiv.children[ 0 ].style.display , "inline", "Erykah Badu div is still visible on the page" );
    plus();
    equal( rdiodiv.children[ 1 ].style.display , "inline", "Scottyhons div is visible on the page" );
    plus();
    equal( rdiodiv2.children[ 0 ].style.display , "none", "null div is not visible on the page" );
    plus();
    equal( rdiodiv3.children[ 0 ].style.display , "none", "null div is not visible on the page" );
    plus();
  });

  popped.exec( 5, function() {
    equal( rdiodiv2.children[ 0 ].innerHTML , "Unknown Source", "Artist information could not be found" );
    plus();
    equal( rdiodiv3.children[ 0 ].innerHTML , "Unknown Source", "Playlist information could not be found" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !rdiodiv3.children[ 0 ], "removed rdio was properly destroyed" );
    plus();
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.rdio({});

  popped.volume( 0 ).play();
});

asyncTest( "Overriding default toString", 2, function() {
  var p = Popcorn( "#video" ),
      artistText = "Rancid",
      lastEvent;

  function testLastEvent( compareText, message ) {
    lastEvent = p.getTrackEvent( p.getLastTrackEventId() );
    equal( lastEvent.toString(), compareText, message );
  }

  p.rdio({
    artist: artistText
  });
  testLastEvent( artistText, "Custom text displayed with toString" );

  p.rdio({});
  testLastEvent( "The Beatles", "Custom text displayed with toString using default" );

  start();
});
