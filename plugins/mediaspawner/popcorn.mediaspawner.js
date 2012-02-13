// PLUGIN: mediaspawner
/**
  * mediaspawner Popcorn Plugin.
  * Adds Video/Audio to the page using Popcorns players
  * Start is the time that you want this plug-in to execute
  * End is the time that you want this plug-in to stop executing
  *
  * @param {Object} options
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
      urlRegex = /(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu|vimeo|soundcloud)/,
      loadingPlayer,
      loadingYoutube,
      loadingSoundcloud,
      loadingVimeo;

  loadingPlayer = loadingVimeo = loadingSoundcloud = loadingYoutube = false;

  var setPlayerTypeLoading = {
    vimeo: function() {
      loadingVimeo = true;
    },
    soundcloud: function() {
      loadingSoundcloud = true;
    },
    youtube: function() {
      loadingYoutube = true;
    }
  };

  var isPlayerTypeLoading = {
    vimeo: function() {
      return loadingVimeo;
    },
    soundcloud: function() {
      return loadingSoundcloud;
    },
    youtube: function() {
      return loadingYoutube;
    }
  };

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
          label: "Media Source:"
        },
        caption: {
          elem: "input",
          type: "text",
          label: "Media Caption:",
          optional: true
        },
        target: "mediaspawner-container",
        start: {
          elem: "input",
          type: "number",
          label: "Start_Time"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End_Time"
        },
        autoplay: {
          elem: "select",
          options: [ "TRUE", "FALSE" ],
          label: "Autoplay Video: ",
          optional: true
        }
      }
    },
    _setup: function( options ) {
      var target = document.getElementById( options.target ),
          caption = options.caption || "",
          mediaType,
          container,
          debug = Popcorn.plugin.debug;

      if ( debug ) {
        // Check if mediaSource is passed and mediaType is NOT audio/video
        if ( !options.source ) {
          Popcorn.error( "Error. Source must be specified." );
        }

        // If it's an HTML Video/Audio check if they passed a correct type
        if ( typeof options.source === "object" && !/audio|video/.exec( options.source.type ) ) {
            Popcorn.error( "Error. Type must be Video or Audio" );
        }

        // Check if target container exists
        if ( !target ) {
          Popcorn.error( "Target MediaSpawner container doesn't exist." );
        }
      }

      // Create separate container for plugin
      options._container = document.createElement( "div" );
      container = options._container;
      container.id = "mediaSpawnerdiv-" + Popcorn.guid();
      container.innerHTML = caption;
      container.style.display = "none";
      target && target.appendChild( container );

      var regexResult = urlRegex.exec( options.source );
      if ( regexResult ) {
        mediaType = regexResult[ 1 ];
      } else {
        mediaType = "object";
      }

      // Store Reference to Type for use in end
      options.type = mediaType;

      function flashCallback( type ) {
        // our regex only handles youtu ( incase the url looks something like youtu.be )
        if ( type === "youtu" ) {
          type = "youtube";

          // Youtube has to deal with nonsense about playreadyState, however will work if I append
          // a flag for it so, this is an easier solution
          if ( options.autoplay ) {
            options.source += "&autoplay=1";
          }
        }

        function checkPlayerTypeLoaded() {
          if ( !window.Popcorn[ type ] ) {
            setTimeout( function() {
              checkPlayerTypeLoaded();
            }, 300 );
          } else {
            options.id = options._container.id;
            options.popcorn = Popcorn.smart( "#" + options.id, options.source );
          }
        }

        if ( !window.Popcorn[ type ] && !isPlayerTypeLoading[ type ]() ) {
          setPlayerTypeLoading[ type ]();
          Popcorn.getScript( "http://popcornjs.org/code/players/" + type + "/popcorn." + type + ".js", function() {
            checkPlayerTypeLoaded();
          });
        }
        else {
          checkPlayerTypeLoaded();
        }
      }

      function html5CallBack() {
        var data = options.source,
            element = document.createElement( data.type ),
            src;

        element.poster = data.poster || "";
        element.controls = data.controls || "";

        Popcorn.forEach( data.sources, function( value, key, item ) {
          src = document.createElement( "source" );
          src.id = value.id || "";
          src.src = value.src || "";
          src.type = value.type || "";
          src.codecs = value.codecs || "";

          element.appendChild( src );
        });

        container.appendChild( element );
        options.id = element.id = "mediaspawner-" + Popcorn.guid();
      }

      // If Player script needed to be loaded, keep checking until it is and then fire readycallback
      function isPlayerReady() {
        if ( !window.Popcorn.player ) {
          setTimeout( function () {
            isPlayerReady();
          }, 300 );
        } else {
          if( mediaType !== "object" ) {
            flashCallback( mediaType );
          }
          else {
            html5CallBack();
          }
        }
      }

      // If player script isn't present, retrieve script
      if ( !window.Popcorn.player && !loadingPlayer ) {
        loadingPlayer = true;
        Popcorn.getScript( PLAYER_URL, function() {
          isPlayerReady();
        });
      } else {
        isPlayerReady();
      }

    },
    start: function( event, options ) {
      if ( options._container ) {
        options._container.style.display = "";
      }

      // If its an HTML Video/Audio
      if ( options.autoplay && options.type === "object" ) {
        document.getElementById( options.id ).play();
      }
      // It's a flash based player
      else if ( options.autoplay ) {
        options.popcorn.play();
      }
    },
    end: function( event, options ) {
      if ( options._container ) {
        options._container.style.display = "none";
      }

      // The Flash Players automagically pause themselves on end already but because these videos we create
      // aren't tied directly to Popcorn instances we have to manually retrieve them ourselves
      if ( options.type === "object" ) {
        document.getElementById( options.id ).pause();
      }
    },
    _teardown: function( options ) {
      if ( options.popcorn && options.popcorn.destory ) {
        options.popcorn.destroy();
      }
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
})( Popcorn, this );
