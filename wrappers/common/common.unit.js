
// TODO: more tests from http://w3c-test.org/html/tests/approved/video

/**
 * This is a shared test suite.  If you change something for one wrapper,
 * make sure you test against all others, and don't assume it will work
 * everywhere.  All tests assume the existence of a testData object, with
 * info about media URLs and durations, as well as a createMedia factory
 * method.  Each wrapper's test file does things slighlty different in order
 * to accomodate differences in browsers/APIs.  See popcorn.HTML*Element.unit.js
 */

// Order matters, and async before sync
QUnit.config.reorder = false;

// Fail any test that takes more than 20s
QUnit.config.testTimeout = 20000;

// If a test times out, we may still have listeners that need to get
// cleaned up.  To deal with this case, we wrap createMedia to return
// an instance which adds extra bookkeeping around event listeners.
// Every event listener gets cached, and when the test is finished, the
// listeners in the cache are cleared.
testData.createMedia = (function( createMedia ) {

  var testListeners = [];
  function addTestListener( o, type, listener, useCapture ) {
    testListeners.push( function() {
      try{
        o.removeEventListener( type, listener, useCapture );
      } catch (e) {}
    });
  }

  QUnit.testDone = function() {
    var i = testListeners.length;
    while( i-- ) {
      testListeners[ i ]();
      testListeners[ i ] = null;
    }
    testListeners = [];
  };

  return function( id ) {
    var media = createMedia( id );
    media.$addEventListener = media.addEventListener;
    media.addEventListener = function( type, listener, useCapture ) {
      addTestListener( media, type, listener, useCapture );
      media.$addEventListener( type, listener, useCapture );
    };
    return media;
  };
}( testData.createMedia ));


/** Async Tests Need to happen first.  Add Sync tests below these. **/

asyncTest( "T01 - error when loading bad type [Known to timeout in Video/Audio+Safari (ticket #1262)]", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "error", function onError() {
    video.removeEventListener( "error", onError, false );
    equal( video.error.code, MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, "error when setting invalid source URL" );
    start();
  }, false);

  video.src = "garbage";

});


asyncTest( "T02 - volumechange for volume", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "volumechange", function onVolumeChange() {
    video.removeEventListener( "volumechange", onVolumeChange, false );
    equal( video.volume, 0.5, "volumechange fires when volume is changed" );
    start();
  }, false);

  video.src = testData.videoSrc;
  video.volume = 0.5;

});


asyncTest( "T03 - volumechange for muted", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "volumechange", function onVolumeChange() {
    video.removeEventListener( "volumechange", onVolumeChange, false );
    ok( video.muted, "volumechange fires when muted is changed" );
    start();
  }, false);

  video.src = testData.videoSrc;
  video.muted = true;

});


asyncTest( "T04 - loadstart", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "loadstart", function onLoadStart() {
    video.removeEventListener( "loadstart", onLoadStart, false );
    ok( true, "loadstart event fired" );
    start();
  }, false);

  video.src = testData.videoSrc;

});


asyncTest( "T05 - loadedmetadata", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "loadedmetadata", function onLoadedMetadata() {
    video.removeEventListener( "loadedmetadata", onLoadedMetadata, false );
    ok( true, "loadedmetadata event fired" );
    start();
  }, false);

  video.src = testData.videoSrc;

});


asyncTest( "T06 - loadeddata", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "loadeddata", function onLoadedData() {
    video.removeEventListener( "loadeddata", onLoadedData, false );
    ok( true, "loadeddata event fired" );
    start();
  }, false);

  video.src = testData.videoSrc;

});


asyncTest( "T07 - loadedmetadata before loadeddata", 1, function() {

  var video = testData.createMedia( "#video" ),
    loadedmetadata = false,
    loadeddata = false;

  video.addEventListener( "loadedmetadata", function onLoadedMetadata() {
    video.removeEventListener( "loadedmetadata", onLoadedMetadata, false );
    loadedmetadata = true;
  }, false);

  video.addEventListener( "loadeddata", function onLoadedData() {
    video.removeEventListener( "loadeddata", onLoadedData, false );
    ok( !loadeddata && loadedmetadata, "loadedmetadata before loadeddata" );
    start();
  }, false);

  video.src = testData.videoSrc;

});


asyncTest( "T08 - progress event", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "progress", function onProgress() {
    video.removeEventListener( "progress", onProgress, false );
    ok( true, "progress event fired" );
    start();
  }, false);

  video.src = testData.videoSrc;

});


asyncTest( "T09 - loadstart, progress event order", 1, function() {

  var video = testData.createMedia( "#video" ),
    loadstart = false,
    progress = false;

  video.addEventListener( "loadstart", function onLoadStart() {
    video.removeEventListener( "loadstart", onLoadStart, false );
    loadstart = true;
  }, false);

  video.addEventListener( "progress", function onProgress() {
    video.removeEventListener( "progress", onProgress, false);
    ok( !progress && loadstart, "loadstart before progress event" );
    start();
  }, false);

  video.src = testData.videoSrc;

});

asyncTest( "T10 - canplay event", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "canplay", function onCanPlay() {
    video.removeEventListener( "canplay", onCanPlay, false );
    ok( true, "canplay fired" );
    start();
  }, false);

  video.preload = "auto";
  video.src = testData.videoSrc;

});


asyncTest( "T11 - readyState in canplay [Known to fail in Video/Audio+Firefox (ticket #1263)]", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "canplay", function onCanPlay() {
    video.removeEventListener( "canplay", onCanPlay, false );
    ok( video.readyState >= video.HAVE_FUTURE_DATA,
        "video.readyState should be >= HAVE_FUTURE_DATA during canplay event" );
    start();
  }, false);

  video.preload = "auto";
  video.src = testData.videoSrc;

});


asyncTest( "T12 - readyState in canplaythrough [Known to fail in Video/Audio+Firefox (ticket #1264)]", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "canplaythrough", function onCanPlayThrough() {
    video.removeEventListener( "canplaythrough", onCanPlayThrough, false );
    equal( video.readyState, video.HAVE_ENOUGH_DATA,
           "video.readyState should be HAVE_ENOUGH_DATA during canplaythrough event" );
    start();
  }, false);

  video.preload = "auto";
  video.src = testData.videoSrc;

});


asyncTest( "T13 - readyState in loadedmetadata", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "loadedmetadata", function onLoadedMetadata() {
    video.removeEventListener( "loadedmetadata", onLoadedMetadata, false );
    ok( video.readyState >= video.HAVE_METADATA,
        "video.readyState should >= HAVE_METADATA during loadedmetadata event" );
    start();
  }, false);

  video.preload = "auto";
  video.src = testData.videoSrc;

});


asyncTest( "T14 - canplaythrough event", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "canplaythrough", function onCanPlayThrough() {
    video.removeEventListener( "canplaythrough", onCanPlayThrough, false );
    ok( true, "canplaythrough fired" );
    start();
  }, false);

  video.preload = "auto";
  video.src = testData.videoSrc;

});


asyncTest( "T15 - canplay, canplaythrough event order", 1, function() {

  var video = testData.createMedia( "#video" ),
      canplay = false;

  video.addEventListener( "canplay", function onCanPlay() {
    video.removeEventListener( "canplay", onCanPlay, false );
    canplay = true;
  }, false);

  video.addEventListener( "canplaythrough", function onCanPlayThrough() {
    video.removeEventListener( "canplaythrough", onCanPlayThrough, false );
    ok( canplay, "canplay before canplaythrough" );
    start();
  }, false);

  video.preload = "auto";
  video.src = testData.videoSrc;

});


asyncTest( "T16 - canplay, playing event order", 1, function() {

  var video = testData.createMedia( "#video" ),
      canplay = false;

  video.addEventListener( "canplay", function onCanPlay() {
    video.removeEventListener( "canplay", onCanPlay, false );
    canplay = true;
    video.play();
  }, false);

  video.addEventListener( "playing", function onPlaying() {
    video.removeEventListener( "playing", onPlaying, false );
    video.pause();
    ok( canplay, "canplay before playing" );
    start();
  }, false);

  video.preload = "auto";
  video.muted = true;
  video.src = testData.videoSrc;

});


asyncTest( "T17 - paused false during play", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "play", function onPlay() {
    video.removeEventListener( "play", onPlay, false );
    ok( !video.paused, "paused is false during play" );
    start();
  }, false);

  video.autoplay = true;
  video.src = testData.videoSrc;

});


asyncTest( "T18 - pause event", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "play", function onPlay() {
    video.removeEventListener( "play", onPlay, false );
    video.pause();
  }, false);


  video.addEventListener( "pause", function onPause() {
    video.removeEventListener( "pause", onPause, false );
    ok( true, "pause() triggers pause" );
    start();
  }, false);

  video.autoplay = true;
  video.muted = true;
  video.src = testData.videoSrc;

});


asyncTest( "T19 - play event", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "play", function onPlay() {
    video.removeEventListener( "play", onPlay, false );
    video.pause();
    ok( true, "play event triggered by autoplay" );
    start();
  }, false);

  video.autoplay = true;
  video.muted = true;
  video.src = testData.videoSrc;

});


asyncTest( "T20 - playing event", 1, function() {

  var video = testData.createMedia( "#video" ),
    pause = 0,
    playing = 0;

  video.addEventListener( "pause", function onPause() {
    if( pause < 2 ) {
      pause++;
      video.play();
    } else {
      equal( playing, 3, "playing event should happen, and on every play()" );
      start();
    }
  }, false);

  video.addEventListener( "playing", function onPlaying() {
    playing++;
    video.pause();
  }, false);

  video.muted = true;
  video.autoplay = true;
  video.src = testData.videoSrc;

});


asyncTest( "T21 - paused is true when paused", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "play", function onPlay() {
    video.removeEventListener( "play", onPlay, false );
    video.pause();
  }, false);

  video.addEventListener( "pause", function onPause() {
    video.removeEventListener( "pause", onPause, false );
    ok( video.paused, "paused is true while paused" );
    start();
  }, false);

  video.muted = true;
  video.src = testData.videoSrc;
  video.play();

});


asyncTest( "T22 - Setting src loads video, triggers loadedmetadata, sets currentSrc", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "loadedmetadata", function onLoadedMetadata() {
    video.removeEventListener( "loadedmetadata", onLoadedMetadata, false );
    // If we're running locally, paths will break us, check filename
    ok( ( testData.videoSrc === video.currentSrc ) ||
        ( testData.videoSrc.split( "/" ).reverse()[ 0 ] === video.currentSrc.split( "/" ).reverse()[ 0 ] ),
        "currentSrc is set in loadedmetadata" );
    start();
  }, false);

  video.preload = "auto";
  video.src = testData.videoSrc;

});


asyncTest( "T23 - video.duration, durationchagne event", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "durationchange", function onDurationChange() {
    video.removeEventListener( "durationchange", onDurationChange, false );
    equal( Math.round( video.duration ),
           Math.round( testData.expectedDuration ),
           "duration is set and durationchange fired." );
    start();
  }, false);

  video.src = testData.videoSrc;

});


asyncTest( "T24 - currentTime, seeking, seeked [Known to fail with Vimeo+Firefox, SoundClound+Firefox (ticket #1265)]", 2, function() {

  var video = testData.createMedia( "#video" ),
      eventOrder = "";

  video.addEventListener( "playing", function onPlaying() {
    video.removeEventListener( "playing", onPlaying, false );
    video.currentTime = 10;
  }, false);

  video.addEventListener( "seeking", function onSeek() {
    video.removeEventListener( "seeking", onSeek, false );
    eventOrder += "seeking";
  }, false);

  video.addEventListener( "seeked", function onSeeked() {
    video.removeEventListener( "seeked", onSeeked, false );
    var currentTime = Math.floor( video.currentTime );
    eventOrder += "seeked";

    equal( eventOrder, "seekingseeked", "seeking then seeked" );
    // Seeking isn't perfect, so look for it to be close or we'll fail a lot.
    ok( currentTime === 9 || currentTime === 10, "duration is ~10 after seek ends. Known to fail using SoundCloud with Firefox, due to Flash." );
    start();
  }, false);

  video.muted = true;
  video.autoplay = true;
  video.src = testData.videoSrc;

});


asyncTest( "T25 - ended [Known to fail with Vimeo+Chrome, Vimeo+Firefox (ticket #1266)]", 4, function() {

  var video = testData.createMedia( "#video" );
  var duration = testData.shortVideoSrc ? testData.shortExpectedDuration : testData.expectedDuration;

  video.addEventListener( "play", function onPlay() {
    video.removeEventListener( "play", onPlay, false );
    // Fast-forward to almost the end of the media
    video.currentTime = duration - 1;
  }, false);

  video.addEventListener( "pause", function onPause() {
    video.removeEventListener( "pause", onPause, false );
    ok( true, "pause fired at end" );
    ok( video.ended, "pause fired at end [Known to fail in youtube due to pause events being fired at some unspecified time after a seekTo call.]" );

    video.addEventListener( "timeupdate", function onTimeUpdate() {
      video.removeEventListener( "timeupdate", onTimeUpdate, false );
      ok( true, "timeupdate fired at end" );

      video.addEventListener( "ended", function onEnded() {
        video.removeEventListener( "ended", onEnded, false );
        ok( true, "ended fired at end" );
        start();
      }, false );
    }, false );
  }, false );

  video.autoplay = true;
  video.muted = true;
  video.src = testData.shortVideoSrc ? testData.shortVideoSrc : testData.videoSrc;

});


asyncTest( "T26 - loop (NOTE: test takes a minute to complete) [Known to fail with Vimeo+Firefox (ticket #1267)]", 3, function() {

  var video = testData.createMedia( "#video" ),
      playCount = 0,
      seekingCount = 0,
      seekedCount = 0,
      fastForwarding = false,
      duration = testData.shortVideoSrc ? testData.shortExpectedDuration : testData.expectedDuration;

  function onTimeUpdate() {
    // Fast-forward toward the end of the video when at the start
    if( ( video.currentTime >= 1.0 && video.currentTime <= 2.0 ) &&
        !fastForwarding ) {
      fastForwarding = true;
      video.currentTime = duration - 1;
    }
  }
  video.addEventListener( "timeupdate", onTimeUpdate, false );


  function onPlay() {
    playCount += 1;
    equal( playCount, 1, "Should get exactly one play event." );
  }
  video.addEventListener( "play", onPlay, false );

  function onSeeking() {
    seekingCount += 1;
  }
  video.addEventListener( "seeking", onSeeking, false );

  function onSeeked() {
    fastForwarding = false;
    seekedCount += 1;

    if( seekedCount === 3 ) {
      equal( seekingCount, 3, "Expect matched pairs of seeking/seeked events.");
      video.removeEventListener( "timeupdate", onTimeUpdate, false );
      video.loop = false;
    }
  }
  video.addEventListener( "seeked", onSeeked, false );

  video.addEventListener( "ended", function onEnded() {
    video.removeEventListener( "ended", onEnded, false );
    video.removeEventListener( "seeking", onSeeking, false );
    video.removeEventListener( "seeked", onSeeked, false );
    video.removeEventListener( "play", onPlay, false );
    equal( video.loop, false, "Shouldn't get ended event while looping." );
    start();
  }, false);

  video.loop = true;
  video.muted = true;
  video.autoplay = true;
  video.src = testData.shortVideoSrc ? testData.shortVideoSrc : testData.videoSrc;

});


// Add any player-specific async tests now
if( testData.playerSpecificAsyncTests ) {
  testData.playerSpecificAsyncTests();
}


/** Sync Tests **/

test( "T27 - _canPlaySrc", function() {

  var video = testData.createMedia( "#video" );
  // HTML5 wrapped media will always give "maybe", so deal with "" and "maybe"
  notEqual( video._canPlaySrc( "garbage" ), "probably", "Empty string or Maybe if we can't play the type" );
  notEqual( video._canPlaySrc( testData.videoSrc ), "",
            "Report maybe/probably if we can play the type" );

  // TODO: canPlayType tests for each wrapper
});


test( "T28 - currentSrc", function() {

  var video = testData.createMedia( "#video" );
  equal( video.currentSrc, "", "currentSrc is empty if there is no source" );

/** This fails in all browsers, so I think spec has maybe changed...
  video.src = testData.videoSrc;
  notEqual( video.currentSrc, "", "currentSrc is not empty after setting src" );
**/

});


test( "T29 - error is null", function() {

  var video = testData.createMedia( "#video" );
  equal( video.error, null, "error is null if no source" );

});


test( "T30 - error when video parameter is bad", function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "error", function onError() {
    video.removeEventListener( "error", onError, false );
    equal( video.error.code, MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED,
           "MEDIA_ERR_SRC_NOT_SUPPORTED when param is invalid." );
  }, false);

  video.src = "data:video/x-fake;base64,0";

});


test( "T31 - muted", function() {

  var video = testData.createMedia( "#video" );

  equal( video.muted, false, "muted is false by default" );

  video.muted = true;
  equal( video.muted, true, "muted is true" );

});


test( "T32 - volume values", function() {

  var video = testData.createMedia( "#video" );

  video.volume = 0;
  equal( video.volume, 0, "Setting volume to 0" );

  video.volume = 1;
  equal( video.volume, 1, "Setting volume to 1" );

  // Invalid volume values (outside 0.0 to 1.0)
  raises( function() { video.volume = -0.1; } );
  raises( function() { video.volume = 1.1; } );

});


test( "T33 - networkState", function() {

  var video = testData.createMedia( "#video" );
  ok( video.networkState === video.NETWORK_EMPTY ||
      video.networkState === video.NETWORK_NO_SOURCE,
      "networkState is initially NETWORK_EMPTY or NETWORK_NO_SOURCE" );

});

asyncTest( "T34 - paused state during autoplay", 10, function() {

  var video = testData.createMedia( "#video" ),
      loadedMetaDataFired = false,
      canplayFired = false,
      playFired = false,
      playingFired = false,
      canPlayThrough = false;

  video.addEventListener( "loadedmetadata", function onLoadedMetaData() {
    video.removeEventListener( "loadedmetadata", onLoadedMetaData, false );
    loadedMetaDataFired = true;
    ok( !video.paused, "video is playing during loadedmetadata" );
  }, false);

  video.addEventListener( "canplay", function onCanPlay() {
    video.removeEventListener( "canplay", onCanPlay, false );
    canPlayFired = true;
    ok( !playFired, "play has not yet been fired on canplay from an autoplay" );
    ok( loadedMetaDataFired, "loadedMetaDataFired has been fired on canplay from an autoplay" );
  }, false);

  video.addEventListener( "play", function onPlay() {
    video.removeEventListener( "play", onPlay, false );
    playFired = true;
    ok( !playingFired, "playing has not yet been fired on play from an autoplay" );
    ok( canPlayFired, "canplay has been fired on play from an autoplay" );
  }, false);

  video.addEventListener( "playing", function onPlaying() {
    video.removeEventListener( "playing", onPlaying, false );
    playingFired = true;
    ok( !canPlayThrough, "canplaythrough has not yet been fired on playing from an autoplay" );
    ok( playFired, "play has been fired on playing from an autoplay" );
  }, false);

  video.addEventListener( "canplaythrough", function onCanPlayThrough() {
    video.removeEventListener( "canplaythrough", onCanPlayThrough, false );
    canPlayThrough = true;
    ok( playingFired, "playing has been fired on canplaythrough from an autoplay" );
    start();
  }, false);

  video.autoplay = true;
  ok( video.paused, "video does not autoplay before source" );
  video.src = testData.videoSrc;
  ok( video.paused, "video does not autoplay before ready events" );

});

asyncTest( "T35 - duration ready in loadedmetadata", 1, function() {

  var video = testData.createMedia( "#video" );

  video.addEventListener( "loadedmetadata", function onLoadedMetaData() {
    video.removeEventListener( "loadedmetadata", onLoadedMetaData, false );
    ok( video.duration, "video is playing during loadedmetadata" );
    start();
  }, false);
  video.src = testData.videoSrc;
});

// Add any player-specific sync tests now
if( testData.playerSpecificSyncTests ) {
  testData.playerSpecificSyncTests();
}
