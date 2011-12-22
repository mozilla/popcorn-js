// Popcorn Soundcloud Player Wrapper
( function( Popcorn, global ) {
  /**
  * Soundcloud wrapper for Popcorn.
  * This player adds enables Popcorn.js to handle Soundcloud audio. It does so by masking an embedded Soundcloud Flash object
  * as a video and implementing the HTML5 Media Element interface.
  *
  * You can configure the video source and dimensions in two ways:
  *  1. Use the embed code path supplied by Soundcloud the id of the desired location into a new Popcorn.soundcloud object.
  *     Width and height can be configured throughh CSS.
  *
  *    <div id="player_1" style="width: 500px; height: 81px"></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood" ));
  *      }, false);
  *    </script>
  *
  *  2. Width and height may also be configured directly with the player; this will override any CSS. This is useful for
  *     when different sizes are desired. for multiple players within the same parent container.
  *
  *     <div id="player_1"></div>
  *     <script type="text/javascript">
  *       document.addEventListener("DOMContentLoaded", function() {
  *       var popcorn = Popcorn( Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood", {
  *         width: "500",                                     // Optional, will default to CSS values
  *         height: "81"                                      // Optional, will default to CSS values
  *       }));
  *       }, false);
  *     </script>
  *
  * The player can be further configured to integrate with the SoundCloud API:
  *
  * var popcorn = Popcorn( Popcorn.soundcloud( "player_1", "http://soundcloud.com/forss/flickermood", {
  *   width: "100%",                                    // Optional, the width for the player. May also be as '##px'
  *                                                     //           Defaults to the maximum possible width
  *   height: "81px",                                   // Optional, the height for the player. May also be as '###%'
  *                                                     //           Defaults to 81px
  *   api: {                                            // Optional, information for Soundcloud API interaction
  *     key: "abcdefsdfsdf",                            // Required for API interaction. The Soundcloud API key
  *     commentdiv: "divId_for_output",                 // Required for comment retrieval, the Div Id for outputting comments.
  *     commentformat: function( comment ) {}           // Optional, a function to format a comment. Returns HTML string
  *   }
  * }));
  *
  * Comments are retrieved from Soundcloud when the player is registered with Popcorn by calling the registerWithPopcorn()
  * function. For this to work, the api_key and commentdiv attributes must be set. Comments are output by default similar to
  * how Soundcloud formats them in-player, but a custom formatting function may be supplied. It receives a comment object and
  * the current date. A comment object has:
  *
  * var comment = {
  *   start: 0,                           // Required. Start time in ms.
  *   date: new Date(),                   // Required. Date comment wasa posted.
  *   text: "",                           // Required. Comment text
  *   user: {                             // Required. Describes the user who posted the comment
  *     name: "",                         // Required. User name
  *     profile: "",                      // Required. User profile link
  *     avatar: ""                        // Required. User avatar link
  *   }
  * }
  *
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
  *   canplay
  *   ended
  *   error
  *   pause
  *   playing
  *   progress
  *   seeked
  *   timeupdate
  *
  * These events are not supported:
  *   abort
  *   emptied
  *   loadeddata
  *   ratechange
  *   seeking
  *   stalled
  *   suspend
  *   waiting
  *
  * Supported media attributes:
  *   autoplay ( via Popcorn )
  *   currentTime
  *   defaultPlaybackRate ( get only )
  *   duration ( get only )
  *   ended ( get only )
  *   initialTime ( get only, always 0 )
  *   loop ( get only, set by calling setLoop() )
  *   muted ( get only )
  *   paused ( get only )
  *   playbackRate ( get only )
  *   played ( get only, 0/1 only )
  *   readyState ( get only )
  *   src ( get only )
  *   volume
  *
  *   load() function
  *   mute() function ( toggles on/off )
  *   play() function
  *   pause() function
  *
  * Unsupported media attributes:
  *   buffered
  *   networkState
  *   preload
  *   seekable
  *   seeking
  *   startOffsetTime
  *
  *   canPlayType() function
  */

  // Trackers
  var timeupdateInterval = 33,
      timeCheckInterval = 0.25,
      abs = Math.abs,
      floor = Math.floor,
      round = Math.round,
      registry = {};

  function hasAllDependencies() {
    return global.swfobject && global.soundcloud;
  }

  // Borrowed from: http://www.quirksmode.org/dom/getstyles.html
  // Gets the style for the given element
  function getStyle( elem, styleProp ) {
    if ( elem.currentStyle ) {
      // IE way
      return elem.currentStyle[styleProp];
    } else if ( global.getComputedStyle ) {
      // Firefox, Chrome, et. al
      return document.defaultView.getComputedStyle( elem, null ).getPropertyValue( styleProp );
    }
  }

  function formatComment( comment ) {
    // Calclate the difference between d and now, express as "n units ago"
    function ago( d ) {
      var diff = ( ( new Date() ).getTime() - d.getTime() )/1000;

      function pluralize( value, unit ) {
        return value + " " + unit + ( value > 1 ? "s" : "") + " ago";
      }

      if ( diff < 60 ) {
        return pluralize( round( diff ), "second" );
      }
      diff /= 60;

      if ( diff < 60 ) {
        return pluralize( round( diff ), "minute" );
      }
      diff /= 60;

      if ( diff < 24 ) {
        return pluralize( round( diff ), "hour" );
      }
      diff /= 24;

      // Rough approximation of months
      if ( diff < 30 ) {
        return pluralize( round( diff ), "day" );
      }

      if ( diff < 365 ) {
        return pluralize( round( diff/30 ), "month" );
      }

      return pluralize( round( diff/365 ), "year" );
    }

    // Converts sec to min.sec
    function timeToFraction ( totalSec ) {
      var min = floor( totalSec / 60 ),
          sec = round( totalSec % 60 );

      return min + "." + ( sec < 10 ? "0" : "" ) + sec;
    }

    return '<div><a href="' + comment.user.profile + '">' +
           '<img width="16px height="16px" src="' + comment.user.avatar + '"></img>' +
           comment.user.name + '</a> at ' + timeToFraction( comment.start ) + ' '  +
           ago( comment.date )  +
           '<br />' + comment.text + '</span>';
  }

  function isReady( self ) {
    if ( !hasAllDependencies() ) {
      setTimeout( function() {
        isReady( self );
      }, 15 );
      return;
    }

    var flashvars = {
      enable_api: true,
      object_id: self._playerId,
      url: self.src,
      // Hide comments in player if showing them elsewhere
      show_comments: !self._options.api.key && !self._options.api.commentdiv
    },
    params = {
      allowscriptaccess: "always",
      // This is so we can overlay html ontop of Flash
      wmode: 'transparent'
    },
    attributes = {
      id: self._playerId,
      name: self._playerId
    },
    actualTarget = document.createElement( 'div' );

    actualTarget.setAttribute( "id", self._playerId );
    self._container.appendChild( actualTarget );

    swfobject.embedSWF( "http://player.soundcloud.com/player.swf", self._playerId, self.offsetWidth, self.height, "9.0.0", "expressInstall.swf", flashvars, params, attributes );
  }


  Popcorn.soundcloud = function( containerId, src, options ) {

    Popcorn.getScript( "http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" );

    // Source file originally from 'https://github.com/soundcloud/Widget-JS-API/raw/master/soundcloud.player.api.js'
    Popcorn.getScript( "http://popcornjs.org/code/players/soundcloud/lib/soundcloud.player.api.js", function() {
      // Play event is fired twice when player is first started. Ignore second one
      var ignorePlayEvt = 1;

      // Register the wrapper's load event with the player
      soundcloud.addEventListener( 'onPlayerReady', function( object, data ) {
        var wrapper = registry[object.api_getFlashId()];

        wrapper.swfObj = object;
        wrapper.duration = object.api_getTrackDuration();
        wrapper.currentTime = object.api_getTrackPosition();
        // This eliminates volumechangee event from firing on load
        wrapper.volume = wrapper.previousVolume =  object.api_getVolume()/100;

        // The numeric id of the track for use with Soundcloud API
        wrapper._mediaId = data.mediaId;

        wrapper.dispatchEvent( 'load' );
        wrapper.dispatchEvent( 'canplay' );
        wrapper.dispatchEvent( 'durationchange' );

        wrapper.timeupdate();
      });

      // Register events for when the flash player plays a track for the first time
      soundcloud.addEventListener( 'onMediaStart', function( object, data ) {
        var wrapper = registry[object.api_getFlashId()];
        wrapper.played = 1;
        wrapper.dispatchEvent( 'playing' );
      });

      // Register events for when the flash player plays a track
      soundcloud.addEventListener( 'onMediaPlay', function( object, data ) {
        if ( ignorePlayEvt ) {
          ignorePlayEvt = 0;
          return;
        }

        var wrapper = registry[object.api_getFlashId()];
        wrapper.dispatchEvent( 'play' );
      });

      // Register events for when the flash player pauses a track
      soundcloud.addEventListener( 'onMediaPause', function( object, data ) {
        var wrapper = registry[object.api_getFlashId()];
        wrapper.dispatchEvent( 'pause' );
      });

      // Register events for when the flash player is buffering
      soundcloud.addEventListener( 'onMediaBuffering', function( object, data ) {
        var wrapper = registry[object.api_getFlashId()];

        wrapper.dispatchEvent( 'progress' );

        if ( wrapper.readyState === 0 ) {
          wrapper.readyState = 3;
          wrapper.dispatchEvent( "readystatechange" );
        }
      });

      // Register events for when the flash player is done buffering
      soundcloud.addEventListener( 'onMediaDoneBuffering', function( object, data ) {
        var wrapper = registry[object.api_getFlashId()];
        wrapper.dispatchEvent( 'canplaythrough' );
      });

      // Register events for when the flash player has finished playing
      soundcloud.addEventListener( 'onMediaEnd', function( object, data ) {
        var wrapper = registry[object.api_getFlashId()];
        wrapper.paused = 1;
        //wrapper.pause();
        wrapper.dispatchEvent( 'ended' );
      });

      // Register events for when the flash player has seeked
      soundcloud.addEventListener( 'onMediaSeek', function( object, data ) {
        var wrapper = registry[object.api_getFlashId()];

        wrapper.setCurrentTime( object.api_getTrackPosition() );

        if ( wrapper.paused ) {
          wrapper.dispatchEvent( "timeupdate" );
        }
      });

      // Register events for when the flash player has errored
      soundcloud.addEventListener( 'onPlayerError', function( object, data ) {
        var wrapper = registry[object.api_getFlashId()];
        wrapper.dispatchEvent( 'error' );
      });
    });

    return new Popcorn.soundcloud.init( containerId, src, options );
  };

  // A constructor, but we need to wrap it to allow for "static" functions
  Popcorn.soundcloud.init = (function() {
    function pullFromContainer( that ) {
      var options = that._options,
          container = that._container,
          bounds = container.getBoundingClientRect(),
          tmp,
          undef;

      that.width = options.width || getStyle( container, "width" ) || "100%";
      that.height = options.height || getStyle( container, "height" ) || "81px";
      that.src = options.src;
      that.autoplay = options.autoplay;

      if ( parseFloat( that.height, 10 ) !== 81 ) {
        that.height = "81px";
      }

      that.offsetLeft = bounds.left;
      that.offsetTop = bounds.top;
      that.offsetHeight = parseFloat( that.height, 10 );
      that.offsetWidth = parseFloat( that.width, 10 );

      // Width and height may've been specified as a %, find the value now in case a plugin needs it (like subtitle)
      if ( /[\d]+%/.test( that.width ) ) {
        tmp = getStyle( container, "width" );
        that._container.style.width = that.width;
        that.offsetWidth = that._container.offsetWidth;
        that._container.style.width = tmp;
      }

      if ( /[\d]+%/.test( that.height ) ) {
        tmp = getStyle( container, "height" );
        that._container.style.height = that.height;
        that.offsetHeight = that._container.offsetHeight;
        that._container.style.height = tmp;
      }
    }

    // If container id is not supplied, assumed to be same as player id
    var ctor = function ( containerId, src, options ) {
      if ( !containerId ) {
        throw "Must supply an id!";
      } else if ( !src ) {
        throw "Must supply a source!";
      } else if ( /file/.test( location.protocol ) ) {
        throw "Must run from a web server!";
      }

      var container = this._container = document.getElementById( containerId );

      if ( !container ) {
        throw "Could not find that container in the DOM!";
      }

      options = options || {};
      options.api = options.api || {};
      options.target = containerId;
      options.src = src;
      options.api.commentformat = options.api.commentformat || formatComment;

      this._mediaId = 0;
      this._listeners = {};
      this._playerId = Popcorn.guid( options.target );
      this._containerId = options.target;
      this._options = options;
      this._comments = [];
      this._popcorn = null;

      pullFromContainer( this );

      this.duration = 0;
      this.volume = 1;
      this.currentTime = 0;
      this.ended = 0;
      this.paused = 1;
      this.readyState = 0;
      this.playbackRate = 1;

      this.top = 0;
      this.left = 0;

      this.autoplay = null;
      this.played = 0;

      this.addEventListener( "load", function() {
        var boundRect = this.getBoundingClientRect();

        this.top = boundRect.top;
        this.left = boundRect.left;

        this.offsetWidth = this.swfObj.offsetWidth;
        this.offsetHeight = this.swfObj.offsetHeight;
        this.offsetLeft = this.swfObj.offsetLeft;
        this.offsetTop = this.swfObj.offsetTop;
      });

      registry[ this._playerId ] = this;
      isReady( this );
    };
    return ctor;
  })();

  Popcorn.soundcloud.init.prototype = Popcorn.soundcloud.prototype;

  // Sequence object prototype
  Popcorn.extend( Popcorn.soundcloud.prototype, {
    // Set the volume as a value between 0 and 1
    setVolume: function( val ) {
      if ( !val && val !== 0 ) {
        return;
      }

      // Normalize in case outside range of expected values of 0 .. 1
      if ( val < 0 ) {
        val = -val;
      }

      if ( val > 1 ) {
        val %= 1;
      }

      // HTML video expects to be 0.0 -> 1.0, Flash object expects 0-100
      this.volume = this.previousVolume = val;
      this.swfObj.api_setVolume( val*100 );
      this.dispatchEvent( "volumechange" );
    },
    // Seeks the video
    setCurrentTime: function ( time ) {
      if ( !time && time !== 0 ) {
        return;
      }

      this.currentTime = this.previousCurrentTime = time;
      this.ended = time >= this.duration;

      // Fire events for seeking and time change
      this.dispatchEvent( "seeked" );
    },
    // Play the video
    play: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.play );
        return;
      } else if ( !this.paused ) {
        // No need to process if already playing
        return;
      }

      this.paused = 0;
      this.swfObj.api_play();
    },
    // Pause the video
    pause: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.pause );
        return;
      } else if ( this.paused ) {
        // No need to process if already playing
        return;
      }

      this.paused = 1;
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
    // Hook an event listener for the player event into internal event system
    // Stick to HTML conventions of add event listener and keep lowercase, without prepending "on"
    addEventListener: function( evt, fn ) {
      if ( !this._listeners[evt] ) {
        this._listeners[evt] = [];
      }

      this._listeners[evt].push( fn );
      return fn;
    },
    dispatchEvent: function( evt ) {
      var self = this,
          evtName = evt.type || evt;

      // Manually triggered a UI event, have it invoke rather than just the event handlers
      if ( evtName === "play" && this.paused || evtName === "pause" && !this.paused ) {
        this[evtName]();
        return;
      }

      Popcorn.forEach( this._listeners[evtName], function( fn ) {
        fn.call( self );
      });
    },
    timeupdate: function() {
      var self = this,
          checkedVolume = this.swfObj.api_getVolume()/100,
          seeked = 0;

      // If has been changed through setting currentTime attribute
      if ( abs( this.currentTime - this.previousCurrentTime ) > timeCheckInterval ) {
        // Has programatically set the currentTime
        this.swfObj.api_seekTo( this.currentTime );
        seeked = 1;
      } else {
        this.previousCurrentTime = this.currentTime = this.swfObj.api_getTrackPosition();
      }

      // If has been changed throughh volume attribute
      if ( checkedVolume !== this.previousVolume ) {
        this.setVolume( checkedVolume );
      } else if ( this.volume !== this.previousVolume ) {
        this.setVolume( this.volume );
      }

      if ( !this.paused ) {
        this.dispatchEvent( 'timeupdate' );
      }

      if( !self.ended ) {
        setTimeout( function() {
          self.timeupdate.call( self );
        }, timeupdateInterval);
      }
    },

    getBoundingClientRect: function() {
      var b,
          self = this;

      if ( this.swfObj ) {
        b = this.swfObj.getBoundingClientRect();

        return {
          bottom: b.bottom,
          left: b.left,
          right: b.right,
          top: b.top,

          //  These not guaranteed to be in there
          width: b.width || ( b.right - b.left ),
          height: b.height || ( b.bottom - b.top )
        };
      } else {
        //container = document.getElementById( this.playerId );
        tmp = this._container.getBoundingClientRect();

        // Update bottom, right for expected values once the container loads
        return {
          left: tmp.left,
          top: tmp.top,
          width: self.offsetWidth,
          height: self.offsetHeight,
          bottom: tmp.top + this.width,
          right: tmp.top + this.height
        };
      }
    },

    registerPopcornWithPlayer: function( popcorn ) {
      if ( !this.swfObj ) {
        this.addEventListener( "load", function() {
          this.registerPopcornWithPlayer( popcorn );
        });
        return;
      }

      this._popcorn = popcorn;

      var api = this._options.api;

      if ( api.key && api.commentdiv ) {
        var self = this;

        Popcorn.xhr({
          url: "http://api.soundcloud.com/tracks/" + self._mediaId + "/comments.js?consumer_key=" + api.key,
          success: function( data ) {
            Popcorn.forEach( data.json, function ( obj ) {
              self.addComment({
                start: obj.timestamp/1000,
                date: new Date( obj.created_at ),
                text: obj.body,
                user: {
                  name: obj.user.username,
                  profile: obj.user.permalink_url,
                  avatar: obj.user.avatar_url
                }
              });
            });
          }
        });
      }
    }
  });

  Popcorn.extend( Popcorn.soundcloud.prototype, {
    addComment: function( obj, displayFn ) {
      var self = this,
          comment = {
            start: obj.start || 0,
            date: obj.date || new Date(),
            text: obj.text || "",
            user: {
              name: obj.user.name || "",
              profile: obj.user.profile || "",
              avatar: obj.user.avatar || ""
            },
            display: function() {
              return ( displayFn || self._options.api.commentformat )( comment );
            }
          };

      this._comments.push( comment );

      if ( !this._popcorn ) {
        return;
      }

      this._popcorn.subtitle({
        start: comment.start,
        target: this._options.api.commentdiv,
        display: 'inline',
        language: 'en',
        text: comment.display()
      });
    }
  });
})( Popcorn, window );
