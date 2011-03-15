// Popcorn Youtube Player Wrapper

var onYouTubePlayerReady;

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
  // 33 ms per update is suitable for 30 fps
  // 0.05 sec tolerance between old and new times to determine if currentTime has been set programatically
  // 250 ms progress interval as specified by WHATWG
  var timeupdateInterval = 33,
      timeCheckInterval = 0.5
      progressInterval = 250;

  // Ready State Constants
  var READY_STATE_HAVE_NOTHING = 0,
      READY_STATE_HAVE_METADATA = 1,
      READY_STATE_HAVE_CURRENT_DATA = 2,
      READY_STATE_HAVE_FUTURE_DATA = 3,
      READY_STATE_HAVE_ENOUGH_DATA = 4;

  // Youtube State Constants
  var YOUTUBE_STATE_UNSTARTED = -1,
      YOUTUBE_STATE_ENDED = 0,
      YOUTUBE_STATE_PLAYING = 1,
      YOUTUBE_STATE_PAUSED = 2,
      YOUTUBE_STATE_BUFFERING = 3,
      YOUTUBE_STATE_CUED = 5;
  
  // Collection of all Youtube players
  var registry = {},
      loadedPlayers = {};
      
  var abs = Math.abs;
  
  // Extract the id from a web url
  function extractIdFromUrl( url ) {
    if ( !url ) {
      return;
    }
    
    var matches = url.match( /((http:\/\/)?www\.)?youtube\.[a-z]+\/watch\?v\=[a-z0-9]+/i );
    
    // Return id, which comes after first equals sign
    return !matches || matches[0].split( "=" )[1];
  };
  
  function cueDelayedDurationCheck ( evt ) {
    var self = this,
        durSetEvt;
        
    durSetEvt = function() {
      this.duration = this.video.getDuration();
      this.dispatchEvent( "durationchange" );
    };
    
    this.eventListeners[evt] = this.eventListeners[evt] || [];
    
    this.eventListeners[evt].unshift(durSetEvt);
  }
  
  function getPlayerAddress( id ) {
    if( !id ) {
      return;
    }
    
    return "http://www.youtube.com/e/"+id;
  }
  
  // Called when a player is loaded
  // Playerid must match the element id
  onYouTubePlayerReady = function ( playerId ) {
    var vid = registry[playerId];
    
    loadedPlayers[playerId] = 1;
    
    // Video hadn't loaded yet when ctor was called
    if( !vid.video ) {
      vid.video = document.getElementById( playerId );
    }
    
    // Set up stuff that requires the API to be loaded
    vid.registerYoutubeEventHandlers();
    vid.registerInternalEventHandlers();
    
    // Issue load event
    vid.dispatchEvent( 'load' );
  }

  Popcorn.youtube = function( elementId, url ) {
    return new Popcorn.youtube.init( elementId, url );
  };

  Popcorn.youtube.init = function( elementId, url ) {
    if ( !elementId ) {
      throw "Element id is invalid.";
    }
    
    var self = this,
        durEvtType;

    this.video = document.getElementById( elementId );
    this.readyState = READY_STATE_HAVE_NOTHING;
    this.eventListeners = {};
    this.loadStarted = false;
    this.loadedData = false;
    this.fullyLoaded = false;
    this.timeUpdater = null;
    this.progressUpdater = null;
    
    this.currentTime = 0;
    this.previousCurrentTime = 0;
    this.volume = 0;
    this.previousVolume = 0;
    
    this.playerId = elementId;
    this.duration = Number.MAX_VALUE;
    
    // The video id for youtube
    this.vidId = extractIdFromUrl( url );
    
    if ( this.vidId ) {
      this.addEventListener( "load", function() {
        self.video.cueVideoByUrl( getPlayerAddress( self.vidId ) );
        cueDelayedDurationCheck.call( self, "playing" );
      });
    } else {
      cueDelayedDurationCheck.call( this, "load" );
    }
    
    registry[elementId] = this;
    
    if ( loadedPlayers[elementId] ) {
      this.dispatchEvent( "load" );
    }
  };
  // end Popcorn.youtube.init

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
        // In case ctor has been called many times for many ctors
        // Only use latest ctor call for each player id        
        var self = registry[youcorn.playerId];
        
        if ( state === YOUTUBE_STATE_UNSTARTED ) {
          self.readyState = READY_STATE_HAVE_METADATA;
          self.dispatchEvent( 'loadedmetadata' );
        } else if ( state === YOUTUBE_STATE_ENDED ) {
          self.dispatchEvent( 'ended' );
        } else if ( state === YOUTUBE_STATE_PLAYING ) {
          // Being able to play means current data is loaded.
          if ( !this.loadedData ) {
            this.loadedData = true;
            self.dispatchEvent( 'loadeddata' );
          }

          self.readyState = READY_STATE_HAVE_CURRENT_DATA;
          self.dispatchEvent( 'playing' );
        } else if ( state === YOUTUBE_STATE_PAUSED ) {
          self.dispatchEvent( 'pause' );
        } else if ( state === YOUTUBE_STATE_BUFFERING ) {
          self.dispatchEvent( 'waiting' );
        } else if ( state === YOUTUBE_STATE_CUED ) {
          // not handled
        }
      };

      Popcorn.youtube.errorEventHandler = function( state ) {
        youcorn.dispatchEvent( 'error' );
      };
    },

    // For internal use only.
    // Start current time and loading progress syncing intervals.
    registerInternalEventHandlers: function() {
      this.addEventListener( 'playing', function() {
        this.startTimeUpdater();
      });
      this.addEventListener( 'loadedmetadata', function() {
        this.startProgressUpdater();
      });
    },

    play: function() {
      this.dispatchEvent( 'play' );
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

    seekTo: function( time ) {      
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
      this.dispatchEvent( 'seeked' );
    },

    duration: function() {
      return this.video.getDuration();
    },

    // Mute is toggleable
    mute: function() {
      if ( this.video.isMuted() ) {
        this.video.unMute();
        this.volume = this.video.getVolume() / 100;
        this.dispatchEvent( 'volumechange' );
      } else {
        this.video.mute();
        this.volume = 0;
        this.dispatchEvent( 'volumechange' );
      }
    },

    // Expects beteween 0 and 1
    setVolume: function( vol ) {
      this.volume = this.previousVolume = vol;
      this.video.setVolume( vol * 100 );
      this.dispatchEvent( 'volumechange' );
    },

    addEventListener: function( evt, func ) {
      var evtName = evt.type || evt;
      
      if ( !this.eventListeners[evtName] ) {
        this.eventListeners[evtName] = [];
      }
      
      this.eventListeners[evtName].push( func );
    },

    /**
     * Notify event listeners about an event.
     */
    dispatchEvent: function( name ) {
      var evtName = name.type || name;
      if ( !this.eventListeners[evtName] ) {
        return;
      }
      
      var self = this;
      
      Popcorn.forEach( this.eventListeners[evtName], function( evt ) {
        evt.call( self, null );
      });
    },

    /* Unsupported methods. */

    defaultPlaybackRate: function( arg ) {
    },

    playbackRate: function( arg ) {
    },
    
    startTimeUpdater: function() {
      var state = this.video.getPlayerState(),
          self = this,
          seeked = 0;
      
      if ( abs( this.currentTime - this.previousCurrentTime ) > timeCheckInterval ) {
        // Has programatically set the currentTime
        this.previousCurrentTime = this.currentTime - timeCheckInterval;
        this.seekTo( this.currentTime );
        seeked = 1;
      } else {
        this.previousCurrentTime = this.currentTime;
        this.currentTime = this.video.getCurrentTime();
      }
      
      if ( this.volume !== this.previousVolume ) {
        this.setVolume( this.volume );
      }
      
      if ( state !== YOUTUBE_STATE_ENDED && state !== YOUTUBE_STATE_PAUSED || seeked ) {
        this.dispatchEvent( 'timeupdate' );
      }
      
      if( state !== YOUTUBE_STATE_ENDED ) {
        setTimeout( function() {
          self.startTimeUpdater.call(self);
        }, timeupdateInterval);
      }
    },
    
    startProgressUpdater: function() {
      var bytesLoaded = this.video.getVideoBytesLoaded(),
          bytesToLoad = this.video.getVideoBytesTotal(),
          self = this;

      // do nothing if size is not yet determined
      if ( bytesToLoad == 0 ) {
        return;
      }

      // raise an event if load has just started
      if ( !this.loadStarted ) {
        this.loadStarted = true;
        this.dispatchEvent( 'loadstart' );
      }

      // fully loaded
      if ( bytesLoaded >= bytesToLoad ) {
        this.fullyLoaded = true;
        this.readyState = READY_STATE_HAVE_ENOUGH_DATA;
        this.dispatchEvent( 'canplaythrough' );
        return;
      }

      this.dispatchEvent( 'progress' );
        
      setTimeout( function() {
        self.startTimeUpdater.call( self );
      }, progressInterval);
    }
  }); // end Popcorn.extend

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
   */

})( Popcorn );

