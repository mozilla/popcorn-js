// Popcorn Vimeo Player Wrapper
( function( Popcorn ) {
  /**
  * Vimeo wrapper for Popcorn.
  * This player adds enables Popcorn.js to handle Vimeo videos. It does so by masking an embedded Vimeo video iframe
  * as a video and implementing the HTML5 Media Element interface.
  *
  * To use this plug-in, include the Vimeo JavaScript API Froogaloop in the parent HTML page as well as the embedded Vimeo iframe:
  *
  *   <script src="https://github.com/downloads/vimeo/froogaloop/froogaloop.v1.0.min.js"></script>
  *
  * You can specify the video in three ways:
  *  1. Use the embed code supplied by Vimeo, and pass the iframe id into a new Popcorn.VimeoEngine object
  *
  *    <iframe id="player_1" src="http://player.vimeo.com/video/11127501?js_api=1&js_swf_id=player_1" width="500" height="281" frameborder="0"></iframe>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var player = Popcorn.vimeo( "player_1" );
  *      }, false);
  *    </script>
  *
  *  2. Use an empty iframe and give both the iframe id and the web url when creating a new Popcorn.VimeoEngine
  *
  *    <iframe id="player_1" width="500" height="281" frameborder="0"></iframe>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var player = Popcorn.vimeo( "player_1", "http://vimeo.com/11127501" );
  *      }, false);
  *    </script>
  *
  *  3. Set the iframe's src attribute to the vimeo video's web url, and pass the id when creating a new Popcorn.VimeoEngine
  *
  *    <iframe id="player_1" src="http://vimeo.com/11127501" width="500" height="281" frameborder="0"></iframe>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var player = Popcorn.vimeo( "player_1" );
  *      }, false);
  *    </script>
  *
  * Due to Vimeo's API, certain events must be subscribed to at different times, and some not at all.
  * These events are completely custom-implemented and may be subscribed to at any time:
  *   durationchange
  *   load
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
  *   canplaythrough
  *   error
  *   loadeddata
  *   loadedmetadata
  *   ratechange
  *   seeking
  *   stalled
  *   suspend
  *   waiting
  *
  * Due to Vimeo's API, some attributes are be supported while others are not.
  * Supported media attributes:
  *   autoplay ( via Popcorn )
  *   currentTime ( get only, set by calling setCurrentTime() )
  *   duration ( get only )
  *   ended ( get only )
  *   initialTime ( get only, always 0 )
  *   loop ( get only, set by calling setLoop() )
  *   muted ( get only, set by calling setVolume(0) )
  *   paused ( get only )
  *   readyState ( get only )
  *   src ( get only )
  *   volume ( get only, set by calling setVolume() )
  *
  *   load() function
  *   mute() function
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
  *   startOffsetTime
  */
  
  // base object for DOM-related behaviour like events
  var LikeADOM = function ( owner ) {
    var evts = {};
    var makeHandler = function( evtName ) {
      if ( !evts[evtName] ) {
        evts[evtName] = [];
        
        // Create a wrapper function to all registered listeners
        this["on"+evtName] = function() {
          Popcorn.forEach( evts[evtName], function( fn ) {
            if ( fn ) {
              fn.call( owner );
            }
          });
        }
      }
    };
    
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
      dispatchEvent: function( evt ) {        
        // If event object was passed in, toString will yield event type as string (timeupdate)
        // If a string, toString() will return the string itself (timeupdate)
        var evt = "on"+evt.toString().toLowerCase();
        this[evt] && this[evt]();
      }
    };
  };
  
  Popcorn.vimeo = function( mediaId, list ) {
    return new Popcorn.vimeo.init( mediaId, list );
  };
  
  // A constructor, but we need to wrap it to allow for "static" functions
  Popcorn.vimeo.init = (function() {
    var rPlayerUri = /^http:\/\/player\.vimeo\.com\/video\/[\d]+/i,
        rWebUrl = /vimeo\.com\/[\d]+/,
        registry = [],
        hasAPILoaded = false;
        
    // Source file is from https://github.com/vimeo/froogaloop/blob/master/froogaloop.min.js
    // HTTPS seems to have some difficulties with getScript, so store locally
    Popcorn.getScript( "./froogaloop.min.js", function() {
      var i,
          l = registry.length;
          
      hasAPILoaded = true;
      for( i=0; i<l; i++ ) {
        registry[i].addEventListener.transferToHandler.call( registry[i] );
      }
    });
    
    // Extract the numeric video id from container uri: 'http://player.vimeo.com/video/11127501' or 'http://player.vimeo.com/video/4282282'
    // Expect id to be a valid 32/64-bit unsigned integer
    // Returns string, empty string if could not match
    function extractIdFromUri( uri ) {
      var matches = uri.match( rPlayerUri );
      return matches ? matches[0].substr(30) : "";
    };
    
    // Extract the numeric video id from url: 'http://vimeo.com/11127501' or simply 'vimeo.com/4282282'
    // Ignores protocol and subdomain, but one would expecct it to be http://www.vimeo.com/#######
    // Expect id to be a valid 32/64-bit unsigned integer
    // Returns string, empty string if could not match
    function extractIdFromUrl( url ) {
      var matches = url.match( rWebUrl );
      return matches ? matches[0].substr(10) : "";
    };
  
    // If container id is not supplied, assumed to be same as player id
    var ctor = function ( containerId, videoUrl ) {
      if ( !containerId ) {
        throw "Must supply an id!";
      }
      
      var vidId,
          that = this;
      
      this.swfObj = document.getElementById( containerId ),
      this.addEventFn,
      this.evtHolder,
      this.popped,
      this.autoplay,
      this.readyState = 0,
      this.objVars;
          
      if ( !this.swfObj ) {
        throw "Invalid id, could not find it!";
      }
      
      this.evtHolder = new LikeADOM( this );
      this.autoplay = this.swfObj.autoplay;
      
      // Tracking variables for the video player
      // Better to store them here than on the DOM
      this.objVars = {
        paused: true,
        duration: Number.NaN,
        ended: 0,
        currentTime: Number.NaN,
        volume: 1,
        loop: 0,
        initialTime: 0,
        played: 0,
      };
      
      // Try and get a video id from a vimeo site url
      // Try either from ctor param or from iframe itself
      if( videoUrl ) {
        vidId = extractIdFromUrl( videoUrl );
      } else {
        vidId = extractIdFromUrl( this.swfObj.src )
      }
      
      // If was able to gete a video id
      if ( vidId ) {
        // Set iframe source to vimeo player and id
        // Note that speccifying a web url will over-write any src attribute already on the iframe
        this.swfObj.src = "http://player.vimeo.com/video/"+vidId+"?js_api=1&js_swf_id="+containerId;
      }
      
      registry.push( this );
      
      if( hasAPILoaded ) {
        Froogaloop.init( [ this.swfObj ] );
      } else {
        // API not ready, temporarily hold events here, will be transfered over shortly
        // This is in case an object is instantiated and played around with before the Vimeo API is ready
        this.addEventListener = (function() {
          // Make a lightweight collection
          var evts = {},
              retFn;
              
          retFn = function( evt, fn ) {
              evt = evt.toLowerCase();
              
              if ( !evts[evt] ) {
                evts[evt] = [];
              }
              
              evts[evt].push( fn );
            }
            
          retFn.transferToHandler = function() {
            Froogaloop.init( [ this.swfObj ] );
            
            // No need to keep caching events, now we can connect them to the API directly!
            this.addEventListener = Popcorn.vimeo.prototype.addEventListener;
            
            Popcorn.forEach( evts, function( evtArray, evtName ) {
              // Must call once on own to link up event to Froogaloop events
              // Splice off first callback to setup link
              that.addEventListener( evtName, evtArray.splice( 0, 1 )[0] );
              
              // Splice call above modified the array. Link rest up quickly
              that.evtHolder.addEventListeners( evtName, evtArray );
            });
            
            // GC Function
            retFn = null;
          };
          
          return retFn;
        })();
      }
      
      // Set up listeners to internally track state as needed
      this.addEventListener( "load", function() {
        var loadingFn;
        
        that.swfObj.get( "api_getDuration", function( duration ) {
          that.objVars.duration = duration;
          that.evtHolder.dispatchEvent( "durationchange" );
        });
        
        // Chain events and calls together so that this.currentTime reflects the current time of the video
        // Done by Getting the Current Time while the video plays
        that.swfObj.addEvent( "onProgress", function() {
          that.swfObj.get( "api_getCurrentTime", function( time ) {
            that.objVars.currentTime = parseFloat( time );
            that.evtHolder.dispatchEvent( "timeupdate" );
          });
        });
        
        // Add pause listener to keep track of playing state
        that.addEventListener( "pause", function() {
          that.objVars.paused = true;
        });
        
        // Add play listener to keep track of playing state
        that.addEventListener( "playing", function() {
          that.objVars.paused = false;
          that.objVars.ended = 0;
        });
        
        // Add ended listener to keep track of playing state
        that.addEventListener( "ended", function() {
          if ( that.objVars.loop !== "loop" ) {
            that.objVars.paused = true;
            that.objVars.ended = 1;
          }
        });
        
        // Add progress listener to keep track of ready state
        loadingFn = that.addEventListener( "progress", function() {
          that.readyState = 3;
          that.evtHolder.dispatchEvent( "readystatechange" );
          that.evtHolder.removeEventListener( "progress", loadingFn );
        });
      });
    
      // 'this' is a video wrapper, so put into Popcorn and return the result
      this.popped = Popcorn( this );      
      return this.popped;
    }
    return ctor;
  })();
  
  Popcorn.vimeo.init.prototype = Popcorn.vimeo.prototype;
  
  // Sequence object prototype
  Popcorn.extend( Popcorn.vimeo.prototype, {
    // Do everything as functions instead of get/set
    loop: function( val ) {
      if ( !val ) {
        return this.objVars.loop;
      }
      
      this.objVars.loop = val;
      var isLoop = val === "loop" ? 1 : 0;
      // HTML convention says to loop if value is 'loop'
      this.swfObj.api('api_setLoop', isLoop );
    },
    // Set the volume as a value between 0 and 1
    volume: function( val ) {
      if ( !val && val !== 0 ) {
        return this.objVars.volume;
      }
      
      // Normalize in case outside range of expected values
      if ( val < 0 ) {
        val = -val;
      }
      
      if ( val > 1 ) {
        val %= 1;
      }
      
      // HTML video expects to be 0.0 -> 1.0, Vimeo expects 0-100
      this.objVars.volume = val;
      this.swfObj.api( "api_setVolume", val*100 );
      this.evtHolder.dispatchEvent( "volumechange" );
    },
    // Seeks the video
    currentTime: function ( time ) {
      if ( !time && time !== 0 ) {
        return this.objVars.currentTime;
      }
      
      this.objVars.currentTime = time;
      this.objVars.ended = time < this.objVars.duration;
      this.swfObj.api( "api_seekTo", time );
      
      // Fire events for seeking and time change
      this.evtHolder.dispatchEvent( "seeked" );
      this.evtHolder.dispatchEvent( "timeupdate" );
    },
    // Play the video
    play: function() {
      if ( !this.objVars.played ) {
        this.objVars.played = 1;
        this.evtHolder.dispatchEvent( "loadstart" );
      }
      
      this.evtHolder.dispatchEvent( "play" );
      this.swfObj.api( "api_play" );
    },
    // Pauses the video
    pause: function() {
      this.swfObj.api( "api_pause" );
    },
    duration: function() {
      return this.objVars.duration;
    },
    mute: function() {
      if ( !this.muted() ) {
        this.objVars.oldVol = this.objVars.volume;
        this.volume( 0 );
      } else {
        this.volume( this.objVars.oldVol );
      }
    },
    muted: function() {
      return this.objVars.volume === 0;
    },
    // Force loading by playing the player. Pause afterwards
    load: function() {
      this.play();
      this.pause();
    },
    unload: function() {
      this.pause();
      
      this.swfObj.api( "api_unload" );
      this.evtHolder.dispatchEvent( "abort" );
      this.evtHolder.dispatchEvent( "emptied" );
    },
    // Hook an event listener for the player event into internal event system
    // Stick to HTML conventions of add event listener and keep lowercase, without prependinng "on"
    addEventListener: function( evt, fn ) {
      var playerEvt,
          that = this;
      
      evt = evt.toLowerCase();
      
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
      } else if ( evt === "pause" || evt === "load" ) {
        // Direct mapping, CamelCase the event name as vimeo API expects
        playerEvt = "on"+evt[0].toUpperCase() + evt.substr(1);
      }
      
      // Vimeo only stores 1 callback per event
      // Have vimeo call internal collection of callbacks
      this.evtHolder.addEventListener( evt, fn, false );
      
      // Link manual event structure with Vimeo's if not already
      // Do not link for 'timeupdate'
      if( evt !== "timeupdate" && playerEvt && this.evtHolder.getEventListeners( evt ).length === 1 ) {
        this.swfObj.addEvent( playerEvt, function() {
          that.evtHolder.dispatchEvent( evt );
        });
      }
    },
    removeEventListener: function( evtName, fn ) {
      return this.evtHolder.removeEventListener( evtName, fn );
    },
    dispatchEvent: function( evtName ) {
      return this.evtHolder.dispatchEvent( evtName );
    }
  });
})( Popcorn );