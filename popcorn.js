(function(global) {

  //  Cache refs to speed up calls to native utils
  var  
  forEach = Array.prototype.forEach, 
  hasOwn = Object.prototype.hasOwnProperty, 
  slice = Array.prototype.slice,

  // intentionally left undefined
  undef,

  //  ID string matching
  rIdExp  = /^(#([\w\-\_\.]+))$/, 

  //  Declare a pseudo-private constructor
  //  This constructor returns the instance object.    
  Popcorn = function( entity ) {
    //  Return new Popcorn object
    return new Popcorn.p.init( entity );
  };

  //  Declare a shortcut (Popcorn.p) to and a definition of 
  //  the new prototype for our Popcorn constructor 
  Popcorn.p = Popcorn.prototype = {

    init: function( entity ) {

      var elem, matches;

      matches = rIdExp.exec( entity );
      
      if ( matches.length && matches[2]  ) {
        elem = document.getElementById(matches[2]);
      }
      
      this.video = elem ? elem : null;
      
      this.data = {
        events: {},
        trackEvents: {
          byStart: [{start: -1, end: -1}],
          byEnd:   [{start: -1, end: -1}],
          startIndex: 0,
          endIndex:   0,
          previousUpdateTime: 0
        }
      };
      
      var isReady = function( that ) {

        if ( that.video.readyState >= 3 ) {
          // adding padding to the front and end of the arrays
          // this is so we do not fall off either end

          var videoDurationPlus = that.video.duration + 1;
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

              while ( tracksByEnd[tracks.endIndex] && tracksByEnd[tracks.endIndex].end <= currentTime ) {
                if ( tracksByEnd[tracks.endIndex].running === true ) {
                  tracksByEnd[tracks.endIndex].running = false;
                  tracksByEnd[tracks.endIndex].natives.end.call( that, event, tracksByEnd[tracks.endIndex] );
                }
                tracks.endIndex++;
              }
              
              while ( tracksByStart[tracks.startIndex] && tracksByStart[tracks.startIndex].start <= currentTime ) {
                if ( tracksByStart[tracks.startIndex].end > currentTime && tracksByStart[tracks.startIndex].running === false ) {
                  tracksByStart[tracks.startIndex].running = true;
                  tracksByStart[tracks.startIndex].natives.start.call( that, event, tracksByStart[tracks.startIndex] );
                }
                tracks.startIndex++;
              }

            // Playbar receding
            } else if ( previousTime > currentTime ) {

              while ( tracksByStart[tracks.startIndex] && tracksByStart[tracks.startIndex].start > currentTime ) {
                if ( tracksByStart[tracks.startIndex].running === true ) {
                  tracksByStart[tracks.startIndex].running = false;
                  tracksByStart[tracks.startIndex].natives.end.call( that, event, tracksByStart[tracks.startIndex] );
                }
                tracks.startIndex--;
              }
              
              while ( tracksByEnd[tracks.endIndex] && tracksByEnd[tracks.endIndex].end > currentTime ) {
                if ( tracksByEnd[tracks.endIndex].start <= currentTime && tracksByEnd[tracks.endIndex].running === false ) {
                  tracksByEnd[tracks.endIndex].running = true;
                  tracksByEnd[tracks.endIndex].natives.start.call( that, event, tracksByEnd[tracks.endIndex] );
                }
                tracks.endIndex--;
              }
            } else {
              // When user seeks, currentTime can be equal to previousTime on the
              // timeUpdate event. We are not doing anything with this right now, but we
              // may need this at a later point and should be aware that this behavior
              // happens in both Chrome and Firefox.
            }

            tracks.previousUpdateTime = currentTime;
          }, false);
        } else {
          setTimeout( function() {
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

  Popcorn.addTrackEvent = function( obj, track ) {
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

  // A Few reusable utils, memoized onto Popcorn
  Popcorn.extend( Popcorn, {
    error: function( msg ) {
      throw msg;
    },
    guid: function() {
      return +new Date() + Math.floor(Math.random()*11);
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
      
      !fn && ( fn = Popcorn.nop );
      
      
      var timer = 0, 
          self  = this, 
          callback = function execCallback( event ) {
            
            if ( this.currentTime() >= time && !timer ) {
              
              fn.call(self, event);
              
              this.unlisten("execCallback");
              
              timer++;
            }
          };
      
      
      
      this.listen("timeupdate", callback);
      
      
      
      return this;
    },
    removePlugin: function( name ) {

      var byStart = this.data.trackEvents.byStart, 
          byEnd = this.data.trackEvents.byEnd;        
  
      delete Popcorn.p[ name ];
  
      // remove plugin reference from registry
      for ( var i = 0, rl = Popcorn.registry.length; i < rl; i++ ) {
        if ( Popcorn.registry[i].type === name ) {
          Popcorn.registry.splice(i, 1);
          break; // plugin found, stop checking
        }
      }

      // remove all trackEvents
      for ( var i = 0, sl = byStart.length; i < sl; i++ ) {
        if ( byStart[i] && byStart[i].natives && byStart[i].natives.type === name ) {
          byStart.splice( i, 1 );
          i--; sl--; // update for loop if something removed, but keep checking
          if ( this.data.trackEvents.startIndex <= i ) {
            this.data.trackEvents.startIndex--; // write test for this
          }
        }
      }
      for ( var i = 0, el = byEnd.length; i < el; i++ ) {
        if ( byEnd[i] && byEnd[i].natives && byEnd[i].natives.type === name ) {
          byEnd.splice( i, 1 );
          i--; el--; // update for loop if something removed, but keep checking
          if ( this.data.trackEvents.endIndex <= i ) {
            this.data.trackEvents.endIndex--; // write test for this
          }
        }
      }
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
          
          var interface  = Popcorn.events.getInterface(type);
          
          if ( interface ) {
          
            var evt = document.createEvent( interface );
                evt.initEvent(type, true, true, window, 1);          
          
            this.video.dispatchEvent(evt);
            
            return this;
          }        

          //  Custom events          
          Popcorn.forEach(this.data.events[type], function ( obj, key ) {

            obj.call( this, evt, data );
            
          }, this);
          
        }
        
        return this;
      }, 
      listen: function ( type, fn ) {
        
        var self = this, hasEvents = true, ns = '';
        
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
          this.data.events[type][fn]  = null;
          return this;
        }
      
        this.data.events[type] = null;
        return this;        
      },      
      special: {
        // handles timeline controllers
        play: function () {
          //  renders all of the interally stored track commands
        }
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
  
  //  Plugins are registered 
  Popcorn.registry = [];
  //  An interface for extending Popcorn 
  //  with plugin functionality
  Popcorn.plugin = function( name, definition ) {

    if ( Popcorn.protect.natives.indexOf( name.toLowerCase() ) >= 0 ) {
      Popcorn.error("'" + name + "' is a protected function name");
      return;
    }

    //  Provides some sugar, but ultimately extends
    //  the definition into Popcorn.p 
    
    var natives = Popcorn.events.all, 

        reserved = [ "start", "end"], 
        plugin = {type: name},
        pluginFn, 
        setup;
    
    if ( typeof definition === "object" ) {
      
      setup = definition;
      
      /*if ( !( "timeupdate" in setup ) ) {
        setup.timeupdate = Popcorn.nop;
      }*/        

      pluginFn  = function ( options ) {
        
        if ( !options ) {
          return this;
        } 
        
        // storing the plugin natives
        options.natives = setup;
        options.natives.type = name;
        options.running = false;

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
          setup._setup.call(self, options);
        }
        

        Popcorn.addTrackEvent( this, options );

        
        //  Future support for plugin event definitions 
        //  for all of the native events
        Popcorn.forEach( setup, function ( callback, type ) {
          
          if ( reserved.indexOf(type) === -1 ) {
            
            this.listen( type, callback );
          }
          
        }, this);
        
        return this;
      };
    }
    
    //  If a function is passed... 
    if ( typeof definition === "function" ) {
      
      //  Execute and capture returned object
      setup = definition.call(this);
      
      //  Ensure an object was returned 
      //  it has properties and isnt an array
      if ( typeof setup === "object" && 
            !( "length" in setup )  ) {
        
        Popcorn.plugin( name, setup );                
      }
      return;
    }
    
    //  Assign new named definition     
    plugin[ name ] = pluginFn;
    
    //  Extend Popcorn.p with new named definition
    Popcorn.extend( Popcorn.p, plugin );
    
    //  Push into the registry
    Popcorn.registry.push(plugin);
    
    
    return plugin;
  };
  
  
  var setup = {
    url: '',
    data: '',
    dataType: '',
    success: Popcorn.nop,
    type: 'GET',
    async: true, 
    xhr: function()  {
      return new XMLHttpRequest();
    }
  };   
  
  Popcorn.xhr = function ( options ) {

    var settings = Popcorn.extend( {}, setup, options );

    settings.ajax  = settings.xhr();
    
    if ( settings.ajax ) {

      settings.ajax.open( settings.type, settings.url, settings.async ); 
      settings.ajax.send( null ); 

      return Popcorn.xhr.httpData( settings );
    }       
  };

  
  Popcorn.xhr.httpData = function ( settings ) {
  
    var data, json = null,  
        
    onreadystatechange = settings.ajax.onreadystatechange = function() {

      if ( settings.ajax.readyState === 4 ) { 
        
        try {
          json = JSON.parse(settings.ajax.responseText);
        } catch(e) {
          //suppress
        };

        data = {
          xml: settings.ajax.responseXML, 
          text: settings.ajax.responseText, 
          json: json
        };

        settings.success.call( settings.ajax, data );
        
      } 
    }; 
    return data;  
  };
  

  global.Popcorn = Popcorn;
  
})(window);
