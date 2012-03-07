asyncTest( "Popcorn 0.3 JSON Parser Plugin", function () {

  var expects = 9,
      count = 0,
      timeOut = 0,
      numLoadingEvents = 5,
      finished = false,
      trackData,
      trackEvents,
      poppercorn = Popcorn( "#video" );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  poppercorn.parseJSON("data/video.json");
  poppercorn.pause();

  expect(expects);

  trackData = poppercorn.data;
  trackEvents = trackData.trackEvents;

  Popcorn.xhr({
    url: "data/video.json",
    success: function( data ) {

      var idx = 1;

      Popcorn.forEach( data.json.data, function ( dataObj ) {
        Popcorn.forEach( dataObj, function ( obj, key ) {
          equal( trackData.history[ idx ].indexOf( key ), 0, "history item '" + trackData.history[ idx ] + "' matches data key '"+ key + "' at correct index" );
          plus();
          idx++;
        });
      });
    }
  });

  poppercorn.exec( 3, function() {
    if ( !finished ) {
      finished = true;

      equal( trackEvents.byStart.length,  numLoadingEvents + 3 , "trackEvents.byStart.length === (5 loaded, 2 padding) " );
      plus();
      equal( $("#video-iframe-container").children().length, 2, '$("#video-iframe-container").children().length' );
      plus();
      equal( $("#video-map-container").children().length, 1, '$("#video-map-container").children().length'  );
      plus();
      equal( $("#video-footnote-container").children().length, 2, '$("#video-footnote-container").children().length'  );
      plus();

      this.pause();
    }
  });

  poppercorn.listen( "canplayall", function() {
    this.play();
  });
});

asyncTest( "Popcorn 0.3 JSON Parser Plugin - AUDIO", function () {

  var expects = 5,
      count = 0,
      timeOut = 0,
      numLoadingEvents = 5,
      finished = false,
      trackData,
      trackEvents,
      interval,
      audiocorn;

  function getInstance( id ) {
    var instance;
    for ( var i = 0, l = Popcorn.instances.length; i < l; i++ ) {
      instance = instance = Popcorn.instances[ i ];  // Why is it done twice?
      if ( instance.media.id === id ) {
        return instance;
      }
    }
    throw( "instance not found" );
  }

  audiocorn = getInstance( "audio" );

  function plus() {
    if ( ++count === expects ) {
      start();
      // clean up added events after tests
      clearInterval( interval );
      audiocorn.pause();
    }
  }

  expect(expects);

  trackData = audiocorn.data;
  trackEvents = trackData.trackEvents;


  Popcorn.xhr({
    url: "data/audio.json",
    success: function( data ) {

      var idx = 0;

      Popcorn.forEach( data.json.data, function( dataObj ) {
        Popcorn.forEach( dataObj, function( obj, key ) {

          var historyItem = trackData.history[ idx ];

          equal( historyItem.indexOf( key ), 0, "history item '" + historyItem + "' matches data key '"+ key+ "' at correct index" );
          plus();

          idx++;
        });
      });
    }
  });
});

