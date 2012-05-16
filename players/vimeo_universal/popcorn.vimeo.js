Popcorn.player( "vimeo", {

  _canPlayType: function( nodeName, url ) {

    return (/http:\/\/player.vimeo.com\/video\/\d+/).test( url );
  },
  _setup: function( options ) {

    var media = this,
        ready = false,
        vimeoContainer = document.createElement("iframe"),
        guid = Popcorn.guid(),
        autoplay = false,
        currentTime = 0,
        loop = false;

    function readyListener( event ) {
      if (event.origin !== "http://player.vimeo.com") {
        return;
      }

      try {
        var data = JSON.parse( event.data );
        if ( data.event == "ready" && data.player_id == guid ) {
          ready = true;
          window.removeEventListener( 'message', readyListener, false );
          window.addEventListener( 'message', generalEventListener, false );
          sendMessage('addEventListener', 'loadProgress');
          sendMessage('addEventListener', 'playProgress');
          sendMessage('addEventListener', 'play');
          sendMessage('addEventListener', 'pause');
          sendMessage('addEventListener', 'finish');
          sendMessage('addEventListener', 'seek');
          sendMessage('getDuration');
          /*setInterval( function() {
            sendMessage('getCurrentTime');
          }, 300);*/
        }
      } catch ( ex ) {
        console.warn(ex);
      }
    }

    window.addEventListener( 'message', readyListener, false );

    vimeoContainer.width = media.style.width ? media.style.width : 500;
    vimeoContainer.height = media.style.height ? media.style.height : 281;
    vimeoContainer.frameBorder = 0;
    vimeoContainer.webkitAllowFullScreen = true;
    vimeoContainer.mozAllowFullScreen = true;
    vimeoContainer.allowFullScreen = true;
    vimeoContainer.src = this.src + "?api=1&player_id=" + guid;
    media.appendChild( vimeoContainer );

    autoplay = !!this.src.match(/autoplay=1/);
    Object.defineProperty( media, "autoplay", {
      get: function() {
        return autoplay;
      },
      set: function( value ) {
        if ( value !== undefined ) {
          autoplay = !!value;
        }

        return autoplay;
      }
    });

    Object.defineProperty( media, "currentTime", {
      get: function() {
        return currentTime;
      },
      set: function( value ) {
        if ( value !== undefined ) {
          sendMessage( "seekTo", value );
          media.dispatchEvent( "seeking" );
        }

        return currentTime;
      }
    });

    loop = !!this.src.match(/loop=1/);
    Object.defineProperty( media, "loop", {
      get: function() {
        return loop;
      },
      set: function( value) {
        if ( value !== undefined ) {
          loop = !!value;
          sendMessage( "setLoop", loop );
        }

        return loop;
      }
    });

    function sendMessage( method, params ) {
      var url = vimeoContainer.src.split('?')[0],
          data = JSON.stringify({
            method: method,
            value: params
          });

      if (url.substr(0, 2) === '//') {
        url = window.location.protocol + url;
      }

      vimeoContainer.contentWindow.postMessage( data, url );
    }

    function generalEventListener( event ) {
      if ( event.origin !== "http://player.vimeo.com" ) {
        return;
      }

      var data
      try {
        data = JSON.parse( event.data );
      } catch ( ex ) {
        console.warn( ex );
      }

      if ( data.player_id != guid ) {
        return;
      }

      // Methods
      switch ( data.method ) {
        case "paused":
        case "getCurrentTime":
          currentTime = parseFloat( data.value );
          //media.dispatchEvent( "timeupdate" );
          break;
        case "getDuration":
          media.duration = parseFloat( data.value );
          media.dispatchEvent( "durationchange" );
          media.dispatchEvent( "loadedmetadata" );
          break;
        case "getVideoEmbedCode":
        case "getVideoHeight":
        case "getVideoWidth":
        case "getVideoUrl":
        case "getColor":
        case "getVolume":
          break;
      }

      // Events
      switch ( data.event ) {
        case "loadProgress":
          break;
        case "playProgress":
          currentTime = parseFloat( data.data.seconds );
          media.dispatchEvent( "timeupdate" );
          times.push(currentTime);
          break;
        case "play":
          break;
        case "pause":
          break;
        case "finish":
          media.dispatchEvent( "ended" );
          break;
        case "seek":
          currentTime = parseFloat(data.data.seconds);
          media.dispatchEvent( "seeked" );
          break;
      }
    }

    media.play = function() {
      if (!ready) {
        return;
      }

      sendMessage( "play" );
    }

    media.pause = function() {
      if (!ready) {
        return;
      }

      sendMessage( "pause" );
    }

  },
  _teardown: function( options ) {
    
  }
});
