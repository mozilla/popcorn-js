(function( Popcorn, window, document ) {

  var

  EMPTY_STRING = "",

  jwReady = false,
  jwLoaded = false,
  jwCallbacks = [];

  function onJWPlayerAPIReady() {
console.log( "ready" );
    jwReady = true;
    var i = jwCallbacks.length;
    while( i-- ) {
      jwCallbacks[ i ]();
      delete jwCallbacks[ i ];
    }
  };

  function jwplayerReadyCheck() {
console.log( "ready check" );
    if ( window.jwplayer ) {
      onJWPlayerAPIReady();
    } else {
      setTimeout( jwplayerReadyCheck, 100 );
    }
  }

  function isJWPlayerReady() {
    // If the jwplayer API isn't injected, do it now.
    if( !jwLoaded ) {
      var tag = document.createElement( "script" );
      var protocol = window.location.protocol === "file:" ? "http:" : "";

      tag.src = protocol + "//jwpsrv.com/library/zaIF4JI9EeK2FSIACpYGxA.js";
      var firstScriptTag = document.getElementsByTagName( "script" )[ 0 ];
      firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );
      jwLoaded = true;
      jwplayerReadyCheck();
    }
    return jwReady;
  }

  function addJWPlayerCallback( callback ) {
    jwCallbacks.unshift( callback );
  }

  function HTMLJWPlayerVideoElement( id ) {

    // YouTube iframe API requires postMessage
    if( !window.postMessage ) {
      throw "ERROR: HTMLJWPlayerVideoElement requires window.postMessage";
    }

    var self = this,
      parent = typeof id === "string" ? document.querySelector( id ) : id,
      //elem = document.createElement( "div" ),
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
      bufferedInterval,
      lastLoadedFraction = 0,
      currentTimeInterval,
      timeUpdateInterval,
      firstPlay = true;

    // Namespace all events we'll produce
    self._eventNamespace = Popcorn.guid( "HTMLJWPlayerVideoElement::" );

    self.parentNode = parent;

    // Mark this as YouTube
    self._util.type = "JWPlayer";

    function addMediaReadyCallback( callback ) {
      mediaReadyCallbacks.unshift( callback );
    }

    function onPlayerReady() {
      playerReady = true;
      impl.readyState = self.HAVE_METADATA;
      self.dispatchEvent( "loadedmetadata" );
      self.dispatchEvent( "loadeddata" );
      impl.readyState = self.HAVE_FUTURE_DATA;
      self.dispatchEvent( "canplay" );
      impl.readyState = self.HAVE_ENOUGH_DATA;
      self.dispatchEvent( "canplaythrough" );
    }

    function getDuration() {
      if( !mediaReady ) {
        // loadedmetadata properly sets the duration, so nothing to do here yet.
        return impl.duration;
      }

      var oldDuration = impl.duration,
          newDuration = player.getDuration();

      // Deal with duration=0
      if( newDuration ) {
        if( oldDuration !== newDuration ) {
          impl.duration = newDuration;
          self.dispatchEvent( "durationchange" );
        }
      } else {
        setTimeout( getDuration, 50 );
      }

      return newDuration;
    }

    function onPlayerError() {
      var err = { name: "MediaError" };

      // TODO: figure out jwplayer errors.
      err.message = "Unknown error.";
      err.code = 5;

      impl.error = err;
      self.dispatchEvent( "error" );
    }

    /*function onPlayerStateChange( event ) {
      switch( event.data ) {

        // ended
        case YT.PlayerState.ENDED:
          onEnded();
          // Seek back to the start of the video to reset the player,
          // otherwise the player can become locked out.
          // I do not see this happen all the time or on all systems.
          player.seekTo( 0 );
          break;

        // playing
        case YT.PlayerState.PLAYING:
          if( firstPlay ) {
            // fake ready event
            firstPlay = false;

            addMediaReadyCallback(function() {
              bufferedInterval = setInterval( monitorBuffered, 50 );
            });

            // Set initial paused state
            if( impl.autoplay || !impl.paused ) {
              impl.paused = false;
              addMediaReadyCallback(function() {
                onPlay();
              });
            } else {
              // if a pause happens while seeking, ensure we catch it.
              // in youtube seeks fire pause events, and we don't want to listen to that.
              // except for the case of an actual pause.
              catchRoguePauseEvent = false;
              player.pauseVideo();
            }

            // Ensure video will now be unmuted when playing due to the mute on initial load.
            if( !impl.muted ) {
              player.unMute();
            }

            impl.duration = player.getDuration();
            impl.readyState = self.HAVE_METADATA;
            self.dispatchEvent( "loadedmetadata" );
            currentTimeInterval = setInterval( monitorCurrentTime,
                                               CURRENT_TIME_MONITOR_MS );
            
            self.dispatchEvent( "loadeddata" );

            impl.readyState = self.HAVE_FUTURE_DATA;
            self.dispatchEvent( "canplay" );

            mediaReady = true;
            var i = mediaReadyCallbacks.length;
            while( i-- ) {
              mediaReadyCallbacks[ i ]();
              delete mediaReadyCallbacks[ i ];
            }

            // We can't easily determine canplaythrough, but will send anyway.
            impl.readyState = self.HAVE_ENOUGH_DATA;
            self.dispatchEvent( "canplaythrough" );
          } else if ( catchRoguePlayEvent ) {
            catchRoguePlayEvent = false;
            player.pauseVideo();
          } else {
            onPlay();
          }
          break;

        // paused
        case YT.PlayerState.PAUSED:
          // a seekTo call fires a pause event, which we don't want at this point.
          // as long as a seekTo continues to do this, we can safly toggle this state.
          if ( catchRoguePauseEvent ) {
            catchRoguePauseEvent = false;
            break;
          }
          onPause();
          break;

        // buffering
        case YT.PlayerState.BUFFERING:
          impl.networkState = self.NETWORK_LOADING;
          self.dispatchEvent( "waiting" );
          break;

        // video cued
        case YT.PlayerState.CUED:
          // XXX: cued doesn't seem to fire reliably, bug in youtube api?
          break;
      }

      if ( event.data !== YT.PlayerState.BUFFERING &&
           playerState === YT.PlayerState.BUFFERING ) {
        onProgress();
      }

      playerState = event.data;
    }*/

    function destroyPlayer() {
      if( !( playerReady && player ) ) {
        return;
      }
      // TODO: figure out how to destroy a player.
      /*clearInterval( currentTimeInterval );
      clearInterval( bufferedInterval );
      player.stopVideo();
      player.clearVideo();

      parent.removeChild( elem );
      elem = document.createElement( "div" );*/
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

      // Make sure YouTube is ready, and if not, register a callback
      if( !isJWPlayerReady() ) {
        addJWPlayerCallback( function() { changeSrc( aSrc ); } );
        return;
      }

      if( playerReady ) {
        destroyPlayer();
      }

      //parent.appendChild( elem );
      jwplayer( parent.id ).setup({
        file: aSrc,
        width: "100%",
        height: "100%"
      });

      player = jwplayer( parent.id );
      player.onReady( onPlayerReady );
      player.onError( onPlayerError );

      impl.networkState = self.NETWORK_LOADING;
      //self.dispatchEvent( "loadstart" );
      //self.dispatchEvent( "progress" );
    }

    /*function monitorCurrentTime() {
      var playerTime = player.getCurrentTime();
      if ( !impl.seeking ) {
        impl.currentTime = playerTime;
        if ( ABS( impl.currentTime - playerTime ) > CURRENT_TIME_MONITOR_MS ) {
          onSeeking();
          onSeeked();
        }
      } else if ( ABS( playerTime - impl.currentTime ) < 1 ) {
        onSeeked();
      }
    }*/

    /*function monitorBuffered() {
      var fraction = player.getVideoLoadedFraction();

      if ( lastLoadedFraction !== fraction ) {
        lastLoadedFraction = fraction;

        onProgress();

        if ( fraction >= 1 ) {
          clearInterval( bufferedInterval );
        }
      }
    }*/

    function getCurrentTime() {
      return impl.currentTime;
    }

    function changeCurrentTime( aTime ) {
      /*impl.currentTime = aTime;
      if( !mediaReady ) {
        addMediaReadyCallback( function() {

          onSeeking();
          player.seek( aTime );
        });
        return;
      }

      onSeeking();
      player.seek( aTime );*/
    }

    function onTimeUpdate() {
      //self.dispatchEvent( "timeupdate" );
    }

    function onSeeking() {
      /*// a seek in youtube fires a paused event.
      // we don't want to listen for this, so this state catches the event.
      catchRoguePauseEvent = true;
      impl.seeking = true;
      self.dispatchEvent( "seeking" );*/
    }

    function onSeeked() {
      /*impl.ended = false;
      impl.seeking = false;
      self.dispatchEvent( "timeupdate" );
      self.dispatchEvent( "seeked" );
      self.dispatchEvent( "canplay" );
      self.dispatchEvent( "canplaythrough" );*/
    }

    function onPlay() {

      /*if( impl.ended ) {
        changeCurrentTime( 0 );
        impl.ended = false;
      }
      timeUpdateInterval = setInterval( onTimeUpdate,
                                        self._util.TIMEUPDATE_MS );
      impl.paused = false;

      if( playerPaused ) {
        playerPaused = false;

        // Only 1 play when video.loop=true
        if ( ( impl.loop && !loopedPlay ) || !impl.loop ) {
          loopedPlay = true;
          self.dispatchEvent( "play" );
        }
        self.dispatchEvent( "playing" );
      }*/
    }

    function onProgress() {
      self.dispatchEvent( "progress" );
    }

    self.play = function() {
      /*impl.paused = false;
      if( !mediaReady ) {
        addMediaReadyCallback( function() { self.play(); } );
        return;
      }
      player.playVideo();*/
    };

    function onPause() {
      /*impl.paused = true;
      if ( !playerPaused ) {
        playerPaused = true;
        clearInterval( timeUpdateInterval );
        self.dispatchEvent( "pause" );
      }*/
    }

    self.pause = function() {
      /*impl.paused = true;
      if( !mediaReady ) {
        addMediaReadyCallback( function() { self.pause(); } );
        return;
      }
      // if a pause happens while seeking, ensure we catch it.
      // in youtube seeks fire pause events, and we don't want to listen to that.
      // except for the case of an actual pause.
      catchRoguePauseEvent = false;
      player.pauseVideo();*/
    };

    function onEnded() {
      /*if( impl.loop ) {
        changeCurrentTime( 0 );
        self.play();
      } else {
        impl.ended = true;
        onPause();
        // YouTube will fire a Playing State change after the video has ended, causing it to loop.
        catchRoguePlayEvent = true;
        self.dispatchEvent( "timeupdate" );
        self.dispatchEvent( "ended" );
      }*/
    }

    function setVolume( aValue ) {
      impl.volume = aValue;
      if( !mediaReady ) {
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
      if( !mediaReady ) {
        addMediaReadyCallback( function() { setMuted( impl.muted ); } );
        return;
      }
      player.setMute( aValue );
      // TODO: consider using onMute/onVolume for this, if applicable.
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
          if( aValue < 0 || aValue > 1 ) {
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
      }/*,

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
      }*/
    });
  }

  HTMLJWPlayerVideoElement.prototype = new Popcorn._MediaElementProto();
  HTMLJWPlayerVideoElement.prototype.constructor = HTMLJWPlayerVideoElement;

  // Helper for identifying URLs we know how to play.
  HTMLJWPlayerVideoElement.prototype._canPlaySrc = function( url ) {
    //return (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu).*(?:\/|v=)(.{11})/).test( url ) ?
    //  "probably" :
    //  EMPTY_STRING;
    return "probably";
  };

  // We'll attempt to support a mime type of video/x-youtube
  HTMLJWPlayerVideoElement.prototype.canPlayType = function( type ) {
    //return type === "video/x-youtube" ? "probably" : EMPTY_STRING;
    return "probably";
  };

  Popcorn.HTMLJWPlayerVideoElement = function( id ) {
    return new HTMLJWPlayerVideoElement( id );
  };
  Popcorn.HTMLJWPlayerVideoElement._canPlaySrc = HTMLJWPlayerVideoElement.prototype._canPlaySrc;

}( Popcorn, window, document ));
