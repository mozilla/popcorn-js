
var testData = {

  videoSrc: "#t=,20",
  expectedDuration: 20,

  createMedia: function( id ) {
    return Popcorn.HTMLNullVideoElement( id );
  },

  playerSpecificAsyncTests: function() {

    asyncTest( "NullVideo 01 - durationchange fired after setting duration", 1, function() {

      var video = testData.createMedia( "#video" );

      video.src = testData.videoSrc;

      video.addEventListener( "durationchange", function onDurationChange() {
        video.removeEventListener( "durationchange", onDurationChange, false );

        equal( video.duration, 35, "Null video properly had it's new duration set." );
        start();
      }, false );

      video.duration = 35;
    });

  }

};
