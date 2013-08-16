
// Find a suitable video source for this browser.
var videoSource = (function() {

  var v = document.createElement( "video" ),
    sources = [
      {
        type: "video/webm",
        file: "../../test/trailer.webm"
      },
      {
        type: "video/mp4",
        file: "../../test/trailer.mp4"
      },
      {
        type: "video/ogg",
        file: "../../test/trailer.ogv"
      }
    ],
    source,
    sourcesLength = sources.length;

  while( sourcesLength-- ) {
    source = sources[ sourcesLength ];
    if( v.canPlayType( source.type ) !== "" ) {
      return source;
    }
  }

  throw "No Supported Media Types found for this browser.";

}());


var testData = {

  videoSrc: videoSource.file,
  videoType: videoSource.type,
  expectedDuration: 64.544,

  createMedia: function( id ) {
    return Popcorn.HTMLVideoElement( id );
  }

  test( "HTML5 Media Wrapper 01 - can rate playback", 1, function() {
      var video = testData.createMedia( "#video" );
      ok( video.canRatePlayback === true, "Can rate playback");
    });

  asyncTest( "HTML5 Media Wrapper 02 - change playback rate", 2, function() {
      var video = testData.createMedia( "#video" );

      video.on("loadeddata", function () {
        equal( video.playbackRate, 1, "Playback rate is 1 by default" );

        video.on("ratechange", function onRateChange () {
          video.off("ratechange", onRateChange);
          equal( video.playbackRate, 2, "Playback rate is 2" );
        });
        video.playbackRate(2);  
      });
      
    });

};
