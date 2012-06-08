test( "Popcorn Flickr Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 11,
      count = 0,
      setupId,
      flickrdiv = document.getElementById( "flickrdiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "flickr" in popped, "flickr is a method of the popped instance" );
  plus();

  equal( flickrdiv.innerHTML, "", "initially, there is nothing inside the flickrdiv" );
  plus();

  popped.flickr({
    start: 0,
    end: 3,
    userid: "35034346917@N01",
    numberofimages: 1,
    target: "flickrdiv"
  })
  .flickr({
    start: 4,
    end: 7,
    tags: "georgia",
    numberofimages: 8,
    target: "flickrdiv"
  })
  .flickr({
    start: 8,
    end: 10,
    username: "AniaSob",
    apikey: "d1d249260dd1673ec8810c8ce5150ae1",
    numberofimages: 1,
    target: "flickrdiv"
  });

  setupId = popped.getLastTrackEventId();

  popped.exec( 2, function() {

    ok( /display: inline\b;?/.test( flickrdiv.innerHTML ), "Div contents are displayed" );
    plus();
    ok( /img/.test( flickrdiv.innerHTML ), "An image exists" );
    plus();
  });

  popped.exec( 5, function() {

    var numberOfImages = document.getElementById( "flickrdiv" ).childNodes[ 1 ].getElementsByTagName( "a" ).length;

    ok( /display: inline\b;?/.test( flickrdiv.innerHTML ), "Div contents are displayed" );
    plus();

    ok( /img/.test( flickrdiv.innerHTML ), "An image exists" );
    plus();

    ok( /display: inline\b;?/.test( flickrdiv.innerHTML ), "Images tagged 'georgia' are displayed in div" );
    plus();

    equal( numberOfImages, 8, "There are 8 images tagged 'georgia' being displayed" );
    plus();
  });

  popped.exec( 11, function() {

    ok( /display: none\b;?/.test( flickrdiv.innerHTML ), "Div contents are hidden again" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !flickrdiv.children[ 2 ], "Removed flickr was properly destroyed"  );
    plus();
  });

  // empty track events should be safe
  Popcorn.plugin.debug = false;
  popped.flickr({});

  // debug should log errors on empty track events
  Popcorn.plugin.debug = true;
  try {
    popped.flickr({});
  } catch( e ) {
    ok( true, "empty event was caught by debug" );
    plus();
  }

  popped.volume( 0 ).play();

});
