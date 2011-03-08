(function(global, document) {

  //  Cache refs to speed up calls to native utils
  var
  forEach = Array.prototype.forEach,
  hasOwn = Object.prototype.hasOwnProperty,
  slice = Array.prototype.slice,

  //  ID string matching
  rIdExp  = /^(#([\w\-\_\.]+))$/,

  // ready fn cache
  readyStack = [],
  readyBound = false,
  readyFired = false,


  //  Declare a pseudo-private constructor
  //  Returns an instance object.
  Popcorn = function( entity ) {
    //  Return new Popcorn object
    return new Popcorn.p.init( entity );
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
        instanceId = instance.video.id && instance.video.id;

    //  If the video element has its own `id` use it, otherwise provide one
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

    init: function( entity ) {

      var elem, matches;

      //  Supports Popcorn(function () { /../ })
      //  Originally proposed by Daniel Brooks

      if ( typeof entity === "function" ) {

        //  If document ready has already fired
        if ( document.readyState === "interactive" || document.readyState === "complete" ) {

          entity(document, Popcorn);

          return;
        }


        readyStack.push( entity );

        //  This process should happen once per page load
        if ( !readyBound ) {

          //  set readyBound flag
          readyBound = true;

          var DOMContentLoaded  = function () {

            readyFired = true;

            //  remove this listener
            document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );

            //  Execute all ready function in the stack
            for ( var i = 0; i < readyStack.length; i++ ) {

              readyStack[i].call( document, Popcorn );

            }
            //  GC readyStack
            readyStack = null;
          };

          document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false);
        }



        return;
      }


      matches = rIdExp.exec( entity );

      if ( matches.length && matches[2]  ) {
        elem = document.getElementById(matches[2]);
      }


      this.video = elem ? elem : null;
      
      Popcorn.addInstance(this);

      this.data = {
        history: [],
        events: {},
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

      var isReady = function( that ) {

        if ( that.video.readyState >= 2 ) {
          // adding padding to the front and end of the arrays
          // this is so we do not fall off either end

          var duration = that.video.duration;
          // Check for no duration info (NaN)
          var videoDurationPlus = duration != duration ? Number.MAX_VALUE : duration + 1;

          Popcorn.addTrackEvent( that, {
            start: videoDurationPlus,
            end: videoDurationPlus
          });

          that.video.addEventListener( "timeupdate", function( event ) {

            var currentTime    = this.currentTime,
                previousTime   = that.data.trackEvents.previousUpdateTime,
                tracks         = that.data.trackEvents,
                tracksByEnd    = tracks.byEnd,
                tracksByStart  = tracks.byStart;

            // Playbar advancing
            if ( previousTime < currentTime ) {

              while ( tracksByEnd[ tracks.endIndex ] && tracksByEnd[ tracks.endIndex ].end <= currentTime ) {
                // if plugin does not exist on this instance, remove it
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
                // if plugin does not exist on this instance, remove it
                if ( !tracksByStart[ tracks.startIndex ]._natives || !!that[ tracksByStart[ tracks.startIndex ]._natives.type ] ) {
                  if ( tracksByStart[ tracks.startIndex ].end > currentTime && tracksByStart[ tracks.startIndex ]._running === false ) {
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
                  if ( tracksByEnd[ tracks.endIndex ].start <= currentTime && tracksByEnd[ tracks.endIndex ]._running === false ) {
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
            /*
            //  This empty block causes errors with jslint

            else {
              // When user seeks, currentTime can be equal to previousTime on the
              // timeUpdate event. We are not doing anything with this right now, but we
              // may need this at a later point and should be aware that this behavior
              // happens in both Chrome and Firefox.
            }
            */
            tracks.previousUpdateTime = currentTime;

          }, false);
        } else {
          global.setTimeout( function() {
            isReady( that );
          }, 1);
        }
      };

      isReady( this );

      return this;
    }
  };

  //  This trick allows our api methods to be chained to
  //  instance references.
  Popcorn.p.init.prototype = Popcorn.p;

  Popcorn.forEach = function( obj, fn, context ) {

    if ( !obj || !fn ) {
      return {};
    }

    context = context || this;
    // Use native whenever possible
    if ( forEach && obj.forEach === forEach ) {
      return obj.forEach(fn, context);
    }

    for ( var key in obj ) {
      if ( hasOwn.call(obj, key) ) {
        fn.call(context, obj[key], key, obj);
      }
    }

    return obj;
  };

  Popcorn.extend = function( obj ) {
    var dest = obj, src = slice.call(arguments, 1);

    Popcorn.forEach( src, function( copy ) {
      for ( var prop in copy ) {
        dest[prop] = copy[prop];
      }
    });
    return dest;
  };


  // A Few reusable utils, memoized onto Popcorn
  Popcorn.extend( Popcorn, {
    error: function( msg ) {
      throw msg;
    },
    guid: function( prefix ) {
      Popcorn.guid.counter++;
      return  ( prefix ? prefix : '' ) + ( +new Date() + Popcorn.guid.counter );
    },
    sizeOf: function ( obj ) {
      var size = 0;

      for ( var prop in obj  ) {
        size++;
      }

      return size;
    },
    nop: function () {}
  });

  //  Memoization property
  Popcorn.guid.counter  = 1;

  //  Simple Factory pattern to implement getters, setters and controllers
  //  as methods of the returned Popcorn instance. The immediately invoked function
  //  creates and returns an object of methods
  Popcorn.extend(Popcorn.p, (function () {

      // todo: play, pause, mute should toggle
      var methods = "load play pause currentTime playbackRate mute volume duration",
          ret = {};


      //  Build methods, store in object that is returned and passed to extend
      Popcorn.forEach( methods.split(/\s+/g), function( name ) {

        ret[ name ] = function( arg ) {

          if ( typeof this.video[name] === "function" ) {
            this.video[ name ]();

            return this;
          }


          if ( arg !== false && arg !== null && typeof arg !== "undefined" ) {

            this.video[ name ] = arg;

            return this;
          }

          return this.video[ name ];
        };
      });

      return ret;

    })()
  );

  Popcorn.extend(Popcorn.p, {

    //  getting properties
    roundTime: function () {
      return -~this.video.currentTime;
    },
    
    exec: function ( time, fn ) {

      // creating a one second track event with an empty end
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

  Popcorn.events  = {


    isNative: function( type ) {

      var checks = Popcorn.Events.Natives.split(/\s+/g);

      for ( var i = 0; i < checks.length; i++ ) {
        if ( checks[i] === type ) {
          return true;
        }
      }

      return false;
    },
    getInterface: function( type ) {

      if ( !Popcorn.events.isNative( type ) ) {
        return false;
      }

      var natives = Popcorn.Events, proto;

      for ( var p in natives ) {
        if ( p !== "Natives" && natives[p].indexOf(type) > -1 ) {
          proto = p;
        }
      }

      return proto;

    },


    all: Popcorn.Events.Natives.split(/\s+/g),

    fn: {
      trigger: function ( type, data ) {

        //  setup checks for custom event system
        if ( this.data.events[type] && Popcorn.sizeOf(this.data.events[type]) ) {

          var eventInterface  = Popcorn.events.getInterface(type);

          if ( eventInterface ) {

            var evt = document.createEvent( eventInterface );
                evt.initEvent(type, true, true, global, 1);

            this.video.dispatchEvent(evt);

            return this;
          }

          //  Custom events
          Popcorn.forEach(this.data.events[type], function ( obj, key ) {

            obj.call( this, data );

          }, this);

        }

        return this;
      },
      listen: function ( type, fn ) {

        var self = this, hasEvents = true;

        if ( !this.data.events[type] ) {
          this.data.events[type] = {};
          hasEvents = false;
        }

        //  Register
        this.data.events[type][ fn.name || ( fn.toString() + Popcorn.guid() ) ] = fn;

        // only attach one event of any type
        if ( !hasEvents && Popcorn.events.all.indexOf( type ) > -1 ) {

          this.video.addEventListener( type, function( event ) {

            Popcorn.forEach( self.data.events[type], function ( obj, key ) {
              if ( typeof obj === "function" ) {
                obj.call(self, event);
              }

            });

            //fn.call( self, event );

          }, false);
        }
        return this;
      },
      unlisten: function( type, fn ) {

        if ( this.data.events[type] && this.data.events[type][fn] ) {

          delete this.data.events[type][ fn ];

          return this;
        }

        this.data.events[type] = null;
        
        return this;        
      }
    }
  };

  //  Extend listen and trigger to all Popcorn instances
  Popcorn.forEach( ["trigger", "listen", "unlisten"], function ( key ) {
    Popcorn.p[key] = Popcorn.events.fn[key];
  });

  Popcorn.protect = {
    natives: "load play pause currentTime playbackRate mute volume duration removePlugin roundTime trigger listen unlisten".toLowerCase().split(/\s+/)
  };


  Popcorn.addTrackEvent = function( obj, track ) {

    if ( track._natives ) {
      // supports user defined track event id
      track._id = !track.id ? Popcorn.guid( track._natives.type ) : track.id;

      //  Push track event ids into the history
      obj.data.history.push( track._id );

      track._natives.start = track._natives.start || Popcorn.nop;
      track._natives.end = track._natives.end || Popcorn.nop;
    }

    // Store this definition in an array sorted by times
    obj.data.trackEvents.byStart.push( track );
    obj.data.trackEvents.byEnd.push( track );
    obj.data.trackEvents.byStart.sort( function( a, b ){
      return ( a.start - b.start );
    });
    obj.data.trackEvents.byEnd.sort( function( a, b ){
      return ( a.end - b.end );
    });

  };

  // removePlugin( type ) removes all tracks of that from all instances of popcorn
  // removePlugin( obj, type ) removes all tracks of type from obj, where obj is a single instance of popcorn
  Popcorn.removePlugin = function( obj, name ) {

    // check if we are removing plugin from an instance or from all of Popcorn
    if ( !name ) {

      // all of Popcorn it is

      // fix the order
      name = obj;
      obj = Popcorn.p;

      var registryLength = Popcorn.registry.length,
          registryIndex;

      // remove plugin reference from registry
      for ( registryIndex = 0; registryIndex < registryLength; registryIndex++ ) {
        if ( Popcorn.registry[ registryIndex ].type === name ) {
          Popcorn.registry.splice( registryIndex, 1 );

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


    Popcorn.forEach( obj.data.trackEvents.byStart, function( o, i, context) {
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
    obj.data.trackEvents.byEnd = byEnd;


    for ( var i = 0; i < historyLen; i++ ) {
      if ( obj.data.history[i] !== trackId ) {
        history.push( obj.data.history[i] );
      }
    }

    obj.data.history = history;

  };

  Popcorn.getTrackEvents = function( obj ) {

    var trackevents = [];

    Popcorn.forEach( obj.data.trackEvents.byStart, function(o, i, context) {
      if ( o._id ) {
        trackevents.push(o);
      }
    });

    return trackevents;
  };


  Popcorn.getLastTrackEventId = function( obj ) {
    return obj.data.history[ obj.data.history.length - 1 ];
  };

  //  Map TrackEvents functions to the {popcorn}.prototype
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
      Popcorn.forEach( setup, function ( callback, type ) {

        if ( type !== "type" ) {

          if ( reserved.indexOf(type) === -1 ) {

            this.listen( type, callback );
          }
        }

      }, this);

      return this;
    };

    //  Augment the manifest object
    if ( manifest || ( "manifest" in definition ) ) {
      Popcorn.manifest[ name ] = manifest || definition.manifest;
    }

    //  Assign new named definition
    plugin[ name ] = function( options ) {
      return pluginFn.call( this,
                            isfn ? definition.call( this, options )
                                 : definition, options );
    };

    //  Extend Popcorn.p with new named definition
    Popcorn.extend( Popcorn.p, plugin );

    //  Push into the registry
    Popcorn.registry.push( Popcorn.extend( plugin, {
      type: name
    }) );

    return plugin;
  };

  // stores parsers keyed on filetype
  Popcorn.parsers = {};

  // An interface for extending Popcorn
  // with parser functionality
  Popcorn.parser = function( name, type, definition ) {

    if ( Popcorn.protect.natives.indexOf( name.toLowerCase() ) >= 0 ) {
      Popcorn.error("'" + name + "' is a protected function name");
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
    
    parseFn = function ( filename, callback ) {
        
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
    url: '',
    data: '',
    dataType: '',
    success: Popcorn.nop,
    type: 'GET',
    async: true,
    xhr: function()  {
      return new global.XMLHttpRequest();
    }
  };

  Popcorn.xhr = function ( options ) {

    if ( options.dataType && 
          ( options.dataType.toLowerCase() === "jsonp" || 
              options.dataType.toLowerCase() === "script" ) ) {

      Popcorn.xhr.getJSONP(
        options.url,
        options.success, 
        options.dataType.toLowerCase() === "script"
      );
      return;
    }

    var settings = Popcorn.extend( {}, setup, options );

    //  Create new XMLHttpRequest object
    settings.ajax  = settings.xhr();

    //  Normalize dataType
    settings.dataType  = settings.dataType.toLowerCase();


    if ( settings.ajax ) {

      if ( settings.type === "GET" && settings.data ) {

        //  append query string
        settings.url += ( rparams.test( settings.url ) ? "&" : "?") + settings.data;

        //  Garbage collect and reset settings.data
        settings.data = null;
      }


      settings.ajax.open( settings.type, settings.url, settings.async );
      settings.ajax.send( settings.data || null );

      return Popcorn.xhr.httpData( settings );
    }
  };


  Popcorn.xhr.httpData = function ( settings ) {

    var data, json = null;

    settings.ajax.onreadystatechange = function() {

      if ( settings.ajax.readyState === 4 ) {

        try {
          json = JSON.parse(settings.ajax.responseText);
        } catch(e) {
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
  
  Popcorn.xhr.getJSONP = function ( url, success, isScript ) {
    
    //  If this is a script request, ensure that we do not call something that has already been loaded
    if ( isScript ) {
      
      var scripts = document.querySelectorAll('script[src="' + url + '"]');
      
      //  If there are scripts with this url loaded, early return      
      if ( scripts.length ) {
      
        //  Execute success callback and pass "exists" flag
        success && success( true );

        return;
      }
    }

    var head = document.getElementsByTagName("head")[0] || document.documentElement,
      script = document.createElement("script"), 
      paramStr = url.split("?")[1], 
      fired = false, 
      params = [], 
      callback, parts, callparam;
    
    if ( paramStr && !isScript ) {
      params = paramStr.split("&");
    }

    if ( params.length ) {
      parts = params[ params.length - 1 ].split("=");
    }
    
    callback = params.length ? ( parts[1] ? parts[1] : parts[0]  ) : "jsonp";    
    
    if ( !paramStr && !isScript ) {
      url += "?callback=" + callback;
    }

    if ( callback && !isScript ) {
      
      //  If a callback name already exists...
      if ( !!window[ callback ] ) {
      
        //  Create a new unique callback name
        callback = Popcorn.guid( callback );
      }
      
      //  Define the jsonp success callback globally
      window[ callback ] = function ( data ) {

        success && success( data );
        fired = true;

      };
      
      //  Replace callback param and callback name
      url = url.replace( parts.join("="), parts[0] + "=" + callback );
      
    }
    
    script.src = url;
    
    script.onload = script.onreadystatechange = function() {

      //  Executing remote scripts
      if ( isScript && ( !script.readyState || /loaded|complete/.test( script.readyState ) ) ) {

        success && success();

      }

      //  Executing for JSONP requests
      if ( fired || /loaded|complete/.test( script.readyState ) ) {

        //  Garbage collect the callback
        delete window[ callback ];
        
        //  Garbage collect the script resource
        head.removeChild( script );
      }
    };  

    head.insertBefore( script, head.firstChild );
    
    return;
  
  };
  
  Popcorn.getJSONP = Popcorn.xhr.getJSONP;
  
  Popcorn.getScript = Popcorn.xhr.getScript = function( url, success ) {

    return Popcorn.xhr.getJSONP( url, success, true );
  };


  //  Exposes Popcorn to global context
  global.Popcorn = Popcorn;

  document.addEventListener( "DOMContentLoaded", function () {

    var videos = document.getElementsByTagName( "video" );

    Popcorn.forEach( videos, function ( iter, key ) {

      var video = videos[ key ],
          hasDataSources = false,
          dataSources, data, popcornVideo;

      //  Ensure that the DOM has an id
      if ( !video.id ) {

        video.id = Popcorn.guid( "__popcorn" );

      }

      //  Ensure we're looking at a dom node
      if ( video.nodeType && video.nodeType === 1 ) {

        popcornVideo = Popcorn( "#" + video.id );

        dataSources = ( video.getAttribute( "data-timeline-sources" ) || "" ).split(",");

        if ( dataSources[ 0 ] ) {

          Popcorn.forEach( dataSources, function ( source ) {

            // split the parser and data as parser:file
            data = source.split( ":" );

            // if no parser is defined for the file, assume "parse" + file extension
            if ( data.length === 1 ) {

              data = source.split( "." );
              data[ 0 ] = "parse" + data[ data.length - 1 ].toUpperCase();
              data[ 1 ] = source;
              
            }

            //  If the video has data sources and the correct parser is registered, continue to load
            if ( dataSources[ 0 ] && popcornVideo[ data[ 0 ] ] ) {

              //  Set up the video and load in the datasources
              popcornVideo[ data[ 0 ] ]( data[ 1 ] );

            }
          });

        }

        //  Only play the video if it was specified to do so
        if ( !!popcornVideo.autoplay ) {
          popcornVideo.play();
        }

      }
    });
  }, false );

})(window, window.document);
