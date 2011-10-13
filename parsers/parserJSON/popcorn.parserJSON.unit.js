test("Popcorn 0.3 JSON Parser Plugin", function () {

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

  expect(expects);

  stop( 10000 );


  trackData = poppercorn.data;
  trackEvents = trackData.trackEvents;

  Popcorn.xhr({
    url: 'data/video.json',
    success: function( data ) {

      var idx = 0;

      Popcorn.forEach( data.json.data, function (dataObj) {

        Popcorn.forEach( dataObj, function ( obj, key ) {

          equals( trackData.history[idx].indexOf(key), 0, "history item '" + trackData.history[idx] + "' matches data key '"+ key+ "' at correct index" );
          plus();

          idx++;
        });
      });


    }
  });

  poppercorn.listen("timeupdate", function ( event ) {


    if ( Math.round( this.currentTime()) === 3 && !finished ) {

      finished = true;

      equals( trackEvents.byStart.length,  numLoadingEvents + 2 , "trackEvents.byStart.length === (5 loaded, 2 padding) " );
      plus();


      equals( $("#video-iframe-container").children().length, 2, '$("#video-iframe-container").children().length' )
      plus();
      equals( $("#video-map-container").children().length, 1, '$("#video-map-container").children().length'  );
      plus();
      equals( $("#video-footnote-container").children().length, 2, '$("#video-footnote-container").children().length'  );
      plus();

      this.pause();

    }
  });

  poppercorn.currentTime(0).play()
});

test("Popcorn 0.3 JSON Parser Plugin - AUDIO", function () {

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
      instance = instance = Popcorn.instances[ i ];
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
    }
  }

  expect(expects);

  stop();


  trackData = audiocorn.data;
  trackEvents = trackData.trackEvents;


  Popcorn.xhr({
    url: 'data/audio.json',
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

