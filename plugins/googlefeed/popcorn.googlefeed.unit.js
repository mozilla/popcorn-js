test( "Popcorn Google Feed Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 12,
      setupId,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

    ok ( "googlefeed" in popped, "googlefeed is a method of the popped instance" );
    plus();
    ok ( document.getElementById( "feed" ).innerHTML === "", "initially, there is nothing inside the feed" );
    plus();
    ok ( document.getElementById( "feed1" ).innerHTML === "", "initially, there is nothing inside the feed1" );
    plus();

  popped.googlefeed({
    start: 1,
    end: 2,
    target: "feed",
    url: "http://zenit.senecac.on.ca/~chris.tyler/planet/rss20.xml",
    title: "Planet Feed"
	})
	.googlefeed({
    start: 2,
    end: 3,
    target: "feed1",
    url: "http://blog.pikimal.com/geek/feed/",
    title: "pikiGeek",
    orientation: "Horizontal"
  })
  .volume( 0 );

  setupId = popped.getLastTrackEventId();

  popped.exec( 1, function() {
    ok( google.load, "Google Feed is available" );
    plus();
    ok( GFdynamicFeedControl, "Dynamic Feed Control Available" );
    plus();
    ok( document.getElementById( "_feed1" ), "First feed is on the page" );
    plus();
    equal( document.getElementById( "_feed1" ).offsetParent.id, "feed", "First feed is inside the 'feed' div" );
    plus();
    equal( popped.data.trackEvents.byStart[ 1 ].orientation, "vertical", "Defaulting to vertical orientation" );
    plus();
  });
  popped.exec( 2, function() {
    ok( document.getElementById( "_feed2" ), "Second feed is on the page" );
    plus();
    equal( document.getElementById( "_feed2" ).offsetParent.id, "feed1", "Second feed is inside the 'feed2' div" );
    plus();
  });
  popped.exec( 3, function() {
    ok( document.getElementById( "_feed2" ).style.display === "none" &&
        document.getElementById( "_feed1" ).style.display === "none", "Both feeds are no lnger visible" );
	  plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !document.getElementById( "feed1" ).children[ 0 ], "removed feed was properly destroyed" );
    plus();
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.googlefeed({});

  popped.play();

});

asyncTest( "Overriding default toString", 2, function() {
  var p = Popcorn( "#video" ),
      urlText = "http://zenit.senecac.on.ca/~chris.tyler/planet/rss20.xml",
      lastEvent;

  function testLastEvent( compareText, message ) {
    lastEvent = p.getTrackEvent( p.getLastTrackEventId() );
    equal( lastEvent.toString(), compareText, message );
  }

  p.googlefeed({
    url: urlText
  });
  testLastEvent( urlText, "Custom text displayed with toString" );

  p.googlefeed({});
  testLastEvent( "http://planet.mozilla.org/rss20.xml", "Custom text displayed with toString using default" );

  start();
});
