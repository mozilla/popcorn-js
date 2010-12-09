(function(global) {

  //  Cache refs to speed up calls to native utils
  var  
  forEach = Array.prototype.forEach, 
  hasOwn = Object.prototype.hasOwnProperty, 
  slice = Array.prototype.slice,

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
        tracks: []
      };
      
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



    toTrack: function( setup ) {
      /*
      {
        in: ts,
        out: ts, 
        command: f()
      }
      */
      // stores the command in a track
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
                              Popcorn.Events.Events,
  
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
    natives: "load play pause currentTime playbackRate mute volume duration".toLowerCase().split(/\s+/)
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
        reserved = [ "start", "end", "timeupdate" ], 
        plugin = {}, 
        pluginFn, 
        setup;
    
    if ( typeof definition === "object" ) {
      
      setup = definition;
      
      if ( !( "timeupdate" in setup ) ) {
        setup.timeupdate = Popcorn.nop;
      }         

      pluginFn  = function ( options ) {
        
        var self = this, 
            fired = {
              start: 0, 
              end: 0
            };
        
        if ( !options ) {
          return this;
        } 
        
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
        
        //  Plugin timeline handler 
        this.listen( "timeupdate", function( event ) {
          
          
          if ( ~~self.currentTime() === options.start || 
                  self.currentTime() === options.start ) {
            
            !fired.start && setup.start.call(self, event, options);
            fired.start++;
          }

          if ( self.currentTime() > options.start && 
                self.currentTime() < options.end ) {
            
            setup.timeupdate.call(self, event, options);
          }

          if ( ~~self.currentTime() === options.end || 
                  self.currentTime() === options.end ) {
                
            !fired.end && setup.end.call(self, event, options);
            fired.end++;
          }
          
        });
        
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
  

  global.Popcorn = Popcorn;
  
})(window);
