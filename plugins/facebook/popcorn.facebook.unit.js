test( "Popcorn Facebook Plugin", function () {

  Popcorn.plugin.debug = true;

  var popped = Popcorn( "#video" ),
      expects = 12,
      count = 0,
      interval,
      interval2,
      interval3,
      interval4,
      likediv = document.getElementById( "likediv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok ( "facebook" in popped, "facebook is a method of the popped instance" );
  plus();

  popped.facebook({
    site: "http://popcornjs.org/",
    type: "ACTIVITY",
    target: "activitydiv",
    start: 3,
    end: 11
  })
  .facebook({
    href: "https://www.facebook.com/boardwalkempire",
    type: "FACEPILE",
    target: "facepilediv",
    start: 4,
    end: 11,
    width: 300
  })
  .facebook({
    type: "LIKE",
    target: "likediv",
    layout: "box_count",
    start: 2,
    end: 11
  })
  .facebook({
    type: "send",
    target: "likediv",
    start: 1,
    end: 11
  })
  .facebook({
    href: "http://www.facebook.com/senecacollege",
    type: "LIKE-BOX",
    show_faces: "true",
    header: "false",
    target: "likeboxdiv",
    start: 2,
    end: 13
  })
  .volume( 0 )
  .play();

  setupId = popped.getLastTrackEventId();

  // Checks if all div elements exist on the page
  ok ( document.getElementById( "activitydiv" ), "activitydiv exists on the page" );
  plus();
  ok( document.getElementById( "facepilediv" ), "facepilediv exists on the page" );
  plus();
  ok ( document.getElementById( "likediv" ), "activitydiv exists on the page" );
  plus();
  ok( document.getElementById( "likeboxdiv" ), "facepilediv exists on the page" );
  plus();

  // I inspected the html genterated by facebook, and found that there are no uniquely identifying attributes between plug-in types
  // so right now, we just check ot make sure that facebook is returning a plugin and displaying it at the correct time.
  popped.exec( 3, function() {
    // Counts number of children elements in likediv
    equals( likediv.childElementCount, 2, "likediv has 2 inner elements" );
    plus();
    // Checks display style is set correctly on startup
    equals( likediv.children[ 0 ].style.display , "", "likediv is visible on the page with '' display style" );
    plus();
    // Checks if likediv is empty at specific time
    ok( document.getElementById( "likediv" ).innerHTML, "likediv is not empty at 0:03 (expected)" );
    plus();
  });

  // Checks if activitydiv is emtpy at specific time
  popped.exec( 4, function() {
    ok( document.getElementById( "activitydiv" ).innerHTML, "Activitydiv is not empty at 0:04 (expected)" );
    plus();
    // Checks if likeboxdiv is empty at specific time
    ok( document.getElementById( "likeboxdiv" ).innerHTML, "likeboxdiv is not empty at 0:04 (expected)" );
    plus();
  });

  // Checks if facepilediv is empty at a specific time
  popped.exec( 5, function() {
    ok( document.getElementById( "facepilediv" ).innerHTML, "Facepilediv is not empty at 0:05 (expected)" );
    plus();
  });

  // Checks if _teardown function is run properly on like-box
  popped.exec( 12, function() {
    popped.pause().removeTrackEvent( setupId );
    ok( !document.getElementById( "likeboxdiv" ).innerHTML, "likebox facebook social plugin was properly destroyed" );
    plus();
  });

});


test( "Test Initialized Facebook Blocks", function () {

  var pop = Popcorn( "#video" );

  expect( 2 );

  // Tests for thrown Error on emtpy block
  try {
    pop.facebook({});
  } catch( e ) {
    ok( true, "Empty event was caught by debugger" );
  }

  // Tests for thrown Error on invalid plugin type
  try {
    pop.facebook({
      target: "likediv",
      type: "asdasd",
      start: 1,
      end: 6
    });
  } catch( e ) {
    ok( true, "Facebook plugin type was invalid." );
  }
});

