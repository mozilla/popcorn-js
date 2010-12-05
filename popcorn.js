//  Immediately invoked function expression is used to 
//  create a pseudo-private scope for our api definition
//  a reference to the `window` object is passed into the
//  closure and referenced as `global`. This is both 
//  beneficial for compressors and provides a fast 
//  reference to the window context
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
    //  Return new instance of
    //  Popcorn.prototype.instance constructor
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
    guid: function() {
      return +new Date() + Math.floor(Math.random()*11);
    }, 
    sizeOf: function ( obj ) {
      var size = 0;

      for ( var prop in obj  ) {
        size++;
      }

      return size;
    }
  });    
  
  //  Simple Factory pattern to implement native 
  //  getters/setters and controllers 
  //  as methods of the returned Popcorn instance
  //  The immediately invoked function creates 
  //  and returns an object of methods
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
    
    setCommand: function() {
    
    }, 
    getCommand: function() {
    
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
  
  var nativeEvents = "loadstart progress suspend emptied stalled play pause " + 
                     "loadedmetadata loadeddata waiting playing canplay canplaythrough " + 
                     "seeking seeked timeupdate ended ratechange durationchange volumechange";
  
  Popcorn.events  = {
    //todo, fix types to be custom, natives will be native only
    types: nativeEvents.split(/\s+/g),
    natives: nativeEvents.split(/\s+/g),
    custom: [ "frame" ], 
    all: [ "frame" ].concat( nativeEvents.split(/\s+/g) ), 
    fn: {
      trigger: function ( type, data ) {
        
        //  setup checks for custom event system
        if ( this.data.events[type] && Popcorn.sizeOf(this.data.events[type]) ) {
          
          var evt = document.createEvent("Events");
              evt.initEvent(type, true, true, window, 1);
          
          this.video.dispatchEvent(evt);
        
          /*
          
          TODO: implement some form of custom event system
          Popcorn.forEach(this.data.events[type], function ( obj, key ) {

            //obj.call(_target, _data);
            
            // update to dispatch an event

          });
          */
        }
      }, 
      listen: function ( type, fn ) {
        
        var self = this, hasEvents = true;
        
        if ( !this.data.events[type] ) {
          this.data.events[type] = {};
          hasEvents = false;
        }
        
        //  Register 
        this.data.events[type][ fn.toString() + Popcorn.guid() ] = fn;
        
        // only attach one event of any type          
        if (!hasEvents && Popcorn.events.all.indexOf( type ) > -1 ) {

          this.video.addEventListener( type, function( event ) {
            
            Popcorn.forEach( self.data.events[type], function ( obj, key ) {
              obj.call(self, event);
            });
            
            //fn.call( self, event );
          
          }, false);          
        }
        return this;
      }, 
      unlisten: function( type ) {
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
  
  //  Plugins are registered 
  Popcorn.registry = [];
  //  An interface for extending Popcorn 
  //  with plugin functionality
  Popcorn.plugin = function( name, definition ) {

    //  Provides some sugar, but ultimately extends
    //  the definition into Popcorn.p 
    
    var plugin = {}, setup;
    
    
    
    if ( typeof definition === "object" ) {
      
      setup = definition;
      
      
      definition  = function ( options ) {
        
        var self = this;
        
        if ( !options ) {
          return this;
        } 
        
        if ( !( "start" in options ) ) {
          options.start = 0;
        }
        
        if ( !( "end" in options ) ) {
          options.end = this.duration();
        }
        
        this.video.addEventListener( "timeupdate", function( event ) {
          
          
          if ( ~~self.currentTime() === options.start || 
                  self.currentTime() === options.start ) {
          
            setup.start.call(self, event, options);
          }

          if ( self.currentTime() > options.start && 
                self.currentTime() < options.end ) {
            
            setup.timeupdate.call(self, event, options);
            
          }

          if ( ~~self.currentTime() === options.end || 
                  self.currentTime() === options.end ) {
                
            setup.end.call(self, event, options);
          }
          
        });
      
        
        return this;
      };
    }

    
    plugin[ name ] = definition;
    
    Popcorn.extend( Popcorn.p, plugin );
    
    Popcorn.registry.push({ 
      name: name,
      plugin: plugin
    });
    
    //  within the context of a plugin
    //  any of the events can be listened to 
  };
  

  global.Popcorn = Popcorn;
  
})(window);
