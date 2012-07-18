//PLUGIN: facebook

(function( Popcorn, global ) {
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

  Popcorn.plugin( "facebook" , {
    manifest: {
      about: {
        name: "Popcorn Facebook Plugin",
        version: "0.1",
        author: "Dan Ventura, Matthew Schranz: @mjschranz",
        website: "dsventura.blogspot.com, mschranz.wordpress.com"
      },
      options: {
        type: {
          elem: "select",
          options: [ "LIKE", "LIKE-BOX", "ACTIVITY", "FACEPILE", "LIVE-STREAM", "SEND", "COMMENTS" ],
          label: "Plugin Type"
        },
        target: "facebook-container",
        start: {
          elem: "input",
          type: "number",
          label: "Start"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End"
        },
        // optional parameters:
        font: {
          elem: "input",
          type: "text",
          label: "Font",
          optional: true
        },
        xid: {
          elem: "input",
          type: "text",
          label: "Xid",
          optional: true
        },
        href: {
          elem: "input",
          type: "url",
          label: "href",
          optional: true
        },
        site: {
          elem: "input",
          type: "url",
          label: "Site",
          optional: true
        },
        height: {
          elem: "input",
          type: "text",
          label: "Height",
          "default": "200",
          optional: true
        },
        width: {
          elem: "input",
          type: "text",
          label: "Width",
          "default": "200",
          optional: true
        },
        action: {
          elem: "select",
          options: [ "like", "recommend" ],
          label: "Action",
          optional: true
        },
        stream: {
          elem: "input",
          type: "checkbox",
          label: "Stream",
          "default": false,
          optional: true
        },
        header: {
          elem: "input",
          type: "checkbox",
          label: "Header",
          "default": false,
          optional: true
        },
        layout: {
          elem: "select",
          options: [ "standard", "button_count", "box_count" ],
          label: "Layout",
          optional: true
        },
        max_rows: {
          elem: "input",
          type: "number",
          label: "Max Rows",
          "default": 1,
          optional: true
        },
        border_color: {
          elem: "input",
          type: "text",
          label: "Border Color",
          optional: true
        },
        event_app_id: {
          elem: "input",
          type: "text",
          label: "Event App Id",
          optional: true
        },
        colorscheme: {
          elem: "select",
          options: [ "light", "dark" ],
          label: "Color Scheme",
          optional: true
        },
        show_faces: {
          elem: "input",
          type: "checkbox",
          label: "Show Faces",
          "default": false,
          optional: true
        },
        recommendations: {
          elem: "input",
          type: "checkbox",
          label: "Recommendations",
          "default": false,
          optional: true
        },
        always_post_to_friends: {
          elem: "input",
          type: "checkbox",
          label: "Always post to Friends",
          "default": false,
          optional: true
        },
        num_posts: {
          elem: "input",
          type: "number",
          label: "Number of Comments",
          "default": 1,
          optional: true
        }
      }
    },

    _setup: function( options ) {

      var target = document.getElementById( options.target ),
          _type = options.type || "like";

      // facebook script requires a div named fb-root
      if ( !document.getElementById( "fb-root" ) ) {
        var fbRoot = document.createElement( "div" );
        fbRoot.setAttribute( "id", "fb-root" );
        document.body.appendChild( fbRoot );
      }

      if ( !ranOnce || options.event_app_id ) {
        ranOnce = true;
        // initialize facebook JS SDK
        Popcorn.getScript( "//connect.facebook.net/en_US/all.js" );

        global.fbAsyncInit = function() {
          FB.init({
            appId: ( options.event_app_id || "" ),
            status: true,
            cookie: true,
            xfbml: true
          });
        };
      }

      // Lowercase to make value consistent no matter what user inputs
      _type = _type.toLowerCase();

      options._container = document.createElement( "div" );
      options._container.id = "facebookdiv-" + Popcorn.guid();
      options._facebookdiv = document.createElement( "fb:" + _type );
      options._container.appendChild( options._facebookdiv );
      options._container.style.display = "none";

      // All the the "types" for facebook share largely identical attributes, for loop suffices.
      // ** Credit to Rick Waldron, it's essentially all his code in this function.
      // activity feed uses 'site' rather than 'href'
      var attr = _type === "activity" ? "site" : "href";

      options._facebookdiv.setAttribute( attr, ( options[ attr ] || document.URL ) );

      // create an array of Facebook widget attributes
      var fbAttrs = (
        "width height layout show_faces stream header colorscheme" +
        " maxrows border_color recommendations font always_post_to_friends xid" +
        " num_posts"
      ).split(" ");

      // For Each that loops through all of our attributes adding them to the divs properties
      Popcorn.forEach( fbAttrs, function( attr ) {
        // Test for null/undef. Allows 0, false & ""
        if ( options[ attr ] != null ) {
          options._facebookdiv.setAttribute( attr, options[ attr ] );
        }
      });

      target && target.appendChild( options._container );
    },
    /**
    * @member facebook
    * The start function will be executed when the currentTime
    * of the video reaches the start time provided by the
    * options variable
    */
    start: function( event, options ){
      options._container.style.display = "";
    },
    /**
    * @member facebook
    * The end function will be executed when the currentTime
    * of the video reaches the end time provided by the
    * options variable
    */
    end: function( event, options ){
      options._container.style.display = "none";
    },
    _teardown: function( options ){
      var target = document.getElementById( options.target );
      target && target.removeChild( options._container );
    }
  });

})( Popcorn, this );
