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
        }
      } catch ( ex ) {
        console.warn(ex);
        // XXX fail silently I guess?
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
      set: function() {
        if ( value !== undefined ) {
          autoplay = !!value;
        }

        return autoplay;
      }
    });

    loop = !!this.src.match(/loop=1/);
    Object.defineProperty( media, "loop", {
      get: function() {
        return loop;
      },
      set: function() {
        if ( value !== undefined ) {
          loop = !!value;
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
      console.log( event.data );
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
