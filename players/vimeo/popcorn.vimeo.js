(function() {

  // global callback for vimeo.. yuck.
  vimeo_player_loaded = function( playerId ) {
    vimeo_player_loaded[ playerId ] && vimeo_player_loaded[ playerId ]();
  };
  vimeo_player_loaded.seek = {};
  vimeo_player_loaded.loadProgress = {};
  vimeo_player_loaded.play = {};
  vimeo_player_loaded.pause = {};

  Popcorn.player( "vimeo", {
    _canPlayType: function( nodeName, url ) {

      return (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(vimeo)/).test( url ) && nodeName.toLowerCase() !== "video";
    },
    _setup: function( options ) {

      var media = this,
          vimeoObject,
          vimeoContainer = document.createElement( "div" ),
          currentTime = 0,
          seekTime = 0,
          seeking = false,
          volumeChanged = false,
          lastMuted = false,
          lastVolume = 0,
          height,
          width;

      vimeoContainer.id = media.id + Popcorn.guid();

      media.appendChild( vimeoContainer );

      // setting vimeo player's height and width, default to 560 x 315
      width = media.style.width ? "" + media.offsetWidth : "560";
      height = media.style.height ? "" + media.offsetHeight : "315";

      var vimeoInit = function() {

        var flashvars,
            params,
            attributes = {},
            src = media.src,
            toggleMuteVolume = 0,
            loadStarted = false;

        vimeo_player_loaded[ vimeoContainer.id ] = function() {
          vimeoObject = document.getElementById( vimeoContainer.id );

          vimeo_player_loaded.seek[ vimeoContainer.id ] = function( time ) {
            if( time !== currentTime ) {
              currentTime = time;
              media.dispatchEvent( "seeked" );
              media.dispatchEvent( "timeupdate" );
            }
          };

          vimeo_player_loaded.play[ vimeoContainer.id ] = function() {
            if ( media.paused ) {
              media.paused = false;
              media.dispatchEvent( "play" );

              media.dispatchEvent( "playing" );
              timeUpdate();
            }
          };

          vimeo_player_loaded.pause[ vimeoContainer.id ] = function() {
            if ( !media.paused ) {
              media.paused = true;
              media.dispatchEvent( "pause" );
            }
          };

          vimeo_player_loaded.loadProgress[ vimeoContainer.id ] = function( progress ) {

            if ( !loadStarted ) {
              loadStarted = true;
              media.dispatchEvent( "loadstart" );
            }

            if ( progress.percent === 100 ) {
              media.dispatchEvent( "canplaythrough" );
            }
          };

          vimeoObject.api_addEventListener( "seek", "vimeo_player_loaded.seek." + vimeoContainer.id );
          vimeoObject.api_addEventListener( "loadProgress", "vimeo_player_loaded.loadProgress." + vimeoContainer.id );
          vimeoObject.api_addEventListener( "play", "vimeo_player_loaded.play." + vimeoContainer.id );
          vimeoObject.api_addEventListener( "pause", "vimeo_player_loaded.pause." + vimeoContainer.id );

          var timeUpdate = function() {
            if ( !media.paused ) {
              currentTime = vimeoObject.api_getCurrentTime();
              media.dispatchEvent( "timeupdate" );
              setTimeout( timeUpdate, 10 );
            }
          },

          isMuted = function() {

            return vimeoObject.api_getVolume() === 0;
          };

          var volumeUpdate = function() {

            var muted = isMuted(),
            vol = vimeoObject.api_getVolume();
            if ( lastMuted !== muted ) {
              lastMuted = muted;
              media.dispatchEvent( "volumechange" );
            }

            if ( lastVolume !== vol ) {
              lastVolume = vol;
              media.dispatchEvent( "volumechange" );
            }

            setTimeout( volumeUpdate, 250 );
          };

          media.play = function() {
            media.paused = false;
            media.dispatchEvent( "play" );

            media.dispatchEvent( "playing" );
            timeUpdate();
            vimeoObject.api_play();
          };

          media.pause = function() {

            if ( !media.paused ) {

              media.paused = true;
              media.dispatchEvent( "pause" );
              vimeoObject.api_pause();
            }
          };

          Popcorn.player.defineProperty( media, "currentTime", {

            set: function( val ) {

              if ( !val ) {
                return currentTime;
              }

              currentTime = seekTime = +val;
              seeking = true;

              media.dispatchEvent( "seeked" );
              media.dispatchEvent( "timeupdate" );
              vimeoObject.api_seekTo( currentTime );

              return currentTime;
            },

            get: function() {

              return currentTime;
            }
          });

          Popcorn.player.defineProperty( media, "muted", {

            set: function( val ) {

              if ( isMuted() !== val ) {

                if ( val ) {
                  toggleMuteVolume = vimeoObject.api_getVolume();
                  vimeoObject.api_setVolume( 0 );
                } else {

                  vimeoObject.api_setVolume( toggleMuteVolume );
                }
              }
            },
            get: function() {

              return isMuted();
            }
          });

          Popcorn.player.defineProperty( media, "volume", {

            set: function( val ) {

              if ( !val || typeof val !== "number" || ( val < 0 || val > 1 ) ) {
                return vimeoObject.api_getVolume() / 100;
              }

              if ( vimeoObject.api_getVolume() !== val ) {
                vimeoObject.api_setVolume( val * 100 );
                lastVolume = vimeoObject.api_getVolume();
                media.dispatchEvent( "volumechange" );
              }

              return vimeoObject.api_getVolume() / 100;
            },
            get: function() {

              return vimeoObject.api_getVolume() / 100;
            }
          });

          media.dispatchEvent( "loadedmetadata" );
          media.dispatchEvent( "loadeddata" );

          media.duration = vimeoObject.api_getDuration();
          media.dispatchEvent( "durationchange" );
          volumeUpdate();
          media.readyState = 4;
          media.dispatchEvent( "canplaythrough" );
        };

        var clip_id = ( /\d+$/ ).exec( src );

        flashvars = {
          // Load a video not found poster if the url does not contain a valid id
          clip_id: clip_id ? clip_id[ 0 ] : 0,
          api: 1,
          js_swf_id: vimeoContainer.id
        };

        //  extend options from user to flashvars. NOTE: Videos owned by Plus Vimeo users may override these options
        Popcorn.extend( flashvars, options );

        params = {
          allowscriptaccess: "always",
          allowfullscreen: "true",
          wmode: "transparent"
        };

        swfobject.embedSWF( "//vimeo.com/moogaloop.swf", vimeoContainer.id,
                            width, height, "9.0.0", "expressInstall.swf",
                            flashvars, params, attributes );

      };

      if ( !window.swfobject ) {

        Popcorn.getScript( "//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js", vimeoInit );
      } else {

        vimeoInit();
      }
    }
  });
})();