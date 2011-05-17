//PLUGIN: facebook

(function (Popcorn){
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
   * This will show how many people "like" Seneca College's Facebook page, and show their profile pictures (show_faces)
   *
   Other than the mandatory four parameters, there are several optional parameters (Some options are only applicable to certain plugins)
   * Font - the font of the text contained in the plugin. Options: arial / segoe ui / tahoma / trebuchet ms / verdana / lucida grande
   * Action - like button will either "Like" or "Recommend". Options: recommend / like(default)
   * Recommendations - shows recommendations, if any, in the bottom half of activity feed. Options: true / false(default)
   * Border_color - border color of the activity feed. Names (i.e: "white") and html color codes are valid
   * Max_rows - number of rows to disperse pictures in facepile. Default is 1
   * Stream - displays a the latest posts from the specified page's wall. Options: true / false(default)
   * Header - displays the title of like-box or activity feed. Options: true / false(default)
   * Colorscheme - changes the color of almost all plugins. Options: light(default) / dark
   * Layout - changes the format of the 'like' count (written in english or a number in a callout).
     Options: box_count / button_count / standard(default)
   * Show_faces - show pictures beside like button and like-box. Options: true / false(default)
   * Href - url to apply to the plugin. Default is current page
   * Site - href for activity feed. No idea why it must be "site". Default is current page
   * Type - determines which plugin to create
   */
  Popcorn.plugin( "facebook" , {  
    manifest:{
      about:{
        name   : "Popcorn Facebook Plugin",
        version: "0.1",
        author : "Dan Ventura",
        website: "dsventura.blogspot.com"
      },
      options:{
        type   : {elem:"select", options:["LIKE", "LIKE-BOX", "ACTIVITY", "FACEPILE"], label:"Type"},
        target : "facebook-container",
        start  : {elem:'input', type:'number', label:'In'},
        end    : {elem:'input', type:'number', label:'Out'},
        // optional parameters:
        font   : {elem:"input", type:"text", label:"font"},
        action : {elem:"select", options:["like", "recommend"], label:"Action"},
        recommendations : {elem:"select", options:["false", "true"], label:"Recommendations"},
        border_color    : {elem:"input",  type:"text", label:"Border_color"},
        height          : {elem:"input",  type:"text", label:"Height"},
        width           : {elem:"input",  type:"text", label:"Width"},
        max_rows        : {elem:"input",  type:"text", label:"Max_rows"},
        stream          : {elem:"select", options:["false", "true"], label:"Stream"},
        header          : {elem:"select", options:["false", "true"], label:"Header"},
        colorscheme     : {elem:"select", options:["light", "dark"], label:"Colorscheme"},
        layout          : {elem:"select", options:["standard", "button_count", "box_count"], label:"Layout"},
        show_faces      : {elem:"select", options:["false", "true"], label:"Showfaces"},
        href            : {elem:"input",  type:"text", label:"Href"},
        site            : {elem:"input",  type:"text", label:"Site"}
      }
    },
    
    _setup: function( options ) {

      // facebook script requires a div named fb-root
      if( !document.getElementById( "fb-root" ) ) {
        var fbRoot = document.createElement( "div" );
        fbRoot.setAttribute( "id", "fb-root" );
        document.body.appendChild( fbRoot );
        
        // initialize facebook JS SDK
        Popcorn.getScript("http://connect.facebook.net/en_US/all.js");
        window.fbAsyncInit = function() {
          FB.init({
            appId  : "YOUR APP ID",
            status : true,
            cookie : true,
            xfbml  : true
          });
        };
      }
      
      var validType = function( type ){
        var valid = false;
        var existing = [ "like", "like-box", "activity", "facepile" ];
        
        for(var i in existing){
          if ( type.toLowerCase() === existing[i] ) {
            valid = true;
          }
        }
        
        return valid;
      };
      
      // default plugin is like button
      if( typeof( options.type ) === "undefined"){
        options.type = "like";
      } else if ( !validType( options.type ) ){
        return;
      }
      
      options.type = options.type.toLowerCase();
      options._container = document.createElement( "fb:" + options.type );
      
      // setOptions property list doesn't accept dashes
      if( options.type === "like-box" ) {
        options.type = "likebox";
      }
      
      var setOptions = (function ( options ) {
        options._container.style.display = "none";
        // activity feed uses 'site' rather than 'href'
        if ( options.type === "activity" ) {
          options._container.setAttribute( "site", ( options.site || document.URL));
        } else {
          options._container.setAttribute( "href", ( options.href || document.URL ) );
        }

        return {
          like: function () {
            options._container.setAttribute( "width", options.width );
            options._container.setAttribute( "show_faces", options.show_faces );
            options._container.setAttribute( "layout", options.layout );
            options._container.setAttribute( "font", options.font );
            options._container.setAttribute( "colorscheme", options.colorscheme );
          },
          likebox: function () {
            options._container.setAttribute( "height", ( options.height || 250 ) );
            options._container.setAttribute( "width", options.width );
            options._container.setAttribute( "show_faces", options.show_faces );
            options._container.setAttribute( "stream", options.stream );
            options._container.setAttribute( "header", options.header );
            options._container.setAttribute( "colorscheme", options.colorscheme );
          },
          facepile: function () {
            options._container.setAttribute( "height", options.height );
            options._container.setAttribute( "width", options.width );
            options._container.setAttribute( "max_rows", ( options.max_rows || 1 ) );
          },
          activity: function () {
            options._container.setAttribute( "width", options.width );
            options._container.setAttribute( "height", options.height );
            options._container.setAttribute( "header", options.header );
            options._container.setAttribute( "border_color", options.border_color );
            options._container.setAttribute( "recommendations", options.recommendations );
            options._container.setAttribute( "font", options.font );
            options._container.setAttribute( "colorscheme", options.colorscheme );
          }
        };
      })( options );

      setOptions[ options.type ]();
      
      if ( document.getElementById( options.target ) ) {
        document.getElementById( options.target ).appendChild( options._container );
      }
    },
    /**
    * @member facebook
    * The start function will be executed when the currentTime
    * of the video reaches the start time provided by the
    * options variable
    */
    start: function( event, options ){
      var display = function () {
        if ( options._container ) {
          options._container.style.display = "inline";
        } else {
          setTimeout ( display, 10 ); 
        }
      }
      
      display();
      
    },
    /**
    * @member facebook
    * The end function will be executed when the currentTime
    * of the video reaches the end time provided by the
    * options variable
    */
    end: function( event, options ){
      var hide = function () {
        if ( options._container ) {
      options._container.style.display = "none";
      } else {
          setTimeout ( hide, 10 ); 
        }
      }
      
      hide();
    }
  });

})( Popcorn );

