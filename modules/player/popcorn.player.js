(function( Popcorn ) {

  // combines calls of two function calls into one
  var combineFn = function( first, second ) {

    first = first || Popcorn.nop;
    second = second || Popcorn.nop;

    return function() {

      first.apply( this, arguments );
      second.apply( this, arguments );
    };
  };

  Popcorn.player = function( name, player ) {

    //  ID string matching
    var rIdExp  = /^(#([\w\-\_\.]+))$/;

    player = player || {};

    var playerFn = function( target, src, options ) {

      options = options || {};

      // List of events
      var date = new Date() / 1000,
          baselineTime = date,
          currentTime = 0,
          volume = 1,
          muted = false,
          events = {},

          // The container div of the resource
          container = document.getElementById( rIdExp.exec( target ) && rIdExp.exec( target )[ 2 ] ) ||
                        document.getElementById( target ) ||
                          target,
          basePlayer = {},
          timeout,
          popcorn;

      // copies a div into the media object
      for( var val in container ) {

        if ( typeof container[ val ] === "object" ) {

          basePlayer[ val ] = container[ val ];
        } else if ( typeof container[ val ] === "function" ) {

          basePlayer[ val ] = (function( value ) {

            // this is a stupid ugly kludgy hack in honour of Safari
            // in Safari a NodeList is a function, not an object
            if ( "length" in container[ value ] && !container[ value ].call ) {

              return container[ value ];
            } else {

              return function() {

                return container[ value ].apply( container, arguments );
              };
            }
          }( val ));
        } else {

          Popcorn.player.defineProperty( basePlayer, val, {
            get: (function( value ) {

              return function() {

                return container[ value ];
              };
            }( val )),
            set: Popcorn.nop,
            configurable: true
          });
        }
      }

      var timeupdate = function() {

        date = new Date() / 1000;

        if ( !basePlayer.paused ) {

          basePlayer.currentTime = basePlayer.currentTime + ( date - baselineTime );
          basePlayer.dispatchEvent( "timeupdate" );
          timeout = setTimeout( timeupdate, 10 );
        }

        baselineTime = date;
      };

      basePlayer.play = function() {

        this.paused = false;

        if ( basePlayer.readyState >= 4 ) {

          baselineTime = new Date() / 1000;
          basePlayer.dispatchEvent( "play" );
          timeupdate();
        }
      };

      basePlayer.pause = function() {

        this.paused = true;
        basePlayer.dispatchEvent( "pause" );
      };

      Popcorn.player.defineProperty( basePlayer, "currentTime", {
        get: function() {

          return currentTime;
        },
        set: function( val ) {

          // make sure val is a number
          currentTime = +val;
          basePlayer.dispatchEvent( "timeupdate" );

          return currentTime;
        },
        configurable: true
      });

      Popcorn.player.defineProperty( basePlayer, "volume", {
        get: function() {

          return volume;
        },
        set: function( val ) {

          // make sure val is a number
          volume = +val;
          basePlayer.dispatchEvent( "volumechange" );
          return volume;
        },
        configurable: true
      });

      Popcorn.player.defineProperty( basePlayer, "muted", {
        get: function() {

          return muted;
        },
        set: function( val ) {

          // make sure val is a number
          muted = +val;
          basePlayer.dispatchEvent( "volumechange" );
          return muted;
        },
        configurable: true
      });

      // Adds an event listener to the object
      basePlayer.addEventListener = function( evtName, fn ) {

        if ( !events[ evtName ] ) {

          events[ evtName ] = [];
        }

        events[ evtName ].push( fn );
        return fn;
      };

      // Can take event object or simple string
      basePlayer.dispatchEvent = function( oEvent ) {

        var evt,
            self = this,
            eventInterface,
            eventName = oEvent.type;

        // A string was passed, create event object
        if ( !eventName ) {

          eventName = oEvent;
          eventInterface  = Popcorn.events.getInterface( eventName );

          if ( eventInterface ) {

            evt = document.createEvent( eventInterface );
            evt.initEvent( eventName, true, true, window, 1 );
          }
        }

        Popcorn.forEach( events[ eventName ], function( val ) {

          val.call( self, evt, self );
        });
      };

      // Attempt to get src from playerFn parameter
      basePlayer.src = src || "";
      basePlayer.readyState = 0;
      basePlayer.duration = 0;
      basePlayer.paused = true;
      basePlayer.ended = 0;

      options && options.events && Popcorn.forEach( options.events, function( val, key ) {

        basePlayer.addEventListener( key, val, false );
      });

      if ( player._setup ) {

        player._setup.call( basePlayer, options );
      } else {

        // there is no setup, which means there is nothing to load
        basePlayer.readyState = 4;
        basePlayer.dispatchEvent( "load" );
        basePlayer.dispatchEvent( "loadeddata" );
      }

      // when a custom player is loaded, load basePlayer state into custom player
      basePlayer.addEventListener( "load", function() {

        // if a player is not ready before currentTime is called, this will set it after it is ready
        basePlayer.currentTime = currentTime;

        // same as above with volume and muted
        basePlayer.volume = volume;
        basePlayer.muted = muted;
      });

      basePlayer.addEventListener( "loadeddata", function() {

        // if play was called before player ready, start playing video
        !basePlayer.paused && basePlayer.play();
      });

      popcorn = new Popcorn.p.init( basePlayer, options );

      if ( player._teardown ) {

        popcorn.destroy = combineFn( popcorn.destroy, function() {
        
          player._teardown.call( basePlayer, options );
        });
      }

      return popcorn;
    };

    Popcorn[ name ] = Popcorn[ name ] || playerFn;
  };

  Popcorn.player.defineProperty = Object.defineProperty || function( object, description, options ) {

    object.__defineGetter__( description, options.get || Popcorn.nop );
    object.__defineSetter__( description, options.set || Popcorn.nop );
  };

})( Popcorn );
