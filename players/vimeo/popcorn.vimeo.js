(function() {

  // parseUri 1.2.2
  // http://blog.stevenlevithan.com/archives/parseuri
  // (c) Steven Levithan <stevenlevithan.com>
  // MIT License

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

  function canPlayType( nodeName, url ) {
    return ( /player.vimeo.com\/video\/\d+/ ).test( url ) ||
           ( /vimeo.com\/\d+/ ).test( url );
  }

  Popcorn.player( "vimeo", {

    _canPlayType: canPlayType,
    _setup: function( options ) {

      var TIMEUPDATE_INTERVAL_MS  = 250,
          CURRENT_TIME_MONITOR_MS = 16,
          MediaErrorInterface = {
            MEDIA_ERR_ABORTED: 1,
            MEDIA_ERR_NETWORK: 2,
            MEDIA_ERR_DECODE: 3,
            MEDIA_ERR_SRC_NOT_SUPPORTED: 4
          },
          guid,
          media = this,
          commands = {
            q: [],
            queue: function queue( fn ) {
              this.q.push( fn );
              this.process();
            },
            process: function process() {
              if ( !vimeoReady ) {
                return;
              }

              while ( this.q.length ) {
                var fn = this.q.shift();
                fn();
              }
            }
          },
          currentTimeId,
          timeUpdateId,
          vimeoReady,
          vimeoContainer = document.createElement( "iframe" ),
          // Loosely based on HTMLMediaElement + HTMLVideoElement IDL
          impl = {
            // error state
            error: null,

            // network state
            src: media.src,
            NETWORK_EMPTY: 0,
            NETWORK_IDLE: 1,
            NETWORK_LOADING: 2,
            NETWORK_NO_SOURCE: 3,
            networkState: 0,

            // ready state
            HAVE_NOTHING: 0,
            HAVE_METADATA: 1,
            HAVE_CURRENT_DATA: 2,
            HAVE_FUTURE_DATA: 3,
            HAVE_ENOUGH_DATA: 4,
            readyState: 0,
            seeking: false,

            // playback state
            currentTime: 0,
            duration: NaN,
            paused: true,
            ended: false,
            autoplay: false,
            loop: false,

            // controls
            volume: 1,
            muted: false,

            // Video attributes
            width: 0,
            height: 0
          };

      var readOnlyAttrs = "error networkState readyState seeking duration paused ended";
      Popcorn.forEach( readOnlyAttrs.split(" "), function( value ) {
        Object.defineProperty( media, value, {
          get: function() {
            return impl[ value ];
          }
        });
      });

      Object.defineProperties( media, {
        "src": {
          get: function() {
            return impl.src;
          },
          set: function( value ) {
            // Is there any sort of logic that determines whether to load the video or not?
            impl.src = value;
            media.load();
          }
        },
        "currentTime": {
          get: function() {
            return impl.currentTime;
          },
          set: function( value ) {
            commands.queue(function() {
              sendMessage( "seekTo", value );
            });
            impl.seeking = true;
            media.dispatchEvent( "seeking" );
          }
        },
        "autoplay": {
          get: function() {
            return impl.autoplay;
          },
          set: function( value ) {
            impl.autoplay = !!value;
          }
        },
        "loop": {
          get: function() {
            return impl.loop;
          },
          set: function( value) {
            impl.loop = !!value;
            commands.queue(function() {
              sendMessage( "setLoop", loop );
            });
          }
        },
        "volume": {
          get: function() {
            return impl.volume;
          },
          set: function( value ) {
            impl.volume = value;
            commands.queue(function() {
              sendMessage( "setVolume", impl.muted ? 0 : impl.volume );
            });
            media.dispatchEvent( "volumechange" );
          }
        },
        "muted": {
          get: function() {
            return impl.muted;
          },
          set: function( value ) {
            impl.muted = !!value;
            commands.queue(function() {
              sendMessage( "setVolume", impl.muted ? 0 : impl.volume );
            });
            media.dispatchEvent( "volumechange" );
          }
        },
        "width": {
          get: function() {
            return vimeoContainer.width;
          },
          set: function( value ) {
            vimeoContainer.width = value;
          }
        },
        "height": {
          get: function() {
            return vimeoContainer.height;
          },
          set: function( value ) {
            vimeoContainer.height = value;
          }
        }
      });

      function sendMessage( method, params ) {
        var url = vimeoContainer.src.split( "?" )[ 0 ],
            data = JSON.stringify({
              method: method,
              value: params
            });

        if ( url.substr( 0, 2 ) === "//" ) {
          url = window.location.protocol + url;
        }

        // The iframe has been destroyed, it just doesn't know it
        if ( !vimeoContainer.contentWindow ) {
          media.unload();
          return;
        }

        vimeoContainer.contentWindow.postMessage( data, url );
      }

      var vimeoAPIMethods = {
        "getCurrentTime": function( data ) {
          impl.currentTime = parseFloat( data.value );
        },
        "getDuration": function( data ) {
          impl.duration = parseFloat( data.value );
          maybeReady();
        },
        "getVolume": function( data ) {
          impl.volume = parseFloat( data.value );
        }
      };

      var vimeoAPIEvents = {
        "ready": function( data ) {
          sendMessage( "addEventListener", "loadProgress" );
          sendMessage( "addEventListener", "playProgress" );
          sendMessage( "addEventListener", "play" );
          sendMessage( "addEventListener", "pause" );
          sendMessage( "addEventListener", "finish" );
          sendMessage( "addEventListener", "seek" );
          sendMessage( "getDuration" );
          vimeoReady = true;
          commands.process();
          media.dispatchEvent( "loadstart" );
        },
        "loadProgress": function( data ) {
          media.dispatchEvent( "progress" );
          // loadProgress has a more accurate duration than getDuration
          impl.duration = parseFloat( data.data.duration );
        },
        "playProgress": function( data ) {
          impl.currentTime = parseFloat( data.data.seconds );
        },
        "play": function( data ) {
          // Vimeo plays video if seeking from an unloaded state
          if ( impl.seeking ) {
            impl.seeking = false;
            media.dispatchEvent( "seeked" );
          }
          impl.paused = false;
          impl.ended = false;
          startUpdateLoops();
          media.dispatchEvent( "play" );
        },
        "pause": function( data ) {
          impl.paused = true;
          stopUpdateLoops();
          media.dispatchEvent( "pause" );
        },
        "finish": function( data ) {
          impl.ended = true;
          stopUpdateLoops();
          media.dispatchEvent( "ended" );
        },
        "seek": function( data ) {
          impl.currentTime = parseFloat( data.data.seconds );
          impl.seeking = false;
          impl.ended = false;
          media.dispatchEvent( "timeupdate" );
          media.dispatchEvent( "seeked" );
        }
      };

      function messageListener( event ) {
        if ( event.origin !== "http://player.vimeo.com" ) {
          return;
        }

        var data;
        try {
          data = JSON.parse( event.data );
        } catch ( ex ) {
          console.warn( ex );
        }

        if ( data.player_id != guid ) {
          return;
        }

        // Methods
        if ( data.method && vimeoAPIMethods[ data.method ] ) {
          vimeoAPIMethods[ data.method ]( data );
        }

        // Events
        if ( data.event && vimeoAPIEvents[ data.event ] ) {
          vimeoAPIEvents[ data.event ]( data );
        }
      }

      media.load = function() {
        vimeoReady = false;
        guid = Popcorn.guid();

        var src = parseUri( impl.src ),
            combinedOptions = {},
            optionsArray = [],
            vimeoAPIOptions = {
              api: 1,
              player_id: guid
            };

        if ( !canPlayType( media.nodeName, src.source ) ) {
          setErrorAttr( impl.MEDIA_ERR_SRC_NOT_SUPPORTED );
          return;
        }

        // Add Popcorn ctor options, url options, then the Vimeo API options
        Popcorn.extend( combinedOptions, options );
        Popcorn.extend( combinedOptions, src.queryKey );
        Popcorn.extend( combinedOptions, vimeoAPIOptions );

        // Create the base vimeo player string. It will always have query string options
        src = "http://player.vimeo.com/video/" + ( /\d+$/ ).exec( src.path ) + "?";

        for ( var key in combinedOptions ) {
          if ( combinedOptions.hasOwnProperty( key ) ) {
            optionsArray.push( encodeURIComponent( key ) + "=" + encodeURIComponent( combinedOptions[ key ] ) );
          }
        }
        src += optionsArray.join( "&" );

        impl.loop = !!src.match( /loop=1/ );
        impl.autoplay = !!src.match( /autoplay=1/ );

        vimeoContainer.width = media.style.width ? media.style.width : 500;
        vimeoContainer.height = media.style.height ? media.style.height : 281;
        vimeoContainer.frameBorder = 0;
        vimeoContainer.webkitAllowFullScreen = true;
        vimeoContainer.mozAllowFullScreen = true;
        vimeoContainer.allowFullScreen = true;
        vimeoContainer.src = src;
        media.appendChild( vimeoContainer );
      };

      function setErrorAttr( value ) {
        impl.error = {};
        Popcorn.extend( impl.error, MediaErrorInterface );
        impl.error.code = value;
        media.dispatchEvent( "error" );
      }

      function maybeReady() {
        if ( !isNaN( impl.duration ) ) {
          impl.readyState = 4;
          media.dispatchEvent( "durationchange" );
          media.dispatchEvent( "loadedmetadata" );
          media.dispatchEvent( "loadeddata" );
          media.dispatchEvent( "canplay" );
          media.dispatchEvent( "canplaythrough" );
        }
      }

      function startUpdateLoops() {
        if ( !timeUpdateId ) {
          timeUpdateId = setInterval(function() {
            media.dispatchEvent( "timeupdate" );
          }, TIMEUPDATE_INTERVAL_MS );
        }

        if ( !currentTimeId ) {
          currentTimeId = setInterval(function() {
            sendMessage( "getCurrentTime" );
          }, CURRENT_TIME_MONITOR_MS );
        }
      }

      function stopUpdateLoops() {
        if ( timeUpdateId ) {
          clearInterval( timeUpdateId );
          timeUpdateId = 0;
        }

        if ( currentTimeId ) {
          clearInterval( currentTimeId );
          currentTimeId = 0;
        }
      }

      media.unload = function() {
        stopUpdateLoops();
        window.removeEventListener( "message", messageListener, false );
      };

      media.play = function() {
        commands.queue(function() {
          sendMessage( "play" );
        });
      };

      media.pause = function() {
        commands.queue(function() {
          sendMessage( "pause" );
        });
      };

      // Start the load process now, players behave like `preload="metadata"` is set
      // Do it asynchronously so that users can attach event listeners
      setTimeout(function() {
        window.addEventListener( "message", messageListener, false );
        media.load();
      }, 0 );
    },
    _teardown: function( options ) {
      // If the baseplayer doesn't call _setup
      if ( this.unload ) {
        this.unload();
      }
    }
  });
})();
