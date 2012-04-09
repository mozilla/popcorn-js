(function() {

  Popcorn.player( "soundcloud", {
    scriptLoaded: false,
    _canPlayType: function( nodeName, url ) {

      return (/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(api\.soundcloud)/).test( url ) && nodeName.toLowerCase() !== "video";
    },
    _setup: function( options ) {

      var media = this,
          container = document.createElement( "iframe" ),
          widget,
          lastVolume = 0,
          currentTime = 0,
          duration = 0,
          muted = false;

      this.play = function() {
        widget.play();
      };

      this.pause = function() {
        widget.pause();
      };

      this.mute = function() {
        widget.toggle();
      };

      // getter and setter for muted property, multiply volume by 100 as that is the scale soundcloud works on
      Object.defineProperties( media, {
        muted: {
          set: function( val ) {
            if ( val ) {
              widget.getVolume(function( data ) {
                lastVolume = data / 100;
                widget.setVolume( 0 );
                muted = true;
              });
            } else {
              widget.setVolume( lastVolume * 100 );
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
            widget.setVolume( val * 100 );
            lastVolume = val ;
            media.dispatchEvent( "volumechange" );
          },
          get: function() {
            return lastVolume;
          }
        },
        currentTime: {
          set: function( val ) {
            widget.seekTo( val * 1000 );
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
        }
      });
      // called when the SoundCloud api script has loaded
      function scriptReady() {
        media.scriptLoaded = true;

        media.width = media.style.width ? "" + media.offsetWidth : "560";
        media.height = media.style.height ? "" + media.offsetHeight : "315";
        container.scrolling = "no";
        container.frameborder = "no";
        container.src = "http://w.soundcloud.com/player/?url=" + media.src + 
        "&show_artwork=false" +
        "&buying=false" +
        "&liking=false" +
        "&sharing=false";

        container.width = "100%";
        container.height = "100%";

        container.addEventListener( "load", function( e ) {
          widget = SC.Widget( container );
          // setup all of our listeners
          widget.bind(SC.Widget.Events.READY, function() {
            widget.getDuration(function( data ) {
              duration = data / 1000;
              media.dispatchEvent( "durationchange" );
              // update the readyState after we have the duration
              media.dispatchEvent( "loadedmetadata" );
              media.dispatchEvent( "loadeddata" );
              media.dispatchEvent( "canplaythrough" );
              media.readyState = 4;
              media.dispatchEvent( "readystatechange" );
              media.dispatchEvent( "load" );
            });
            widget.getVolume(function( data ) {
              lastVolume = data / 100;
            });
          });

          widget.bind(SC.Widget.Events.FINISH, function() {
            media.dispatchEvent( "ended" );
          });

          widget.bind(SC.Widget.Events.PLAY_PROGRESS, function( data ) {
            currentTime = data.currentPosition / 1000;
            media.dispatchEvent( "timeupdate" );
          });
        }, false);
        media.appendChild( container );
      }

      // load the SoundCloud API script if it doesn't exist
      function loadScript() {
        Popcorn.getScript( "http://w.soundcloud.com/player/api.js", function() {
          scriptReady();
        });
      }

      if ( !this.scriptLoaded ) {
        loadScript();
      } else {
        scriptReady();
      }
    }
  });
})();
