test( "Popcorn Facebook Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 9,
      count = 0,
      interval,
      interval2,
      interval3,
      interval4,
      subtitlediv;

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
        target: "likediv",
        start: 1,
        end: 6
      })
      .facebook({
        href: "http://www.facebook.com/senecacollege",
        type: "LIKE_BOX",
        target: "likeboxdiv",
        start: 2,
        end: 6
      })
      .facebook({
        site: "http://popcornjs.org/",
        type: "ACTIVITY",
        target: "activitydiv",
        start: 3,
        end: 6
      })
      .facebook({
        href: "http://www.facebook.com/senecacollege",
        type: "FACEPILE",
        target: "facepilediv",
        start: 4,
        end: 6,
        width: 300
      })
    .volume( 0 )
    .play();

  ok( document.getElementById( "likediv" ), "likediv exists on the page" );
  plus();
  ok( document.getElementById( "likeboxdiv" ), "likeboxdiv exists on the page" );
  plus();
  ok( document.getElementById( "activitydiv" ), "activitydiv exists on the page" );
  plus();
  ok( document.getElementById( "facepilediv" ), "facepilediv exists on the page" );
  plus();

  // I inspected the html genterated by facebook, and found that there are no uniquely identifying attributes between plug-in types
  // so right now, we just check ot make sure that facebook is returning a plugin and displaying it at the correct time.

  popped.exec( 2, function() {
    ok( document.getElementById( "likediv" ).innerHTML, "likediv is not empty at 0:02 (expected)" );
    plus();
  });

  popped.exec( 3, function() {
    ok( document.getElementById( "likeboxdiv" ).innerHTML, "likeboxdiv is not empty at 0:03 (expected)" );
    plus();
  });

  popped.exec( 4, function() {
    ok( document.getElementById( "activitydiv" ).innerHTML, "Activitydiv is not empty at 0:04 (expected)" );
    plus();
  });

  popped.exec( 5, function() {
    ok( document.getElementById( "facepilediv" ).innerHTML, "Facepilediv is not empty at 0:05 (expected)" );
    plus();
  });
  
});

test( "Test Empty Block", function () {

  Popcorn.plugin.debug = true;

  var pop = Popcorn( "#video" );
  
  expect( 1 );
  
  // Tests for thrown Error on emtpy block
  try {
    pop.facebook({});
  } catch( e ) {
    ok( true, "Empty event was caught by debugger" );
  }
  
});
