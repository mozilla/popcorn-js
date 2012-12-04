(function( window, Popcorn ) {
  var videoIdRegex = new RegExp( "(?:http://www\\.|http://|www\\.|\\.|^)(?:youtu).*(?:/|v=)(.{11})" );
  // A global callback for youtube... that makes me angry
  window.onYouTubePlayerAPIReady = function() {

    onYouTubePlayerAPIReady.ready = true;
    for ( var i = 0; i < onYouTubePlayerAPIReady.waiting.length; i++ ) {
      onYouTubePlayerAPIReady.waiting[ i ]();
    }
  };

  // existing youtube references can break us.
  // remove it and use the one we can trust.
  if ( window.YT ) {
    window.quarantineYT = window.YT;
    window.YT = null;
  }

  onYouTubePlayerAPIReady.waiting = [];

  var _loading = false;

  Popcorn.player( "youtube", {
    _canPlayType: function( nodeName, url ) {
      return typeof url === "string" && videoIdRegex.test( url ) && nodeName.toLowerCase() !== "video";
    },
    _setup: function( options ) {
      if ( !window.YT && !_loading ) {
        _loading = true;
        Popcorn.getScript( "//youtube.com/player_api" );
      }

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

            val = Number( val );
            
            if ( isNaN ( val ) ) {
              return;
            }
            
            currentTime = val;
            
            seeking = true;
            media.dispatchEvent( "seeking" );
            
            options.youtubeObject.seekTo( val );
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

        var src, query, params, playerVars, queryStringItem, firstPlay = true, seekEps = 0.1;

        var timeUpdate = function() {

          if ( options.destroyed ) {
            return;
          }

          var ytTime = options.youtubeObject.getCurrentTime();

          if ( !seeking ) {
            currentTime = ytTime;
          } else if ( currentTime >= ytTime - seekEps && currentTime <= ytTime + seekEps ) {
            seeking = false;
            seekEps = 0.1;
            media.dispatchEvent( "seeked" );
          } else {
            // seek didn't work very well, try again with higher tolerance
            seekEps *= 2;
            options.youtubeObject.seekTo( currentTime );
          }
          
          media.dispatchEvent( "timeupdate" );
          
          setTimeout( timeUpdate, 200 );
        };

        // delay is in seconds
        var fetchDuration = function( delay ) {
          var ytDuration = options.youtubeObject.getDuration();

          if ( isNaN( ytDuration ) || ytDuration === 0 ) {
            setTimeout( function() {
              fetchDuration( delay * 2 );
            }, delay*1000 );
          } else {
            // set duration and dispatch ready events
            media.duration = ytDuration;
            media.dispatchEvent( "durationchange" );
            
            media.dispatchEvent( "loadedmetadata" );
            media.dispatchEvent( "loadeddata" );
            
            media.readyState = 4;

            timeUpdate();

            media.dispatchEvent( "canplay" );
            media.dispatchEvent( "canplaythrough" );
          }
        };

        // Default controls to off
        options.controls = +options.controls === 0 || +options.controls === 1 ? options.controls : 0;
        options.annotations = +options.annotations === 1 || +options.annotations === 3 ? options.annotations : 1;

        src = videoIdRegex.exec( media.src )[ 1 ];

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

        params = query.split( /[\&\?]/g );
        playerVars = { wmode: "transparent" };

        for( var i = 0; i < params.length; i++ ) {
          queryStringItem = params[ i ].split( "=" );
          playerVars[ queryStringItem[ 0 ] ] = queryStringItem[ 1 ];
        }

        // Don't show related videos when ending
        playerVars.rel = playerVars.rel || 0;

        // Don't show YouTube's branding
        playerVars.modestbranding = playerVars.modestbranding || 1;

        // Don't show annotations by default
        playerVars.iv_load_policy = playerVars.iv_load_policy || 3;

        // Don't show video info before playing
        playerVars.showinfo = playerVars.showinfo || 0;

        // Show/hide controls.
        playerVars.controls = playerVars.controls || ( options.controls || 0 );

        options.youtubeObject = new YT.Player( container.id, {
          height: "100%",
          width: "100%",
          wmode: "transparent",
          playerVars: playerVars,
          videoId: src,
          events: {
            "onReady": function(){

              // pulling initial volume states form baseplayer
              lastVolume = media.volume;
              lastMuted = media.muted;

              volumeupdate();

              paused = media.paused;
              createProperties();
              options.youtubeObject.playVideo();

              media.currentTime = fragmentStart;

              media.dispatchEvent( "loadstart" );

              // wait to dispatch ready events until we get a duration
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
              } else if ( state.data === 1 && !firstPlay ) {
                paused = false;
                media.dispatchEvent( "play" );
                media.dispatchEvent( "playing" );
                playerQueue.next();
              } else if ( state.data === 0 ) {
                media.dispatchEvent( "ended" );
              } else if ( state.data === 1 && firstPlay ) {
                firstPlay = false;

                // pulling initial paused state from autoplay or the baseplayer
                // also need to explicitly set to paused otherwise.
                if ( autoPlay || !media.paused ) {
                  paused = false;
                }

                if ( paused ) {
                  options.youtubeObject.pauseVideo();
                }
                
                fetchDuration( 0.025 );
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

      if ( onYouTubePlayerAPIReady.ready ) {

        youtubeInit();
      } else {

        onYouTubePlayerAPIReady.waiting.push( youtubeInit );
      }
    },
    _teardown: function( options ) {

      options.destroyed = true;

      var youtubeObject = options.youtubeObject;
      if( youtubeObject ){
        youtubeObject.stopVideo();
        youtubeObject.clearVideo && youtubeObject.clearVideo();
      }

      this.removeChild( document.getElementById( options._container.id ) );
    }
  });
}( window, Popcorn ));
