test( "Popcorn SlideShare Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 9,
      count = 0,
      setupId,
      slidesharediv = document.getElementById( "slidesharediv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "slideshare" in popped, "slideshare is a method of the popped instance" );
  plus();

  equal( slidesharediv.innerHTML, "", "initially, there is nothing inside the slidesharediv" );
  plus();

  popped.slideshare({
    start: 1,
    end: 5,
    slideshowurl: "http://www.slideshare.net/storycode/storycode-immersion-5-popcornjs-deep-dive",
    startslide:1,
    target: "slidesharediv"
  })
  .slideshare({
	  start: 5,
      end: 10,
      slideshowurl: "http://www.slideshare.net/storycode/storycode-immersion-5-popcornjs-deep-dive",
      startslide:8,
      target: "slidesharediv"
  })
  .slideshare({
	  start: 10,
      end: 15,
      slideshowurl: "http://www.slideshare.net/storycode/storycode-immersion-5-popcornjs-deep-dive",
      startslide:16,
      target: "slidesharediv"
  });

  setupId = popped.getLastTrackEventId();

  popped.cue( 2, function() {

    ok( /display: inline\b;?/.test( slidesharediv.innerHTML ), "Div contents are displayed" );
    plus();
    ok( /src/.test( slidesharediv.innerHTML ), "An slide exists" );
    plus();
  });

  popped.cue( 8, function() {

    ok( /display: inline\b;?/.test( slidesharediv.innerHTML ), "Div contents are displayed" );
    plus();

    ok( /src/.test( slidesharediv.innerHTML ), "An slide exists" );
    plus();

    ok( /startSlide=8/.test( slidesharediv.innerHTML ), "Slide 8 is displayed in div" );
    plus();
  });

  popped.cue( 16, function() {

    ok( /display: none\b;?/.test( slidesharediv.innerHTML ), "Div contents are hidden again" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !slidesharediv.children[ 2 ], "Removed slideshare was properly destroyed"  );
    plus();
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.slideshare({});

  popped.volume( 0 ).play();

});

