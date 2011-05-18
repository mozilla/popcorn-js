(function(global, document) {

  //  Cache refs to speed up calls to native utils
  
  var
  
  AP = Array.prototype,
  OP = Object.prototype,
  
  forEach = AP.forEach,
  slice = AP.slice,
  hasOwn = OP.hasOwnProperty,
  toString = OP.toString,

  //  ID string matching
  rIdExp  = /^(#([\w\-\_\.]+))$/,

  //  Ready fn cache
  readyStack = [],
  readyBound = false,
  readyFired = false,


  //  Declare constructor
  //  Returns an instance object.
  Popcorn = function( entity, options ) {
    //  Return new Popcorn object
    return new Popcorn.p.init( entity, options || null );
  };

  //  Instance caching
  Popcorn.instances = [];
  Popcorn.instanceIds = {};

  Popcorn.removeInstance = function( instance ) {
    //  If called prior to any instances being created
    //  Return early to avoid splicing on nothing
    if ( !Popcorn.instances.length ) {
      return;
    }

    //  Remove instance from Popcorn.instances
    Popcorn.instances.splice( Popcorn.instanceIds[ instance.id ], 1 );

    //  Delete the instance id key
    delete Popcorn.instanceIds[ instance.id ];

    //  Return current modified instances
    return Popcorn.instances;
  };

  //  Addes a Popcorn instance to the Popcorn instance array
  Popcorn.addInstance = function( instance ) {

    var instanceLen = Popcorn.instances.length,
        instanceId = instance.media.id && instance.media.id;

    //  If the media element has its own `id` use it, otherwise provide one
    //  Ensure that instances have unique ids and unique entries
    //  Uses `in` operator to avoid false positives on 0
    instance.id = !( instanceId in Popcorn.instanceIds ) && instanceId ||
                    "__popcorn" + instanceLen;

    //  Create a reference entry for this instance
    Popcorn.instanceIds[ instance.id ] = instanceLen;

    //  Add this instance to the cache
    Popcorn.instances.push( instance );

    //  Return the current modified instances
    return Popcorn.instances;
  };

  //  Request Popcorn object instance by id
  Popcorn.getInstanceById = function( id ) {
    return Popcorn.instances[ Popcorn.instanceIds[ id ] ];
  };

  //  Remove Popcorn object instance by id
  Popcorn.removeInstanceById = function( id ) {
    return Popcorn.removeInstance( Popcorn.instances[ Popcorn.instanceIds[ id ] ] );
  };

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
      Popcorn.addInstance( this );

      this.options = options || {};

      this.data = {

        // Allows disabling a plugin per instance
        disabled: [],

        // Stores DOM event queues by type
        events: {},

        // Store track event history data
        history: [],

        // Playback track event queues
        trackEvents: {
          byStart: [{
            start: -1,
            end: -1
          }],
          byEnd:   [{
            start: -1,
            end: -1
          }],
          startIndex: 0,
          endIndex:   0,
          previousUpdateTime: 0
        }
      };

      //  Wrap true ready check
      var isReady = function( that ) {

        if ( that.media.readyState >= 2 ) {
          //  Adding padding to the front and end of the arrays
          //  this is so we do not fall off either end

          var duration = that.media.duration,
              //  Check for no duration info (NaN)
              videoDurationPlus = duration != duration ? Number.MAX_VALUE : duration + 1;

          Popcorn.addTrackEvent( that, {
            start: videoDurationPlus,
            end: videoDurationPlus
          });

          that.media.addEventListener( "timeupdate", function( event ) {

            var currentTime    = this.currentTime,
                previousTime   = that.data.trackEvents.previousUpdateTime,
                tracks         = that.data.trackEvents,
                tracksByEnd    = tracks.byEnd,
                tracksByStart  = tracks.byStart;

            //  Playbar advancing
            if ( previousTime < currentTime ) {

              while ( tracksByEnd[ tracks.endIndex ] && tracksByEnd[ tracks.endIndex ].end <= currentTime ) {
                //  If plugin does not exist on this instance, remove it
                if ( !tracksByEnd[ tracks.endIndex ]._natives || !!that[ tracksByEnd[ tracks.endIndex ]._natives.type ] ) {
                  if ( tracksByEnd[ tracks.endIndex ]._running === true ) {
                    tracksByEnd[ tracks.endIndex ]._running = false;
                    tracksByEnd[ tracks.endIndex ]._natives.end.call( that, event, tracksByEnd[ tracks.endIndex ] );
                  }
                  tracks.endIndex++;
                } else {
                  // remove track event
                  Popcorn.removeTrackEvent( that, tracksByEnd[ tracks.endIndex ]._id );
                  return;
                }
              }

              while ( tracksByStart[ tracks.startIndex ] && tracksByStart[ tracks.startIndex ].start <= currentTime ) {
                //  If plugin does not exist on this instance, remove it
                if ( !tracksByStart[ tracks.startIndex ]._natives || !!that[ tracksByStart[ tracks.startIndex ]._natives.type ] ) {
                  if ( tracksByStart[ tracks.startIndex ].end > currentTime && 
                        tracksByStart[ tracks.startIndex ]._running === false && 
                          that.data.disabled.indexOf( tracksByStart[ tracks.endIndex ]._natives.type ) === -1 ) {
                          
                    tracksByStart[ tracks.startIndex ]._running = true;
                    tracksByStart[ tracks.startIndex ]._natives.start.call( that, event, tracksByStart[ tracks.startIndex ] );
                  }
                  tracks.startIndex++;
                } else {
                  // remove track event
                  Popcorn.removeTrackEvent( that, tracksByStart[ tracks.startIndex ]._id );
                  return;
                }
              }

            // Playbar receding
            } else if ( previousTime > currentTime ) {

              while ( tracksByStart[ tracks.startIndex ] && tracksByStart[ tracks.startIndex ].start > currentTime ) {
                // if plugin does not exist on this instance, remove it
                if ( !tracksByStart[ tracks.startIndex ]._natives || !!that[ tracksByStart[ tracks.startIndex ]._natives.type ] ) {
                  if ( tracksByStart[ tracks.startIndex ]._running === true ) {
                    tracksByStart[ tracks.startIndex ]._running = false;
                    tracksByStart[ tracks.startIndex ]._natives.end.call( that, event, tracksByStart[ tracks.startIndex ] );
                  }
                  tracks.startIndex--;
                } else {
                  // remove track event
                  Popcorn.removeTrackEvent( that, tracksByStart[ tracks.startIndex ]._id );
                  return;
                }
              }

              while ( tracksByEnd[ tracks.endIndex ] && tracksByEnd[ tracks.endIndex ].end > currentTime ) {
                // if plugin does not exist on this instance, remove it
                if ( !tracksByEnd[ tracks.endIndex ]._natives || !!that[ tracksByEnd[ tracks.endIndex ]._natives.type ] ) {
                  if ( tracksByEnd[ tracks.endIndex ].start <= currentTime && 
                        tracksByEnd[ tracks.endIndex ]._running === false  && 
                          that.data.disabled.indexOf( tracksByStart[ tracks.endIndex ]._natives.type ) === -1 ) {

                    tracksByEnd[ tracks.endIndex ]._running = true;
                    tracksByEnd[ tracks.endIndex ]._natives.start.call( that, event, tracksByEnd[tracks.endIndex] );
                  }
                  tracks.endIndex--;
                } else {
                  // remove track event
                  Popcorn.removeTrackEvent( that, tracksByEnd[ tracks.endIndex ]._id );
                  return;
                }
              }
            }

            tracks.previousUpdateTime = currentTime;

          }, false );
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
    // Use native whenever possible
    if ( forEach && obj.forEach === forEach ) {
      return obj.forEach( fn, context );
    }

    for ( var key in obj ) {
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

      return instance;
    },
    enable: function( instance, plugin ) {

      var disabled = instance.data.disabled, 
          index = disabled.indexOf( plugin );

      if ( index > -1 ) {
        disabled.splice( index, 1 );
      }

      return instance;
    }
  });

  //  Memoized GUID Counter
  Popcorn.guid.counter = 1;

  //  Factory to implement getters, setters and controllers
  //  as Popcorn instance methods. The IIFE will create and return
  //  an object with defined methods
  Popcorn.extend(Popcorn.p, (function() {

      var methods = "load play pause currentTime playbackRate mute volume duration",
          ret = {};


      //  Build methods, store in object that is returned and passed to extend
      Popcorn.forEach( methods.split( /\s+/g ), function( name ) {

        ret[ name ] = function( arg ) {

          if ( typeof this.media[ name ] === "function" ) {
            this.media[ name ]();

            return this;
          }


          if ( arg !== false && arg !== null && typeof arg !== "undefined" ) {

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
    position: function() {
      return Popcorn.position( this.media );
    }, 
    toggle: function( plugin ) {
      return Popcorn[ this.data.disabled.indexOf( plugin ) > -1 ? "enable" : "disable" ]( this, plugin );
    }
  });

  Popcorn.Events  = {
    UIEvents: "blur focus focusin focusout load resize scroll unload  ",
    MouseEvents: "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave click dblclick",
    Events: "loadstart progress suspend emptied stalled play pause " +
            "loadedmetadata loadeddata waiting playing canplay canplaythrough " +
            "seeking seeked timeupdate ended ratechange durationchange volumechange"
  };

  Popcorn.Events.Natives = Popcorn.Events.UIEvents + " " +
                           Popcorn.Events.MouseEvents + " " +
                           Popcorn.Events.Events;

  Popcorn.events = {

    isNative: function( type ) {

      var checks = Popcorn.Events.Natives.split( /\s+/g );

      for ( var i = 0; i < checks.length; i++ ) {
        if ( checks[ i ] === type ) {
          return true;
        }
      }

      return false;
    },
    getInterface: function( type ) {

      if ( !Popcorn.events.isNative( type ) ) {
        return false;
      }

      var natives = Popcorn.Events,
          proto;

      for ( var p in natives ) {
        if ( p !== "Natives" && natives[ p ].indexOf( type ) > -1 ) {
          proto = p;
        }
      }

      return proto;
    },
    //  Compile all native events to single array
    all: Popcorn.Events.Natives.split( /\s+/g ),
    //  Defines all Event handling static functions
    fn: {
      trigger: function( type, data ) {

        //  setup checks for custom event system
        if ( this.data.events[ type ] && Popcorn.sizeOf( this.data.events[ type ] ) ) {

          var eventInterface  = Popcorn.events.getInterface( type );

          if ( eventInterface ) {

            var evt = document.createEvent( eventInterface );
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
            hasEvents = true;

        if ( !this.data.events[ type ] ) {
          this.data.events[ type ] = {};
          hasEvents = false;
        }

        //  Register
        this.data.events[ type ][ fn.name || ( fn.toString() + Popcorn.guid() ) ] = fn;

        // only attach one event of any type
        if ( !hasEvents && Popcorn.events.all.indexOf( type ) > -1 ) {

          this.media.addEventListener( type, function( event ) {

            Popcorn.forEach( self.data.events[ type ], function( obj, key ) {
              if ( typeof obj === "function" ) {
                obj.call( self, event );
              }
            });

            //fn.call( self, event );

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
    }
  };

  //  Extend Popcorn.events.fns (listen, unlisten, trigger) to all Popcorn instances
  Popcorn.forEach( [ "trigger", "listen", "unlisten" ], function( key ) {
    Popcorn.p[ key ] = Popcorn.events.fn[ key ];
  });
  //  Protected API methods
  Popcorn.protect = {
    natives: "load play pause currentTime playbackRate mute volume duration removePlugin roundTime trigger listen unlisten".toLowerCase().split( /\s+/ )
  };

  //  Internal Only
  Popcorn.addTrackEvent = function( obj, track ) {

    if ( track._natives ) {
      //  Supports user defined track event id
      track._id = !track.id ? Popcorn.guid( track._natives.type ) : track.id;

      //  Push track event ids into the history
      obj.data.history.push( track._id );

      track._natives.start = track._natives.start || Popcorn.nop;
      track._natives.end   = track._natives.end || Popcorn.nop;
    }

    track.start = Popcorn.util.toSeconds( track.start, obj.options.framerate );
    track.end   = Popcorn.util.toSeconds( track.end, obj.options.framerate );

    //  Store this definition in an array sorted by times
    var byStart = obj.data.trackEvents.byStart,
        byEnd = obj.data.trackEvents.byEnd, 
        idx;
   
    for ( idx = byStart.length-1; idx >= 0; idx-- ) {

      if ( track.start >= byStart[idx].start ) {
        byStart.splice( idx + 1, 0, track );
        break;
      }
    }
   
    for ( idx = byEnd.length-1; idx >= 0; idx-- ) {

      if ( track.start >= byEnd[idx].start ) {
        byEnd.splice( idx + 1, 0, track );
        break;
      }
    }

  };

  //  removePlugin( type ) removes all tracks of that from all instances of popcorn
  //  removePlugin( obj, type ) removes all tracks of type from obj, where obj is a single instance of popcorn
  Popcorn.removePlugin = function( obj, name ) {

    //  Check if we are removing plugin from an instance or from all of Popcorn
    if ( !name ) {

      //  Fix the order
      name = obj;
      obj = Popcorn.p;

      var registryLen = Popcorn.registry.length,
          registryIdx;

      // remove plugin reference from registry
      for ( registryIdx = 0; registryIdx < registryLen; registryIdx++ ) {
        if ( Popcorn.registry[ registryIdx ].name === name ) {
          Popcorn.registry.splice( registryIdx, 1 );
          delete Popcorn.registryByName[ name ];

          // delete the plugin
          delete obj[ name ];

          // plugin found and removed, stop checking, we are done
          return;
        }
      }

    }

    var byStart = obj.data.trackEvents.byStart,
        byEnd = obj.data.trackEvents.byEnd,
        idx, sl;

    // remove all trackEvents
    for ( idx = 0, sl = byStart.length; idx < sl; idx++ ) {

      if ( ( byStart[ idx ] && byStart[ idx ]._natives && byStart[ idx ]._natives.type === name ) &&
                ( byEnd[ idx ] && byEnd[ idx ]._natives && byEnd[ idx ]._natives.type === name ) ) {

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
  };

  Popcorn.removeTrackEvent  = function( obj, trackId ) {

    var historyLen = obj.data.history.length,
        indexWasAt = 0,
        byStart = [],
        byEnd = [],
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


    //  Update
    if ( indexWasAt <= obj.data.trackEvents.startIndex ) {
      obj.data.trackEvents.startIndex--;
    }

    if ( indexWasAt <= obj.data.trackEvents.endIndex ) {
      obj.data.trackEvents.endIndex--;
    }


    obj.data.trackEvents.byStart = byStart;
    obj.data.trackEvents.byEnd  = byEnd;


    for ( var i = 0; i < historyLen; i++ ) {
      if ( obj.data.history[ i ] !== trackId ) {
        history.push( obj.data.history[ i ] );
      }
    }

    obj.data.history = history;

  };

  Popcorn.getTrackEvents = function( obj ) {

    var trackevents = [];

    Popcorn.forEach( obj.data.trackEvents.byStart, function( o, i, context ) {
      if ( o._id ) {
        trackevents.push( o );
      }
    });

    return trackevents;
  };


  Popcorn.getLastTrackEventId = function( obj ) {
    return obj.data.history[ obj.data.history.length - 1 ];
  };

  //  Map and Extend TrackEvent functions to all Popcorn instances
  Popcorn.extend( Popcorn.p, {

    getTrackEvents: function() {
      return Popcorn.getTrackEvents.call( null, this );
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
      Popcorn.error("'" + name + "' is a protected function name");
      return;
    }

    //  Provides some sugar, but ultimately extends
    //  the definition into Popcorn.p
    var reserved = [ "start", "end" ],
        plugin = {},
        setup,
        isfn = typeof definition === "function";

    //  If `manifest` arg is undefined, check for manifest within the `definition` object
    //  If no `definition.manifest`, an empty object is a sufficient fallback
    if ( !manifest ) {
      manifest = definition.manifest || {};
    }

    var pluginFn = function( setup, options ) {

      if ( !options ) {
        return this;
      }

      //  Storing the plugin natives
      options._natives = setup;
      options._natives.type = name;
      options._running = false;

      //  Ensure a manifest object, an empty object is a sufficient fallback
      options._natives.manifest = manifest;

      //  Checks for expected properties
      if ( !( "start" in options ) ) {
        options.start = 0;
      }

      if ( !( "end" in options ) ) {
        options.end = this.duration();
      }

      //  If a _setup was declared, then call it before
      //  the events commence
      if ( "_setup" in setup && typeof setup._setup === "function" ) {

        // Resolves 239, 241, 242
        if ( !options.target ) {

          //  Sometimes the manifest may be missing entirely
          //  or it has an options object that doesn't have a `target` property

          var manifestopts = "options" in manifest && manifest.options;

          options.target = manifestopts && "target" in manifestopts && manifestopts.target;
        }

        setup._setup.call( this, options );
      }

      Popcorn.addTrackEvent( this, options );

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

    //  Augment the manifest object
    if ( manifest || ( "manifest" in definition ) ) {
      Popcorn.manifest[ name ] = manifest || definition.manifest;
    }

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

  //  Popcorn Plugin Inheritance Helper Methods
  //  Internal use only
  Popcorn.plugin.getDefinition = function( name ) {

    var registry = Popcorn.registryByName;

    if ( registry[ name ] ) {
      return registry[ name ];
    }

    Popcorn.error( "Cannot inherit from " + name + "; Object does not exist" );
  };

  //  Internal use only
  Popcorn.plugin.delegate = function( instance, name, plugins ) {

    return function() {
      var args = arguments;
      plugins.forEach( function( plugin ) {
        // The new plugin simply calls the delegated methods on
        // all of its parents in the order they were specified.
        plugin[ name ] && plugin[ name ].apply( instance, args );
      });
    };
  };

  //  Plugin inheritance
  Popcorn.plugin.inherit = function( name, parents, definition, manifest ) {


    // Get the names of all of the ancestor classes, in the order that
    // we will be calling them. The override is for the class we're
    // currently defining, since it's not in the registry yet.
    var ancestors = [],
        pluginFn, entry;

    function getAncestors( name, override ) {
      var parents = override || Popcorn.plugin.getDefinition( name ).parents;
      for ( var i in parents ) {
        if ( hasOwn.call( parents, i ) ) {
          var p = parents[ i ];
          getAncestors( p );
          if ( ancestors.indexOf( p ) === -1 ) {
            ancestors.push( p );
          }
        }
      }
    }

    getAncestors( name, Popcorn.isArray( parents ) ? parents : [ parents ] );
    ancestors.push( name );

    // Now create the requested plugin under the reqested name.
    pluginFn = Popcorn.plugin( name, function( options ) {

      var self = this,
          plugins;

      function instantiate( definition ) {
        return definition.call && definition.call( self, options ) || definition;
      }

      // When the newly-defined plugin is instantiated, it must
      // explicitly instantiate all of its ancestors.
      plugins = ancestors.map( function( name ) {
        return instantiate( Popcorn.plugin.getDefinition( name ).base );
      });

      return {
        _setup: Popcorn.plugin.delegate( self, "_setup", plugins ),
        start: Popcorn.plugin.delegate( self, "start", plugins ),
        end: Popcorn.plugin.delegate( self, "end", plugins )
      };

    }, manifest || definition.manifest );

    entry = Popcorn.plugin.getDefinition( name );
    entry.base = definition;
    entry.parents = parents;

    return pluginFn;
  };

  // Augment Popcorn;
  Popcorn.inherit = Popcorn.plugin.inherit;

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

    var data, json = null;

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

    //  If this is a script request, ensure that we do not call something that has already been loaded
    if ( isScript ) {

      var scripts = document.querySelectorAll( "script[src=\"" + url + "\"]" );

      //  If there are scripts with this url loaded, early return
      if ( scripts.length ) {

        //  Execute success callback and pass "exists" flag
        success && success( true );

        return;
      }
    }

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

        success && success( data );
        isFired = true;

      };

      //  Replace callback param and callback name
      url = url.replace( parts.join( "=" ), parts[ 0 ] + "=" + callback );

    }

    script.onload = script.onreadystatechange = function() {

      if ( !script.readyState || /loaded|complete/.test( script.readyState ) ) {

        //  Handling remote script loading callbacks
        if ( isScript ) {

          //  getScript
          success && success();
        }

        //  Executing for JSONP requests
        if ( isFired ) {

          //  Garbage collect the callback
          delete window[ callback ];

          //  Garbage collect the script resource
          head.removeChild( script );
        }
      }
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
        //Hours and minutes are optional
        //Seconds must be specified
        //Seconds can be followed by milliseconds OR by the frame information
        var validTimeFormat = /^([0-9]+:){0,2}[0-9]+([.;][0-9]+)?$/,
            errorMessage = "Invalid time format";

        if ( typeof timeStr === "number" ) {
          return timeStr;
        } else if ( typeof timeStr === "string" ) {
          if ( ! validTimeFormat.test( timeStr ) ) {
            Popcorn.error( errorMessage );
          }
        } else {
          Popcorn.error( errorMessage );
        }

        var t = timeStr.split( ":" ),
            lastIndex = t.length - 1,
            lastElement = t[ lastIndex ];

        //Fix last element:
        if ( lastElement.indexOf( ";" ) > -1 ) {
          var frameInfo = lastElement.split( ";" ),
              frameTime = 0;

          if ( framerate && ( typeof framerate === "number" ) ) {
              frameTime = parseFloat( frameInfo[ 1 ], 10 ) / framerate;
          }

          t[ lastIndex ] =
            parseInt( frameInfo[ 0 ], 10 ) + frameTime;
        }

        if ( t.length === 1 ) {
          return parseFloat( t[ 0 ], 10 );
        } else if ( t.length === 2 ) {
          return ( parseInt( t[ 0 ], 10 ) * 60 ) + parseFloat( t[ 1 ], 10 );
        } else if ( t.length === 3 ) {
          return ( parseInt( t[ 0 ], 10 ) * 3600 ) +
                 ( parseInt( t[ 1 ], 10 ) * 60 ) +
                 parseFloat( t[ 2 ], 10 );
        }
    }
  };

  //  Exposes Popcorn to global context
  global.Popcorn = Popcorn;

  document.addEventListener( "DOMContentLoaded", function() {

    //  Supports non-specific elements
    var dataAttr = "data-timeline-sources",
        medias = document.querySelectorAll( "[" + dataAttr + "]" );

    Popcorn.forEach( medias, function( idx, key ) {

      var media = medias[ key ],
          hasDataSources = false,
          dataSources, data, popcornMedia;

      //  Ensure that the DOM has an id
      if ( !media.id ) {

        media.id = Popcorn.guid( "__popcorn" );
      }

      //  Ensure we're looking at a dom node
      if ( media.nodeType && media.nodeType === 1 ) {

        popcornMedia = Popcorn( "#" + media.id );

        dataSources = ( media.getAttribute( dataAttr ) || "" ).split( "," );

        if ( dataSources[ 0 ] ) {

          Popcorn.forEach( dataSources, function( source ) {

            // split the parser and data as parser!file
            data = source.split( "!" );

            // if no parser is defined for the file, assume "parse" + file extension
            if ( data.length === 1 ) {

              data = source.split( "." );
              data[ 0 ] = "parse" + data[ data.length - 1 ].toUpperCase();
              data[ 1 ] = source;
            }

            //  If the media has data sources and the correct parser is registered, continue to load
            if ( dataSources[ 0 ] && popcornMedia[ data[ 0 ] ] ) {

              //  Set up the media and load in the datasources
              popcornMedia[ data[ 0 ] ]( data[ 1 ] );

            }
          });

        }

        //  Only play the media if it was specified to do so
        if ( !!popcornMedia.autoplay ) {
          popcornMedia.play();
        }

      }
    });
  }, false );

})(window, window.document);

