(function( global, doc ) {
  Popcorn.baseplayer = function() {
    return new Popcorn.baseplayer.init();
  };

  Popcorn.baseplayer.init = function() {
    this.readyState = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.paused = 1;
    this.ended = 0;
    this.volume = 1;
    this.muted = 0;
    this.playbackRate = 1;

    // These are considered to be "on" by being defined. Initialize to undefined
    this.autoplay;
    this.loop;
    
    // List of events
    this._events = {};
    
    // The underlying player resource. May be <canvas>, <iframe>, <object>, array, etc
    this._resource;
    // The container div of the resource
    this._container;
    
    this.offsetWidth = this.width = 0;
    this.offsetHeight = this.height = 0;
    this.offsetLeft = 0;
    this.offsetTop = 0;
    this.offsetParent;
  };

  Popcorn.baseplayer.init.prototype = {
    load: function() {},
    
    play: function() {
      this.paused = 0;
      this.timeupdate();
    },
    
    pause: function() {
      this.paused = 1;
    },
    
    timeupdate: function() {
      // The player was paused since the last time update
      if ( this.paused ) {
        return;
      }

      // So we can refer to the instance when setTimeout is run
      var self = this;
      this.currentTime += 0.015;
      
      this.dispatchEvent( "timeupdate" );
      setTimeout( function() {
        self.timeupdate.call( self );
      }, 15 );
    },
    
    // By default, assumes this.resource is a DOM Element
    // Changing the type of this.resource requires this method to be overridden
    getBoundingClientRect: function() {
			return Popcorn.position( this._resource || this._container );
	  },
    
    // Add an event listener to the object
    addEventListener: function( evtName, fn ) {
      if ( !this._events[evtName] ) {
        this._events[evtName] = [];
      }
      
      this._events[evtName].push( fn );
      return fn;
    },
    
    // Can take event object or simple string
    dispatchEvent: function( oEvent ) {
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
      
      Popcorn.forEach( this._events[eventName], function( val ) {
        val.call( self, evt, self );
      });
    },
    
    // Extracts values from container onto this object
    extractContainerValues: function( id ) {
      this._container = document.getElementById( id );
      
      if ( !this._container ) {
        return;
      }
      
      var bounds = this._container.getBoundingClientRect();
      
      this.offsetWidth = this.width = this.getStyle( "width" ) || 0;
      this.offsetHeight = this.height = this.getStyle( "height" ) || 0;
      this.offsetLeft = bounds.left;
      this.offsetTop = bounds.top;
      this.offsetParent = this._container.offsetParent;
      
      return this._container;
    },
    
    // By default, assumes this.resource is a DOM Element
    // Changing the type of this.resource requires this method to be overridden
    // Returns the computed value for CSS style 'prop' as computed by the browser
    getStyle: function( prop ) {

      var elem = this._resource || this._container;
      
      if ( elem.currentStyle ) {
        // IE syntax
        return elem.currentStyle[prop];
      } else if ( global.getComputedStyle ) {
        // Firefox, Chrome et. al
        return doc.defaultView.getComputedStyle( elem, null ).getPropertyValue( prop );
      } else {
        // Fallback, just in case
        return elem.style[prop];
      }
    }
  };
})( window, document );
