test( "Popcorn LastFM Plugin", function() {
  /*
    ATTENTION

    This demo uses an API key obtained for testing the LastFM Popcorn.js
    plugin. Please do not use it for other purposes.
  */
  var popped = Popcorn( "#video" ),
      expects = 9,
      count = 0,
      setupId,
      lastfmdiv = document.getElementById( "lastfmdiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "lastfm" in popped, "lastfm is a method of the popped instance" );
  plus();

  equal( lastfmdiv.innerHTML, "", "initially, there is nothing inside the lastfmdiv" );
  plus();

  popped.lastfm({
    start: 1,
    end: 4,
    artist: "yacht",
    target: "lastfmdiv",
    apikey: "30ac38340e8be75f9268727cb4526b3d"
  })
  .lastfm({
    start: 2,
    end: 7,
    artist: "the beatles",
    target: "lastfmdiv",
    apikey: "30ac38340e8be75f9268727cb4526b3d"
  })
  .lastfm({
    start: 4,
    end: 7,
    target: "lastfmdiv",
    apikey: "30ac38340e8be75f9268727cb4526b3d"
  });

  setupId = popped.getLastTrackEventId();

  popped.exec( 2, function() {
    equal( lastfmdiv.childElementCount, 3, "lastfmdiv now has three inner elements" );
    plus();
    equal( lastfmdiv.children[ 0 ].style.display , "inline", "yachtdiv is visible on the page" );
    plus();
  });

  popped.exec( 3, function() {
    equal( lastfmdiv.children[ 0 ].style.display , "inline", "yachtdiv is still visible on the page" );
    plus();
    equal( lastfmdiv.children[ 1 ].style.display , "inline", "beatlesdiv is visible on the page" );
    plus();
    equal( lastfmdiv.children[ 2 ].style.display , "none", "nulldiv is not visible on the page" );
    plus();
  });

  popped.exec( 5, function() {
    equal( lastfmdiv.children[ 2 ].innerHTML , "Unknown Artist", "Artist information could not be found" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !lastfmdiv.children[ 2 ], "removed artist was properly destroyed" );
    plus();
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.lastfm({});

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

  p.lastfm({
    artist: artistText
  });
  testLastEvent( artistText.toLowerCase(), "Custom text displayed with toString" );

  p.lastfm({});
  testLastEvent( "the beatles", "Custom text displayed with toString using default" );

  start();
});
