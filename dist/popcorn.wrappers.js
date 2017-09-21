/**
 * The Popcorn._MediaElementProto object is meant to be used as a base
 * prototype for HTML*VideoElement and HTML*AudioElement wrappers.
 * MediaElementProto requires that users provide:
 *   - parentNode: the element owning the media div/iframe
 *   - _eventNamespace: the unique namespace for all events
 */
(function( Popcorn, document ) {

  /*********************************************************************************
   * parseUri 1.2.2
   * http://blog.stevenlevithan.com/archives/parseuri
   * (c) Steven Levithan <stevenlevithan.com>
   * MIT License
   */
  function parseUri (str) {
    var	o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) {
      uri[o.key[i]] = m[i] || "";
    }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) {
        uri[o.q.name][$1] = $2;
      }
    });

    return uri;
  }

  parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
      name:   "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };
  /*********************************************************************************/

  // Fake a TimeRanges object
  var _fakeTimeRanges = {
    length: 0,
    start: Popcorn.nop,
    end: Popcorn.nop
  };

  // Make sure the browser has MediaError
  window.MediaError = window.MediaError || (function() {
    function MediaError(code, msg) {
      this.code = code || null;
      this.message = msg || "";
    }
    MediaError.MEDIA_ERR_NONE_ACTIVE    = 0;
    MediaError.MEDIA_ERR_ABORTED        = 1;
    MediaError.MEDIA_ERR_NETWORK        = 2;
    MediaError.MEDIA_ERR_DECODE         = 3;
    MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

    return MediaError;
  }());


  function MediaElementProto() {
    var protoElement = {},
        events = {},
        parentNode;
    if ( !Object.prototype.__defineGetter__ ) {
      protoElement = document.createElement( "div" );
    }
    protoElement._util = {
      // Each wrapper stamps a type.
      type: "HTML5",

      // How often to trigger timeupdate events
      TIMEUPDATE_MS: 250,

      // Standard width and height
      MIN_WIDTH: 300,
      MIN_HEIGHT: 150,

      // Check for attribute being set or value being set in JS.  The following are true:
      //   autoplay
      //   autoplay="true"
      //   v.autoplay=true;
      isAttributeSet: function( value ) {
        return ( typeof value === "string" || value === true );
      },

      parseUri: parseUri
    };
    // Mimic DOM events with custom, namespaced events on the document.
    // Each media element using this prototype needs to provide a unique
    // namespace for all its events via _eventNamespace.
    protoElement.addEventListener = function( type, listener, useCapture ) {
      document.addEventListener( this._eventNamespace + type, listener, useCapture );
    };

    protoElement.removeEventListener = function( type, listener, useCapture ) {
      document.removeEventListener( this._eventNamespace + type, listener, useCapture );
    };

    protoElement.dispatchEvent = function( name ) {
      var customEvent = document.createEvent( "CustomEvent" ),
        detail = {
          type: name,
          target: this.parentNode,
          data: null
        };

      customEvent.initCustomEvent( this._eventNamespace + name, false, false, detail );
      document.dispatchEvent( customEvent );
    };

    protoElement.load = Popcorn.nop;

    protoElement.canPlayType = function( url ) {
      return "";
    };

    // Popcorn expects getBoundingClientRect to exist, forward to parent node.
    protoElement.getBoundingClientRect = function() {
      return parentNode.getBoundingClientRect();
    };

    protoElement.NETWORK_EMPTY = 0;
    protoElement.NETWORK_IDLE = 1;
    protoElement.NETWORK_LOADING = 2;
    protoElement.NETWORK_NO_SOURCE = 3;

    protoElement.HAVE_NOTHING = 0;
    protoElement.HAVE_METADATA = 1;
    protoElement.HAVE_CURRENT_DATA = 2;
    protoElement.HAVE_FUTURE_DATA = 3;
    protoElement.HAVE_ENOUGH_DATA = 4;
    Object.defineProperties( protoElement, {

      currentSrc: {
        get: function() {
          return this.src !== undefined ? this.src : "";
        },
        configurable: true
      },

      parentNode: {
        get: function() {
          return parentNode;
        },
        set: function( val ) {
          parentNode = val;
        },
        configurable: true
      },
      
      // We really can't do much more than "auto" with most of these.
      preload: {
        get: function() {
          return "auto";
        },
        set: Popcorn.nop,
        configurable: true
      },

      controls: {
        get: function() {
          return true;
        },
        set: Popcorn.nop,
        configurable: true
      },

      // TODO: it would be good to overlay an <img> using this URL
      poster: {
        get: function() {
          return "";
        },
        set: Popcorn.nop,
        configurable: true
      },

      crossorigin: {
        get: function() {
          return "";
        },
        configurable: true
      },

      played: {
        get: function() {
          return _fakeTimeRanges;
        },
        configurable: true
      },

      seekable: {
        get: function() {
          return _fakeTimeRanges;
        },
        configurable: true
      },

      buffered: {
        get: function() {
          return _fakeTimeRanges;
        },
        configurable: true
      },

      defaultMuted: {
        get: function() {
          return false;
        },
        configurable: true
      },

      defaultPlaybackRate: {
        get: function() {
          return 1.0;
        },
        configurable: true
      },

      style: {
        get: function() {
          return this.parentNode.style;
        },
        configurable: true
      },

      id: {
        get: function() {
          return this.parentNode.id;
        },
        configurable: true
      }

      // TODO:
      //   initialTime
      //   playbackRate
      //   startOffsetTime

     });
    return protoElement;
  }

  Popcorn._MediaElementProto = MediaElementProto;

}( Popcorn, window.document ));
/**
 * The HTMLVideoElement and HTMLAudioElement are wrapped media elements
 * that are created within a DIV, and forward their properties and methods
 * to a wrapped object.
 */
(function( Popcorn, document ) {

  function canPlaySrc( src ) {
    // We can't really know based on URL.
    return "maybe";
  }

  function wrapMedia( id, mediaType ) {
    var parent = typeof id === "string" ? document.querySelector( id ) : id,
      media = document.createElement( mediaType );

    parent.appendChild( media );

    // Add the helper function _canPlaySrc so this works like other wrappers.
    media._canPlaySrc = canPlaySrc;

    return media;
  }

  Popcorn.HTMLVideoElement = function( id ) {
    return wrapMedia( id, "video" );
  };
  Popcorn.HTMLVideoElement._canPlaySrc = canPlaySrc;


  Popcorn.HTMLAudioElement = function( id ) {
    return wrapMedia( id, "audio" );
  };
  Popcorn.HTMLAudioElement._canPlaySrc = canPlaySrc;

}( Popcorn, window.document ));
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

        tag.src = "https://jwpsrv.com/library/zaIF4JI9EeK2FSIACpYGxA.js";
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

    var self = new Popcorn._MediaElementProto(),
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

    function waitForMetaData(){
      var duration = player.getDuration();
      //JWPlayer sets the duration only after the video has started playing
      //Hence, we assume that when duration is available all
      //other metadata is also ready
      if(duration == -1 || duration == undefined){
        setTimeout(waitForMetaData, 0);
      } else {
        impl.duration = duration
        self.dispatchEvent( "durationchange" );
        playerReady = true;
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
      }
    }

    function onReady() {
      // JWPlayer needs a play/pause to force ready state.
      waitForMetaData();
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

      var params = {
        width: "100%",
        height: "100%",
        autostart: impl.autoplay,
        controls: impl.controls
      };

      // Source can either be a single file or multiple files that represent
      // different quality
      if(typeof aSrc == "string"){
        params["file"] = aSrc;
      } else {
        params["sources"] = aSrc;
      }

      jwplayer( parent.id ).setup(params);

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

      if ( playerReady && playerPaused ) {
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
            },
            length: 1
          };

          return timeRanges;
        }
      }
    });

    self._canPlaySrc = Popcorn.HTMLJWPlayerVideoElement._canPlaySrc;
    self.canPlayType = Popcorn.HTMLJWPlayerVideoElement.canPlayType;

    return self;
  }

  Popcorn.HTMLJWPlayerVideoElement = function( id ) {
    return new HTMLJWPlayerVideoElement( id );
  };

  // Helper for identifying URLs we know how to play.
  Popcorn.HTMLJWPlayerVideoElement._canPlaySrc = function( source ) {
    // Because of the nature of JWPlayer playing all media types,
    // it can potentially play all url formats.
    if(typeof source == "string"){
      if(/.+\.+/g.exec(source)){
        return "probably";
      }
    } else {
      return "probably"
    }
  };

  // This could potentially support everything. It is a bit of a catch all player.
  Popcorn.HTMLJWPlayerVideoElement.canPlayType = function( type ) {
    return "probably";
  };

}( Popcorn, window, document ));
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
  temporalRegex = /#t=(\d+\.?\d*)?,?(\d+\.?\d*)/;

  function NullPlayer( options ) {
    this.startTime = 0;
    this.currentTime = options.currentTime || 0;
    this.duration = options.duration || NaN;
    this.playInterval = null;
    this.paused = true;
    this.defaultPlaybackRate = 1;
    this.playbackRate = 1;
    this.ended = options.endedCallback || Popcorn.nop;
  }

  function nullPlay( video ) {
    video.currentTime += ( Date.now() - video.startTime ) / (1000 / video.playbackRate);
    video.startTime = Date.now();
    if( video.currentTime >= video.duration ) {
      video.pause(video.duration);
      video.ended();
    }
    if( video.currentTime < 0 ) {
       video.pause(0);   
    }
  }

  NullPlayer.prototype = {

    play: function() {
      var video = this;
      if ( this.paused ) {
        this.paused = false;
        this.startTime = Date.now();
        this.playInterval = setInterval( function() { nullPlay( video ); },
                                         DEFAULT_UPDATE_RESOLUTION_MS );
      }
    },

    pause: function() {
      if ( !this.paused ) {
        this.paused = true;
        clearInterval( this.playInterval );
      }
    },

    seekTo: function( aTime ) {
      aTime = aTime < 0 ? 0 : aTime;
      aTime = aTime > this.duration ? this.duration : aTime;
      this.currentTime = aTime;
    }

  };

  function HTMLNullVideoElement( id ) {

    var self = new Popcorn._MediaElementProto(),
      parent = typeof id === "string" ? document.querySelector( id ) : id,
      elem = document.createElement( "div" ),
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
        width: parent.width|0   ? parent.width  : self._util.MIN_WIDTH,
        height: parent.height|0 ? parent.height : self._util.MIN_HEIGHT,
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

    // Mark type as NullVideo
    self._util.type = "NullVideo";

    function addPlayerReadyCallback( callback ) {
      playerReadyCallbacks.push( callback );
    }

    function onPlayerReady() {
      var callback;
      playerReady = true;

      impl.networkState = self.NETWORK_IDLE;
      impl.readyState = self.HAVE_METADATA;
      self.dispatchEvent( "loadedmetadata" );

      self.dispatchEvent( "loadeddata" );

      impl.readyState = self.HAVE_FUTURE_DATA;
      self.dispatchEvent( "canplay" );

      impl.readyState = self.HAVE_ENOUGH_DATA;
      self.dispatchEvent( "canplaythrough" );

      while( playerReadyCallbacks.length ) {
        callback = playerReadyCallbacks.shift();
        callback();
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
      elem = document.createElement( "div" );
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

      elem.width = impl.width;
      elem.height = impl.height;
      parent.appendChild( elem );

      // Parse out the start and duration, if specified
      var fragments = temporalRegex.exec( aSrc ),
          start = +fragments[ 1 ],
          duration = +fragments[ 2 ];

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
      if ( aTime === getCurrentTime() ) {
        return;
      }
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
      impl.ended = false;
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
          impl.ended = false;
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
      if ( impl.paused ) {
        onPlay();
      }
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
      if ( !impl.paused ) {
        onPause();
      }
    };

    function onEnded() {
      if( impl.loop ) {
        changeCurrentTime( 0 );
        self.play();
      } else {
        impl.ended = true;
        onPause();
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
          elem.width = aValue;
          impl.width = elem.width;
        }
      },

      height: {
        get: function() {
          return elem.height;
        },
        set: function( aValue ) {
          elem.height = aValue;
          impl.height = elem.height;
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
      
      playbackRate: {
        get: function() {
          return player.playbackRate;   
        },
        set: function( aValue ) {
          player.playbackRate = aValue;
          self.dispatchEvent( "ratechange" );
        }
      },

      error: {
        get: function() {
          return impl.error;
        }
      }
    });

    self._canPlaySrc = Popcorn.HTMLNullVideoElement._canPlaySrc;
    self.canPlayType = Popcorn.HTMLNullVideoElement.canPlayType;

    return self;
  }

  Popcorn.HTMLNullVideoElement = function( id ) {
    return new HTMLNullVideoElement( id );
  };

  // Helper for identifying URLs we know how to play.
  Popcorn.HTMLNullVideoElement._canPlaySrc = function( url ) {
    return ( temporalRegex ).test( url ) ?
      "probably" :
      EMPTY_STRING;
  };

  // We'll attempt to support a mime type of video/x-nullvideo
  Popcorn.HTMLNullVideoElement.canPlayType = function( type ) {
    return type === "video/x-nullvideo" ? "probably" : EMPTY_STRING;
  };

}( Popcorn, document ));
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
      Popcorn.getScript( "https://w.soundcloud.com/player/api.js", function() {
        Popcorn.getScript( "https://connect.soundcloud.com/sdk.js", function() {
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

    var self = new Popcorn._MediaElementProto(),
      parent = typeof id === "string" ? Popcorn.dom.find( id ) : id,
      elem = document.createElement( "iframe" ),
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
        // SC Volume values are 0-100, we remap to 0-1 in volume getter/setter
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
      playerPaused = true,
      player,
      playerReadyCallbacks = [],
      timeUpdateInterval,
      currentTimeInterval,
      lastCurrentTime = 0;

    // Namespace all events we'll produce
    self._eventNamespace = Popcorn.guid( "HTMLSoundCloudAudioElement::" );

    self.parentNode = parent;

    // Mark this as SoundCloud
    self._util.type = "SoundCloud";

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
        player.getPosition( function( currentTimeInMS ) {
          // Convert milliseconds to seconds.
          var currentTimeInSeconds = currentTimeInMS / 1000;
          if ( impl.seeking ) {
            if ( Math.floor( currentTimeInSeconds ) !== Math.floor( impl.currentTime ) ) {
              // Convert Seconds back to milliseconds.
              player.seekTo( impl.currentTime * 1000 );
            } else {
              onSeeked();
            }
            return;
          }
          onStateChange({
            type: "seek",
            data: currentTimeInSeconds
          });
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

      // Turn down the volume and kick-off a play to force load
      player.bind( SC.Widget.Events.PLAY_PROGRESS, function( data ) {
        // Turn down the volume.
        // Loading has to be kicked off before volume can be changed.
        player.setVolume( 0 );
        // Wait for both flash and HTML5 to play something.
        if( data.currentPosition > 0 ) {
          player.unbind( SC.Widget.Events.PLAY_PROGRESS );

          player.bind( SC.Widget.Events.PAUSE, function() {
            player.unbind( SC.Widget.Events.PAUSE );

            // Play/Pause cycle is done, restore volume and continue loading.
            player.setVolume( 1 );
            player.bind( SC.Widget.Events.SEEK, function() {
              player.unbind( SC.Widget.Events.SEEK );
              onLoaded();
            });
            // Re seek back to 0, then we're back to default, loaded, and ready to go.
            player.seekTo( 0 );
          });
          player.pause();
        }
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
      elem = document.createElement( "iframe" );
    }

    self.play = function() {
      impl.paused = false;
      if( !playerReady ) {
        addPlayerReadyCallback( function() { self.play(); } );
        return;
      }
      if( impl.ended ) {
        changeCurrentTime( 0 );
      }
      player.play();
    };

    function changeCurrentTime( aTime ) {
      impl.currentTime = aTime;

      // Convert to ms
      aTime = aTime * 1000;

      function seek() {
        onSeeking();
        player.seekTo( aTime );
      }

      if( !playerReady ) {
        addMediaReadyCallback( seek );
        return;
      }

      seek();
    }

    function onSeeking() {
      impl.seeking = true;
      self.dispatchEvent( "seeking" );
    }

    function onSeeked() {
      // XXX: make sure seeks don't hold us in the ended state
      impl.ended = false;
      impl.seeking = false;
      self.dispatchEvent( "timeupdate" );
      self.dispatchEvent( "seeked" );
      self.dispatchEvent( "canplay" );
      self.dispatchEvent( "canplaythrough" );
    }

    self.pause = function() {
      impl.paused = true;
      if( !playerReady ) {
        addPlayerReadyCallback( function() { self.pause(); } );
        return;
      }
      player.pause();
    };

    function onPause() {
      impl.paused = true;
      if( !playerPaused ) {
        playerPaused = true;
        clearInterval( timeUpdateInterval );
        self.dispatchEvent( "pause" );
      }
    }

    function onTimeUpdate() {
      self.dispatchEvent( "timeupdate" );
    }

    function onPlay() {
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

      impl.paused = false;

      if ( playerPaused ) {
        playerPaused = false;

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
        // XXX: SoundCloud doesn't manage end/paused state well.  We have to
        // simulate a pause or we leave the player in a state where it can't
        // restart playing after ended.  Also, the onPause callback won't get
        // called when we do self.pause() here, so we manually set impl.paused
        // to get the state right.
        impl.ended = true;
        self.pause();
        onPause();
        self.dispatchEvent( "timeupdate" );
        self.dispatchEvent( "ended" );
      }
    }

    function onCurrentTime( currentTime ) {
      impl.currentTime = currentTime;

      if( currentTime !== lastCurrentTime ) {
        self.dispatchEvent( "timeupdate" );
      }

      lastCurrentTime = currentTime;
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
          break;
      }
    }

    function monitorCurrentTime() {
      if ( impl.ended ) {
        return;
      }
      player.getPosition( function( currentTimeInMS ) {
        // Convert from ms to s
        onCurrentTime( currentTimeInMS / 1000 );
      });
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

      // Make sure SoundCloud is ready, and if not, register a callback
      if( !isSoundCloudReady() ) {
        addSoundCloudCallback( function() { changeSrc( aSrc ); } );
        return;
      }

      playerReady = false;

      SC.get( "/resolve", { url: aSrc }, function( data ) {
        var err;
        if ( data.errors ) {
          err = { name: "MediaError" };
          // Not sure why this is in an array, and how multiple errors should be handled.
          // For now, I'll just use the first. We just need something.
          if ( data.errors[ 0 ] ) {
            if ( data.errors[ 0 ].error_message === "404 - Not Found" ) {
              err.message = "Video not found.";
              err.code = MediaError.MEDIA_ERR_NETWORK;
            }
          }
          impl.error = err;
          self.dispatchEvent( "error" );
        }
        elem.id = Popcorn.guid( "soundcloud-" );
        elem.width = impl.width;
        elem.height = impl.height;
        elem.frameBorder = 0;
        elem.webkitAllowFullScreen = true;
        elem.mozAllowFullScreen = true;
        elem.allowFullScreen = true;

        // Apply the current controls state, since iframe wasn't ready yet.
        setControls( impl.controls );

        parent.appendChild( elem );

        elem.onload = function() {
          elem.onload = null;

          player = SC.Widget( elem );
          player.bind( SC.Widget.Events.READY, onPlayerReady );

          impl.networkState = self.NETWORK_LOADING;
          self.dispatchEvent( "loadstart" );
          self.dispatchEvent( "progress" );
        };
        elem.src = "https://w.soundcloud.com/player/?url=" + data.uri +
          "&show_artwork=false" +
          "&buying=false" +
          "&liking=false" +
          "&sharing=false" +
          "&download=false" +
          "&show_comments=false" +
          "&show_user=false" +
          "&single_active=false";
      });
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

    function setControls( controls ) {
      // Due to loading issues with hidden content, we have to be careful
      // about how we hide the player when controls=false.  Using opacity:0
      // will let the content load, but allow mouse events.  When it's totally
      // loaded we can visibility:hidden + position:absolute it.
      if ( playerReady ) {
        elem.style.position = "absolute";
        elem.style.visibility = controls ? "visible" : "hidden";
      } else {
        elem.style.opacity = controls ? "1" : "0";
        // Try to stop mouse events over the iframe while loading. This won't
        // work in current Opera or IE, but there's not much I can do
        elem.style.pointerEvents = controls ? "auto" : "none";
      }
      impl.controls = controls;
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
          elem.width = aValue;
          impl.width = elem.width;
        }
      },

      height: {
        get: function() {
          return elem.height;
        },
        set: function( aValue ) {
          elem.height = aValue;
          impl.height = elem.height;
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
      },

      // Similar to HTML5 Audio Elements, with SoundCloud you can
      // hide all visible UI for the player by setting controls=false.
      controls: {
        get: function() {
          return impl.controls;
        },
        set: function( aValue ) {
          setControls( !!aValue );
        }
      }
    });

    self._canPlaySrc = Popcorn.HTMLSoundCloudAudioElement._canPlaySrc;
    self.canPlayType = Popcorn.HTMLSoundCloudAudioElement.canPlayType;

    return self;
  }

  Popcorn.HTMLSoundCloudAudioElement = function( id ) {
    return new HTMLSoundCloudAudioElement( id );
  };

  // Helper for identifying URLs we know how to play.
  Popcorn.HTMLSoundCloudAudioElement._canPlaySrc = function( url ) {
    return (/(?:https?:\/\/www\.|https?:\/\/|www\.|\.|^)(soundcloud)/).test( url ) ?
      "probably" : EMPTY_STRING;
  };

  // We'll attempt to support a mime type of audio/x-soundcloud
  Popcorn.HTMLSoundCloudAudioElement.canPlayType = function( type ) {
    return type === "audio/x-soundcloud" ? "probably" : EMPTY_STRING;
  };

}( Popcorn, window, document ));
(function( Popcorn, window, document ) {

  var

  CURRENT_TIME_MONITOR_MS = 16,
  EMPTY_STRING = "",
  VIMEO_HOST = "https://player.vimeo.com";

  // Utility wrapper around postMessage interface
  function VimeoPlayer( vimeoIFrame ) {
    var self = this,
      url = vimeoIFrame.src.split('?')[0],
      muted = 0;

    if( url.substr(0, 2) === '//' ) {
      url = window.location.protocol + url;
    }

    function sendMessage( method, params ) {
      var data = JSON.stringify({
        method: method,
        value: params
      });

      // The iframe has been destroyed, it just doesn't know it
      if ( !vimeoIFrame.contentWindow ) {
        return;
      }

      vimeoIFrame.contentWindow.postMessage( data, url );
    }

    var methods = ( "play pause paused seekTo unload getCurrentTime getDuration " +
                    "getVideoEmbedCode getVideoHeight getVideoWidth getVideoUrl " +
                    "getColor setColor setLoop getVolume setVolume addEventListener" ).split(" ");
    methods.forEach( function( method ) {
      // All current methods take 0 or 1 args, always send arg0
      self[ method ] = function( arg0 ) {
        sendMessage( method, arg0 );
      };
    });
  }


  function HTMLVimeoVideoElement( id ) {

    // Vimeo iframe API requires postMessage
    if( !window.postMessage ) {
      throw "ERROR: HTMLVimeoVideoElement requires window.postMessage";
    }

    var self = new Popcorn._MediaElementProto(),
      parent = typeof id === "string" ? Popcorn.dom.find( id ) : id,
      elem = document.createElement( "iframe" ),
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
        // Vimeo seems to use .77 as default
        volume: 1,
        // Vimeo has no concept of muted, store volume values
        // such that muted===0 is unmuted, and muted>0 is muted.
        muted: 0,
        currentTime: 0,
        duration: NaN,
        ended: false,
        paused: true,
        error: null
      },
      playerReady = false,
      playerUID = Popcorn.guid(),
      player,
      playerPaused = true,
      playerReadyCallbacks = [],
      timeUpdateInterval,
      currentTimeInterval,
      lastCurrentTime = 0;

    // Namespace all events we'll produce
    self._eventNamespace = Popcorn.guid( "HTMLVimeoVideoElement::" );

    self.parentNode = parent;

    // Mark type as Vimeo
    self._util.type = "Vimeo";

    function addPlayerReadyCallback( callback ) {
      playerReadyCallbacks.unshift( callback );
    }

    function onPlayerReady( event ) {
      player.addEventListener( 'loadProgress' );
      player.addEventListener( 'playProgress' );
      player.addEventListener( 'play' );
      player.addEventListener( 'pause' );
      player.addEventListener( 'finish' );
      player.addEventListener( 'seek' );

      player.getDuration();

      impl.networkState = self.NETWORK_LOADING;
      self.dispatchEvent( "loadstart" );
      self.dispatchEvent( "progress" );
    }

    function updateDuration( newDuration ) {
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
          // Auto-start if necessary
          if( impl.autoplay ) {
            self.play();
          }

          var i = playerReadyCallbacks.length;
          while( i-- ) {
            playerReadyCallbacks[ i ]();
            delete playerReadyCallbacks[ i ];
          }
        }
      }
    }

    function getDuration() {
      if( !playerReady ) {
        // Queue a getDuration() call so we have correct duration info for loadedmetadata
        addPlayerReadyCallback( function() { getDuration(); } );
      }

      player.getDuration();
    }

    function destroyPlayer() {
      if( !( playerReady && player ) ) {
        return;
      }
      clearInterval( currentTimeInterval );
      player.pause();

      window.removeEventListener( 'message', onStateChange, false );
      parent.removeChild( elem );
      elem = document.createElement( "iframe" );
    }

    self.play = function() {
      impl.paused = false;
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
      impl.paused = true;
      if( !playerReady ) {
        addPlayerReadyCallback( function() { self.pause(); } );
        return;
      }

      player.pause();
    };

    function onPause() {
      impl.paused = true;
      if ( !playerPaused ) {
        playerPaused = true;
        clearInterval( timeUpdateInterval );
        self.dispatchEvent( "pause" );
      }
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

      impl.paused = false;
      if( playerPaused ) {
        playerPaused = false;

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
      var currentTime = impl.currentTime = aTime;

      if( currentTime !== lastCurrentTime ) {
        self.dispatchEvent( "timeupdate" );
      }

      lastCurrentTime = impl.currentTime;
    }

    // We deal with the startup load messages differently than
    // we will once the player is fully ready and loaded.
    // When the player is "ready" it is playable, but not
    // yet seekable.  We need to force a play() to get data
    // to download (mimic preload=auto), or seeks will fail.
    function startupMessage( event ) {
      if( event.origin !== VIMEO_HOST ) {
        return;
      }

      var data;
      try {
        data = JSON.parse( event.data );
      } catch ( ex ) {
        console.warn( ex );
      }

      if ( data.player_id != playerUID ) {
        return;
      }

      switch ( data.event ) {
        case "ready":
          player = new VimeoPlayer( elem );
          player.addEventListener( "loadProgress" );
          player.addEventListener( "pause" );
          player.setVolume( 0 );
          player.play();
          break;
        case "loadProgress":
          var duration = parseFloat( data.data.duration );
          if( duration > 0 && !playerReady ) {
            playerReady = true;
            player.pause();
          }
          break;
        case "pause":
          player.setVolume( 1 );
          // Switch message pump to use run-time message callback vs. startup
          window.removeEventListener( "message", startupMessage, false );
          window.addEventListener( "message", onStateChange, false );
          onPlayerReady();
          break;
      }
    }

    function onStateChange( event ) {
      if( event.origin !== VIMEO_HOST ) {
        return;
      }

      var data;
      try {
        data = JSON.parse( event.data );
      } catch ( ex ) {
        console.warn( ex );
      }

      if ( data.player_id != playerUID ) {
        return;
      }

      // Methods
      switch ( data.method ) {
        case "getCurrentTime":
          onCurrentTime( parseFloat( data.value ) );
          break;
        case "getDuration":
          updateDuration( parseFloat( data.value ) );
          break;
        case "getVolume":
          onVolume( parseFloat( data.value ) );
          break;
      }

      // Events
      switch ( data.event ) {
        case "loadProgress":
          self.dispatchEvent( "progress" );
          updateDuration( parseFloat( data.data.duration ) );
          break;
        case "playProgress":
          onCurrentTime( parseFloat( data.data.seconds ) );
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
          onCurrentTime( parseFloat( data.data.seconds ) );
          onSeeked();
          break;
      }
    }

    function monitorCurrentTime() {
      player.getCurrentTime();
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

      playerReady = false;

      var src = self._util.parseUri( aSrc ),
        queryKey = src.queryKey,
        key,
        optionsArray = [
          // Vimeo API options first
          "api=1",
          "player_id=" + playerUID,
          // Turn off as much of the metadata/branding as possible
          "title=0",
          "byline=0",
          "portrait=0"
        ];

      // Sync loop and autoplay based on URL params, and delete.
      // We'll manage both internally.
      impl.loop = queryKey.loop === "1" || impl.loop;
      delete queryKey.loop;
      impl.autoplay = queryKey.autoplay === "1" || impl.autoplay;
      delete queryKey.autoplay;

      // Create the base vimeo player string. It will always have query string options
      src = VIMEO_HOST + '/video/' + ( /\d+$/ ).exec( src.path ) + "?";
      for( key in queryKey ) {
        if ( queryKey.hasOwnProperty( key ) ) {
          optionsArray.push( encodeURIComponent( key ) + "=" +
                             encodeURIComponent( queryKey[ key ] ) );
        }
      }
      src += optionsArray.join( "&" );

      elem.id = playerUID;
      elem.style.width = "100%";
      elem.style.height = "100%";
      elem.frameBorder = 0;
      elem.webkitAllowFullScreen = true;
      elem.mozAllowFullScreen = true;
      elem.allowFullScreen = true;
      parent.appendChild( elem );
      elem.src = src;

      window.addEventListener( "message", startupMessage, false );
    }

    function onVolume( aValue ) {
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

    self._canPlaySrc = Popcorn.HTMLVimeoVideoElement._canPlaySrc;
    self.canPlayType = Popcorn.HTMLVimeoVideoElement.canPlayType;

    return self;
  }

  Popcorn.HTMLVimeoVideoElement = function( id ) {
    return new HTMLVimeoVideoElement( id );
  };

  // Helper for identifying URLs we know how to play.
  Popcorn.HTMLVimeoVideoElement._canPlaySrc = function( url ) {
    return ( (/player.vimeo.com\/video\/\d+/).test( url ) ||
             (/vimeo.com\/\d+/).test( url ) ) ? "probably" : EMPTY_STRING;
  };

  // We'll attempt to support a mime type of video/x-vimeo
  Popcorn.HTMLVimeoVideoElement.canPlayType = function( type ) {
    return type === "video/x-vimeo" ? "probably" : EMPTY_STRING;
  };

}( Popcorn, window, document ));
(function( Popcorn, window, document ) {

  var

  CURRENT_TIME_MONITOR_MS = 10,
  EMPTY_STRING = "",

  // Example: http://www.youtube.com/watch?v=12345678901
  regexYouTube = /^.*(?:\/|v=)(.{11})/,

  ABS = Math.abs,

  // Setup for YouTube API
  ytReady = false,
  ytLoading = false,
  ytCallbacks = [];

  function onYouTubeIframeAPIReady() {
    var callback;
    if ( YT.loaded ) {
      ytReady = true;
      while( ytCallbacks.length ) {
        callback = ytCallbacks.shift();
        callback();
      }
    } else {
      setTimeout( onYouTubeIframeAPIReady, 250 );
    }
  }

  function isYouTubeReady() {
    var script;
    // If we area already waiting, do nothing.
    if( !ytLoading ) {
      // If script is already there, check if it is loaded.
      if ( window.YT ) {
        onYouTubeIframeAPIReady();
      } else {
        script = document.createElement( "script" );
        script.addEventListener( "load", onYouTubeIframeAPIReady, false);
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild( script );
      }
      ytLoading = true;
    }
    return ytReady;
  }

  function addYouTubeCallback( callback ) {
    ytCallbacks.push( callback );
  }

  function HTMLYouTubeVideoElement( id ) {

    // YouTube iframe API requires postMessage
    if( !window.postMessage ) {
      throw "ERROR: HTMLYouTubeVideoElement requires window.postMessage";
    }

    var self = new Popcorn._MediaElementProto(),
      parent = typeof id === "string" ? document.querySelector( id ) : id,
      elem = document.createElement( "div" ),
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
      mediaReady = false,
      loopedPlay = false,
      player,
      playerPaused = true,
      mediaReadyCallbacks = [],
      playerState = -1,
      bufferedInterval,
      lastLoadedFraction = 0,
      currentTimeInterval,
      timeUpdateInterval;

    // Namespace all events we'll produce
    self._eventNamespace = Popcorn.guid( "HTMLYouTubeVideoElement::" );

    self.parentNode = parent;

    // Mark this as YouTube
    self._util.type = "YouTube";

    function addMediaReadyCallback( callback ) {
      mediaReadyCallbacks.push( callback );
    }

    function catchRoguePlayEvent() {
      player.pauseVideo();
      removeYouTubeEvent( "play", catchRoguePlayEvent );
      addYouTubeEvent( "play", onPlay );
    }

    function catchRoguePauseEvent() {
      addYouTubeEvent( "pause", onPause );
      removeYouTubeEvent( "pause", catchRoguePauseEvent );
    }

    function onPlayerReady( event ) {

      var onMuted = function() {
        if ( player.isMuted() ) {
          // force an initial play on the video, to remove autostart on initial seekTo.
          addYouTubeEvent( "play", onFirstPlay );
          player.playVideo();
        } else {
          setTimeout( onMuted, 0 );
        }
      };
      playerReady = true;
      // XXX: this should really live in cued below, but doesn't work.

      // Browsers using flash will have the pause() call take too long and cause some
      // sound to leak out. Muting before to prevent this.
      player.mute();

      // ensure we are muted.
      onMuted();
    }

    function onPlayerError(event) {
      // There's no perfect mapping to HTML5 errors from YouTube errors.
      var err = { name: "MediaError" };

      switch( event.data ) {

        // invalid parameter
        case 2:
          err.message = "Invalid video parameter.";
          err.code = MediaError.MEDIA_ERR_ABORTED;
          break;

        // HTML5 Error
        case 5:
          err.message = "The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.";
          err.code = MediaError.MEDIA_ERR_DECODE;

        // requested video not found
        case 100:
          err.message = "Video not found.";
          err.code = MediaError.MEDIA_ERR_NETWORK;
          break;

        // video can't be embedded by request of owner
        case 101:
        case 150:
          err.message = "Video not usable.";
          err.code = MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
          break;

        default:
          err.message = "Unknown error.";
          err.code = 5;
      }

      impl.error = err;
      self.dispatchEvent( "error" );
    }

    function onReady() {

      addYouTubeEvent( "play", onPlay );
      addYouTubeEvent( "pause", onPause );
      // Set initial paused state
      if( impl.autoplay || !impl.paused ) {
        removeYouTubeEvent( "play", onReady );
        impl.paused = false;
        addMediaReadyCallback(function() {
          if ( !impl.paused ) {
            onPlay();
          }
        });
      }

      // Ensure video will now be unmuted when playing due to the mute on initial load.
      if( !impl.muted ) {
        player.unMute();
      }

      impl.readyState = self.HAVE_METADATA;
      self.dispatchEvent( "loadedmetadata" );
      currentTimeInterval = setInterval( monitorCurrentTime,
                                         CURRENT_TIME_MONITOR_MS );

      self.dispatchEvent( "loadeddata" );

      impl.readyState = self.HAVE_FUTURE_DATA;
      self.dispatchEvent( "canplay" );

      mediaReady = true;
      bufferedInterval = setInterval( monitorBuffered, 50 );

      while( mediaReadyCallbacks.length ) {
        mediaReadyCallbacks[ 0 ]();
        mediaReadyCallbacks.shift();
      }

      // We can't easily determine canplaythrough, but will send anyway.
      impl.readyState = self.HAVE_ENOUGH_DATA;
      self.dispatchEvent( "canplaythrough" );
    }

    function onFirstPause() {
      removeYouTubeEvent( "pause", onFirstPause );
      if ( player.getCurrentTime() > 0 ) {
        setTimeout( onFirstPause, 0 );
        return;
      }

      if( impl.autoplay || !impl.paused ) {
        addYouTubeEvent( "play", onReady );
        player.playVideo();
      } else {
        onReady();
      }
    }

    // This function needs duration and first play to be ready.
    function onFirstPlay() {
      removeYouTubeEvent( "play", onFirstPlay );
      if ( player.getCurrentTime() === 0 ) {
        setTimeout( onFirstPlay, 0 );
        return;
      }
      addYouTubeEvent( "pause", onFirstPause );
      player.seekTo( 0 );
      player.pauseVideo();
    }

    function addYouTubeEvent( event, listener ) {
      self.addEventListener( "youtube-" + event, listener, false );
    }
    function removeYouTubeEvent( event, listener ) {
      self.removeEventListener( "youtube-" + event, listener, false );
    }
    function dispatchYouTubeEvent( event ) {
      self.dispatchEvent( "youtube-" + event );
    }

    function onBuffering() {
      impl.networkState = self.NETWORK_LOADING;
      var newDuration = player.getDuration();
      if (impl.duration !== newDuration) {
        impl.duration = newDuration;
        self.dispatchEvent( "durationchange" );
      }
      self.dispatchEvent( "waiting" );
    }

    addYouTubeEvent( "buffering", onBuffering );
    addYouTubeEvent( "ended", onEnded );

    function onPlayerStateChange( event ) {

      switch( event.data ) {

        // ended
        case YT.PlayerState.ENDED:
          dispatchYouTubeEvent( "ended" );
          break;

        // playing
        case YT.PlayerState.PLAYING:
          dispatchYouTubeEvent( "play" );
          break;

        // paused
        case YT.PlayerState.PAUSED:
          // Youtube fires a paused event before an ended event.
          // We have no need for this.
          if ( player.getDuration() !== player.getCurrentTime() ) {
            dispatchYouTubeEvent( "pause" );
          }
          break;

        // buffering
        case YT.PlayerState.BUFFERING:
          dispatchYouTubeEvent( "buffering" );
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
    }

    function destroyPlayer() {
      if( !( playerReady && player ) ) {
        return;
      }

      removeYouTubeEvent( "buffering", onBuffering );
      removeYouTubeEvent( "ended", onEnded );
      removeYouTubeEvent( "play", onPlay );
      removeYouTubeEvent( "pause", onPause );
      onPause();
      mediaReady = false;
      loopedPlay = false;
      impl.currentTime = 0;
      mediaReadyCallbacks = [];
      clearInterval( currentTimeInterval );
      clearInterval( bufferedInterval );
      player.stopVideo();
      player.clearVideo();
      player.destroy();
      elem = document.createElement( "div" );
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
      if( !isYouTubeReady() ) {
        addYouTubeCallback( function() { changeSrc( aSrc ); } );
        return;
      }

      if( playerReady ) {
        if( mediaReady ) {
          destroyPlayer();
        } else {
          addMediaReadyCallback( function() {
            changeSrc( aSrc );
          });
          return;
        }
      }

      parent.appendChild( elem );

      // Use any player vars passed on the URL
      var playerVars = self._util.parseUri( aSrc ).queryKey;

      // Remove the video id, since we don't want to pass it
      delete playerVars.v;

      // Sync autoplay, but manage internally
      impl.autoplay = playerVars.autoplay === "1" || impl.autoplay;
      delete playerVars.autoplay;

      // Sync loop, but manage internally
      impl.loop = playerVars.loop === "1" || impl.loop;
      delete playerVars.loop;

      // Don't show related videos when ending
      playerVars.rel = playerVars.rel || 0;

      // Don't show YouTube's branding
      playerVars.modestbranding = playerVars.modestbranding || 1;

      // Don't show annotations by default
      playerVars.iv_load_policy = playerVars.iv_load_policy || 3;

      // Disable keyboard controls by default
      playerVars.disablekb = playerVars.disablekb || 1;

      // Don't show video info before playing
      playerVars.showinfo = playerVars.showinfo || 0;

      // Specify our domain as origin for iframe security
      var domain = window.location.protocol === "file:" ? "*" :
      window.location.protocol + "//" + window.location.host;
      playerVars.origin = playerVars.origin || domain;

      // Show/hide controls. Sync with impl.controls and prefer URL value.
      playerVars.controls = playerVars.controls || impl.controls ? 2 : 0;
      impl.controls = playerVars.controls;

      // Set wmode to transparent to show video overlays
      playerVars.wmode = playerVars.wmode || "opaque";

      if ( playerVars.html5 !== 0 ) {
        playerVars.html5 = 1;
      }

      // Get video ID out of youtube url
      aSrc = regexYouTube.exec( aSrc )[ 1 ];

      player = new YT.Player( elem, {
        width: "100%",
        height: "100%",
        wmode: playerVars.wmode,
        videoId: aSrc,
        playerVars: playerVars,
        events: {
          'onReady': onPlayerReady,
          'onError': onPlayerError,
          'onStateChange': onPlayerStateChange
        }
      });

      impl.networkState = self.NETWORK_LOADING;
      self.dispatchEvent( "loadstart" );
      self.dispatchEvent( "progress" );
    }

    function monitorCurrentTime() {
      var playerTime = player.getCurrentTime();
      if ( !impl.seeking ) {
        if ( ABS( impl.currentTime - playerTime ) > CURRENT_TIME_MONITOR_MS ) {
          onSeeking();
          onSeeked();
        }
        impl.currentTime = playerTime;
      } else if ( ABS( playerTime - impl.currentTime ) < 1 ) {
        onSeeked();
      }
    }

    function monitorBuffered() {
      var fraction = player.getVideoLoadedFraction();

      if ( fraction && lastLoadedFraction !== fraction ) {
        lastLoadedFraction = fraction;
        onProgress();
      }
    }

    function changeCurrentTime( aTime ) {
      if ( aTime === impl.currentTime ) {
        return;
      }
      impl.currentTime = aTime;
      if( !mediaReady ) {
        addMediaReadyCallback( function() {

          onSeeking();
          player.seekTo( aTime );
        });
        return;
      }

      onSeeking();
      player.seekTo( aTime );
    }

    function onTimeUpdate() {
      self.dispatchEvent( "timeupdate" );
    }

    function onSeeking() {
      // a seek in youtube fires a paused event.
      // we don't want to listen for this, so this state catches the event.
      addYouTubeEvent( "pause", catchRoguePauseEvent );
      removeYouTubeEvent( "pause", onPause );
      impl.seeking = true;
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
      if( impl.ended ) {
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
      }
    }

    function onProgress() {
      self.dispatchEvent( "progress" );
    }

    self.play = function() {
      impl.paused = false;
      if( !mediaReady ) {
        addMediaReadyCallback( function() {
          self.play();
        });
        return;
      }
      player.playVideo();
    };

    function onPause() {
      impl.paused = true;
      if ( !playerPaused ) {
        playerPaused = true;
        clearInterval( timeUpdateInterval );
        self.dispatchEvent( "pause" );
      }
    }

    self.pause = function() {
      impl.paused = true;
      if( !mediaReady ) {
        addMediaReadyCallback( function() {
          self.pause();
        });
        return;
      }
      // if a pause happens while seeking, ensure we catch it.
      // in youtube seeks fire pause events, and we don't want to listen to that.
      // except for the case of an actual pause.
      catchRoguePauseEvent();
      player.pauseVideo();
    };

    function onEnded() {
      if( impl.loop ) {
        changeCurrentTime( 0 );
        self.play();
      } else {
        impl.ended = true;
        onPause();
        // YouTube will fire a Playing State change after the video has ended, causing it to loop.
        addYouTubeEvent( "play", catchRoguePlayEvent );
        removeYouTubeEvent( "play", onPlay );
        self.dispatchEvent( "timeupdate" );
        self.dispatchEvent( "ended" );
      }
    }

    function setMuted( aValue ) {
      impl.muted = aValue;
      if( !mediaReady ) {
        addMediaReadyCallback( function() {
          setMuted( impl.muted );
        });
        return;
      }
      player[ aValue ? "mute" : "unMute" ]();
      self.dispatchEvent( "volumechange" );
    }

    function getMuted() {
      // YouTube has isMuted(), but for sync access we use impl.muted
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
          return impl.volume;
        },
        set: function( aValue ) {
          if( aValue < 0 || aValue > 1 ) {
            throw "Volume value must be between 0.0 and 1.0";
          }
          impl.volume = aValue;
          if( !mediaReady ) {
            addMediaReadyCallback( function() {
              self.volume = aValue;
            });
            return;
          }
          player.setVolume( impl.volume * 100 );
          self.dispatchEvent( "volumechange" );
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
              if ( index === 0 ) {
                if ( !impl.duration ) {
                  return 0;
                }

                return impl.duration * lastLoadedFraction;
              }

              //throw fake DOMException/INDEX_SIZE_ERR
              throw "INDEX_SIZE_ERR: DOM Exception 1";
            },
            length: 1
          };

          return timeRanges;
        },
        configurable: true
      }
    });

    self._canPlaySrc = Popcorn.HTMLYouTubeVideoElement._canPlaySrc;
    self.canPlayType = Popcorn.HTMLYouTubeVideoElement.canPlayType;

    return self;
  }

  Popcorn.HTMLYouTubeVideoElement = function( id ) {
    return new HTMLYouTubeVideoElement( id );
  };

  // Helper for identifying URLs we know how to play.
  Popcorn.HTMLYouTubeVideoElement._canPlaySrc = function( url ) {
    return (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu).*(?:\/|v=)(.{11})/).test( url ) ?
      "probably" :
      EMPTY_STRING;
  };

  // We'll attempt to support a mime type of video/x-youtube
  Popcorn.HTMLYouTubeVideoElement.canPlayType = function( type ) {
    return type === "video/x-youtube" ? "probably" : EMPTY_STRING;
  };

}( Popcorn, window, document ));
