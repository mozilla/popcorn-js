/**
 * Simplified Media Fragments (http://www.w3.org/TR/media-frags/) Null player.
 * Valid URIs include:
 *
 *   #t=,100   -- a null video of 100s
 *   #t=5,100  -- a null video of 100s, which starts at 5s (i.e., 95s duration)
 *
 */
(function( Popcorn, document ) {

  var

  // How often (ms) to update the video's current time,
  // and by how much (s).
  DEFAULT_UPDATE_RESOLUTION_MS = 16,
  DEFAULT_UPDATE_RESOLUTION_S = DEFAULT_UPDATE_RESOLUTION_MS / 1000,

  EMPTY_STRING = "",

  // We currently support simple temporal fragments:
  //   #t=,100   -- a null video of 100s (starts at 0s)
  //   #t=5,100  -- a null video of 100s, which starts at 5s (i.e., 95s duration)
  temporalRegex = /#t=(\d+)?,?(\d+)?/;

  function NullPlayer( options ) {
    this.currentTime = options.currentTime || 0;
    this.duration = options.duration || NaN;
    this.playInterval = null;
    this.ended = options.endedCallback || Popcorn.nop;
  }

  function nullPlay( video ) {
    if( video.currentTime + DEFAULT_UPDATE_RESOLUTION_S >= video.duration ) {
      video.currentTime = video.duration;
      video.pause();
      video.ended();
    } else {
      video.currentTime += DEFAULT_UPDATE_RESOLUTION_S;
    }
  }

  NullPlayer.prototype = {

    play: function() {
      var video = this;
      this.playInterval = setInterval( function() { nullPlay( video ); },
                                       DEFAULT_UPDATE_RESOLUTION_MS );
    },

    pause: function() {
      clearInterval( this.playInterval );
    },

    seekTo: function( aTime ) {
      aTime = aTime < 0 ? 0 : aTime;
      aTime = aTime > this.duration ? this.duration : aTime;
      this.currentTime = aTime;
    }

  };

  function HTMLNullVideoElement( id ) {

    var self = this,
      parent = typeof id === "string" ? document.querySelector( id ) : id,
      elem,
      playerReady = false,
      player,
      impl = {
        src: EMPTY_STRING,
        networkState: self.NETWORK_EMPTY,
        readyState: self.HAVE_NOTHING,
        autoplay: EMPTY_STRING,
        preload: EMPTY_STRING,
        controls: EMPTY_STRING,
        loop: false,
        poster: EMPTY_STRING,
        volume: 1,
        muted: false,
        width: '100%',
        height: '100%',
        seeking: false,
        ended: false,
        paused: 1, // 1 vs. true to differentiate first time access
        error: null
      },
      playerReadyCallbacks = [],
      timeUpdateInterval;

    // Namespace all events we'll produce
    self._eventNamespace = Popcorn.guid( "HTMLNullVideoElement::" );

    // Attach parentNode
    self.parentNode = parent;

    function addPlayerReadyCallback( callback ) {
      playerReadyCallbacks.unshift( callback );
    }

    function onPlayerReady( ) {
      playerReady = true;

      impl.networkState = self.NETWORK_IDLE;
      impl.readyState = self.HAVE_METADATA;
      self.dispatchEvent( "loadedmetadata" );

      self.dispatchEvent( "loadeddata" );

      impl.readyState = self.HAVE_FUTURE_DATA;
      self.dispatchEvent( "canplay" );

      impl.readyState = self.HAVE_ENOUGH_DATA;
      self.dispatchEvent( "canplaythrough" );

      var i = playerReadyCallbacks.length;
      while( i-- ) {
        playerReadyCallbacks[ i ]();
        delete playerReadyCallbacks[ i ];
      }

      // Auto-start if necessary
      if( impl.autoplay ) {
        self.play();
      }
    }

    function getDuration() {
      return player ? player.duration : NaN;
    }

    function destroyPlayer() {
      if( !( playerReady && player ) ) {
        return;
      }
      player.pause();
      player = null;
      parent.removeChild( elem );
      elem = null;
    }

    function changeSrc( aSrc ) {
      if( !self._canPlaySrc( aSrc ) ) {
        impl.error = {
          name: "MediaError",
          message: "Media Source Not Supported",
          code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
        };
        self.dispatchEvent( "error" );
        return;
      }

      impl.src = aSrc;

      if( playerReady ) {
        destroyPlayer();
      }

      elem = document.createElement( "div" );
      elem.width = impl.width;
      elem.height = impl.height;
      parent.appendChild( elem );

      // Parse out the start and duration, if specified
      var fragments = temporalRegex.exec( aSrc ),
          start = fragments[ 1 ],
          duration = fragments [ 2 ];

      player = new NullPlayer({
        currentTime: start,
        duration: duration,
        endedCallback: onEnded
      });

      self.dispatchEvent( "loadstart" );
      self.dispatchEvent( "progress" );
      self.dispatchEvent( "durationchange" );
      onPlayerReady();
    }

    function getCurrentTime() {
      if( !playerReady ) {
        return 0;
      }

      return player.currentTime;
    }

    function changeCurrentTime( aTime ) {
      if( !playerReady ) {
        addPlayerReadyCallback( function() { changeCurrentTime( aTime ); } );
        return;
      }

      onSeeking();
      player.seekTo( aTime );
      onSeeked();
    }

    function onTimeUpdate() {
      self.dispatchEvent( "timeupdate" );
    }

    function onSeeking( target ) {
      impl.seeking = true;
      self.dispatchEvent( "seeking" );
    }

    function onSeeked() {
      impl.seeking = false;
      self.dispatchEvent( "timeupdate" );
      self.dispatchEvent( "seeked" );
      self.dispatchEvent( "canplay" );
      self.dispatchEvent( "canplaythrough" );
    }

    function onPlay() {
      // Deal with first time play vs. subsequent.
      if( impl.paused === 1 ) {
        impl.paused = false;
        self.dispatchEvent( "play" );
        self.dispatchEvent( "playing" );
      } else {
        if( impl.ended ) {
          changeCurrentTime( 0 );
        }

        if ( impl.paused ) {
          impl.paused = false;
          if ( !impl.loop ) {
            self.dispatchEvent( "play" );
          }
          self.dispatchEvent( "playing" );
        }
      }

      timeUpdateInterval = setInterval( onTimeUpdate,
                                        self._util.TIMEUPDATE_MS );
    }

    self.play = function() {
      if( !playerReady ) {
        addPlayerReadyCallback( function() { self.play(); } );
        return;
      }
      player.play();
      onPlay();
    };

    function onPause() {
      impl.paused = true;
      clearInterval( timeUpdateInterval );
      self.dispatchEvent( "pause" );
    }

    self.pause = function() {
      if( !playerReady ) {
        addPlayerReadyCallback( function() { self.pause(); } );
        return;
      }
      player.pause();
      onPause();
    };

    function onEnded() {
      if( impl.loop ) {
        changeCurrentTime( 0 );
        self.play();
      } else {
        impl.ended = true;
        clearInterval( timeUpdateInterval );
        self.dispatchEvent( "timeupdate" );
        self.dispatchEvent( "ended" );
      }
    }

    function setVolume( aValue ) {
      impl.volume = aValue;
      self.dispatchEvent( "volumechange" );
    }

    function getVolume() {
      return impl.volume;
    }

    function setMuted( aValue ) {
      impl.muted = aValue;
      self.dispatchEvent( "volumechange" );
    }

    function getMuted() {
      return impl.muted;
    }

    Object.defineProperties( self, {

      src: {
        get: function() {
          return impl.src;
        },
        set: function( aSrc ) {
          if( aSrc && aSrc !== impl.src ) {
            changeSrc( aSrc );
          }
        }
      },

      autoplay: {
        get: function() {
          return impl.autoplay;
        },
        set: function( aValue ) {
          impl.autoplay = self._util.isAttributeSet( aValue );
        }
      },

      loop: {
        get: function() {
          return impl.loop;
        },
        set: function( aValue ) {
          impl.loop = self._util.isAttributeSet( aValue );
        }
      },

      width: {
        get: function() {
          return elem.width;
        },
        set: function( aValue ) {
          impl.width = aValue;
        }
      },

      height: {
        get: function() {
          return elem.height;
        },
        set: function( aValue ) {
          impl.height = aValue;
        }
      },

      currentTime: {
        get: function() {
          return getCurrentTime();
        },
        set: function( aValue ) {
          changeCurrentTime( aValue );
        }
      },

      duration: {
        get: function() {
          return getDuration();
        }
      },

      ended: {
        get: function() {
          return impl.ended;
        }
      },

      paused: {
        get: function() {
          return impl.paused;
        }
      },

      seeking: {
        get: function() {
          return impl.seeking;
        }
      },

      readyState: {
        get: function() {
          return impl.readyState;
        }
      },

      networkState: {
        get: function() {
          return impl.networkState;
        }
      },

      volume: {
        get: function() {
          return getVolume();
        },
        set: function( aValue ) {
          if( aValue < 0 || aValue > 1 ) {
            throw "Volume value must be between 0.0 and 1.0";
          }
          setVolume( aValue );
        }
      },

      muted: {
        get: function() {
          return getMuted();
        },
        set: function( aValue ) {
          setMuted( self._util.isAttributeSet( aValue ) );
        }
      },

      error: {
        get: function() {
          return impl.error;
        }
      }
    });
  }

  HTMLNullVideoElement.prototype = new Popcorn._MediaElementProto();
  HTMLNullVideoElement.prototype.constructor = HTMLNullVideoElement;

  // Helper for identifying URLs we know how to play.
  HTMLNullVideoElement.prototype._canPlaySrc = function( url ) {
    return ( /#t=\d*,?\d+?/ ).test( url ) ?
      "probably" :
      EMPTY_STRING;
  };

  // We'll attempt to support a mime type of video/x-nullvideo
  HTMLNullVideoElement.prototype.canPlayType = function( type ) {
    return type === "video/x-nullvideo" ? "probably" : EMPTY_STRING;
  };

  Popcorn.HTMLNullVideoElement = function( id ) {
    return new HTMLNullVideoElement( id );
  };
  Popcorn.HTMLNullVideoElement._canPlaySrc = HTMLNullVideoElement.prototype._canPlaySrc;

}( Popcorn, document ));
