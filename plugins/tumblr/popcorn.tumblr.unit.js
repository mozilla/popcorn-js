test( "Popcorn Tumblr Plugin", function () {

  Popcorn.plugin.debug = true;

  var popped = Popcorn( "#video" ),
      expects = 10,
      count = 0,
      interval,
      interval2,
      interval3,
      interval4,
      textblogdiv = document.getElementById( "textblogdiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok ( "tumblr" in popped, "Tumblr is a method of the popped instance" );
  plus();

  popped.tumblr( {
    // Video
    requestType: "blogpost",
    target: "videoblogdiv",
    start: 1,
    end: 6,
    base_hostname: "tumblrplugin.tumblr.com",
    blogId: 12884797390,
    width: 500,
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .tumblr( {
    // Audio
    requestType: "blogpost",
    target: "audioblogdiv",
    start: 1,
    end: 6,
    base_hostname: "tumblrplugin.tumblr.com",
    blogId: 12836979043,
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .tumblr( {
    // Photo
    requestType: "blogpost",
    target: "photoblogdiv",
    start: 16,
    end: 20,
    base_hostname: "tumblrplugin.tumblr.com",
    blogId: 12836106846,
    width: 500,
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .tumblr( {
    // Avatar
    requestType: "avatar",
    target: "avatardiv",
    start: 6,
    end: 10,
    base_hostname: "tumblrplugin.tumblr.com",
    size: 512
  } )
  .tumblr( {
    // Blog Info
    requestType: "info",
    target: "bloginfodiv",
    start: 1,
    end: 6,
    base_hostname: "www.davidslog.com",
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .tumblr( {
    // Text
    requestType: "blogpost",
    target: "textblogdiv",
    start: 1,
    end: 5,
    base_hostname: "tumblrplugin.tumblr.com",
    blogId: 10444839996,
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .volume( 0 )
  .play();

  setupId = popped.getLastTrackEventId();

  // Checks if all div elements exist on the page
  ok ( document.getElementById( "bloginfodiv" ), "infodiv exists on the page" );
  plus();
  ok( document.getElementById( "avatardiv" ), "avatardiv exists on the page" );
  plus();
  ok ( document.getElementById( "followersdiv" ), "followersdiv exists on the page" );
  plus();
  ok( document.getElementById( "blogpostdiv" ), "blogpostdiv exists on the page" );
  plus();

  // I inspected the html genterated by facebook, and found that there are no uniquely identifying attributes between plug-in types
  // so right now, we just check ot make sure that facebook is returning a plugin and displaying it at the correct time.
  popped.exec( 3, function() {
    // Checks display style is set correctly on startup
    equals( bloginfodiv.style.display , "", "bloginfodiv is visible on the page with '' display style" );
    plus();
    // Checks if likediv is empty at specific time
    ok( document.getElementById( "followersdiv" ).innerHTML, "likediv is not empty at 0:03 (expected)" );
    plus();
  });

  // Checks if activitydiv is emtpy at specific time
  popped.exec( 4, function() {
    ok( document.getElementById( "avatardiv" ).innerHTML, "avatardiv is not empty at 0:04 (expected)" );
    plus();
    // Checks if likeboxdiv is empty at specific time
    ok( document.getElementById( "followersdiv" ).innerHTML, "followersdiv is not empty at 0:04 (expected)" );
    plus();
    // Checks if facepilediv is empty at specific time
    ok( document.getElementById( "blogpostdiv" ).innerHTML, "blogpostdiv is not empty at 0:04 (expected)" );
    plus();

    // Checks if Comments Plugin was successfully destroyed with _teardown
    popped.pause().removeTrackEvent( setupId );
    ok( !document.getElementById( "blogpostdiv" ).innerHTML, "blogpost tumblr plugin was properly destroyed" );
    plus();

    popped.play();
  });
});


test( "Test Initialized Tumblr Blocks", function () {

  var pop = Popcorn( "#video" );

  expect( 2 );

  // Tests for thrown Error on emtpy block
  try {
    pop.tumblr({});
  } catch( e ) {
    ok( true, "Empty event was caught by debugger" );
  }

  // Tests for thrown Error on invalid plugin type
  try {
    pop.facebook({
      requestType: "asdadsadasad",
      target: "bloginfodiv",
      start: 1,
      end: 5,
      api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
    });
  } catch( e ) {
    ok( true, "tumblr plugin type was invalid." );
  }
});

