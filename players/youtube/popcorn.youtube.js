(function( global ) {

var oldYT,
    oldYTReadyCallback,
    YTAPIReady = false,
    popcornYT;

// We load our own version of the youtube player api script regardless of
// whether or not a similar one already exists on the page so that player 
// support is as we expect. As a result, we must swap out existing instances
// while we initialize, and replace them when we're finished, so the user's
// page suffers the least amount of disruption possible. This function places
// the old YT namespace back on the global object if we needed to replace it
// during initialization.
var swapYT = function() {
  if ( oldYT ) {
    global.onYouTubePlayerAPIReady = oldYTReadyCallback;
    global.YT = oldYT;
    oldYT = null;
    oldYTReadyCallback = null;
  }
};

// A global callback for youtube... that makes me angry
global.onYouTubePlayerAPIReady = function() {

  // Store the new version of the youtube script, call ready listeners,
  // and swap in the old YT if necessary
  popcornYT = global.YT;
  YTAPIReady = true;
  for ( var i = 0; i < onYouTubePlayerAPIReady.waiting.length; i++ ) {
    onYouTubePlayerAPIReady.waiting[ i ]();
  }
  swapYT();
};

onYouTubePlayerAPIReady.waiting = [];

// If a YT script already exists, store it and remove the reference from the window
// so it can be safely replaced for our purposes
if ( global.YT ) {
  // Store a reference to the old youtubePlayerReady function if there was one
  oldYTReadyCallback = global.onYouTubePlayerAPIReady;
  oldYT = global.YT;
  global.YT = null;
}

Popcorn.getScript( "http://www.youtube.com/player_api" );

Popcorn.player( "youtube", {
  _canPlayType: function( nodeName, url ) {

    return (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu)/).test( url ) && nodeName.toLowerCase() !== "video";
  },
  _setup: function( options ) {

    var media = this,
        autoPlay = false,
        container = document.createElement( "div" ),
        currentTime = 0,
        paused = true,
        seekTime = 0,
        firstGo = true,
        seeking = false,
        fragmentStart = 0,

        // state code for volume changed polling
        lastMuted = false,
        lastVolume = 100,
        playerQueue = Popcorn.player.playerQueue();

    var createProperties = function() {

      Popcorn.player.defineProperty( media, "currentTime", {
        set: function( val ) {

          if ( options.destroyed ) {
            return;
          }

          seeking = true;
          // make sure val is a number
          currentTime = Math.round( +val * 100 ) / 100;
        },
        get: function() {

          return currentTime;
        }
      });

      Popcorn.player.defineProperty( media, "paused", {
        get: function() {

          return paused;
        }
      });

      Popcorn.player.defineProperty( media, "muted", {
        set: function( val ) {

          if ( options.destroyed ) {

            return val;
          }

          if ( options.youtubeObject.isMuted() !== val ) {

            if ( val ) {

              options.youtubeObject.mute();
            } else {

              options.youtubeObject.unMute();
            }

            lastMuted = options.youtubeObject.isMuted();
            media.dispatchEvent( "volumechange" );
          }

          return options.youtubeObject.isMuted();
        },
        get: function() {

          if ( options.destroyed ) {

            return 0;
          }

          return options.youtubeObject.isMuted();
        }
      });

      Popcorn.player.defineProperty( media, "volume", {
        set: function( val ) {

          if ( options.destroyed ) {

            return val;
          }

          if ( options.youtubeObject.getVolume() / 100 !== val ) {

            options.youtubeObject.setVolume( val * 100 );
            lastVolume = options.youtubeObject.getVolume();
            media.dispatchEvent( "volumechange" );
          }

          return options.youtubeObject.getVolume() / 100;
        },
        get: function() {

          if ( options.destroyed ) {

            return 0;
          }

          return options.youtubeObject.getVolume() / 100;
        }
      });

      media.play = function() {

        if ( options.destroyed ) {

          return;
        }

        paused = false;
        playerQueue.add(function() {

          if ( options.youtubeObject.getPlayerState() !== 1 ) {

            seeking = false;
            options.youtubeObject.playVideo();
          } else {
            playerQueue.next();
          }
        });
      };

      media.pause = function() {

        if ( options.destroyed ) {

          return;
        }

        paused = true;
        playerQueue.add(function() {

          if ( options.youtubeObject.getPlayerState() !== 2 ) {

            options.youtubeObject.pauseVideo();
          } else {
            playerQueue.next();
          }
        });
      };
    };

    container.id = media.id + Popcorn.guid();
    options._container = container;
    media.appendChild( container );

    var youtubeInit = function() {

      var src, width, height, originalStyle, query;

      var timeUpdate = function() {

        if ( options.destroyed ) {
          return;
        }

        if ( !seeking ) {
          currentTime = options.youtubeObject.getCurrentTime();
          media.dispatchEvent( "timeupdate" );
        } else if ( currentTime === options.youtubeObject.getCurrentTime() ) {

          seeking = false;
          media.dispatchEvent( "seeked" );
          media.dispatchEvent( "timeupdate" );
        } else {

          // keep trying the seek until it is right.
          options.youtubeObject.seekTo( currentTime );
        }
        setTimeout( timeUpdate, 250 );
      };

      options.controls = +options.controls === 0 || +options.controls === 1 ? options.controls : 1;
      options.annotations = +options.annotations === 1 || +options.annotations === 3 ? options.annotations : 1;

      src = /^.*(?:\/|v=)(.{11})/.exec( media.src )[ 1 ];

      query = ( media.src.split( "?" )[ 1 ] || "" )
                         .replace( /v=.{11}/, "" );
      query = query.replace( /&t=(?:(\d+)m)?(?:(\d+)s)?/, function( all, minutes, seconds ) {

        // Make sure we have real zeros
        minutes = minutes | 0; // bit-wise OR
        seconds = seconds | 0; // bit-wise OR

        fragmentStart = ( +seconds + ( minutes * 60 ) );
        return "";
      });
      query = query.replace( /&start=(\d+)?/, function( all, seconds ) {

        // Make sure we have real zeros
        seconds = seconds | 0; // bit-wise OR

        fragmentStart = seconds;
        return "";
      });

      autoPlay = ( /autoplay=1/.test( query ) );

      // cache original display property so it can be reapplied
      originalStyle = media.style.display;
      media.style.display = "inline";

      // setting youtube player's height and width, min 640 x 390,
      // anything smaller, and the player reports incorrect states.
      height = media.clientHeight >= 390 ? "" + media.clientHeight : "390";
      width = media.clientWidth >= 640 ? "" + media.clientWidth : "640";
      
      media.style.display = originalStyle;

      options.youtubeObject = new popcornYT.Player( container.id, {
        height: height,
        width: width,
        videoId: src,
        events: {
          "onReady": function(){

            // pulling initial volume states form baseplayer
            lastVolume = media.volume;
            lastMuted = media.muted;

            media.duration = options.youtubeObject.getDuration();

            media.dispatchEvent( "durationchange" );
            volumeupdate();

            // pulling initial paused state from autoplay or the baseplayer
            // also need to explicitly set to paused otherwise.
            if ( autoPlay || !media.paused ) {
              paused = false;
            }

            createProperties();
            options.youtubeObject.playVideo();

            if ( paused ) {
              options.youtubeObject.pauseVideo();
            }

            media.currentTime = fragmentStart;

            media.dispatchEvent( "loadedmetadata" );
            media.dispatchEvent( "loadeddata" );
            media.readyState = 4;

            timeUpdate();
            media.dispatchEvent( "canplaythrough" );
          },
          "onStateChange": function( state ){

            if ( options.destroyed || state.data === -1 ) {
              return;
            }

            // state.data === 2 is for pause events
            // state.data === 1 is for play events
            if ( state.data === 2 ) {

              paused = true;
              media.dispatchEvent( "pause" );
              playerQueue.next();
            } else if ( state.data === 1 ) {
              paused = false;
              media.dispatchEvent( "play" );
              media.dispatchEvent( "playing" );
              playerQueue.next();
            } else if ( state.data === 0 ) {
              media.dispatchEvent( "ended" );
            }
          },
          "onError": function( error ) {

            if ( [ 2, 100, 101, 150 ].indexOf( error.data ) !== -1 ) {
              media.error = {
                customCode: error.data
              };
              media.dispatchEvent( "error" );
            }
          }
        }
      });

      var volumeupdate = function() {

        if ( options.destroyed ) {

          return;
        }

        if ( lastMuted !== options.youtubeObject.isMuted() ) {

          lastMuted = options.youtubeObject.isMuted();
          media.dispatchEvent( "volumechange" );
        }

        if ( lastVolume !== options.youtubeObject.getVolume() ) {

          lastVolume = options.youtubeObject.getVolume();
          media.dispatchEvent( "volumechange" );
        }

        setTimeout( volumeupdate, 250 );
      };
    };

    if ( YTAPIReady ) {

      // store the new version of the youtube script, and swap in the old one if necessary
      popcornYT = global.YT;
      youtubeInit();
      swapYT();
    } else {

      onYouTubePlayerAPIReady.waiting.push( youtubeInit );
    }
  },
  _teardown: function( options ) {

    options.destroyed = true;

    var youtubeObject = options.youtubeObject;
    if( youtubeObject ){
      youtubeObject.stopVideo();
      youtubeObject.clearVideo();
    }

    this.removeChild( document.getElementById( options._container.id ) );
  }
});

} ( window ) );