(function( Popcorn, window, document ) {

  var

  CURRENT_TIME_MONITOR_MS = 16,
  EMPTY_STRING = "",

  // Setup for SoundCloud API
  scReady = false,
  scLoaded = false,
  scCallbacks = [];

  function isSoundCloudReady() {
    // If the SoundCloud Widget API + JS SDK aren't loaded, do it now.
    if( !scLoaded ) {
      Popcorn.getScript( "http://w.soundcloud.com/player/api.js", function() {
        Popcorn.getScript( "http://connect.soundcloud.com/sdk.js", function() {
          scReady = true;

          // XXX: SoundCloud won't let us use real URLs with the API,
          // so we have to lookup the track URL, requiring authentication.
          SC.initialize({
            client_id: "PRaNFlda6Bhf5utPjUsptg"
          });

          var i = scCallbacks.length;
          while( i-- ) {
            scCallbacks[ i ]();
            delete scCallbacks[ i ];
          }
        });
      });
      scLoaded = true;
    }
    return scReady;
  }

  function addSoundCloudCallback( callback ) {
    scCallbacks.unshift( callback );
  }


  function HTMLSoundCloudAudioElement( id ) {

    // SoundCloud API requires postMessage
    if( !window.postMessage ) {
      throw "ERROR: HTMLSoundCloudAudioElement requires window.postMessage";
    }

    var self = this,
      parent = typeof id === "string" ? document.querySelector( id ) : id,
      elem,
      impl = {
        src: EMPTY_STRING,
        networkState: self.NETWORK_EMPTY,
        readyState: self.HAVE_NOTHING,
        seeking: false,
        autoPlay: EMPTY_STRING,
        preload: EMPTY_STRING,
        controls: true,
        loop: false,
        poster: EMPTY_STRING,
        volume: 1,
        muted: 0,
        currentTime: 0,
        duration: NaN,
        ended: false,
        paused: true,
        width: parent.width|0   ? parent.width  : self._util.MIN_WIDTH,
        height: parent.height|0 ? parent.height : self._util.MIN_HEIGHT,
        error: null
      },
      playerReady = false,
      player,
      playerReadyCallbacks = [],
      timeUpdateInterval,
      currentTimeInterval,
      lastCurrentTime = 0;

    // Namespace all events we'll produce
    self._eventNamespace = Popcorn.guid( "HTMLSoundCloudAudioElement::" );

    self.parentNode = parent;

    function addPlayerReadyCallback( callback ) {
      playerReadyCallbacks.unshift( callback );
    }

    // SoundCloud's widget fires its READY event too early for the audio
    // to be used (i.e., the widget is setup, but not the audio decoder).
    // To deal with this we have to wait on loadProgress to fire with a
    // loadedProgress > 0.
    function onLoaded() {
      // Wire-up runtime listeners
      player.bind( SC.Widget.Events.LOAD_PROGRESS, function( data ) {
        onStateChange({
          type: "loadProgress",
          // currentTime is in ms vs. s
          data: data.currentPosition / 1000
        });
      });

      player.bind( SC.Widget.Events.PLAY_PROGRESS, function( data ) {
        onStateChange({
          type: "playProgress",
          // currentTime is in ms vs. s
          data: data.currentPosition / 1000
        });
      });

      player.bind( SC.Widget.Events.PLAY, function( data ) {
        onStateChange({
          type: "play"
        });
      });

      player.bind( SC.Widget.Events.PAUSE, function( data ) {
        onStateChange({
          type: "pause"
        });
      });

      player.bind( SC.Widget.Events.SEEK, function( data ) {
        onStateChange({
          type: "seek",
          data: data.currentPosition
        });
      });

      player.bind( SC.Widget.Events.FINISH, function() {
        onStateChange({
          type: "finish"
        });
      });

      playerReady = true;
      player.getDuration( updateDuration );
    }

    // When the player widget is ready, kick-off a play/pause
    // in order to get the data loading.  We'll wait on loadedProgress.
    // It's possible for the loadProgress to take time after play(), so
    // we don't call pause() right away, but wait on loadedProgress to be 1
    // before we do.
    function onPlayerReady( data ) {
      player.bind( SC.Widget.Events.LOAD_PROGRESS, function( data ) {

        // If we're getting the HTML5 audio, loadedProgress will be 0 or 1.
        // If we're getting Flash, it will be 0 or > 0.  Prefer > 0 to make
        // both happy.
        if( data.loadedProgress > 0 ) {
          player.unbind( SC.Widget.Events.LOAD_PROGRESS );
          player.pause();
        }
      });

      player.bind( SC.Widget.Events.PLAY, function( data ) {
        player.unbind( SC.Widget.Events.PLAY );

        player.bind( SC.Widget.Events.PAUSE, function( data ) {
          player.unbind( SC.Widget.Events.PAUSE );

          // Play/Pause cycle is done, continue loading.
          onLoaded();
        });
      });

      player.play();
    }

    function updateDuration( newDuration ) {
      // SoundCloud gives duration in ms vs. s
      newDuration = newDuration / 1000;

      var oldDuration = impl.duration;

      if( oldDuration !== newDuration ) {
        impl.duration = newDuration;
        self.dispatchEvent( "durationchange" );

        // Deal with first update of duration
        if( isNaN( oldDuration ) ) {
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
          if( impl.paused && impl.autoplay ) {
            self.play();
          }
        }
      }
    }

    function getDuration() {
      if( !playerReady ) {
        // Queue a getDuration() call so we have correct duration info for loadedmetadata
        addPlayerReadyCallback( function() { getDuration(); } );
      }

      player.getDuration( updateDuration );
    }

    function destroyPlayer() {
      if( !( playerReady && player ) ) {
        return;
      }
      clearInterval( currentTimeInterval );
      player.pause();

      player.unbind( SC.Widget.Events.READY );
      player.unbind( SC.Widget.Events.LOAD_PROGRESS );
      player.unbind( SC.Widget.Events.PLAY_PROGRESS );
      player.unbind( SC.Widget.Events.PLAY );
      player.unbind( SC.Widget.Events.PAUSE );
      player.unbind( SC.Widget.Events.SEEK );
      player.unbind( SC.Widget.Events.FINISH );

      parent.removeChild( elem );
      elem = null;
    }

    self.play = function() {
      if( !playerReady ) {
        addPlayerReadyCallback( function() { self.play(); } );
        return;
      }
      player.play();
    };

    function changeCurrentTime( aTime ) {
      if( !playerReady ) {
        addPlayerReadyCallback( function() { changeCurrentTime( aTime ); } );
        return;
      }

      // Convert to ms
      aTime = aTime * 1000;

      onSeeking();
      player.seekTo( aTime );
    }

    function onSeeking() {
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

    self.pause = function() {
      if( !playerReady ) {
        addPlayerReadyCallback( function() { self.pause(); } );
        return;
      }

      player.pause();
    };

    function onPause() {
      impl.paused = true;
      clearInterval( timeUpdateInterval );
      self.dispatchEvent( "pause" );
    }

    function onTimeUpdate() {
      self.dispatchEvent( "timeupdate" );
    }

    function onPlay() {
      if( impl.ended ) {
        changeCurrentTime( 0 );
      }

      if ( !currentTimeInterval ) {
        currentTimeInterval = setInterval( monitorCurrentTime,
                                           CURRENT_TIME_MONITOR_MS ) ;

        // Only 1 play when video.loop=true
        if ( impl.loop ) {
          self.dispatchEvent( "play" );
        }
      }

      timeUpdateInterval = setInterval( onTimeUpdate,
                                        self._util.TIMEUPDATE_MS );

      if( impl.paused ) {
        impl.paused = false;

        // Only 1 play when video.loop=true
        if ( !impl.loop ) {
          self.dispatchEvent( "play" );
        }
        self.dispatchEvent( "playing" );
      }
    }

    function onEnded() {
      if( impl.loop ) {
        changeCurrentTime( 0 );
        self.play();
      } else {
        impl.ended = true;
        self.dispatchEvent( "ended" );
      }
    }

    function onCurrentTime( aTime ) {
      var currentTime = impl.currentTime = aTime / 1000;

      if( currentTime !== lastCurrentTime ) {
        self.dispatchEvent( "timeupdate" );
      }

      lastCurrentTime = impl.currentTime;
    }

    function onStateChange( event ) {
      switch ( event.type ) {
        case "loadProgress":
          self.dispatchEvent( "progress" );
          break;
        case "playProgress":
          onCurrentTime( event.data );
          break;
        case "play":
          onPlay();
          break;
        case "pause":
          onPause();
          break;
        case "finish":
          onEnded();
          break;
        case "seek":
          onCurrentTime( event.data );
          onSeeked();
          break;
      }
    }

    function monitorCurrentTime() {
      player.getPosition( onCurrentTime );
    }

    function changeSrc( aSrc ) {
      if( !self.canPlayType( aSrc ) ) {
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

      // Make sure SoundCloud is ready, and if not, register a callback
      if( !isSoundCloudReady() ) {
        addSoundCloudCallback( function() { changeSrc( aSrc ); } );
        return;
      }

      playerReady = false;

      SC.get( "/resolve", { url: aSrc }, function( data ) {
        elem = document.createElement( "iframe" );
        elem.id = Popcorn.guid( "soundcloud-" );
        elem.width = impl.width;
        elem.height = impl.height;
        elem.frameBorder = 0;
        elem.webkitAllowFullScreen = true;
        elem.mozAllowFullScreen = true;
        elem.allowFullScreen = true;
        parent.appendChild( elem );
        elem.onload = function() {
          elem.onload = null;

          player = SC.Widget( elem );
          player.bind( SC.Widget.Events.READY, onPlayerReady );

          impl.networkState = self.NETWORK_LOADING;
          self.dispatchEvent( "loadstart" );
          self.dispatchEvent( "progress" );
        };
        elem.src = "http://w.soundcloud.com/player/?url=" + data.uri +
          "&show_artwork=false" +
          "&buying=false" +
          "&liking=false" +
          "&sharing=false" +
          "&download=false" +
          "show_comments=false" +
          "show_user=false";
      });
    }


    function onVolume( aValue ) {
      // Remap from 0..100 to 0..1
      aValue = aValue / 100;
      if( impl.volume !== aValue ) {
        impl.volume = aValue;
        self.dispatchEvent( "volumechange" );
      }
    }

    function setVolume( aValue ) {
      impl.volume = aValue;

      if( !playerReady ) {
        addPlayerReadyCallback( function() {
          setVolume( aValue );
        });
        return;
      }
      player.setVolume( aValue );
      self.dispatchEvent( "volumechange" );
    }

    function getVolume() {
      // If we're muted, the volume is cached on impl.muted.
      return impl.muted > 0 ? impl.muted : impl.volume;
    }

    function setMuted( aMute ) {
      if( !playerReady ) {
        impl.muted = aMute ? 1 : 0;
        addPlayerReadyCallback( function() {
          setMuted( aMute );
        });
        return;
      }

      // Move the existing volume onto muted to cache
      // until we unmute, and set the volume to 0.
      if( aMute ) {
        impl.muted = impl.volume;
        setVolume( 0 );
      } else {
        impl.muted = 0;
        setVolume( impl.muted );
      }
    }

    function getMuted() {
      return impl.muted > 0;
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
          return impl.currentTime;
        },
        set: function( aValue ) {
          changeCurrentTime( aValue );
        }
      },

      duration: {
        get: function() {
          return impl.duration;
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
          // Remap from HTML5's 0-1 to SoundCloud's 0-100 range
          var volume = getVolume();
          return volume / 100;
        },
        set: function( aValue ) {
          if( aValue < 0 || aValue > 1 ) {
            throw "Volume value must be between 0.0 and 1.0";
          }

          // Remap from HTML5's 0-1 to SoundCloud's 0-100 range
          aValue = aValue * 100;
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

  HTMLSoundCloudAudioElement.prototype = Popcorn._MediaElementProto;

  HTMLSoundCloudAudioElement.prototype.canPlayType = function( url ) {
    return (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(soundcloud)/).test( url ) ?
      "probably" : EMPTY_STRING;
  };

  Popcorn.HTMLSoundCloudAudioElement = function( id ) {
    return new HTMLSoundCloudAudioElement( id );
  };

}( Popcorn, window, document ));
