module( "Popcorn Parser" );

asyncTest( "Parsing Functions", function() {

  var expects = 3,
      count = 0,
      popperly = Popcorn( "#video" );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  expect( expects );

  ok( typeof Popcorn.parser === "function", "Popcorn.parser is a function" );
  plus();

  Popcorn.parser( "parseJSON" , "json", function( data ){
    return this;
  });

  ok( typeof popperly.parseJSON === "function", "Popcorn.parser created a parseJSON function" );
  plus();

  ok( typeof popperly.parseJSON().parseJSON( "data/test.js" ).parseJSON === "function" , "parseJSON function is chainable" );
  plus();
});

asyncTest( "Parsing Integrity", function() {

  var expects = 6,
      count = 0,
      timeOut = 0,
      poppercore = Popcorn( "#video" );

  function plus() {
    if ( ++count === expects ) {
      start();
      // clean up added events after tests
      Popcorn.removePlugin( "parserTest" );
    }
  }

  expect( expects );

  Popcorn.parser( "parseJSON2", function( data ){
    ok( typeof data.json === "object", "data.json exists" );
    plus();
    return data.json;
  });

  Popcorn.parser( "parseJSON3" , "json", function( data ){
    ok( typeof data === "object", "data exists" );
    plus();
    return data;
  });

  Popcorn.plugin( "parserTest", {

    start: function() {
      ok( true, "parserTest started" );
      plus();
    },
    end: function() {
      ok( true, "parserTest ended" );
      plus();
    }
  });

  poppercore.parseJSON2( "data/parserData.json", function() {

    poppercore.parseJSON3( "data/parserData.json", function() {
      poppercore.currentTime( 5 ).play();
    });
  });
});

asyncTest( "Parsing Handler - References unavailable plugin", function() {

  var expects = 1,
      count = 0,
      timeOut = 0,
      interval,
      poppercore = Popcorn( "#video" );

  function plus() {
    if ( ++count === expects ) {
      start();
      // clean up added events after tests
      clearInterval( interval );
      poppercore.removePlugin( "parserTest" );
    }
  }

  expect( expects );

  Popcorn.parser( "parseJson", function( data ){

    return data.json;
  });

  poppercore.parseJson( "data/parseMissing.json" );

  // interval used to wait for data to be parsed
  interval = setInterval( function() {
    poppercore.currentTime( 5 ).play().currentTime( 6 );

    ok( true, "Ignored call to missing plugin " );
    plus();
  }, 2000 );
});

asyncTest( "Parser Support - audio", function() {

  var expects = 3,
      count = 0,
      timeOut = 0,
      interval,
      audiocorn = Popcorn( "#audio" );

  function plus() {
    if ( ++count === expects ) {
      start();

      Popcorn.removePlugin( "testAudioParser" );
    }
  }

  expect( expects );

  Popcorn.plugin( "testAudioParser", {

    start: function() {
      ok( true, "testAudioParser started: " + Math.round( this.currentTime() ) );
      plus();
    },
    end: function() {
      ok( true, "testAudioParser ended: " + Math.round( this.currentTime() ) );
      plus();
    }
  });

  Popcorn.parser( "parseAudio", function( data ){
    ok( typeof data.json === "object", "data.json exists");
    plus();
    return data.json;
  });

  audiocorn.parseAudio( "data/parserAudio.json", function() {

    audiocorn.currentTime( 4 ).play();
  });
});
