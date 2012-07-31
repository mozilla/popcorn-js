// PLUGIN: mediaspawner
/**
  * mediaspawner Popcorn Plugin.
  * Adds Video/Audio to the page using Popcorns players
  * Start is the time that you want this plug-in to execute
  * End is the time that you want this plug-in to stop executing
  *
  * @param {HTML} options
  *
  * Example:
    var p = Popcorn('#video')
      .mediaspawner( {
        source: "http://www.youtube.com/watch?v=bUB1L3zGVvc",
        target: "mediaspawnerdiv",
        start: 1,
        end: 10,
        caption: "This is a test. We are assuming conrol. We are assuming control."
      })
  *
  */
(function ( Popcorn, global ) {
  var PLAYER_URL = "http://popcornjs.org/code/modules/player/popcorn.player.js",
      urlRegex = /(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu|vimeo|soundcloud|baseplayer)/,
      forEachPlayer,
      playerTypeLoading = {},
      playerTypesLoaded = {
        "vimeo": false,
        "youtube": false,
        "soundcloud": false,
        "module": false
      };

  Object.defineProperty( playerTypeLoading, forEachPlayer, {
    get: function() {
      return playerTypesLoaded[ forEachPlayer ];
    },
    set: function( val ) {
      playerTypesLoaded[ forEachPlayer ] = val;
    }
  });

  Popcorn.plugin( "mediaspawner", {
    manifest: {
      about: {
        name: "Popcorn Media Spawner Plugin",
        version: "0.1",
        author: "Matthew Schranz, @mjschranz",
        website: "mschranz.wordpress.com"
      },
      options: {
        source: {
          elem: "input",
          type: "text",
          label: "Media Source",
          "default": "http://www.youtube.com/watch?v=CXDstfD9eJ0"
        },
        caption: {
          elem: "input",
          type: "text",
          label: "Media Caption",
          "default": "Popcorn Popping",
          optional: true
        },
        target: "mediaspawner-container",
        start: {
          elem: "input",
          type: "number",
          label: "Start"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End"
        },
        autoplay: {
          elem: "input",
          type: "checkbox",
          label: "Autoplay Video",
          optional: true
        },
        width: {
          elem: "input",
          type: "number",
          label: "Media Width",
          "default": 400,
          units: "px",
          optional: true
        },
        height: {
          elem: "input",
          type: "number",
          label: "Media Height",
          "default": 200,
          units: "px",
          optional: true
        }
      }
    },
    _setup: function( options ) {
      var target = document.getElementById( options.target ) || {},
          mediaType,
          container,
          capContainer,
          regexResult;

      regexResult = urlRegex.exec( options.source );
      if ( regexResult ) {
        mediaType = regexResult[ 1 ];
        // our regex only handles youtu ( incase the url looks something like youtu.be )
        if ( mediaType === "youtu" ) {
          mediaType = "youtube";
        }
      }
      else {
        // if the regex didn't return anything we know it's an HTML5 source
        mediaType = "HTML5";
      }

      // Store Reference to Type for use in end
      options._type = mediaType;

      // Create separate container for plugin
      options._container = document.createElement( "div" );
      container = options._container;
      container.id = "mediaSpawnerdiv-" + Popcorn.guid();

      // Default width and height of media
      options.width = options.width || 400;
      options.height = options.height || 200;

      // Captions now need to be in their own container, due to the problem with flash players
      // described in start/end
      if ( options.caption ) {
        capContainer = document.createElement( "div" );
        capContainer.innerHTML = options.caption;
        capContainer.style.display = "none";
        options._capCont = capContainer;
        container.appendChild( capContainer );
      }

      target && target.appendChild( container );

      function constructMedia(){

        function checkPlayerTypeLoaded() {
          if ( mediaType !== "HTML5" && !window.Popcorn[ mediaType ] ) {
            setTimeout( function() {
              checkPlayerTypeLoaded();
            }, 300 );
          } else {
            options.id = options._container.id;
            // Set the width/height of the container before calling Popcorn.smart
            // Allows youtube to pickup on the specified height an create the player
            // with specified dimensions
            options._container.style.width = options.width + "px";
            options._container.style.height = options.height + "px";
            options.popcorn = Popcorn.smart( "#" + options.id, options.source );

            if ( mediaType === "HTML5" ) {
              options.popcorn.controls( true );
            }
            
            // Set them to 0 now so it is hidden
            options._container.style.width = "0px";
            options._container.style.height = "0px";
            options._container.style.visibility = "hidden";
            options._container.style.overflow = "hidden";
          }
        }

        if ( mediaType !== "HTML5" && !window.Popcorn[ mediaType ] && !playerTypeLoading[ mediaType ] ) {
          playerTypeLoading[ mediaType ] = true;
          Popcorn.getScript( "http://popcornjs.org/code/players/" + mediaType + "/popcorn." + mediaType + ".js", function() {
            checkPlayerTypeLoaded();
          });
        }
        else {
          checkPlayerTypeLoaded();
        }

      }

      // If Player script needed to be loaded, keep checking until it is and then fire readycallback
      function isPlayerReady() {
        if ( !window.Popcorn.player ) {
          setTimeout( function () {
            isPlayerReady();
          }, 300 );
        } else {
          constructMedia();
        }
      }

      // If player script isn't present, retrieve script
      if ( !window.Popcorn.player && !playerTypeLoading.module ) {
        playerTypeLoading.module = true;
        Popcorn.getScript( PLAYER_URL, isPlayerReady );
      } else {
        isPlayerReady();
      }

      options.toString = function() {
        return options.source || options._natives.manifest.options.source[ "default" ];
      };
    },
    start: function( event, options ) {
      if( options._capCont ) {
        options._capCont.style.display = "";
      }

      /* Using this style for Start/End is required because of the flash players
       * Without it on end an internal cleanup is called, causing the flash players
       * to be out of sync with Popcorn, as they are then rebuilt.
       */
      options._container.style.width = options.width + "px";
      options._container.style.height = options.height + "px";
      options._container.style.visibility = "visible";
      options._container.style.overflow = "visible";

      if ( options.autoplay ) {
        options.popcorn.play();
      }
    },
    end: function( event, options ) {
      if( options._capCont ) {
        options._capCont.style.display = "none";
      }

      /* Using this style for Start/End is required because of the flash players
       * Without it on end an internal cleanup is called, causing the flash players
       * to be out of sync with Popcorn, as they are then rebuilt.
       */
      options._container.style.width = "0px";
      options._container.style.height = "0px";
      options._container.style.visibility = "hidden";
      options._container.style.overflow = "hidden";

      // Pause all popcorn instances on exit
      options.popcorn.pause();

    },
    _teardown: function( options ) {
      if ( options.popcorn && options.popcorn.destory ) {
        options.popcorn.destroy();
      }
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
})( Popcorn, this );
