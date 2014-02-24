/**
 * The Popcorn._MediaElementProto object is meant to be used as a base
 * prototype for HTML*VideoElement and HTML*AudioElement wrappers.
 * MediaElementProto requires that users provide:
 *   - parentNode: the element owning the media div/iframe
 *   - _eventNamespace: the unique namespace for all events
 */
(function( Popcorn, document ) {

  /*********************************************************************************
   * parseUri 1.2.2
   * http://blog.stevenlevithan.com/archives/parseuri
   * (c) Steven Levithan <stevenlevithan.com>
   * MIT License
   */
  function parseUri (str) {
    var	o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) {
      uri[o.key[i]] = m[i] || "";
    }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) {
        uri[o.q.name][$1] = $2;
      }
    });

    return uri;
  }

  parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
      name:   "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };
  /*********************************************************************************/

  // Fake a TimeRanges object
  var _fakeTimeRanges = {
    length: 0,
    start: Popcorn.nop,
    end: Popcorn.nop
  };

  // Make sure the browser has MediaError
  window.MediaError = window.MediaError || (function() {
    function MediaError(code, msg) {
      this.code = code || null;
      this.message = msg || "";
    }
    MediaError.MEDIA_ERR_NONE_ACTIVE    = 0;
    MediaError.MEDIA_ERR_ABORTED        = 1;
    MediaError.MEDIA_ERR_NETWORK        = 2;
    MediaError.MEDIA_ERR_DECODE         = 3;
    MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

    return MediaError;
  }());


  function MediaElementProto() {
    var protoElement = {},
        events = {},
        parentNode;
    if ( !Object.prototype.__defineGetter__ ) {
      protoElement = document.createElement( "div" );
    }
    protoElement._util = {
      // Each wrapper stamps a type.
      type: "HTML5",

      // How often to trigger timeupdate events
      TIMEUPDATE_MS: 250,

      // Standard width and height
      MIN_WIDTH: 300,
      MIN_HEIGHT: 150,

      // Check for attribute being set or value being set in JS.  The following are true:
      //   autoplay
      //   autoplay="true"
      //   v.autoplay=true;
      isAttributeSet: function( value ) {
        return ( typeof value === "string" || value === true );
      },

      parseUri: parseUri
    };
    // Mimic DOM events with custom, namespaced events on the document.
    // Each media element using this prototype needs to provide a unique
    // namespace for all its events via _eventNamespace.
    protoElement.addEventListener = function( evtName, fn ) {

      if ( !events[ evtName ] ) {
        events[ evtName ] = [];
      }

      if ( events[ evtName ].indexOf( fn ) !== -1 ) {
        return;
      }

      events[ evtName ].push( fn );
    };

    protoElement.removeEventListener = function( evtName, fn ) {
      var i,
          listeners = events[ evtName ];

      if ( !listeners ){
        return;
      }

      // walk backwards so we can safely splice
      for ( i = events[ evtName ].length - 1; i >= 0; i-- ) {

        if( fn === listeners[ i ] ) {
          listeners.splice( i, 1 );
          return;
        }
      }
    };

    protoElement.dispatchEvent = function( oEvent ) {

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

      if ( events[ eventName ] ) {

        for ( var i = 0; i < events[ eventName ].length; i++ ) {

          events[ eventName ][ i ].call( self, evt, self );
        }
      }
    };

    protoElement.load = Popcorn.nop;

    protoElement.canPlayType = function( url ) {
      return "";
    };

    // Popcorn expects getBoundingClientRect to exist, forward to parent node.
    protoElement.getBoundingClientRect = function() {
      return parentNode.getBoundingClientRect();
    };

    protoElement.NETWORK_EMPTY = 0;
    protoElement.NETWORK_IDLE = 1;
    protoElement.NETWORK_LOADING = 2;
    protoElement.NETWORK_NO_SOURCE = 3;

    protoElement.HAVE_NOTHING = 0;
    protoElement.HAVE_METADATA = 1;
    protoElement.HAVE_CURRENT_DATA = 2;
    protoElement.HAVE_FUTURE_DATA = 3;
    protoElement.HAVE_ENOUGH_DATA = 4;
    Object.defineProperties( protoElement, {

      currentSrc: {
        get: function() {
          return this.src !== undefined ? this.src : "";
        }
      },

      parentNode: {
        get: function() {
          return parentNode;
        },
        set: function( val ) {
          parentNode = val;
        }
      },
      
      // We really can't do much more than "auto" with most of these.
      preload: {
        get: function() {
          return "auto";
        },
        set: Popcorn.nop
      },

      controls: {
        get: function() {
          return true;
        },
        set: Popcorn.nop
      },

      // TODO: it would be good to overlay an <img> using this URL
      poster: {
        get: function() {
          return "";
        },
        set: Popcorn.nop
      },

      crossorigin: {
        get: function() {
          return "";
        }
      },

      played: {
        get: function() {
          return _fakeTimeRanges;
        }
      },

      seekable: {
        get: function() {
          return _fakeTimeRanges;
        }
      },

      buffered: {
        get: function() {
          return _fakeTimeRanges;
        },
        configurable: true
      },

      defaultMuted: {
        get: function() {
          return false;
        }
      },

      defaultPlaybackRate: {
        get: function() {
          return 1.0;
        }
      },

      style: {
        get: function() {
          return this.parentNode.style;
        }
      },

      id: {
        get: function() {
          return this.parentNode.id;
        }
      }

      // TODO:
      //   initialTime
      //   playbackRate
      //   startOffsetTime

     });
    return protoElement;
  }

  Popcorn._MediaElementProto = MediaElementProto;

}( Popcorn, window.document ));
