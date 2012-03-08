test( "Popcorn Tumblr Plugin", function () {

  Popcorn.plugin.debug = true;

  var popped = Popcorn( "#video" ),
      expects = 6,
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
    end: 4,
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
    end: 4,
    base_hostname: "tumblrplugin.tumblr.com",
    blogId: 12836979043,
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .tumblr( {
    // Photo
    requestType: "blogpost",
    target: "photoblogdiv",
    start: 1,
    end: 4,
    base_hostname: "tumblrplugin.tumblr.com",
    blogId: 12836106846,
    width: 500,
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .tumblr( {
    // Avatar
    requestType: "avatar",
    target: "avatardiv",
    start: 1,
    end: 5,
    base_hostname: "tumblrplugin.tumblr.com",
    size: 512
  } )
  .tumblr( {
    // Blog Info
    requestType: "info",
    target: "bloginfodiv",
    start: 1,
    end: 4,
    base_hostname: "http://www.davidslog.com",
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .tumblr( {
    // Text
    requestType: "blogpost",
    target: "textblogdiv",
    start: 1,
    end: 6,
    base_hostname: "tumblrplugin.tumblr.com",
    blogId: 10444839996,
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  } )
  .volume( 0 )
  .play();

  setupId = popped.getLastTrackEventId();

  popped.exec( 3, function() {
    // Checks display style is set correctly on startup
    equal( textblogdiv.style.display , "", "textblogdiv is visible on the page with '' display style" );
    plus();
  });

  // Simply checking if the HTML is present in the div
  popped.exec( 4, function() {
    // Checks if avatardiv is emtpy at specific time
    ok( document.getElementById( "avatardiv" ).innerHTML, "avatardiv is not empty at 0:04 (expected)" );
    plus();
    // Checks if photoblogdiv is empty at specific time
    ok( document.getElementById( "photoblogdiv" ).innerHTML, "photoblogdiv is not empty at 0:04 (expected)" );
    plus();
    // Checks if videoblogdiv is empty at specific time
    ok( document.getElementById( "videoblogdiv" ).innerHTML, "videoblogdiv is not empty at 0:04 (expected)" );
    plus();
    // Checks if audioblogdiv is empty at specific time
    ok( document.getElementById( "audioblogdiv" ).innerHTML, "audioblogdiv is not empty at 0:04 (expected)" );
    plus();
  });

  popped.exec( 5, function() {
    // Checks if the Text Blog Post was successfully destroyed with _teardown
    popped.pause().removeTrackEvent( setupId );
    ok( !document.getElementById( "textblogdiv" ).innerHTML, "blogpost tumblr plugin was properly destroyed" );
    plus();

    popped.play();
  });
});


test( "Test Initialized Tumblr Blocks throwing Errors", function () {

  Popcorn.plugin.debug = true;

  var pop = Popcorn( "#video" ), expects = 6;

  expect( expects );
  stop();

  // Tests for thrown Error on emtpy block
  try {
    pop.tumblr({});
  } catch( e ) {
    ok( true, "Empty event was caught by debugger" );
  }

  // Tests for thrown Error on invalid plugin type
  try {
    pop.tumblr({
      requestType: "asdadsadasad",
      target: "testsdiv",
      start: 1,
      end: 5,
      base_hostname: "tumblrplugin.tumblr.com",
      api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
    });
  } catch( e ) {
    ok( true, "tumblr plugin type was invalid." );
  }

  // No blogId supplied for blogpost request
  try {
    pop.tumblr({
      requestType: "blogpost",
      target: "testsdiv",
      start: 1,
      end: 5,
      base_hostname: "tumblrplugin.tumblr.com",
      api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
    });
  } catch( e ) {
    ok( true, "Caught no blogId for blogpost type." );
  }

  // Checking no API KEY
  try {
    pop.tumblr({
      requestType: "blogpost",
      target: "testsdiv",
      start: 1,
      end: 5,
      base_hostname: "tumblrplugin.tumblr.com",
      blogId: 10444839996
    });
  } catch( e ) {
    ok( true, "Caught no API_KEY for blogpost type." );
  }

  // Checking no base_hostname provided
  try {
    pop.tumblr({
      requestType: "blogpost",
      target: "testsdiv",
      start: 1,
      end: 5,
      blogId: 10444839996,
      api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
    });
  } catch( e ) {
    ok( true, "Caught no base_hostname for blogpost type." );
  }

  // Checking for a failing in request from API using invalid blogId
  pop.listen( "tumblrError", function() {
    ok( true, "Caught failed request from API for blogId." );
    start();
  });

  pop.tumblr({
    requestType: "blogpost",
    target: "testsdiv",
    start: 1,
    end: 5,
    blogId: 1,
    base_hostname: "tumblrplugin.tumblr.com",
    api_key: "7lQpV9mMr2PiYjd20FavZcmReq8cWU0oHTS6d3YIB8rLUQvvcg"
  });
});

