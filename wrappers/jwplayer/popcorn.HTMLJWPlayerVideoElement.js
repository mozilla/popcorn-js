(function( Popcorn, window, document ) {

  var

  EMPTY_STRING = "",

  jwReady = false,
  jwLoaded = false,
  jwCallbacks = [];

  function onJWPlayerAPIReady() {
    jwReady = true;
    var i = jwCallbacks.length;
    while( i-- ) {
      jwCallbacks[ i ]();
      delete jwCallbacks[ i ];
    }
  };

  function jwplayerReadyCheck() {
    if ( window.jwplayer ) {
      onJWPlayerAPIReady();
    } else {
      setTimeout( jwplayerReadyCheck, 100 );
    }
  }

  function isJWPlayerReady() {
    // If the jwplayer API isn't injected, do it now.
    if ( !jwLoaded ) {
      if ( !window.jwplayer ) {
        var tag = document.createElement( "script" );
        var protocol = window.location.protocol === "file:" ? "http:" : "";

        tag.src = protocol + "//jwpsrv.com/library/zaIF4JI9EeK2FSIACpYGxA.js";
        var firstScriptTag = document.getElementsByTagName( "script" )[ 0 ];
        firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );
      }
      jwLoaded = true;
      jwplayerReadyCheck();
    }
    return jwReady;
  }

  function addJWPlayerCallback( callback ) {
    jwCallbacks.unshift( callback );
  }

  function HTMLJWPlayerVideoElement( id ) {

    if ( !window.postMessage ) {
      throw "ERROR: HTMLJWPlayerVideoElement requires window.postMessage";
    }

    var self = this,
      parent = typeof id === "string" ? document.querySelector( id ) : id,
      impl = {
        src: EMPTY_STRING,
        networkState: self.NETWORK_EMPTY,
        readyState: self.HAVE_NOTHING,
        seeking: false,
        autoplay: EMPTY_STRING,
        preload: EMPTY_STRING,
        controls: false,
        loop: false,
        poster: EMPTY_STRING,
        volume: 1,
        muted: false,
        currentTime: 0,
        duration: NaN,
        ended: false,
        paused: true,
        error: null
      },
      playerReady = false,
      catchRoguePauseEvent = false,
      catchRoguePlayEvent = false,
      mediaReady = false,
      loopedPlay = false,
      player,
      playerPaused = true,
      mediaReadyCallbacks = [],
      playerState = -1,
      lastLoadedFraction = 0,
      firstPlay = true,
      firstPause = false;

    // Namespace all events we'll produce
    self._eventNamespace = Popcorn.guid( "HTMLJWPlayerVideoElement::" );

    self.parentNode = parent;

    // Mark this as JWPlayer
    self._util.type = "JWPlayer";

    function addMediaReadyCallback( callback ) {
      mediaReadyCallbacks.unshift( callback );
    }

    function onReady() {
      // JWPlayer needs a play/pause to force ready state.
      // However, the ready state does not happen until after the play/pause callbacks.
      // So we put this inside a setTimeout to ensure we do this afterwards,
      // thus, actually being ready.
      setTimeout( function() {
        impl.duration = player.getDuration();
        self.dispatchEvent( "durationchange" );
        impl.readyState = self.HAVE_METADATA;
        self.dispatchEvent( "loadedmetadata" );
        self.dispatchEvent( "loadeddata" );

        impl.readyState = self.HAVE_FUTURE_DATA;
        self.dispatchEvent( "canplay" );

        mediaReady = true;

        var i = 0;
        while( mediaReadyCallbacks.length ) {
          mediaReadyCallbacks[ i ]();
          mediaReadyCallbacks.shift();
        }
        // We can't easily determine canplaythrough, but will send anyway.
        impl.readyState = self.HAVE_ENOUGH_DATA;
        self.dispatchEvent( "canplaythrough" );
      }, 0 );
    }

    // TODO: (maybe)
    // JWPlayer events cannot be removed, so we use functions inside the event.
    // This way we can change these functions to "remove" events.
    function onPauseEvent() {
      if ( catchRoguePauseEvent ) {
        catchRoguePauseEvent = false;
      } else if ( firstPause ) {
        firstPause = false;
        onReady();
      } else {
        onPause();
      }
    }
    function onPlayEvent() {
      if ( firstPlay ) {
        // fake ready event
        firstPlay = false;

        // Set initial paused state
        if ( impl.autoplay || !impl.paused ) {
          impl.paused = false;
          addMediaReadyCallback( onPlay );
          onReady();
        } else {
          firstPause = true;
          catchRoguePlayEvent = true;
          player.pause( true );
        }
      } else if ( catchRoguePlayEvent ) {
        catchRoguePlayEvent = false;
        catchRoguePauseEvent = true;
        // Repause without triggering any events.
        player.pause( true );
      } else {
        onPlay();
      }
    }

    function onSeekEvent() {
      if ( impl.seeking ) {
        onSeeked();
      }
    }

    function onPlayerReady() {
      player.onPause( onPauseEvent );
      player.onTime(function() {
        if ( !impl.ended && !impl.seeking ) {
          impl.currentTime = player.getPosition();
          self.dispatchEvent( "timeupdate" );
        }
      });
      player.onSeek( onSeekEvent );
      player.onPlay(function() {
        if ( !impl.ended ) {
          onPlayEvent();
        }
      });
      player.onBufferChange( onProgress );
      player.onComplete( onEnded );
      player.play( true );
    }

    function getDuration() {
      return player.getDuration();
    }

    function onPlayerError( e ) {
      var err = { name: "MediaError" };
      err.message = e.message;
      err.code = e.code || 5;

      impl.error = err;
      self.dispatchEvent( "error" );
    }

    function destroyPlayer() {
      if ( !( playerReady && player ) ) {
        return;
      }

      player.destroy();
    }

    function changeSrc( aSrc ) {
      if ( !self._canPlaySrc( aSrc ) ) {
        impl.error = {
          name: "MediaError",
          message: "Media Source Not Supported",
          code: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
        };
        self.dispatchEvent( "error" );
        return;
      }

      // Use any player vars passed on the URL
      var playerVars = self._util.parseUri( aSrc ).queryKey;

      // Show/hide controls. Sync with impl.controls and prefer URL value.
      impl.controls = playerVars.controls = playerVars.controls || impl.controls;

      impl.src = aSrc;

      // Make sure JWPlayer is ready, and if not, register a callback
      if ( !isJWPlayerReady() ) {
        addJWPlayerCallback( function() { changeSrc( aSrc ); } );
        return;
      }

      if ( playerReady ) {
        destroyPlayer();
      }

      jwplayer( parent.id ).setup({
        file: aSrc,
        width: "100%",
        height: "100%",
        controls: impl.controls
      });

      player = jwplayer( parent.id );
      player.onReady( onPlayerReady );
      player.onError( onPlayerError );
      jwplayer.utils.log = function( msg, obj ) {
        if ( typeof console !== "undefined" && typeof console.log !== "undefined" ) {
          if ( obj ) {
            console.log( msg, obj );
          } else {
            console.log( msg );
          }
        }

        if ( msg === "No suitable players found and fallback enabled" ) {
          onPlayerError({
            message: msg,
            code: 4
          });
        }
      };

      impl.networkState = self.NETWORK_LOADING;
      self.dispatchEvent( "loadstart" );
      self.dispatchEvent( "progress" );
    }

    function getCurrentTime() {
      return impl.currentTime;
    }

    function changeCurrentTime( aTime ) {
      impl.currentTime = aTime;
      if ( !mediaReady ) {
        addMediaReadyCallback( function() {
          onSeeking();
          player.seek( aTime );
        });
        return;
      }

      onSeeking();
      player.seek( aTime );
    }

    function onSeeking() {
      impl.seeking = true;
      // jwplayer plays right after a seek, we do not want this.
      if ( impl.paused ) {
        catchRoguePlayEvent = true;
      }
      self.dispatchEvent( "seeking" );
    }

    function onSeeked() {
      impl.ended = false;
      impl.seeking = false;
      self.dispatchEvent( "timeupdate" );
      self.dispatchEvent( "seeked" );
      self.dispatchEvent( "canplay" );
      self.dispatchEvent( "canplaythrough" );
    }

    function onPlay() {
      impl.paused = false;

      if ( playerPaused ) {
        playerPaused = false;

        // Only 1 play when video.loop=true
        if ( ( impl.loop && !loopedPlay ) || !impl.loop ) {
          loopedPlay = true;
          self.dispatchEvent( "play" );
        }
        self.dispatchEvent( "playing" );
      }
    }

    function onProgress() {
      self.dispatchEvent( "progress" );
    }

    self.play = function() {
      self.dispatchEvent( "play" );
      impl.paused = false;
      if ( !mediaReady ) {
        addMediaReadyCallback( function() { self.play(); } );
        return;
      }
      if ( impl.ended ) {
        changeCurrentTime( 0 );
        impl.ended = false;
      }
      player.play( true );
    };

    function onPause() {
      impl.paused = true;
      if ( !playerPaused ) {
        playerPaused = true;
        self.dispatchEvent( "pause" );
      }
    }

    self.pause = function() {
      impl.paused = true;
      if ( !mediaReady ) {
        addMediaReadyCallback( function() { self.pause(); } );
        return;
      }
      player.pause( true );
    };

    function onEnded() {
      if ( impl.loop ) {
        changeCurrentTime( 0 );
      } else {
        impl.ended = true;
        onPause();
        self.dispatchEvent( "timeupdate" );
        self.dispatchEvent( "ended" );
      }
    }

    function setVolume( aValue ) {
      impl.volume = aValue;
      if ( !mediaReady ) {
        addMediaReadyCallback( function() {
          setVolume( impl.volume );
        });
        return;
      }
      player.setVolume( impl.volume * 100 );
      self.dispatchEvent( "volumechange" );
    }

    function setMuted( aValue ) {
      impl.muted = aValue;
      if ( !mediaReady ) {
        addMediaReadyCallback( function() { setMuted( impl.muted ); } );
        return;
      }
      player.setMute( aValue );
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
          if ( aSrc && aSrc !== impl.src ) {
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
          return self.parentNode.offsetWidth;
        }
      },

      height: {
        get: function() {
          return self.parentNode.offsetHeight;
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
          return impl.volume;
        },
        set: function( aValue ) {
          if ( aValue < 0 || aValue > 1 ) {
            throw "Volume value must be between 0.0 and 1.0";
          }

          setVolume( aValue );
        }
      },

      muted: {
        get: function() {
          return impl.muted;
        },
        set: function( aValue ) {
          setMuted( self._util.isAttributeSet( aValue ) );
        }
      },

      error: {
        get: function() {
          return impl.error;
        }
      },

      buffered: {
        get: function () {
          var timeRanges = {
            start: function( index ) {
              if ( index === 0 ) {
                return 0;
              }

              //throw fake DOMException/INDEX_SIZE_ERR
              throw "INDEX_SIZE_ERR: DOM Exception 1";
            },
            end: function( index ) {
              var duration;
              if ( index === 0 ) {
                duration = getDuration();
                if ( !duration ) {
                  return 0;
                }

                return duration * ( player.getBuffer() / 100 );
              }

              //throw fake DOMException/INDEX_SIZE_ERR
              throw "INDEX_SIZE_ERR: DOM Exception 1";
            }
          };

          Object.defineProperties( timeRanges, {
            length: {
              get: function() {
                return 1;
              }
            }
          });

          return timeRanges;
        }
      }
    });
  }

  HTMLJWPlayerVideoElement.prototype = new Popcorn._MediaElementProto();
  HTMLJWPlayerVideoElement.prototype.constructor = HTMLJWPlayerVideoElement;

  // Helper for identifying URLs we know how to play.
  HTMLJWPlayerVideoElement.prototype._canPlaySrc = function( url ) {
    // Because of the nature of JWPlayer playing all media types,
    // it can potentially play all url formats.
    return "probably";
  };

  // This could potentially support everything. It is a bit of a catch all player.
  HTMLJWPlayerVideoElement.prototype.canPlayType = function( type ) {
    return "probably";
  };

  Popcorn.HTMLJWPlayerVideoElement = function( id ) {
    return new HTMLJWPlayerVideoElement( id );
  };
  Popcorn.HTMLJWPlayerVideoElement._canPlaySrc = HTMLJWPlayerVideoElement.prototype._canPlaySrc;

}( Popcorn, window, document ));
