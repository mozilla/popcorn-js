
var testData = {

  videoSrc: "#t=,20",
  expectedDuration: 20,

  createMedia: function( id ) {
    return Popcorn.HTMLNullVideoElement( id );
  },

  playerSpecificSyncTests: function() {

    test( "Null Wrapper 01 - Null regex testing ", 4, function() {

      var video = testData.createMedia( "#video" );

      video.src = "#t=,123.12";
      ok( video.duration === 123.12 && video.currentTime === 0, "Correct duration and currentTime" );

      video.src = "#t=0.5,123.12";
      ok( video.duration === 123.12 && video.currentTime === 0.5, "Correct duration and currentTime" );

      video.src = "#t=,123";
      ok( video.duration === 123 && video.currentTime === 0, "Correct duration and currentTime" );

      video.src = "#t=12.54,123";
      ok( video.duration === 123 && video.currentTime === 12.54, "Correct duration and currentTime" );

    });
      
    asyncTest( "Null Wrapper 02 - Null playbackRate testing ", 1,  function() {

      nullVid = Popcorn.HTMLNullVideoElement("#video");
      nullVid.src = "#t=,9";
      vid = Popcorn(nullVid);
      vid.playbackRate(-1);
      vid.play(5);
      vid.cue(2, function(){
        ok( vid.playbackRate() === -1, "Correct playbackRate");
        start();
      });
      vid.cue(6, function(){
        ok( false, "Incorrect playbackRate");
      });
    });
  }

};
