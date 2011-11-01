(function(global, document) {

  // Popcorn.js does not support archaic browsers
  if ( !document.addEventListener ) {
    global.Popcorn = {
      isSupported: false
    };

    var methods = ( "forEach extend effects error guid sizeOf isArray nop position disable enable destroy " +
          "addTrackEvent removeTrackEvent getTrackEvents getTrackEvent getLastTrackEventId " +
          "timeUpdate plugin removePlugin compose effect parser xhr getJSONP getScript" ).split(/\s+/);

    while( methods.length ) {
      global.Popcorn[ methods.shift() ] = function() {};
    }
    return;
  }

  var

  AP = Array.prototype,
  OP = Object.prototype,

  forEach = AP.forEach,
  slice = AP.slice,
  hasOwn = OP.hasOwnProperty,
  toString = OP.toString,

  // Copy global Popcorn (may not exist)
  _Popcorn = global.Popcorn,

  //  ID string matching
  rIdExp  = /^(#([\w\-\_\.]+))$/,

  //  Ready fn cache
  readyStack = [],
  readyBound = false,
  readyFired = false,

  //  Non-public internal data object
  internal = {
    events: {
      hash: {},
      apis: {}
    }
  },

  //  Non-public `requestAnimFrame`
  //  http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  requestAnimFrame = (function(){
    return global.requestAnimationFrame ||
      global.webkitRequestAnimationFrame ||
      global.mozRequestAnimationFrame ||
      global.oRequestAnimationFrame ||
      global.msRequestAnimationFrame ||
      function( callback, element ) {
        global.setTimeout( callback, 16 );
      };
  }()),

  refresh = function ( obj ) {
    var currentTime = obj.media.currentTime,
      tracks = obj.data.trackEvents,
      animating = tracks.animating,
      start = tracks.startIndex,
      animIndex = 0,
      disabled = obj.data.disabled,
      registryByName = Popcorn.registryByName,
      byStart, natives, type;

    start = Math.min( start + 1, tracks.byStart.length - 2 );

    while ( start > 0 && tracks.byStart[ start ] ) {

      byStart = tracks.byStart [ start ];
      natives = byStart._natives;
      type = natives && natives.type;

      if ( !natives ||
          ( !!registryByName[ type ] || !!obj[ type ] ) ) {

        if ( byStart.start <= currentTime &&
          byStart.end > currentTime &&
          disabled.indexOf( type ) === -1 ) {

          if ( !byStart._running ) {
            byStart._running = true;
            natives.start.call( obj, null, byStart );

            // if the 'frameAnimation' option is used,
            // push the current byStart object into the `animating` cue
            if ( obj.options.frameAnimation &&
              ( byStart && byStart._running && byStart.natives.frame ) ) {

              natives.frame.call( obj, null, byStart, currentTime );
            }
          }
        } else if ( byStart._running === true ) {

          byStart._running = false;
          natives.end.call( obj, null, byStart );

          if ( obj.options.frameAnimation && byStart._natives.frame ) {
            animIndex = animating.indexOf( byStart );
            if ( animIndex >= 0 ) {
              animating.splice( animIndex, 1 );
            }
          }

        }
      }

      start--;
    }
  },

  //  Declare constructor
  //  Returns an instance object.
  Popcorn = function( entity, options ) {
    //  Return new Popcorn object
    return new Popcorn.p.init( entity, options || null );
  };

  //  Popcorn API version, automatically inserted via build system.
  Popcorn.version = "@VERSION";

  //  Boolean flag allowing a client to determine if Popcorn can be supported
  Popcorn.isSupported = true;

  //  Instance caching
  Popcorn.instances = [];

  //  Declare a shortcut (Popcorn.p) to and a definition of
  //  the new prototype for our Popcorn constructor
  Popcorn.p = Popcorn.prototype = {

    init: function( entity, options ) {

      var matches;

      //  Supports Popcorn(function () { /../ })
      //  Originally proposed by Daniel Brooks

      if ( typeof entity === "function" ) {

        //  If document ready has already fired
        if ( document.readyState === "interactive" || document.readyState === "complete" ) {

          entity( document, Popcorn );

          return;
        }
        //  Add `entity` fn to ready stack
        readyStack.push( entity );

        //  This process should happen once per page load
        if ( !readyBound ) {

          //  set readyBound flag
          readyBound = true;

          var DOMContentLoaded  = function() {

            readyFired = true;

            //  Remove global DOM ready listener
            document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );

            //  Execute all ready function in the stack
            for ( var i = 0, readyStackLength = readyStack.length; i < readyStackLength; i++ ) {

              readyStack[ i ].call( document, Popcorn );

            }
            //  GC readyStack
            readyStack = null;
          };

          //  Register global DOM ready listener
          document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
        }

        return;
      }

      //  Check if entity is a valid string id
      matches = rIdExp.exec( entity );

      //  Get media element by id or object reference
      this.media = matches && matches.length && matches[ 2 ] ?
                     document.getElementById( matches[ 2 ] ) :
                     entity;

      //  Create an audio or video element property reference
      this[ ( this.media.nodeName && this.media.nodeName.toLowerCase() ) || "video" ] = this.media;

      //  Register new instance
      Popcorn.instances.push( this );

      this.options = options || {};

      this.isDestroyed = false;

      this.data = {

        // Allows disabling a plugin per instance
        disabled: [],

        // Stores DOM event queues by type
        events: {},

        // Stores Special event hooks data
        hooks: {},

        // Store track event history data
        history: [],

        // Stores ad-hoc state related data]
        state: {
          volume: this.media.volume
        },

        // Store track event object references by trackId
        trackRefs: {},

        // Playback track event queues
        trackEvents: {
          byStart: [{

            start: -1,
            end: -1
          }],
          byEnd: [{
            start: -1,
            end: -1
          }],
          animating: [],
          startIndex: 0,
          endIndex: 0,
          previousUpdateTime: -1
        }
      };

      //  Wrap true ready check
      var isReady = function( that ) {

        var duration, videoDurationPlus, animate;

        if ( that.media.readyState >= 2 ) {
          //  Adding padding to the front and end of the arrays
          //  this is so we do not fall off either end

          duration = that.media.duration;
          //  Check for no duration info (NaN)
          videoDurationPlus = duration != duration ? Number.MAX_VALUE : duration + 1;

          Popcorn.addTrackEvent( that, {
            start: videoDurationPlus,
            end: videoDurationPlus
          });

          if ( that.options.frameAnimation ) {
            //  if Popcorn is created with frameAnimation option set to true,
            //  requestAnimFrame is used instead of "timeupdate" media event.
            //  This is for greater frame time accuracy, theoretically up to
            //  60 frames per second as opposed to ~4 ( ~every 15-250ms)
            animate = function () {

              Popcorn.timeUpdate( that, {} );

              that.trigger( "timeupdate" );

              !that.isDestroyed && requestAnimFrame( animate );
            };

            !that.isDestroyed && requestAnimFrame( animate );

          } else {

            that.data.timeUpdateFunction = function( event ) {
              Popcorn.timeUpdate( that, event );
            };

            if ( !that.isDestroyed ) {
              that.media.addEventListener( "timeupdate", that.data.timeUpdateFunction, false );
            }
          }
        } else {
          global.setTimeout(function() {
            isReady( that );
          }, 1 );
        }
      };

      isReady( this );

      return this;
    }
  };

  //  Extend constructor prototype to instance prototype
  //  Allows chaining methods to instances
  Popcorn.p.init.prototype = Popcorn.p;

  Popcorn.forEach = function( obj, fn, context ) {

    if ( !obj || !fn ) {
      return {};
    }

    context = context || this;

    var key, len;

    // Use native whenever possible
    if ( forEach && obj.forEach === forEach ) {
      return obj.forEach( fn, context );
    }

    if ( toString.call( obj ) === "[object NodeList]" ) {
      for ( key = 0, len = obj.length; key < len; key++ ) {
        fn.call( context, obj[ key ], key, obj );
      }
      return obj;
    }

    for ( key in obj ) {
      if ( hasOwn.call( obj, key ) ) {
        fn.call( context, obj[ key ], key, obj );
      }
    }
    return obj;
  };

  Popcorn.extend = function( obj ) {
    var dest = obj, src = slice.call( arguments, 1 );

    Popcorn.forEach( src, function( copy ) {
      for ( var prop in copy ) {
        dest[ prop ] = copy[ prop ];
      }
    });

    return dest;
  };


  // A Few reusable utils, memoized onto Popcorn
  Popcorn.extend( Popcorn, {
    noConflict: function( deep ) {

      if ( deep ) {
        global.Popcorn = _Popcorn;
      }

      return Popcorn;
    },
    error: function( msg ) {
      throw new Error( msg );
    },
    guid: function( prefix ) {
      Popcorn.guid.counter++;
      return  ( prefix ? prefix : "" ) + ( +new Date() + Popcorn.guid.counter );
    },
    sizeOf: function( obj ) {
      var size = 0;

      for ( var prop in obj ) {
        size++;
      }

      return size;
    },
    isArray: Array.isArray || function( array ) {
      return toString.call( array ) === "[object Array]";
    },

    nop: function() {},

    position: function( elem ) {

      var clientRect = elem.getBoundingClientRect(),
          bounds = {},
          doc = elem.ownerDocument,
          docElem = document.documentElement,
          body = document.body,
          clientTop, clientLeft, scrollTop, scrollLeft, top, left;

      //  Determine correct clientTop/Left
      clientTop = docElem.clientTop || body.clientTop || 0;
      clientLeft = docElem.clientLeft || body.clientLeft || 0;

      //  Determine correct scrollTop/Left
      scrollTop = ( global.pageYOffset && docElem.scrollTop || body.scrollTop );
      scrollLeft = ( global.pageXOffset && docElem.scrollLeft || body.scrollLeft );

      //  Temp top/left
      top = Math.ceil( clientRect.top + scrollTop - clientTop );
      left = Math.ceil( clientRect.left + scrollLeft - clientLeft );

      for ( var p in clientRect ) {
        bounds[ p ] = Math.round( clientRect[ p ] );
      }

      return Popcorn.extend({}, bounds, { top: top, left: left });
    },

    disable: function( instance, plugin ) {

      var disabled = instance.data.disabled;

      if ( disabled.indexOf( plugin ) === -1 ) {
        disabled.push( plugin );
      }

      refresh( instance );

      return instance;
    },
    enable: function( instance, plugin ) {

      var disabled = instance.data.disabled,
          index = disabled.indexOf( plugin );

      if ( index > -1 ) {
        disabled.splice( index, 1 );
      }

      refresh( instance );

      return instance;
    },
    destroy: function( instance ) {
      var events = instance.data.events,
          singleEvent, item, fn;

      //  Iterate through all events and remove them
      for ( item in events ) {
        singleEvent = events[ item ];
        for ( fn in singleEvent ) {
          delete singleEvent[ fn ];
        }
        events[ item ] = null;
      }

      if ( !instance.isDestroyed ) {
        instance.data.timeUpdateFunction && instance.media.removeEventListener( "timeupdate", instance.data.timeUpdateFunction, false );
        instance.isDestroyed = true;
      }
    }
  });

  //  Memoized GUID Counter
  Popcorn.guid.counter = 1;

  //  Factory to implement getters, setters and controllers
  //  as Popcorn instance methods. The IIFE will create and return
  //  an object with defined methods
  Popcorn.extend(Popcorn.p, (function() {

      var methods = "load play pause currentTime playbackRate volume duration preload playbackRate " +
                    "autoplay loop controls muted buffered readyState seeking paused played seekable ended",
          ret = {};


      //  Build methods, store in object that is returned and passed to extend
      Popcorn.forEach( methods.split( /\s+/g ), function( name ) {

        ret[ name ] = function( arg ) {

          if ( typeof this.media[ name ] === "function" ) {

            // Support for shorthanded play(n)/pause(n) jump to currentTime
            // If arg is not null or undefined and called by one of the
            // allowed shorthandable methods, then set the currentTime
            // Supports time as seconds or SMPTE
            if ( arg != null && /play|pause/.test( name ) ) {
              this.media.currentTime = Popcorn.util.toSeconds( arg );
            }

            this.media[ name ]();

            return this;
          }


          if ( arg != null ) {

            this.media[ name ] = arg;

            return this;
          }

          return this.media[ name ];
        };
      });

      return ret;

    })()
  );

  Popcorn.forEach( "enable disable".split(" "), function( method ) {
    Popcorn.p[ method ] = function( plugin ) {
      return Popcorn[ method ]( this, plugin );
    };
  });

  Popcorn.extend(Popcorn.p, {

    //  Rounded currentTime
    roundTime: function() {
      return -~this.media.currentTime;
    },

    //  Attach an event to a single point in time
    exec: function( time, fn ) {

      //  Creating a one second track event with an empty end
      Popcorn.addTrackEvent( this, {
        start: time,
        end: time + 1,
        _running: false,
        _natives: {
          start: fn || Popcorn.nop,
          end: Popcorn.nop,
          type: "exec"
        }
      });

      return this;
    },

    // Mute the calling media, optionally toggle
    mute: function( toggle ) {

      var event = toggle == null || toggle === true ? "muted" : "unmuted";

      // If `toggle` is explicitly `false`,
      // unmute the media and restore the volume level
      if ( event === "unmuted" ) {
        this.media.muted = false;
        this.media.volume = this.data.state.volume;
      }

      // If `toggle` is either null or undefined,
      // save the current volume and mute the media element
      if ( event === "muted" ) {
        this.data.state.volume = this.media.volume;
        this.media.muted = true;
      }

      // Trigger either muted|unmuted event
      this.trigger( event );

      return this;
    },

    // Convenience method, unmute the calling media
    unmute: function( toggle ) {

      return this.mute( toggle == null ? false : !toggle );
    },

    // Get the client bounding box of an instance element
    position: function() {
      return Popcorn.position( this.media );
    },

    // Toggle a plugin's playback behaviour (on or off) per instance
    toggle: function( plugin ) {
      return Popcorn[ this.data.disabled.indexOf( plugin ) > -1 ? "enable" : "disable" ]( this, plugin );
    },

    // Set default values for plugin options objects per instance
    defaults: function( plugin, defaults ) {

      // If an array of default configurations is provided,
      // iterate and apply each to this instance
      if ( Popcorn.isArray( plugin ) ) {

        Popcorn.forEach( plugin, function( obj ) {
          for ( var name in obj ) {
            this.defaults( name, obj[ name ] );
          }
        }, this );

        return this;
      }

      if ( !this.options.defaults ) {
        this.options.defaults = {};
      }

      if ( !this.options.defaults[ plugin ] ) {
        this.options.defaults[ plugin ] = {};
      }

      Popcorn.extend( this.options.defaults[ plugin ], defaults );

      return this;
    }
  });

  Popcorn.Events  = {
    UIEvents: "blur focus focusin focusout load resize scroll unload",
    MouseEvents: "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave click dblclick",
    Events: "loadstart progress suspend emptied stalled play pause " +
            "loadedmetadata loadeddata waiting playing canplay canplaythrough " +
            "seeking seeked timeupdate ended ratechange durationchange volumechange"
  };

  Popcorn.Events.Natives = Popcorn.Events.UIEvents + " " +
                           Popcorn.Events.MouseEvents + " " +
                           Popcorn.Events.Events;

  internal.events.apiTypes = [ "UIEvents", "MouseEvents", "Events" ];

  // Privately compile events table at load time
  (function( events, data ) {

    var apis = internal.events.apiTypes,
    eventsList = events.Natives.split( /\s+/g ),
    idx = 0, len = eventsList.length, prop;

    for( ; idx < len; idx++ ) {
      data.hash[ eventsList[idx] ] = true;
    }

    apis.forEach(function( val, idx ) {

      data.apis[ val ] = {};

      var apiEvents = events[ val ].split( /\s+/g ),
      len = apiEvents.length,
      k = 0;

      for ( ; k < len; k++ ) {
        data.apis[ val ][ apiEvents[ k ] ] = true;
      }
    });
  })( Popcorn.Events, internal.events );

  Popcorn.events = {

    isNative: function( type ) {
      return !!internal.events.hash[ type ];
    },
    getInterface: function( type ) {

      if ( !Popcorn.events.isNative( type ) ) {
        return false;
      }

      var eventApi = internal.events,
        apis = eventApi.apiTypes,
        apihash = eventApi.apis,
        idx = 0, len = apis.length, api, tmp;

      for ( ; idx < len; idx++ ) {
        tmp = apis[ idx ];

        if ( apihash[ tmp ][ type ] ) {
          api = tmp;
          break;
        }
      }
      return api;
    },
    //  Compile all native events to single array
    all: Popcorn.Events.Natives.split( /\s+/g ),
    //  Defines all Event handling static functions
    fn: {
      trigger: function( type, data ) {

        var eventInterface, evt;
        //  setup checks for custom event system
        if ( this.data.events[ type ] && Popcorn.sizeOf( this.data.events[ type ] ) ) {

          eventInterface  = Popcorn.events.getInterface( type );

          if ( eventInterface ) {

            evt = document.createEvent( eventInterface );
            evt.initEvent( type, true, true, global, 1 );

            this.media.dispatchEvent( evt );

            return this;
          }

          //  Custom events
          Popcorn.forEach( this.data.events[ type ], function( obj, key ) {

            obj.call( this, data );

          }, this );

        }

        return this;
      },
      listen: function( type, fn ) {

        var self = this,
            hasEvents = true,
            eventHook = Popcorn.events.hooks[ type ],
            origType = type,
            tmp;

        if ( !this.data.events[ type ] ) {
          this.data.events[ type ] = {};
          hasEvents = false;
        }

        // Check and setup event hooks
        if ( eventHook ) {

          // Execute hook add method if defined
          if ( eventHook.add ) {
            eventHook.add.call( this, {}, fn );
          }

          // Reassign event type to our piggyback event type if defined
          if ( eventHook.bind ) {
            type = eventHook.bind;
          }

          // Reassign handler if defined
          if ( eventHook.handler ) {
            tmp = fn;

            fn = function wrapper( event ) {
              eventHook.handler.call( self, event, tmp );
            };
          }

          // assume the piggy back event is registered
          hasEvents = true;

          // Setup event registry entry
          if ( !this.data.events[ type ] ) {
            this.data.events[ type ] = {};
            // Toggle if the previous assumption was untrue
            hasEvents = false;
          }
        }

        //  Register event and handler
        this.data.events[ type ][ fn.name || ( fn.toString() + Popcorn.guid() ) ] = fn;

        // only attach one event of any type
        if ( !hasEvents && Popcorn.events.all.indexOf( type ) > -1 ) {

          this.media.addEventListener( type, function( event ) {

            Popcorn.forEach( self.data.events[ type ], function( obj, key ) {
              if ( typeof obj === "function" ) {
                obj.call( self, event );
              }
            });

          }, false);
        }
        return this;
      },
      unlisten: function( type, fn ) {

        if ( this.data.events[ type ] && this.data.events[ type ][ fn ] ) {

          delete this.data.events[ type ][ fn ];

          return this;
        }

        this.data.events[ type ] = null;

        return this;
      }
    },
    hooks: {
      canplayall: {
        bind: "canplaythrough",
        add: function( event, callback ) {

          var state = false;

          if ( this.media.readyState ) {

            callback.call( this, event );

            state = true;
          }

          this.data.hooks.canplayall = {
            fired: state
          };
        },
        // declare special handling instructions
        handler: function canplayall( event, callback ) {

          if ( !this.data.hooks.canplayall.fired ) {
            // trigger original user callback once
            callback.call( this, event );

            this.data.hooks.canplayall.fired = true;
          }
        }
      }
    }
  };

  //  Extend Popcorn.events.fns (listen, unlisten, trigger) to all Popcorn instances
  Popcorn.forEach( [ "trigger", "listen", "unlisten" ], function( key ) {
    Popcorn.p[ key ] = Popcorn.events.fn[ key ];
  });

  // Internal Only - Adds track events to the instance object
  Popcorn.addTrackEvent = function( obj, track ) {

    // Determine if this track has default options set for it
    // If so, apply them to the track object
    if ( track && track._natives && track._natives.type &&
        ( obj.options.defaults && obj.options.defaults[ track._natives.type ] ) ) {

      track = Popcorn.extend( {}, obj.options.defaults[ track._natives.type ], track );
    }

    if ( track._natives ) {
      //  Supports user defined track event id
      track._id = !track.id ? Popcorn.guid( track._natives.type ) : track.id;

      //  Push track event ids into the history
      obj.data.history.push( track._id );
    }

    track.start = Popcorn.util.toSeconds( track.start, obj.options.framerate );
    track.end   = Popcorn.util.toSeconds( track.end, obj.options.framerate );

    //  Store this definition in an array sorted by times
    var byStart = obj.data.trackEvents.byStart,
        byEnd = obj.data.trackEvents.byEnd,
        startIndex, endIndex,
        currentTime;

    for ( startIndex = byStart.length - 1; startIndex >= 0; startIndex-- ) {

      if ( track.start >= byStart[ startIndex ].start ) {
        byStart.splice( startIndex + 1, 0, track );
        break;
      }
    }

    for ( endIndex = byEnd.length - 1; endIndex >= 0; endIndex-- ) {

      if ( track.end > byEnd[ endIndex ].end ) {
        byEnd.splice( endIndex + 1, 0, track );
        break;
      }
    }

    // Display track event immediately if it's enabled and current
    if ( track._natives &&
        ( !!Popcorn.registryByName[ track._natives.type ] || !!obj[ track._natives.type ] ) ) {

      currentTime = obj.media.currentTime;
      if ( track.end > currentTime &&
        track.start <= currentTime &&
        obj.data.disabled.indexOf( track._natives.type ) === -1 ) {

        track._running = true;
        track._natives.start.call( obj, null, track );
        
        if ( obj.options.frameAnimation &&
          track._natives.frame ) {

          obj.data.trackEvents.animating.push( track );
          track._natives.frame.call( obj, null, track, currentTime );
        }
      }
    }

    // update startIndex and endIndex
    if ( startIndex <= obj.data.trackEvents.startIndex &&
      track.start <= obj.data.trackEvents.previousUpdateTime ) {

      obj.data.trackEvents.startIndex++;
    }

    if ( endIndex <= obj.data.trackEvents.endIndex &&
      track.end < obj.data.trackEvents.previousUpdateTime ) {

      obj.data.trackEvents.endIndex++;
    }

    this.timeUpdate( obj, null, true );

    // Store references to user added trackevents in ref table
    if ( track._id ) {
      Popcorn.addTrackEvent.ref( obj, track );
    }
  };

  // Internal Only - Adds track event references to the instance object's trackRefs hash table
  Popcorn.addTrackEvent.ref = function( obj, track ) {
    obj.data.trackRefs[ track._id ] = track;

    return obj;
  };

  Popcorn.removeTrackEvent  = function( obj, trackId ) {

    var historyLen = obj.data.history.length,
        indexWasAt = 0,
        byStart = [],
        byEnd = [],
        animating = [],
        history = [];

    Popcorn.forEach( obj.data.trackEvents.byStart, function( o, i, context ) {
      // Preserve the original start/end trackEvents
      if ( !o._id ) {
        byStart.push( obj.data.trackEvents.byStart[i] );
        byEnd.push( obj.data.trackEvents.byEnd[i] );
      }

      // Filter for user track events (vs system track events)
      if ( o._id ) {

        // Filter for the trackevent to remove
        if ( o._id !== trackId ) {
          byStart.push( obj.data.trackEvents.byStart[i] );
          byEnd.push( obj.data.trackEvents.byEnd[i] );
        }

        //  Capture the position of the track being removed.
        if ( o._id === trackId ) {
          indexWasAt = i;
          o._natives._teardown && o._natives._teardown.call( obj, o );
        }
      }

    });

    if ( obj.data.trackEvents.animating.length ) {
      Popcorn.forEach( obj.data.trackEvents.animating, function( o, i, context ) {
        // Preserve the original start/end trackEvents
        if ( !o._id ) {
          animating.push( obj.data.trackEvents.animating[i] );
        }

        // Filter for user track events (vs system track events)
        if ( o._id ) {
          // Filter for the trackevent to remove
          if ( o._id !== trackId ) {
            animating.push( obj.data.trackEvents.animating[i] );
          }
        }
      });
    }

    //  Update
    if ( indexWasAt <= obj.data.trackEvents.startIndex ) {
      obj.data.trackEvents.startIndex--;
    }

    if ( indexWasAt <= obj.data.trackEvents.endIndex ) {
      obj.data.trackEvents.endIndex--;
    }

    obj.data.trackEvents.byStart = byStart;
    obj.data.trackEvents.byEnd = byEnd;
    obj.data.trackEvents.animating = animating;

    for ( var i = 0; i < historyLen; i++ ) {
      if ( obj.data.history[ i ] !== trackId ) {
        history.push( obj.data.history[ i ] );
      }
    }

    // Update ordered history array
    obj.data.history = history;

    // Update track event references
    Popcorn.removeTrackEvent.ref( obj, trackId );
  };

  // Internal Only - Removes track event references from instance object's trackRefs hash table
  Popcorn.removeTrackEvent.ref = function( obj, trackId ) {
    delete obj.data.trackRefs[ trackId ];

    return obj;
  };

  // Return an array of track events bound to this instance object
  Popcorn.getTrackEvents = function( obj ) {

    var trackevents = [],
      refs = obj.data.trackEvents.byStart,
      length = refs.length,
      idx = 0,
      ref;

    for ( ; idx < length; idx++ ) {
      ref = refs[ idx ];
      // Return only user attributed track event references
      if ( ref._id ) {
        trackevents.push( ref );
      }
    }

    return trackevents;
  };

  // Internal Only - Returns an instance object's trackRefs hash table
  Popcorn.getTrackEvents.ref = function( obj ) {
    return obj.data.trackRefs;
  };

  // Return a single track event bound to this instance object
  Popcorn.getTrackEvent = function( obj, trackId ) {
    return obj.data.trackRefs[ trackId ];
  };

  // Internal Only - Returns an instance object's track reference by track id
  Popcorn.getTrackEvent.ref = function( obj, trackId ) {
    return obj.data.trackRefs[ trackId ];
  };

  Popcorn.getLastTrackEventId = function( obj ) {
    return obj.data.history[ obj.data.history.length - 1 ];
  };

  Popcorn.timeUpdate = function( obj, event ) {

    var currentTime = obj.media.currentTime,
        previousTime = obj.data.trackEvents.previousUpdateTime,
        tracks = obj.data.trackEvents,
        animating = tracks.animating,
        end = tracks.endIndex,
        start = tracks.startIndex,
        animIndex = 0,

        registryByName = Popcorn.registryByName,

        byEnd, byStart, byAnimate, natives, type;

    //  Playbar advancing
    if ( previousTime <= currentTime ) {

      while ( tracks.byEnd[ end ] && tracks.byEnd[ end ].end <= currentTime ) {

        byEnd = tracks.byEnd[ end ];
        natives = byEnd._natives;
        type = natives && natives.type;

        //  If plugin does not exist on this instance, remove it
        if ( !natives ||
            ( !!registryByName[ type ] ||
              !!obj[ type ] ) ) {

          if ( byEnd._running === true ) {
            byEnd._running = false;
            natives.end.call( obj, event, byEnd );
          }

          end++;
        } else {
          // remove track event
          Popcorn.removeTrackEvent( obj, byEnd._id );
          return;
        }
      }

      while ( tracks.byStart[ start ] && tracks.byStart[ start ].start <= currentTime ) {

        byStart = tracks.byStart[ start ];
        natives = byStart._natives;
        type = natives && natives.type;

        //  If plugin does not exist on this instance, remove it
        if ( !natives ||
            ( !!registryByName[ type ] ||
              !!obj[ type ] ) ) {

          if ( byStart.end > currentTime &&
                byStart._running === false &&
                  obj.data.disabled.indexOf( type ) === -1 ) {

            byStart._running = true;
            natives.start.call( obj, event, byStart );

            // If the `frameAnimation` option is used,
            // push the current byStart object into the `animating` cue
            if ( obj.options.frameAnimation &&
                ( byStart && byStart._running && byStart._natives.frame ) ) {

              animating.push( byStart );
            }
          }
          start++;
        } else {
          // remove track event
          Popcorn.removeTrackEvent( obj, byStart._id );
          return;
        }
      }

      // If the `frameAnimation` option is used, iterate the animating track
      // and execute the `frame` callback
      if ( obj.options.frameAnimation ) {
        while ( animIndex < animating.length ) {

          byAnimate = animating[ animIndex ];

          if ( !byAnimate._running ) {
            animating.splice( animIndex, 1 );
          } else {
            byAnimate._natives.frame.call( obj, event, byAnimate, currentTime );
            animIndex++;
          }
        }
      }

    // Playbar receding
    } else if ( previousTime > currentTime ) {

      while ( tracks.byStart[ start ] && tracks.byStart[ start ].start > currentTime ) {

        byStart = tracks.byStart[ start ];
        natives = byStart._natives;
        type = natives && natives.type;

        // if plugin does not exist on this instance, remove it
        if ( !natives ||
            ( !!registryByName[ type ] ||
              !!obj[ type ] ) ) {

          if ( byStart._running === true ) {
            byStart._running = false;
            natives.end.call( obj, event, byStart );
          }
          start--;
        } else {
          // remove track event
          Popcorn.removeTrackEvent( obj, byStart._id );
          return;
        }
      }

      while ( tracks.byEnd[ end ] && tracks.byEnd[ end ].end > currentTime ) {

        byEnd = tracks.byEnd[ end ];
        natives = byEnd._natives;
        type = natives && natives.type;

        // if plugin does not exist on this instance, remove it
        if ( !natives ||
            ( !!registryByName[ type ] ||
              !!obj[ type ] ) ) {

          if ( byEnd.start <= currentTime &&
                byEnd._running === false  &&
                  obj.data.disabled.indexOf( type ) === -1 ) {

            byEnd._running = true;
            natives.start.call( obj, event, byEnd );

            // If the `frameAnimation` option is used,
            // push the current byEnd object into the `animating` cue
            if ( obj.options.frameAnimation &&
                  ( byEnd && byEnd._running && byEnd._natives.frame ) ) {

              animating.push( byEnd );
            }
          }
          end--;
        } else {
          // remove track event
          Popcorn.removeTrackEvent( obj, byEnd._id );
          return;
        }
      }

      // If the `frameAnimation` option is used, iterate the animating track
      // and execute the `frame` callback
      if ( obj.options.frameAnimation ) {
        while ( animIndex < animating.length ) {

          byAnimate = animating[ animIndex ];

          if ( !byAnimate._running ) {
            animating.splice( animIndex, 1 );
          } else {
            byAnimate._natives.frame.call( obj, event, byAnimate, currentTime );
            animIndex++;
          }
        }
      }
    // time bar is not moving ( video is paused )
    }

    tracks.endIndex = end;
    tracks.startIndex = start;
    tracks.previousUpdateTime = currentTime;
  };

  //  Map and Extend TrackEvent functions to all Popcorn instances
  Popcorn.extend( Popcorn.p, {

    getTrackEvents: function() {
      return Popcorn.getTrackEvents.call( null, this );
    },

    getTrackEvent: function( id ) {
      return Popcorn.getTrackEvent.call( null, this, id );
    },

    getLastTrackEventId: function() {
      return Popcorn.getLastTrackEventId.call( null, this );
    },

    removeTrackEvent: function( id ) {

      Popcorn.removeTrackEvent.call( null, this, id );
      return this;
    },

    removePlugin: function( name ) {
      Popcorn.removePlugin.call( null, this, name );
      return this;
    },

    timeUpdate: function( event ) {
      Popcorn.timeUpdate.call( null, this, event );
      return this;
    },

    destroy: function() {
      Popcorn.destroy.call( null, this );
      return this;
    }
  });

  //  Plugin manifests
  Popcorn.manifest = {};
  //  Plugins are registered
  Popcorn.registry = [];
  Popcorn.registryByName = {};
  //  An interface for extending Popcorn
  //  with plugin functionality
  Popcorn.plugin = function( name, definition, manifest ) {

    if ( Popcorn.protect.natives.indexOf( name.toLowerCase() ) >= 0 ) {
      Popcorn.error( "'" + name + "' is a protected function name" );
      return;
    }

    //  Provides some sugar, but ultimately extends
    //  the definition into Popcorn.p
    var reserved = [ "start", "end" ],
        plugin = {},
        setup,
        isfn = typeof definition === "function",
        methods = [ "_setup", "_teardown", "start", "end", "frame" ];

    // combines calls of two function calls into one
    var combineFn = function( first, second ) {

      first = first || Popcorn.nop;
      second = second || Popcorn.nop;

      return function() {
        first.apply( this, arguments );
        second.apply( this, arguments );
      };
    };

    //  If `manifest` arg is undefined, check for manifest within the `definition` object
    //  If no `definition.manifest`, an empty object is a sufficient fallback
    Popcorn.manifest[ name ] = manifest = manifest || definition.manifest || {};

    // apply safe, and empty default functions
    methods.forEach(function( method ) {
      definition[ method ] = safeTry( definition[ method ] || Popcorn.nop, name );
    });

    var pluginFn = function( setup, options ) {

      if ( !options ) {
        return this;
      }

      //  Storing the plugin natives
      var natives = options._natives = {},
          compose = "",
          defaults, originalOpts, manifestOpts, mergedSetupOpts;

      Popcorn.extend( natives, setup );

      options._natives.type = name;
      options._running = false;

      natives.start = natives.start || natives[ "in" ];
      natives.end = natives.end || natives[ "out" ];

      // extend teardown to always call end if running
      natives._teardown = combineFn (function() {

        // end function signature is not the same as teardown,
        // put null on the front of arguments for the event parameter
        Array.prototype.unshift.call( arguments, null );
        // only call end if event is running
        arguments[ 1 ]._running && natives.end.apply( this, arguments );
      }, natives._teardown );

      // Check for previously set default options
      defaults = this.options.defaults && this.options.defaults[ options._natives && options._natives.type ];

      // default to an empty string if no effect exists
      // split string into an array of effects
      options.compose = options.compose && options.compose.split( " " ) || [];
      options.effect = options.effect && options.effect.split( " " ) || [];

      // join the two arrays together
      options.compose = options.compose.concat( options.effect );

      options.compose.forEach(function( composeOption ) {

        // if the requested compose is garbage, throw it away
        compose = Popcorn.compositions[ composeOption ] || {};

        // extends previous functions with compose function
        methods.forEach(function( method ) {
          natives[ method ] = combineFn( natives[ method ], compose[ method ] );
        });
      });

      //  Ensure a manifest object, an empty object is a sufficient fallback
      options._natives.manifest = manifest;

      //  Checks for expected properties
      if ( !( "start" in options ) ) {
        options.start = options[ "in" ] || 0;
      }

      if ( !( "end" in options ) ) {
        options.end = options[ "out" ] || this.duration() || Number.MAX_VALUE;
      }

      // Merge with defaults if they exist, make sure per call is prioritized
      mergedSetupOpts = defaults ? Popcorn.extend( {}, defaults, options ) :
                          options;

      // Resolves 239, 241, 242
      if ( !mergedSetupOpts.target ) {

        //  Sometimes the manifest may be missing entirely
        //  or it has an options object that doesn't have a `target` property
        manifestOpts = "options" in manifest && manifest.options;

        mergedSetupOpts.target = manifestOpts && "target" in manifestOpts && manifestOpts.target;
      }

      // Trigger _setup method if exists
      options._natives._setup && options._natives._setup.call( this, mergedSetupOpts );

      // Create new track event for this instance
      Popcorn.addTrackEvent( this, Popcorn.extend( mergedSetupOpts, options ) );

      //  Future support for plugin event definitions
      //  for all of the native events
      Popcorn.forEach( setup, function( callback, type ) {

        if ( type !== "type" ) {

          if ( reserved.indexOf( type ) === -1 ) {

            this.listen( type, callback );
          }
        }

      }, this );

      return this;
    };

    //  Assign new named definition
    plugin[ name ] = function( options ) {
      return pluginFn.call( this, isfn ? definition.call( this, options ) : definition,
                                  options );
    };

    //  Extend Popcorn.p with new named definition
    Popcorn.extend( Popcorn.p, plugin );

    //  Push into the registry
    var entry = {
      fn: plugin[ name ],
      definition: definition,
      base: definition,
      parents: [],
      name: name
    };
    Popcorn.registry.push(
       Popcorn.extend( plugin, entry, {
        type: name
      })
    );
    Popcorn.registryByName[ name ] = entry;

    return plugin;
  };

  // Storage for plugin function errors
  Popcorn.plugin.errors = [];

  // Returns wrapped plugin function
  function safeTry( fn, pluginName ) {
    return function() {

      //  When Popcorn.plugin.debug is true, do not suppress errors
      if ( Popcorn.plugin.debug ) {
        return fn.apply( this, arguments );
      }

      try {
        return fn.apply( this, arguments );
      } catch ( ex ) {

        // Push plugin function errors into logging queue
        Popcorn.plugin.errors.push({
          plugin: pluginName,
          thrown: ex,
          source: fn.toString()
        });

        // Trigger an error that the instance can listen for
        // and react to
        this.trigger( "error", Popcorn.plugin.errors );
      }
    };
  }

  // Debug-mode flag for plugin development
  Popcorn.plugin.debug = false;

  //  removePlugin( type ) removes all tracks of that from all instances of popcorn
  //  removePlugin( obj, type ) removes all tracks of type from obj, where obj is a single instance of popcorn
  Popcorn.removePlugin = function( obj, name ) {

    //  Check if we are removing plugin from an instance or from all of Popcorn
    if ( !name ) {

      //  Fix the order
      name = obj;
      obj = Popcorn.p;

      if ( Popcorn.protect.natives.indexOf( name.toLowerCase() ) >= 0 ) {
        Popcorn.error( "'" + name + "' is a protected function name" );
        return;
      }

      var registryLen = Popcorn.registry.length,
          registryIdx;

      // remove plugin reference from registry
      for ( registryIdx = 0; registryIdx < registryLen; registryIdx++ ) {
        if ( Popcorn.registry[ registryIdx ].name === name ) {
          Popcorn.registry.splice( registryIdx, 1 );
          delete Popcorn.registryByName[ name ];
          delete Popcorn.manifest[ name ];

          // delete the plugin
          delete obj[ name ];

          // plugin found and removed, stop checking, we are done
          return;
        }
      }

    }

    var byStart = obj.data.trackEvents.byStart,
        byEnd = obj.data.trackEvents.byEnd,
        animating = obj.data.trackEvents.animating,
        idx, sl;

    // remove all trackEvents
    for ( idx = 0, sl = byStart.length; idx < sl; idx++ ) {

      if ( ( byStart[ idx ] && byStart[ idx ]._natives && byStart[ idx ]._natives.type === name ) &&
                ( byEnd[ idx ] && byEnd[ idx ]._natives && byEnd[ idx ]._natives.type === name ) ) {

        byStart[ idx ]._natives._teardown && byStart[ idx ]._natives._teardown.call( obj, byStart[ idx ] );

        byStart.splice( idx, 1 );
        byEnd.splice( idx, 1 );

        // update for loop if something removed, but keep checking
        idx--; sl--;
        if ( obj.data.trackEvents.startIndex <= idx ) {
          obj.data.trackEvents.startIndex--;
          obj.data.trackEvents.endIndex--;
        }
      }
    }

    //remove all animating events
    for ( idx = 0, sl = animating.length; idx < sl; idx++ ) {

      if ( animating[ idx ] && animating[ idx ]._natives && animating[ idx ]._natives.type === name ) {

        animating.splice( idx, 1 );

        // update for loop if something removed, but keep checking
        idx--; sl--;
      }
    }

  };

  Popcorn.compositions = {};

  //  Plugin inheritance
  Popcorn.compose = function( name, definition, manifest ) {

    //  If `manifest` arg is undefined, check for manifest within the `definition` object
    //  If no `definition.manifest`, an empty object is a sufficient fallback
    Popcorn.manifest[ name ] = manifest = manifest || definition.manifest || {};

    // register the effect by name
    Popcorn.compositions[ name ] = definition;
  };

  Popcorn.plugin.effect = Popcorn.effect = Popcorn.compose;

  // stores parsers keyed on filetype
  Popcorn.parsers = {};

  // An interface for extending Popcorn
  // with parser functionality
  Popcorn.parser = function( name, type, definition ) {

    if ( Popcorn.protect.natives.indexOf( name.toLowerCase() ) >= 0 ) {
      Popcorn.error( "'" + name + "' is a protected function name" );
      return;
    }

    // fixes parameters for overloaded function call
    if ( typeof type === "function" && !definition ) {
      definition = type;
      type = "";
    }

    if ( typeof definition !== "function" || typeof type !== "string" ) {
      return;
    }

    // Provides some sugar, but ultimately extends
    // the definition into Popcorn.p

    var natives = Popcorn.events.all,
        parseFn,
        parser = {};

    parseFn = function( filename, callback ) {

      if ( !filename ) {
        return this;
      }

      var that = this;

      Popcorn.xhr({
        url: filename,
        dataType: type,
        success: function( data ) {

          var tracksObject = definition( data ),
              tracksData,
              tracksDataLen,
              tracksDef,
              idx = 0;

          tracksData = tracksObject.data || [];
          tracksDataLen = tracksData.length;
          tracksDef = null;

          //  If no tracks to process, return immediately
          if ( !tracksDataLen ) {
            return;
          }

          //  Create tracks out of parsed object
          for ( ; idx < tracksDataLen; idx++ ) {

            tracksDef = tracksData[ idx ];

            for ( var key in tracksDef ) {

              if ( hasOwn.call( tracksDef, key ) && !!that[ key ] ) {

                that[ key ]( tracksDef[ key ] );
              }
            }
          }
          if ( callback ) {
            callback();
          }
        }
      });

      return this;
    };

    // Assign new named definition
    parser[ name ] = parseFn;

    // Extend Popcorn.p with new named definition
    Popcorn.extend( Popcorn.p, parser );

    // keys the function name by filetype extension
    //Popcorn.parsers[ name ] = true;

    return parser;
  };

  Popcorn.player = function( name, player ) {

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

            return function() {

              return container[ value ].apply( container, arguments );
            };
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

      return popcorn;
    };

    Popcorn[ name ] = Popcorn[ name ] || playerFn;
  };

  Popcorn.player.defineProperty = Object.defineProperty || function( object, description, options ) {

    object.__defineGetter__( description, options.get || Popcorn.nop );
    object.__defineSetter__( description, options.set || Popcorn.nop );
  };

  //  Cache references to reused RegExps
  var rparams = /\?/,
  //  XHR Setup object
  setup = {
    url: "",
    data: "",
    dataType: "",
    success: Popcorn.nop,
    type: "GET",
    async: true,
    xhr: function() {
      return new global.XMLHttpRequest();
    }
  };

  Popcorn.xhr = function( options ) {

    options.dataType = options.dataType && options.dataType.toLowerCase() || null;

    if ( options.dataType &&
         ( options.dataType === "jsonp" || options.dataType === "script" ) ) {

      Popcorn.xhr.getJSONP(
        options.url,
        options.success,
        options.dataType === "script"
      );
      return;
    }

    var settings = Popcorn.extend( {}, setup, options );

    //  Create new XMLHttpRequest object
    settings.ajax  = settings.xhr();

    if ( settings.ajax ) {

      if ( settings.type === "GET" && settings.data ) {

        //  append query string
        settings.url += ( rparams.test( settings.url ) ? "&" : "?" ) + settings.data;

        //  Garbage collect and reset settings.data
        settings.data = null;
      }


      settings.ajax.open( settings.type, settings.url, settings.async );
      settings.ajax.send( settings.data || null );

      return Popcorn.xhr.httpData( settings );
    }
  };


  Popcorn.xhr.httpData = function( settings ) {

    var data, json = null,
        parser, xml = null;

    settings.ajax.onreadystatechange = function() {

      if ( settings.ajax.readyState === 4 ) {

        try {
          json = JSON.parse( settings.ajax.responseText );
        } catch( e ) {
          //suppress
        }

        data = {
          xml: settings.ajax.responseXML,
          text: settings.ajax.responseText,
          json: json
        };

        // Normalize: data.xml is non-null in IE9 regardless of if response is valid xml
        if ( !data.xml || !data.xml.documentElement ) {
          data.xml = null;

          try {
            parser = new DOMParser();
            xml = parser.parseFromString( settings.ajax.responseText, "text/xml" );

            if ( !xml.getElementsByTagName( "parsererror" ).length ) {
              data.xml = xml;
            }
          } catch ( e ) {
            // data.xml remains null
          }
        }

        //  If a dataType was specified, return that type of data
        if ( settings.dataType ) {
          data = data[ settings.dataType ];
        }


        settings.success.call( settings.ajax, data );

      }
    };
    return data;
  };

  Popcorn.xhr.getJSONP = function( url, success, isScript ) {

    var head = document.head || document.getElementsByTagName( "head" )[ 0 ] || document.documentElement,
      script = document.createElement( "script" ),
      paramStr = url.split( "?" )[ 1 ],
      isFired = false,
      params = [],
      callback, parts, callparam;

    if ( paramStr && !isScript ) {
      params = paramStr.split( "&" );
    }

    if ( params.length ) {
      parts = params[ params.length - 1 ].split( "=" );
    }

    callback = params.length ? ( parts[ 1 ] ? parts[ 1 ] : parts[ 0 ]  ) : "jsonp";

    if ( !paramStr && !isScript ) {
      url += "?callback=" + callback;
    }

    if ( callback && !isScript ) {

      //  If a callback name already exists
      if ( !!window[ callback ] ) {
        //  Create a new unique callback name
        callback = Popcorn.guid( callback );
      }

      //  Define the JSONP success callback globally
      window[ callback ] = function( data ) {
        // Fire success callbacks
        success && success( data );
        isFired = true;
      };

      //  Replace callback param and callback name
      url = url.replace( parts.join( "=" ), parts[ 0 ] + "=" + callback );
    }

    script.onload = function() {

      //  Handling remote script loading callbacks
      if ( isScript ) {
        //  getScript
        success && success();
      }

      //  Executing for JSONP requests
      if ( isFired ) {
        //  Garbage collect the callback
        delete window[ callback ];
      }
      //  Garbage collect the script resource
      head.removeChild( script );
    };

    script.src = url;

    head.insertBefore( script, head.firstChild );

    return;
  };

  Popcorn.getJSONP = Popcorn.xhr.getJSONP;

  Popcorn.getScript = Popcorn.xhr.getScript = function( url, success ) {

    return Popcorn.xhr.getJSONP( url, success, true );
  };

  Popcorn.util = {
    // Simple function to parse a timestamp into seconds
    // Acceptable formats are:
    // HH:MM:SS.MMM
    // HH:MM:SS;FF
    // Hours and minutes are optional. They default to 0
    toSeconds: function( timeStr, framerate ) {
      // Hours and minutes are optional
      // Seconds must be specified
      // Seconds can be followed by milliseconds OR by the frame information
      var validTimeFormat = /^([0-9]+:){0,2}[0-9]+([.;][0-9]+)?$/,
          errorMessage = "Invalid time format",
          digitPairs, lastIndex, lastPair, firstPair,
          frameInfo, frameTime;

      if ( typeof timeStr === "number" ) {
        return timeStr;
      }

      if ( typeof timeStr === "string" &&
            !validTimeFormat.test( timeStr ) ) {
        Popcorn.error( errorMessage );
      }

      digitPairs = timeStr.split( ":" );
      lastIndex = digitPairs.length - 1;
      lastPair = digitPairs[ lastIndex ];

      // Fix last element:
      if ( lastPair.indexOf( ";" ) > -1 ) {

        frameInfo = lastPair.split( ";" );
        frameTime = 0;

        if ( framerate && ( typeof framerate === "number" ) ) {
          frameTime = parseFloat( frameInfo[ 1 ], 10 ) / framerate;
        }

        digitPairs[ lastIndex ] = parseInt( frameInfo[ 0 ], 10 ) + frameTime;
      }

      firstPair = digitPairs[ 0 ];

      return {

        1: parseFloat( firstPair, 10 ),

        2: ( parseInt( firstPair, 10 ) * 60 ) +
              parseFloat( digitPairs[ 1 ], 10 ),

        3: ( parseInt( firstPair, 10 ) * 3600 ) +
            ( parseInt( digitPairs[ 1 ], 10 ) * 60 ) +
              parseFloat( digitPairs[ 2 ], 10 )

      }[ digitPairs.length || 1 ];
    }
  };


  // Initialize locale data
  // Based on http://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes
  function initLocale( arg ) {

    var locale = typeof arg === "string" ? arg : [ arg.language, arg.region ].join( "-" ),
        parts = locale.split( "-" );

    // Setup locale data table
    return {
      iso6391: locale,
      language: parts[ 0 ] || "",
      region: parts[ 1 ] || ""
    };
  }

  // Declare locale data table
  var localeData = initLocale( global.navigator.userLanguage || global.navigator.language );

  Popcorn.locale = {

    // Popcorn.locale.get()
    // returns reference to privately
    // defined localeData
    get: function() {
      return localeData;
    },

    // Popcorn.locale.set( string|object );
    set: function( arg ) {

      localeData = initLocale( arg );

      Popcorn.locale.broadcast();

      return localeData;
    },

    // Popcorn.locale.broadcast( type )
    // Sends events to all popcorn media instances that are
    // listening for locale events
    broadcast: function( type ) {

      var instances = Popcorn.instances,
          length = instances.length,
          idx = 0,
          instance;

      type = type || "locale:changed";

      // Iterate all current instances
      for ( ; idx < length; idx++ ) {
        instance = instances[ idx ];

        // For those instances with locale event listeners,
        // trigger a locale change event
        if ( type in instance.data.events  ) {
          instance.trigger( type );
        }
      }
    }
  };

  // alias for exec function
  Popcorn.p.cue = Popcorn.p.exec;

  function getItems() {

    var item,
        list = [];

    if ( Object.keys ) {
      list = Object.keys( Popcorn.p );
    } else {

      for ( item in Popcorn.p ) {
        if ( hasOwn.call( Popcorn.p, item ) ) {
          list.push( item );
        }
      }
    }

    return list.join( "," ).toLowerCase().split( ",");
  }

  //  Protected API methods
  Popcorn.protect = {
    natives: getItems()
  };

  //  Exposes Popcorn to global context
  global.Popcorn = Popcorn;

})(window, window.document);
