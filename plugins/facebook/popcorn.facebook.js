//PLUGIN: facebook

(function(Popcorn, global ) {
/**
  * Facebook Popcorn plug-in
  * Places Facebook's "social plugins" inside a div ( http://developers.facebook.com/docs/plugins/ )
  * Sets options according to user input or default values
  * Options parameter will need a target, type, start and end time
  * Type is the name of the plugin in fbxml format. Options: LIKE (default), LIKE-BOX, ACTIVITY, FACEPILE
  * Target is the id of the document element that the text needs to be attached to. This target element must exist on the DOM
  * Start is the time that you want this plug-in to execute
  * End is the time that you want this plug-in to stop executing
  *
  * Other than the mandatory four parameters, there are several optional parameters (Some options are only applicable to certain plugins)
  * Action - like button will either "Like" or "Recommend". Options: recommend / like(default)
  * Always_post_to_friends - live-stream posts will be always be posted on your facebook wall if true. Options: true / false(default)
  * Border_color - border color of the activity feed. Names (i.e: "white") and html color codes are valid
  * Colorscheme - changes the color of almost all plugins. Options: light(default) / dark
  * Event_app_id - an app_id is required for the live-stream plugin
  * Font - the font of the text contained in the plugin. Options: arial / segoe ui / tahoma / trebuchet ms / verdana / lucida grande
  * Header - displays the title of like-box or activity feed. Options: true / false(default)
  * Href - url to apply to the plugin. Default is current page
  * Layout - changes the format of the 'like' count (written in english or a number in a callout).
  *          Options: box_count / button_count / standard(default)
  * Max_rows - number of rows to disperse pictures in facepile. Default is 1
  * Recommendations - shows recommendations, if any, in the bottom half of activity feed. Options: true / false(default)
  * Show_faces - show pictures beside like button and like-box. Options: true / false(default)
  * Site - href for activity feed. No idea why it must be "site". Default is current page
  * Stream - displays a the latest posts from the specified page's wall. Options: true / false(default)
  * Type - determines which plugin to create. Case insensitive
  * Xid - unique identifier if more than one live-streams are on one page
  *
  * @param {Object} options
  *
  * Example:
    var p = Popcorn('#video')
      .facebook({
        type  : "LIKE-BOX",
        target: "likeboxdiv",
        start : 3,
        end   : 10,
        href  : "http://www.facebook.com/senecacollege",
        show_faces: "true",
        header: "false"
      } )
  * This will show how many people "like" Seneca College's Facebook page, and show their profile pictures
  */

  var ranOnce = false;

  function toggle( container, display ) {
    if ( container ) {
      container.style.display = display;

      return;
    }

    setTimeout(function() {
      toggle( container, display );
    }, 10 );
  }

  Popcorn.plugin( "facebook" , {
    manifest: {
      about: {
        name: "Popcorn Facebook Plugin",
        version: "0.1",
        author: "Dan Ventura",
        website: "dsventura.blogspot.com"
      },
      options: {
        type: {
          elem: "select",
          options: [ "LIKE", "LIKE-BOX", "ACTIVITY", "FACEPILE", "LIVE-STREAM", "SEND" ],
          label: "Type"
        },
        target: "facebook-container",
        start: {
          elem: "input",
          type: "number",
          label: "In"
        },
        end: {
          elem: "input",
          type: "number",
          label: "Out"
        },
        // optional parameters:
        font: {
          elem: "input",
          type: "text",
          label: "font"
        },
        xid: {
          elem: "input",
          type: "text",
          label: "Xid"
        },
        href: {
          elem: "input",
          type: "text",
          label: "Href"
        },
        site: {
          elem: "input",
          type: "text",
          label:"Site"
        },
        height: {
          elem: "input",
          type: "text",
          label: "Height"
        },
        width: {
          elem: "input",
          type: "text",
          label: "Width"
        },
        action: {
          elem: "select",
          options: [ "like", "recommend" ],
          label: "Action"
        },
        stream: {
          elem: "select",
          options: [ "false", "true" ],
          label: "Stream"
        },
        header: {
          elem: "select",
          options: [ "false", "true" ],
          label: "Header"
        },
        layout: {
          elem: "select",
          options: [ "standard", "button_count", "box_count" ],
          label: "Layout"
        },
        max_rows: {
          elem: "input",
          type: "text",
          label: "Max_rows"
        },
        border_color: {
          elem: "input",
          type: "text",
          label: "Border_color"
        },
        event_app_id: {
          elem: "input",
          type: "text",
          label: "Event_app_id"
        },
        colorscheme: {
           elem: "select",
           options: [ "light", "dark" ],
           label: "Colorscheme"
        },
        show_faces: {
           elem: "select",
           options: [ "false", "true" ],
           label: "Showfaces"
        },
        recommendations: {
           elem: "select",
           options: [ "false", "true" ],
           label: "Recommendations"
        },
        always_post_to_friends: {
          elem: "input",
          options: [ "false", "true" ],
          label: "Always_post_to_friends"
        }
      }
    },

    _setup: function( options ) {

      var target = document.getElementById( options.target ),
          _type = options.type,
          _font = options.font,
          _xid = options.xid,
          _href = options.href,
          _site = options.site,
          _height = options.height,
          _width = options.width,
          _action = options.action,
          _stream = options.stream,
          _header = options.header,
          _layout = options.layout,
          _maxRows = options.max_rows,
          _borderColor = options.border_color,
          _colorScheme = options.colorscheme,
          _showFaces = options.show_faces,
          _recom = options.recommendations,
          _APTF = options.always_post_to_friends;

      // facebook script requires a div named fb-root
      if ( !document.getElementById( "fb-root" ) ) {
        var fbRoot = document.createElement( "div" );
        fbRoot.setAttribute( "id", "fb-root" );
        document.body.appendChild( fbRoot );
      }

      if ( !ranOnce || options.event_app_id ) {
        ranOnce = true;
        // initialize facebook JS SDK
        Popcorn.getScript( "http://connect.facebook.net/en_US/all.js" );

        global.fbAsyncInit = function() {
          FB.init({
            appId: ( options.event_app_id || "" ),
            status: true,
            cookie: true,
            xfbml: true
          });
        };
      }

      var validType = function( type ) {
        return ( [ "like", "like-box", "activity", "facepile", "comments", "live-stream", "send" ].indexOf( type ) > -1 );
      };

      // default plugin is like button
      _type = ( _type || "like" ).toLowerCase();

      // default plugin is like button
      if ( !validType( _type ) ) {
        _type = "like";
      }

      options._container = document.createElement( "fb:" +_type );

      var setOptions = (function( options ) {

        options._container.style.display = "none";

        // activity feed uses 'site' rather than 'href'
        var attr = _type === "activity" ? "site" : "href";

        options._container.setAttribute( attr, ( options[ attr ] || document.URL ) );

        return {
          "like": function () {
            options._container.setAttribute( "send", ( options.send || false ) );
            options._container.setAttribute( "width", _width );
            options._container.setAttribute( "show_faces", _showFaces );
            options._container.setAttribute( "layout", _layout );
            options._container.setAttribute( "font", _font );
            options._container.setAttribute( "colorscheme", _colorScheme );
          },
          "like-box": function () {
            options._container.setAttribute( "height", ( _height || 250 ) );
            options._container.setAttribute( "width", _width );
            options._container.setAttribute( "show_faces", _showFaces );
            options._container.setAttribute( "stream", _stream );
            options._container.setAttribute( "header", _header );
            options._container.setAttribute( "colorscheme", _colorScheme );
          },
          "facepile": function () {
            options._container.setAttribute( "height", _height );
            options._container.setAttribute( "width", _width );
            options._container.setAttribute( "max_rows", ( _maxRows || 1 ) );
          },
          "activity": function () {
            options._container.setAttribute( "width", _width );
            options._container.setAttribute( "height", _height );
            options._container.setAttribute( "header", _header );
            options._container.setAttribute( "border_color", _borderColor );
            options._container.setAttribute( "recommendations", _recom );
            options._container.setAttribute( "font", _font );
            options._container.setAttribute( "colorscheme", _colorScheme );
          },
          "live-stream": function() {
            options._container.setAttribute( "width", ( _width || 400 ) );
            options._container.setAttribute( "height", ( _height || 500 ) );
            options._container.setAttribute( "always_post_to_friends", ( _APTF || false ) );
            options._container.setAttribute( "event_app_id", options.event_app_id );
            options._container.setAttribute( "xid", _xid );
          },
          "send": function() {
            options._container.setAttribute( "font", _font );
            options._container.setAttribute( "colorscheme", _colorScheme );
          }
        };
      })( options );

      setOptions[ _type ]();

      if ( !target && Popcorn.plugin.debug ) {
        throw new Error( "Facebook target container doesn't exist" );
      }
      target && target.appendChild( options._container );
    },
    /**
    * @member facebook
    * The start function will be executed when the currentTime
    * of the video reaches the start time provided by the
    * options variable
    */
    start: function( event, options ){
      toggle( options._container, "inline" );
    },
    /**
    * @member facebook
    * The end function will be executed when the currentTime
    * of the video reaches the end time provided by the
    * options variable
    */
    end: function( event, options ){
      toggle ( options._container, "none" );
    }
  });

})( Popcorn, this );
