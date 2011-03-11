// Popcorn Youtube Player Warpper

( function( Popcorn ) {
  /**
   * Youtube wrapper for popcorn.
   * This plug-in adds capability for Popcorn.js to deal with Youtube
   * videos. This plug-in also doesn't use Popcorn's plugin() API and
   * instead hacks directly into Popcorn's core.
   *
   * To use this plug-in, onYouTubePlayerReady() event handler needs to be
   * called by the Youtube video player, before videos can be registered.
   * Once videos are registered, calls to them can be made the same way as
   * regular Popcorn objects. Also note that enablejsapi=1 needs to be added
   * to the embed code, in order for Youtube's JavaScript API to work.
   *
   * Note that there are a few methods, properties and events that are not
   * supported. See the bottom of this plug-in for a complete list.
   */

  // Intended
  var undef;

  // Config parameters
  var debug = true;
  var timeupdateInterval = 33; // 33 is suitable for 30 fps
  var progressInterval = 250; // as specified by WHATWG

  // Ready State Constants
  var READY_STATE_HAVE_NOTHING = 0;
  var READY_STATE_HAVE_METADATA = 1;
  var READY_STATE_HAVE_CURRENT_DATA = 2;
  var READY_STATE_HAVE_FUTURE_DATA = 3;
  var READY_STATE_HAVE_ENOUGH_DATA = 4;

  // Youtube State Constants
  var YOUTUBE_STATE_UNSTARTED = -1;
  var YOUTUBE_STATE_ENDED = 0;
  var YOUTUBE_STATE_PLAYING = 1;
  var YOUTUBE_STATE_PAUSED = 2;
  var YOUTUBE_STATE_BUFFERING = 3;
  var YOUTUBE_STATE_CUED = 5;

  Popcorn.youtube = function( elementId ) {
    return new Popcorn.youtube.init( elementId );
  };

  Popcorn.youtube.init = function( elementId ) {
    if ( !elementId ) {
      throw "Element id is invalid.";
    }

    this.video = document.getElementById( elementId );
    this.readyState = READY_STATE_HAVE_NOTHING;
    this.duration = this.video.getDuration();
    this.eventListeners = {};
    this.loadStarted = false;
    this.loadedData = false;
    this.fullyLoaded = false;
    this.timeUpdater = null;
    this.progressUpdater = null;
    this.registerYoutubeEventHandlers();
    this.registerInternalEventHandlers();
  }; // end Popcorn.youtube.init

  Popcorn.extend( Popcorn.youtube.init.prototype, {

    // For internal use only.
    // Register handlers to YouTube events.
    registerYoutubeEventHandlers: function() {
      var youcorn = this,
          stateChangeHandler = 'Popcorn.youtube.stateChangeEventHandler',
          errorHandler = 'Popcorn.youtube.errorEventHandler';
      this.video.addEventListener( 'onStateChange', stateChangeHandler );
      this.video.addEventListener( 'onError', errorHandler );

      /**
       * Since Flash can only call named functions, they are declared
       * separately here.
       */
      Popcorn.youtube.stateChangeEventHandler = function( state ) {
        if ( debug ) {
          console.log( 'Youtube state updated: ' + state );
        }
        if ( state == YOUTUBE_STATE_UNSTARTED ) {
          youcorn.readyState = READY_STATE_HAVE_METADATA;
          youcorn.raiseEvent('loadedmetadata');
        } else if ( state == YOUTUBE_STATE_ENDED ) {
          youcorn.raiseEvent('ended');
        } else if ( state == YOUTUBE_STATE_PLAYING ) {
          // Being able to play means current data is loaded.
          if ( !this.loadedData ) {
            this.loadedData = true;
            youcorn.raiseEvent( 'loadeddata' );
          }

          youcorn.readyState = READY_STATE_HAVE_CURRENT_DATA;
          youcorn.raiseEvent( 'playing' );
        } else if ( state == YOUTUBE_STATE_PAUSED ) {
          youcorn.raiseEvent( 'pause' );
        } else if ( state == YOUTUBE_STATE_BUFFERING ) {
          youcorn.raiseEvent( 'waiting' );
        } else if ( state == YOUTUBE_STATE_CUED ) {
          // not handled
        }
      };

      Popcorn.youtube.errorEventHandler = function( state ) {
        if ( debug ) {
          console.log( 'Youtube error encountered: ' + error );
        }
        youcorn.raiseEvent( 'error' );
      };
    },

    // For internal use only.
    // Start current time and loading progress syncing intervals.
    registerInternalEventHandlers: function() {
      this.addEventListener( 'playing', function() {
        startTimeUpdater( this );
      });
      this.addEventListener( 'loadedmetadata', function() {
        startProgressUpdater( this );
      });
    },

    play: function() {
      this.raiseEvent( 'play' );
      this.video.playVideo();
    },

    pause: function() {
      this.video.pauseVideo();
      // pause event is raised by Youtube.
    },

    load: function() {
      this.video.playVideo();
      this.video.pauseVideo();
    },

    currentTime: function( time ) {
      if ( time === undef ) {
        return this.video.getCurrentTime();
      }
      var playing = this.video.getPlayerState() == YOUTUBE_STATE_PLAYING;
      this.video.seekTo( time, true );

      // Prevent Youtube's behaviour to start playing video after seeking.
      if ( !playing ) {
        this.video.pauseVideo();
      }

      // Data need to be loaded again.
      if ( !this.fullyLoaded ) {
        this.loadedData = false;
      }

      // Raise event.
      this.raiseEvent( 'seeked' );
    },

    duration: function() {
      return this.video.getDuration();
    },

    mute: function() {
      if ( this.video.getVolume() != 0 ) {
        this.video.mute();
        this.raiseEvent( 'volumechange' );
      }
    },

    volume: function( vol ) {
      if ( vol == undef ) {
        return this.video.getVolume() / 100;
      }
      if ( vol != this.volume() ) {
        this.video.setVolume( vol * 100 );
        this.raiseEvent( 'volumechange' );
      }
    },

    addEventListener: function( eventName, func ) {
      if ( !this.eventListeners[eventName] ) {
        this.eventListeners[eventName] = [];
      }
      this.eventListeners[eventName].push( func );
    },

    /**
     * Notify event listeners about an event.
     */
    raiseEvent: function( name ) {
      if ( debug ) {
        console.log( 'Raising event: ' + name );
      }
      if ( !this.eventListeners[name] ) {
        return;
      }
      for ( var i in this.eventListeners[name] ) {
        // @TODO should we mimic the event object sent by HTMLMediaElement?
        this.eventListeners[name][i].call( this, null );
      }
    },

    /* Unsupported methods. */

    defaultPlaybackRate: function( arg ) {
    },

    playbackRate: function( arg ) {
    }

  }); // end Popcorn.extend

  function startTimeUpdater( youcorn ) {
    youcorn.timeUpdater = setInterval(function() {
      var state = youcorn.video.getPlayerState();
      if ( (state == YOUTUBE_STATE_ENDED) || (state == YOUTUBE_STATE_PAUSED) ) {
        clearInterval(youcorn.timeUpdater);
        return;
      }
      youcorn.raiseEvent( 'timeupdate' );
    }, timeupdateInterval);
  }

  function startProgressUpdater( youcorn ) {
    youcorn.progressUpdater = setInterval(function() {
      var bytesLoaded = youcorn.video.getVideoBytesLoaded();
      var bytesToLoad = youcorn.video.getVideoBytesTotal();
      if ( debug ) {
        console.log( 'Bytes loaded: ' + bytesLoaded );
        console.log( 'Bytes to load: ' + bytesToLoad );
      }

      // do nothing if size is not yet determined
      if ( bytesToLoad == 0 ) {
        return;
      }

      // raise an event if load has just started
      if ( !youcorn.loadStarted ) {
        youcorn.loadStarted = true;
        youcorn.raiseEvent( 'loadstart' );
      }

      // fully loaded
      if ( bytesLoaded >= bytesToLoad ) {
        youcorn.fullyLoaded = true;
        youcorn.readyState = READY_STATE_HAVE_ENOUGH_DATA;
        youcorn.raiseEvent( 'canplaythrough' );
        clearInterval( youcorn.progressUpdater );
        return;
      }

      youcorn.raiseEvent( 'progress' );
    }, progressInterval);
  }

  /* Unsupported properties and events. */

  /**
   * Unsupported events are:
   * * suspend
   * * abort
   * * emptied
   * * stalled
   * * canplay
   * * seeking
   * * ratechange
   * * durationchange
   */

})( Popcorn );

