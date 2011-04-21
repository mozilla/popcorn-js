// Popcorn Vimeo Player Wrapper
( function( Popcorn, global ) {
  /**
  * Vimeo wrapper for Popcorn.
  * This player adds enables Popcorn.js to handle Vimeo videos. It does so by masking an embedded Vimeo video Flash object
  * as a video and implementing the HTML5 Media Element interface.
  *
  * You can specify the video in four ways:
  *  1. Use the embed code path supplied by Vimeo as a div's src, and pass the div id into a new Popcorn.vimeo object
  *
  *    <div id="player_1" width="500" height="281" src="http://player.vimeo.com/video/11127501" ></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.vimeo( "player_1" ) );
  *      }, false);
  *    </script>
  &
  *  2. Pass the div id and the embed code path supplied by Vimeo into a new Popcorn.vimeo object
  *
  *    <div id="player_1" width="500" height="281" ></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.vimeo( "player_1", "http://player.vimeo.com/video/11127501" ) );
  *      }, false);
  *    </script>
  *
  *  3. Use a web url as a div's src, and pass the div id into a new Popcorn.vimeo object
  *
  *    <div id="player_1" width="500" height="281" src="http://vimeo.com/11127501" ></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.vimeo( "player_1" ) );
  *      }, false);
  *    </script>
  *
  *  4. Pass the div id and the web url into a new Popcorn.vimeo object
  *
  *    <div id="player_1" width="500" height="281" ></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.vimeo( "player_1", "http://vimeo.com/11127501" ) );
  *      }, false);
  *    </script>
  *
  * Due to Vimeo's API, certain events must be subscribed to at different times, and some not at all.
  * These events are completely custom-implemented and may be subscribed to at any time:
  *   canplaythrough
  *   durationchange
  *   load
  *   loadedmetadata
  *   loadstart
  *   play
  *   readystatechange
  *   volumechange
  *
  * These events are related to player functionality and must be subscribed to during or after the load event:
  *   abort
  *   emptied
  *   ended
  *   pause
  *   playing
  *   progress
  *   seeked
  *   timeupdate
  *
  * These events are not supported:
  *   canplay
  *   error
  *   loadeddata
  *   ratechange
  *   seeking
  *   stalled
  *   suspend
  *   waiting
  *
  * Due to Vimeo's API, some attributes are be supported while others are not.
  * Supported media attributes:
  *   autoplay ( via Popcorn )
  *   currentTime
  *   duration ( get only )
  *   ended ( get only )
  *   initialTime ( get only, always 0 )
  *   loop ( get only, set by calling setLoop() )
  *   muted ( get only )
  *   paused ( get only )
  *   readyState ( get only )
  *   volume
  *
  *   load() function
  *   mute() function ( toggles on/off )
  *
  * Unsupported media attributes:
  *   buffered
  *   defaultPlaybackRate
  *   networkState
  *   playbackRate
  *   played
  *   preload
  *   seekable
  *   seeking
  *   src
  *   startOffsetTime
  */
  
  // Trackers
  var timeupdateInterval = 33,
      timeCheckInterval = 0.75,
      abs = Math.abs,
      registry = {};
  
  // base object for DOM-related behaviour like events
  var EventManager = function ( owner ) {
    var evts = {};
    
    function makeHandler( evtName ) {
      if ( !evts[evtName] ) {
        evts[evtName] = [];
        
        // Create a wrapper function to all registered listeners
        this["on"+evtName] = function( args ) {
          Popcorn.forEach( evts[evtName], function( fn ) {
            if ( fn ) {
              fn.call( owner, args );
            }
          });
        };
      }
    }
    
    return {
      addEventListener: function( evtName, fn, doFire ) {
        evtName = evtName.toLowerCase();
        
        makeHandler.call( this, evtName );
        evts[evtName].push( fn );
        
        if ( doFire ) {
          dispatchEvent( evtName );
        }
        
        return fn;
      },
      // Add many listeners for a single event
      // Takes an event name and array of functions
      addEventListeners: function( evtName, events ) {
        evtName = evtName.toLowerCase();
        
        makeHandler.call( this, evtName );
        evts[evtName] = evts[evtName].concat( events );
      },
      removeEventListener: function( evtName, fn ) {
        var evtArray = this.getEventListeners( evtName ),
            i,
            l;
        
        // Find and remove from events array
        for ( i = 0, l = evtArray.length; i < l; i++) {
          if ( evtArray[i] === fn ) {
            var removed = evtArray[i];
            evtArray[i] = 0;
            return removed;
          }
        }
      },
      getEventListeners: function( evtName ) {
        if( evtName ) {
          return evts[ evtName.toLowerCase() ] || [];
        } else {
          return evts;
        }
      },
      dispatchEvent: function( evt, args ) {        
        // If event object was passed in, toString will yield event type as string (timeupdate)
        // If a string, toString() will return the string itself (timeupdate)
        evt = "on"+evt.toString().toLowerCase();
        this[evt] && this[evt]( args );
      }
    };
  };
      
  Popcorn.vimeo = function( mediaId, list, options ) {
    return new Popcorn.vimeo.init( mediaId, list, options );
  };
  
  Popcorn.vimeo.onLoad = function( playerId ) {
    var player = registry[ playerId ];
    
    player.swfObj = document.getElementById( playerId );
    
    // For calculating position relative to video (like subtitles)
    player.offsetWidth = player.swfObj.offsetWidth;
    player.offsetHeight = player.swfObj.offsetHeight;
    player.offsetParent = player.swfObj.offsetParent;
    player.offsetLeft = player.swfObj.offsetLeft;
    player.offsetTop = player.swfObj.offsetTop;
    
    player.dispatchEvent( "load" );
  };
  
  Popcorn.getScript( "http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" );
  
  // A constructor, but we need to wrap it to allow for "static" functions
  Popcorn.vimeo.init = (function() {
    var rPlayerUri = /^http:\/\/player\.vimeo\.com\/video\/[\d]+/i,
        rWebUrl = /vimeo\.com\/[\d]+/,
        hasAPILoaded = false;
    
    // Extract the numeric video id from container uri: 'http://player.vimeo.com/video/11127501' or 'http://player.vimeo.com/video/4282282'
    // Expect id to be a valid 32/64-bit unsigned integer
    // Returns string, empty string if could not match
    function extractIdFromUri( uri ) {
      if ( !uri ) {
        return;
      }
      
      var matches = uri.match( rPlayerUri );
      return matches ? matches[0].substr(30) : "";
    }
    
    // Extract the numeric video id from url: 'http://vimeo.com/11127501' or simply 'vimeo.com/4282282'
    // Ignores protocol and subdomain, but one would expecct it to be http://www.vimeo.com/#######
    // Expect id to be a valid 32/64-bit unsigned integer
    // Returns string, empty string if could not match
    function extractIdFromUrl( url ) {
      if ( !url ) {
        return;
      }
      
      var matches = url.match( rWebUrl );
      return matches ? matches[0].substr(10) : "";
    }
    
    // Gets the style for the given element
    function getStyle( elem, styleProp ) {
      return elem.style[styleProp];
    }
      
    function makeSwf( self, vidId, containerId ) {
      if ( !window.swfobject ) {
        setTimeout( function() {
          makeSwf( self, vidId, containerId );
        }, 1);
        return;
      }
      
      var params,
          flashvars,
          attributes = {};
          
      flashvars = {
        clip_id: vidId,
        show_portrait: 1,
        show_byline: 1,
        show_title: 1,
        // required in order to use the Javascript API
        js_api: 1,
        // moogaloop will call this JS function when it's done loading (optional)
        js_onLoad: 'Popcorn.vimeo.onLoad',
        // this will be passed into all event methods so you can keep track of multiple moogaloops (optional)
        js_swf_id: containerId
      };
      params = {
        allowscriptaccess: 'always',
        allowfullscreen: 'true',
        // This is so we can overlay html ontop o fFlash
        wmode: 'transparent'
      };
      
      swfobject.embedSWF( "http://vimeo.com/moogaloop.swf", containerId, self.offsetWidth, self.offsetHeight, "9.0.0", "expressInstall.swf", flashvars, params, attributes );
    }
    
    // If container id is not supplied, assumed to be same as player id
    var ctor = function ( containerId, videoUrl, options ) {
      if ( !containerId ) {
        throw "Must supply an id!";
      } else if ( /file/.test( location.protocol ) ) {
        throw "Must run from a web server!";
      }
      
      var vidId,
          that = this,
          tmp,
          container = this.container = document.getElementById( containerId );
      
      options = options || {};
      
      this.addEventFn;
      this.evtHolder;
      this.paused = true;
      this.duration = Number.MAX_VALUE;
      this.ended = 0;
      this.currentTime = 0;
      this.volume = 1;
      this.loop = 0;
      this.initialTime = 0;
      this.played = 0;
      this.readyState = 0;
      
      this.previousCurrentTime = this.currentTime;
      this.previousVolume = this.volume;
      this.evtHolder = new EventManager( this );
      
      this._container =  document.getElementById( containerId );
      bounds = this._container.getBoundingClientRect();
      
      // For calculating position relative to video (like subtitles)
      this.width = options.width || getStyle( container, "width" ) || "504px";
      this.height = options.height || getStyle( container, "height" ) || "340px";
      
      if ( !/[\d]%/.test( this.width ) ) {
        this.offsetWidth = parseInt( this.width, 10 );
      } else {
        // convert from pct to abs pixels
        tmp = container.style.width;
        container.style.width = this.width;
        this.offsetWidth = container.offsetWidth;
        container.style.width = tmp;
      }
      
      if ( !/[\d]%/.test( this.height ) ) {
        this.offsetHeight = parseInt( this.height, 10 );
      } else {
        // convert from pct to abs pixels
        tmp = container.style.height;
        container.style.height = this.height;
        this.offsetHeight = container.offsetHeight;
        container.style.height = tmp;
      }
      
      this.offsetLeft = 0;
      this.offsetTop = 0;
      
      // Try and get a video id from a vimeo site url
      // Try either from ctor param or from iframe itself
      vidId = extractIdFromUrl( videoUrl ) || extractIdFromUri( videoUrl );
      
      if ( !vidId ) {
        throw "No video id";
      }
      
      registry[ containerId ] = this;
      
      makeSwf( this, vidId, containerId );
      
      // Set up listeners to internally track state as needed
      this.addEventListener( "load", function() {
        var hasLoaded = false;
        
        that.duration = that.swfObj.api_getDuration();
        that.evtHolder.dispatchEvent( "durationchange" );
        that.evtHolder.dispatchEvent( "loadedmetadata" );
        
        // Chain events and calls together so that this.currentTime reflects the current time of the video
        // Done by Getting the Current Time while the video plays
        that.addEventListener( "timeupdate", function() {
          that.currentTime = that.swfObj.api_getCurrentTime();
        });
        
        // Add pause listener to keep track of playing state
        
        that.addEventListener( "pause", function() {
          that.paused = true;
        });
        
        // Add play listener to keep track of playing state
        that.addEventListener( "playing", function() {
          that.paused = false;
          that.ended = 0;
        });
        
        // Add ended listener to keep track of playing state
        that.addEventListener( "ended", function() {
          if ( that.loop !== "loop" ) {
            that.paused = true;
            that.ended = 1;
          }
        });
        
        // Add progress listener to keep track of ready state
        that.addEventListener( "progress", function( data ) {
          if ( !hasLoaded ) {
            hasLoaded = 1;
            that.readyState = 3;
            that.evtHolder.dispatchEvent( "readystatechange" );
          }
          
          // Check if fully loaded
          if ( data.percent === 100 ) {
            that.readyState = 4;
            that.evtHolder.dispatchEvent( "readystatechange" );
            that.evtHolder.dispatchEvent( "canplaythrough" );
          }
        });
      });
    };
    return ctor;
  })();
  
  Popcorn.vimeo.init.prototype = Popcorn.vimeo.prototype;
  
  // Sequence object prototype
  Popcorn.extend( Popcorn.vimeo.prototype, {
    // Do everything as functions instead of get/set
    setLoop: function( val ) {
      if ( !val ) {
        return;
      }
      
      this.loop = val;
      var isLoop = val === "loop" ? 1 : 0;
      // HTML convention says to loop if value is 'loop'
      this.swfObj.api_setLoop( isLoop );
    },
    // Set the volume as a value between 0 and 1
    setVolume: function( val ) {
      if ( !val && val !== 0 ) {
        return;
      }
      
      // Normalize in case outside range of expected values
      if ( val < 0 ) {
        val = -val;
      }
      
      if ( val > 1 ) {
        val %= 1;
      }
      
      // HTML video expects to be 0.0 -> 1.0, Vimeo expects 0-100
      this.volume = this.previousVolume = val;
      this.swfObj.api_setVolume( val*100 );
      this.evtHolder.dispatchEvent( "volumechange" );
    },
    // Seeks the video
    setCurrentTime: function ( time ) {
      if ( !time && time !== 0 ) {
        return;
      }
      
      this.currentTime = this.previousCurrentTime = time;
      this.ended = time >= this.duration;
      this.swfObj.api_seekTo( time );
      
      // Fire events for seeking and time change
      this.evtHolder.dispatchEvent( "seeked" );
      this.evtHolder.dispatchEvent( "timeupdate" );
    },
    // Play the video
    play: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.play );
        return;
      }
      
      if ( !this.played ) {
        this.played = 1;
        this.startTimeUpdater();
        this.evtHolder.dispatchEvent( "loadstart" );
      }
      
      this.evtHolder.dispatchEvent( "play" );
      this.swfObj.api_play();
    },
    // Pause the video
    pause: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.pause );
        return;
      }
      
      this.swfObj.api_pause();
    },
    // Toggle video muting
    // Unmuting will leave it at the old value
    mute: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.mute );
        return;
      }
      
      if ( !this.muted() ) {
        this.oldVol = this.volume;
        
        if ( this.paused ) {
          this.setVolume( 0 );
        } else {
          this.volume = 0;
        }
      } else {
        if ( this.paused ) {
          this.setVolume( this.oldVol );
        } else {
          this.volume = this.oldVol;
        }
      }
    },
    muted: function() {
      return this.volume === 0;
    },
    // Force loading by playing the player. Pause afterwards
    load: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.load );
        return;
      }
      
      this.play();
      this.pause();
    },
    unload: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.unload );
        return;
      }
      
      this.pause();
      
      this.swfObj.api_unload();
      this.evtHolder.dispatchEvent( "abort" );
      this.evtHolder.dispatchEvent( "emptied" );
    },
    // Hook an event listener for the player event into internal event system
    // Stick to HTML conventions of add event listener and keep lowercase, without prependinng "on"
    addEventListener: function( evt, fn ) {
      var playerEvt,
          that = this;
      
      // In case event object is passed in
      evt = evt.type || evt.toLowerCase();
      
      // If it's an HTML media event supported by player, map
      if ( evt === "seeked" ) {
        playerEvt = "onSeek";
      } else if ( evt === "timeupdate" ) {
        playerEvt = "onProgress";
      } else if ( evt === "progress" ) {
        playerEvt = "onLoading";
      } else if ( evt === "ended" ) {
        playerEvt = "onFinish";
      } else if ( evt === "playing" ) {
        playerEvt = "onPlay";
      } else if ( evt === "pause" ) {
        // Direct mapping, CamelCase the event name as vimeo API expects
        playerEvt = "on"+evt[0].toUpperCase() + evt.substr(1);
      }
      
      // Vimeo only stores 1 callback per event
      // Have vimeo call internal collection of callbacks
      this.evtHolder.addEventListener( evt, fn, false );
      
      // Link manual event structure with Vimeo's if not already
      if( playerEvt && this.evtHolder.getEventListeners( evt ).length === 1 ) {
        // Setup global functions on Popcorn.vimeo to sync player events to an internal collection
        // Some events expect 2 args, some only one (the player id)
        if ( playerEvt === "onSeek" || playerEvt === "onProgress" || playerEvt === "onLoading" ) {
          Popcorn.vimeo[playerEvt] = function( arg1, arg2 ) {
            var player = registry[arg2];
            
            player.evtHolder.dispatchEvent( evt, arg1 );
          };
        } else {
          Popcorn.vimeo[playerEvt] = function( arg1 ) {
            var player = registry[arg1];
            player.evtHolder.dispatchEvent( evt );
          };
        }
        
        this.swfObj.api_addEventListener( playerEvt, "Popcorn.vimeo."+playerEvt );
      }
    },
    removeEventListener: function( evtName, fn ) {
      return this.evtHolder.removeEventListener( evtName, fn );
    },
    dispatchEvent: function( evtName ) {
      return this.evtHolder.dispatchEvent( evtName );
    },
    getBoundingClientRect: function() {
      return this.container.getBoundingClientRect();
    },
    startTimeUpdater: function() {
      var self = this,
          seeked = 0;
      
      if ( abs( this.currentTime - this.previousCurrentTime ) > timeCheckInterval ) {
        // Has programatically set the currentTime
        this.setCurrentTime( this.currentTime );
        seeked = 1;
      } else {
        this.previousCurrentTime = this.currentTime;
      }
      
      if ( this.volume !== this.previousVolume ) {
        this.setVolume( this.volume );
      }
      
      if ( !self.paused || seeked ) {
        this.dispatchEvent( 'timeupdate' );
      }
      
      if( !self.ended ) {
        setTimeout( function() {
          self.startTimeUpdater.call(self);
        }, timeupdateInterval);
      }
    }
  });
})( Popcorn, window );
