test( "Popcorn Facebook Plugin", function () {

  Popcorn.plugin.debug = true;

  var popped = Popcorn( "#video" ),
      expects = 16,
      count = 0,
      interval,
      interval2,
      interval3,
      interval4,
      likediv = document.getElementById( "likediv" ),
      commentdiv = document.getElementById( "commentdiv" );

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
    start: 1,
    end: 6
  })
  .facebook({
    href: "https://www.facebook.com/boardwalkempire",
    type: "FACEPILE",
    target: "facepilediv",
    start: 1,
    end: 6,
    width: 300
  })
  .facebook({
    type: "LIKE",
    target: "likediv",
    layout: "box_count",
    start: 2,
    end: 6
  })
  .facebook({
    type: "send",
    target: "likediv",
    start: 1,
    end: 6
  })
  .facebook({
    href: "http://www.facebook.com/senecacollege",
    type: "LIKE-BOX",
    show_faces: "true",
    header: "false",
    target: "likeboxdiv",
    start: 2,
    end: 6
  })
  .facebook({
    href: "example.com",
    type: "COMMENTS",
    target: "commentdiv",
    start: 2,
    end: 6,
    num_posts: 5
  })
  .volume( 0 )
  .play();

  setupId = popped.getLastTrackEventId();

  // Checks if all div elements exist on the page
  ok ( document.getElementById( "activitydiv" ), "activitydiv exists on the page" );
  plus();
  ok( document.getElementById( "facepilediv" ), "facepilediv exists on the page" );
  plus();
  ok ( document.getElementById( "likediv" ), "likediv exists on the page" );
  plus();
  ok( document.getElementById( "likeboxdiv" ), "likeboxdiv exists on the page" );
  plus();
  ok( document.getElementById( "commentdiv" ), "commentdiv exists on the page" );
  plus();

  popped.exec( 1, function() {
    equal( commentdiv.children[ 0 ].style.display, "none", "comment div is not visible on page with \"none\" display style" );
    plus();
  });
  // I inspected the html genterated by facebook, and found that there are no uniquely identifying attributes between plug-in types
  // so right now, we just check ot make sure that facebook is returning a plugin and displaying it at the correct time.
  popped.exec( 3, function() {
    // Counts number of children elements in likediv
    equal( likediv.childElementCount, 2, "likediv has 2 inner elements" );
    plus();
    // Checks display style is set correctly on startup
    equal( likediv.children[ 0 ].style.display , "", "likediv is visible on the page with \"\" display style" );
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
    // Checks if facepilediv is empty at specific time
    ok( document.getElementById( "facepilediv" ).innerHTML, "Facepilediv is not empty at 0:04 (expected)" );
    plus();
    // Checks if likediv is empty at specific time
    ok( document.getElementById( "likediv" ).innerHTML, "likediv is not empty at 0:04 (expected)" );
    plus();
    // Checks if commentdiv is empty at specific time
    ok( document.getElementById( "commentdiv" ).innerHTML, "commentdiv is not empty at 0:04 (expected)" );
    plus();

    // Checks if Comments Plugin was successfully destroyed with _teardown
    popped.pause().removeTrackEvent( setupId );
    ok( !document.getElementById( "commentdiv" ).innerHTML, "comments facebook social plugin was properly destroyed" );
    plus();

    popped.play();
  });

  // Empty plugin should be safe.
  popped.facebook({});
});

