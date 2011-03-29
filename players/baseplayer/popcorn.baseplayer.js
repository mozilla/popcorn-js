Popcorn.baseplayer = function() {
  return new Popcorn.baseplayer.init();
}

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
  this.events = {};
}

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
  
  // Add an event listener to the object
  addEventListener: function( evtName, fn ) {
    if ( !this.events[evtName] ) {
      this.events[evtName] = [];
    }
    
    this.events[evtName].push( fn );
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
    
    Popcorn.forEach( this.events[eventName], function( val ) {
      val.call( self, evt, self );
    });
  }
};