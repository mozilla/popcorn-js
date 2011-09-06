// A global callback for youtube... that makes me angry
var onYouTubePlayerReady = function( containerId ) {

  onYouTubePlayerReady[ containerId ] && onYouTubePlayerReady[ containerId ]();
};
onYouTubePlayerReady.stateChangeEventHandler = {};

Popcorn.player( "youtube", {
  _setup: function( options ) {

    var media = this,
        player = {},
        youtubeObject,
        container = document.createElement( "div" ),
        currentTime = 0,
        seekTime = 0,
        seeking = false,
        dataLoaded = false;

    container.id = media.id + Popcorn.guid();

    media.appendChild( container );

    var youtubeInit = function() {

      // expose a callback to this scope, that is called from the global callback youtube calls
      onYouTubePlayerReady[ container.id ] = function() {

        youtubeObject = document.getElementById( container.id );

        // more youtube callback nonsense
        onYouTubePlayerReady.stateChangeEventHandler[ container.id ] = function( state ) {

          // playing is state 1
          // paused is state 2
          if ( state === 1 ) {

            media.paused && media.play();
          // youtube fires paused events while seeking
          // this is the only way to get seeking events
          } else if ( state === 2 ) {

            // silly logic forced on me by the youtube API
            // calling youtube.seekTo triggers multiple events
            // with the second events getCurrentTime being the old time
            if ( seeking && seekTime === currentTime && seekTime !== youtubeObject.getCurrentTime() ) {

              seeking = false;
              youtubeObject.seekTo( currentTime );
              return;
            }

            currentTime = youtubeObject.getCurrentTime();
            media.dispatchEvent( "timeupdate" );
            !media.paused && media.pause();
          }
        };

        // youtube requires callbacks to be a string to a function path from the global scope
        youtubeObject.addEventListener( "onStateChange", "onYouTubePlayerReady.stateChangeEventHandler." + container.id );

        var timeupdate = function() {

          currentTime = youtubeObject.getCurrentTime();
          media.dispatchEvent( "timeupdate" );
          timeout = setTimeout( timeupdate, 10 );
        };

        media.play = function() {

          media.paused = false;
          media.dispatchEvent( "play" );

          if ( dataLoaded ) {

            media.dispatchEvent( "loadeddata" );
            dataLoaded = false;
          }

          media.dispatchEvent( "playing" );
          timeupdate();
          youtubeObject.playVideo();
        };

        media.pause = function() {

          if ( !media.paused ) {

            media.paused = true;
            media.dispatchEvent( "pause" );
            youtubeObject.pauseVideo();
          }
        };

        media.__defineSetter__( "currentTime", function( val ) {

          // make sure val is a number
          currentTime = seekTime = +val;
          seeking = true;
          media.dispatchEvent( "seeked" );
          media.dispatchEvent( "timeupdate" );
          youtubeObject.seekTo( currentTime );
          return currentTime;
        });

        media.__defineGetter__( "currentTime", function() {

          return currentTime;
        });

        media.__defineSetter__( "muted", function( val ) {

          if ( youtubeObject.isMuted() !== val ) {

            if ( val ) {

              youtubeObject.mute();
            } else {

              youtubeObject.unMute();
            }

            media.dispatchEvent( "volumechange" );
          }

          return youtubeObject.isMuted();
        });

        media.__defineGetter__( "muted", function() {

          return youtubeObject.isMuted();
        });

        media.__defineSetter__( "volume", function( val ) {

          if ( youtubeObject.getVolume() !== val ) {

            youtubeObject.setVolume( val );
            media.dispatchEvent( "volumechange" );
          }

          return youtubeObject.getVolume();
        });

        media.__defineGetter__( "volume", function() {

          return youtubeObject.getVolume();
        });

        media.readyState = 4;
        media.dispatchEvent( 'load' );
        dataLoaded = true;
        media.duration = youtubeObject.getDuration();
        media.dispatchEvent( 'durationchange' );

        if ( !media.paused ) {

          media.play();
        }

        media.paused && media.dispatchEvent( 'loadeddata' );
      };

      options.controls = +options.controls === 0 || +options.controls === 1 ? options.controls : 1; 
      options.annotations = +options.annotations === 1 || +options.annotations === 3 ? options.annotations : 1;

      var flashvars = {
        playerapiid: container.id,
        controls: options.controls,
        iv_load_policy: options.annotations
      };

      swfobject.embedSWF( "http://www.youtube.com/e/" + /^.*[\/=](.{11})/.exec( media.src )[ 1 ] + "?enablejsapi=1&playerapiid=" + container.id + "&version=3", 
                          container.id, media.offsetWidth, media.offsetHeight, "8", null,
                          flashvars, {wmode: "transparent", allowScriptAccess: "always"}, {id: container.id} );
    };

    if ( !window.swfobject ) {

      Popcorn.getScript( "http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js", youtubeInit );
    } else {

      youtubeInit();
    }
  }
});

