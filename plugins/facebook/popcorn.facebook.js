//PLUGIN: facebook

(function (Popcorn){
/**
   * Facebook Popcorn plug-in 
   * Places Facebook's "social plugins" inside a div ( http://developers.facebook.com/docs/plugins/ )
   * Sets options according to user input or default values
   * Options parameter will need a target and a type
   * Type is the name of the plugin in fbxml format. Options: LIKE (default), LIKE-BOX, ACTIVITY, FACEPILE
   * Target is the id of the document element that the text needs to be 
   * attached to, this target element must exist on the DOM
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .facebook({
          href: "http://www.facebook.com/senecacollege",
          type: "LIKE-BOX",
          show_faces: "true",
          header: "false",
          target: "likeboxdiv"
        } )

    This will show how many people "like" Seneca College's Facebook page, and show their profile pictures (show_faces)
   *
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
        id     : {elem:"input", type:"text", label:"Id"},
        type   : {elem:"input", type:"text", label:"Type"},
        target : "facebook-container"
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
      
      options._container = document.createElement( "fb:" + ( options.type.toLowerCase() || "like" ) );
      
      // setOptions property list doesn't accept dashes
      if( options.type === "LIKE-BOX" ) {
        options.type = "likebox";
      }
      
      var setOptions = (function ( options ) {
        options._container.setAttribute( "href", ( options.href || document.URL ) );
        return {
          like: function () {
            options._container.setAttribute( "width", ( options.width || "450" ) );
            options._container.setAttribute( "show_faces", ( options.show_faces || "false" ) );
            options._container.setAttribute( "layout", ( options.layout || "standard" ) );
            options._container.setAttribute( "font", options.font );
          },
          likebox: function () {
            options._container.setAttribute( "width", ( options.width || "292" ) );
            options._container.setAttribute( "show_faces", ( options.show_faces || "false" ) );
            options._container.setAttribute( "stream", ( options.stream || "false" ) );
            options._container.setAttribute( "header", ( options.header || "true" ) );
          },
          facepile: function () {
            options._container.setAttribute( "width", ( options.width || "200" ) );
            options._container.setAttribute( "max_rows", ( options.max_rows || "1" ) );
          },
          activity: function () {
            options._container.setAttribute( "width", ( options.width || "300" ) );
            options._container.setAttribute( "height", ( options.height || "300" ) );
            options._container.setAttribute( "header", ( options.header || "true" ) );
            options._container.setAttribute( "border_color", ( options.border_color || "#000000" ) );
            options._container.setAttribute( "recommendations", ( options.recommendations || "false" ) );
            options._container.setAttribute( "font", options.font );
          }
        };
      })( options );
      
      setOptions[ options.type.toLowerCase() ] && setOptions[ options.type.toLowerCase() ]();
      
      if ( document.getElementById( options.target ) ) {
        document.getElementById( options.target ).appendChild( options._container );
      }
    }
  });

})( Popcorn );