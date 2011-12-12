test( "Popcorn Rdio Plugin", function() {
  
  var popped = Popcorn( "#video" ),
      expects = 12,
      count = 0,
      setupId,
      rdiodiv = document.getElementById( "rdiodiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "rdio" in popped, "rdio is a method of the popped instance" );
  plus();

  equals( rdiodiv.innerHTML, "", "initially, there is nothing inside the rdiodiv" );
  plus();

  popped.rdio({
    start: 1,
    end: 4,
    target: "rdiodiv",
    artist: "Erykah Badu",
    album: "Baduizm"
  })
  .rdio({
    start: 2,
    end: 7,
    target: "rdiodiv",
    person: "scottyhons",
    id: 236475,
    playlist: "Toronto Music"	
  })
  .rdio({
    start: 4,
    end: 7,
    target: "rdiodiv",
    artist: "Radiohead",
    album: "some album"
  })
  .rdio({
    start: 5,
    end: 8,
    target: "rdiodiv",
    person: "some person",
    id: "236475",
    playlist: "some playlist"	
  });
  

  setupId = popped.getLastTrackEventId();

  popped.exec( 2, function() {
    equals( rdiodiv.childElementCount, 4, "rdiodiv now has three inner elements" );
    plus();
    equals( rdiodiv.children[ 0 ].style.display , "inline", "Erykah Badu div is visible on the page" );
    plus();
  });

  popped.exec( 3, function() {
    equals( rdiodiv.children[ 0 ].style.display , "inline", "Erykah Badu div is still visible on the page" );
    plus();
    equals( rdiodiv.children[ 1 ].style.display , "inline", "Scottyhons div is visible on the page" );
    plus();
    equals( rdiodiv.children[ 2 ].style.display , "none", "null div is not visible on the page" );
    plus();
    equals( rdiodiv.children[ 3 ].style.display , "none", "null div is not visible on the page" );
    plus();
  });

  popped.exec( 5, function() {
    equals( rdiodiv.children[ 2 ].innerHTML , "Unknown Artist", "Artist information could not be found" );
    plus();
    equals( rdiodiv.children[ 3 ].innerHTML , "Unknown Playlist", "Playlist information could not be found" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !rdiodiv.children[ 3 ], "removed playlist was properly destroyed" );
    plus();
  });

  // empty track events should be safe
  popped.rdio({});

  // debug should log errors on empty track events
  Popcorn.plugin.debug = true;
  try {
    popped.rdio({});
  } catch( e ) {
    ok( true, "empty event was caught by debug" );
    plus();
  }

  popped.volume( 0 ).play();
});
