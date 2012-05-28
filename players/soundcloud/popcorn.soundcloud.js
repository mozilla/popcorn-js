(function() {

  var scriptLoaded = false,
      loading = false;
  Popcorn.player( "soundcloud", {
    _canPlayType: function( nodeName, url ) {

      return (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(soundcloud)/).test( url ) && nodeName.toLowerCase() !== "video";
    },
    _setup: function( options ) {

      var media = this,
          container = document.createElement( "iframe" ),
          lastVolume = 1,
          currentTime = 0,
          paused = true,
          realPaused = true,
          widget,
          duration = 0,
          muted = false,
          playerQueue = Popcorn.player.playerQueue();

      options._container = container;
      media.style.visibility = "hidden";

      media.play = function() {

        paused = false;
        playerQueue.add(function() {

          if ( realPaused ) {

            widget && widget.play();
          } else {
            playerQueue.next();
          }
        });
      };

      media.pause = function() {

        paused = true;

        playerQueue.add(function() {

          if ( !realPaused ) {

            widget && widget.pause();
          } else {
            playerQueue.next();
          }
        });
      };

      // getter and setter for muted property, multiply volume by 100 as that is the scale soundcloud works on
      Object.defineProperties( media, {
        muted: {
          set: function( val ) {
            if ( val ) {
              widget && widget.getVolume(function( data ) {
                lastVolume = data / 100;
              });
              widget && widget.setVolume( 0 );
              muted = true;
            } else {
              widget && widget.setVolume( lastVolume * 100 );
              muted = false;
            }
            media.dispatchEvent( "volumechange" );
          },
          get: function() {
            return muted;
          }
        },
        volume: {
          set: function( val ) {
            widget && widget.setVolume( val * 100 );
            lastVolume = val ;
            media.dispatchEvent( "volumechange" );
          },
          get: function() {
            return muted ? 0 : lastVolume;
          }
        },
        currentTime: {
          set: function( val ) {
            currentTime = val;
            widget && widget.seekTo( val * 1000 );
            media.dispatchEvent( "seeked" );
            media.dispatchEvent( "timeupdate" );
          },
          get: function() {
            return currentTime;
          }
        },
        duration: {
          get: function() {
            return duration;
          }
        },
        paused: {
          get: function() {
            return paused;
          }
        }
      });
      // called when the SoundCloud api script has loaded
      function scriptReady() {
        scriptLoaded = true;

        SC.initialize({
          client_id: "PRaNFlda6Bhf5utPjUsptg"
        });

        SC.get( "/resolve", {
          url: media.src
        }, function( data ) {
          media.width = media.style.width ? "" + media.offsetWidth : "560";
          media.height = media.style.height ? "" + media.offsetHeight : "315";
          // TODO: There are quite a few options here that we should pass on to the user
          container.scrolling = "no";
          container.frameborder = "no";
          container.id = "soundcloud-" + Popcorn.guid();
          container.src = "http://w.soundcloud.com/player/?url=" + data.uri +
          "&show_artwork=false" +
          "&buying=false" +
          "&liking=false" +
          "&sharing=false";

          container.width = "100%";
          container.height = "100%";

          options.loadListener = function( e ) {
            options.widget = widget = SC.Widget( container.id );
            // setup all of our listeners
            widget.bind(SC.Widget.Events.FINISH, function() {
              media.pause();

              media.dispatchEvent( "ended" );
            });

            widget.bind(SC.Widget.Events.PLAY_PROGRESS, function( data ) {

              currentTime = data.currentPosition / 1000;
              media.dispatchEvent( "timeupdate" );
            });

            widget.bind(SC.Widget.Events.PLAY, function( data ) {

              paused = realPaused = false;

              media.dispatchEvent( "play" );
              media.dispatchEvent( "playing" );
              media.currentTime = currentTime;

              playerQueue.next();
            });

            widget.bind(SC.Widget.Events.PAUSE, function( data ) {

              paused = realPaused = true;
              media.dispatchEvent( "pause" );

              playerQueue.next();
            });
            widget.bind(SC.Widget.Events.READY, function( data ) {
              widget.getDuration(function( data ) {

                duration = data / 1000;

                media.style.visibility = "visible";
                media.dispatchEvent( "durationchange" );
                // update the readyState after we have the duration
                media.readyState = 4;
                media.dispatchEvent( "readystatechange" );
                media.dispatchEvent( "loadedmetadata" );
                media.dispatchEvent( "loadeddata" );
                media.dispatchEvent( "canplaythrough" );
                media.dispatchEvent( "load" );
                !media.paused && media.play();
              });
              widget.getVolume(function( data ) {
                lastVolume = data / 100;
              });
            });
          };

          container.addEventListener( "load", options.loadListener, false );
          media.appendChild( container );
        });
      }

      // load the SoundCloud API script if it doesn't exist
      function loadScript() {
        if ( !loading ) {
          loading = true;
          Popcorn.getScript( "http://w.soundcloud.com/player/api.js", function() {
            Popcorn.getScript( "http://connect.soundcloud.com/sdk.js", function() {
              scriptReady();
            });
          });
        } else {
          (function isReady() {
            setTimeout(function() {
              if ( !scriptLoaded ) {
                isReady();
              } else {
                scriptReady();
              }
            }, 100 );
          })();
        }
      }

      if ( !scriptLoaded ) {
        loadScript();
      } else {
        scriptReady();
      }
    },
    _teardown: function( options ) {
      var widget = options.widget,
          events = SC.Widget.Events,
          container = options._container,
          parentContainer = container.parentNode;

      options.destroyed = true;

      // if the widget never got setup, remove the containers load listener and return
      if ( !widget ) {
        container.removeEventListener( "load", options.loadEventListener, false );
        return;
      }

      // remove all bound soundcloud listeners
      for ( var prop in events ) {
        widget && widget.unbind( events[ prop ] );
      }
    }
  });
})();
