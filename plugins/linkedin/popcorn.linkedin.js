//PLUGIN: linkedin
(function (Popcorn){
/**
   * LinkedIn Popcorn plug-in 
   * An api_key must be specified before the linkedin.js script
   * Places a  LinkedIn plugin inside a div ( http://developers.facebook.com/docs/plugins/ )
   * Sets options according to user input or default values
   * Options parameter will need a target and a type
   * Type is the name of the plugin. Either share, memberprofile, companyinsider, companyprofile, or recommendproduct
   * Target is the id of the document element that the plugin needs to be 
   * attached to, this target element must exist on the DOM
   * 
   * @param {Object} options
   * 
   * Example:
   * // This api_key is valid for the matrix.senecac.on.ca domain
   * <script>
   *   var api_key = 'ND1uSIEUBH8MkI8E7g41kgGlWUexzvFL9uB2ihJbIrFuqunFq8aVmUrxyfAqxCBX';
   * </script>
   * <script src="popcorn.linkedin.js"></script>
   * ...
   * var p = Popcorn('#video')
   *     .linkedin({
   *       type    : 'share',
   *       url     : "http://www.google.ca",
   *       counter : "right",
   *       target  : 'sharediv'
   *     } )
   *
   * This will show how many people have "shared" Google (default url is current page, if non specified) via LinkedIn.
   * Will show number of people (counter) to the right of the share plugin.
   */
   
  Popcorn.plugin( "linkedin" , {  
    manifest:{
      about:{
        name   : "Popcorn LinkedIn Plugin",
        version: "0.1",
        author : "Dan Ventura",
        website: "dsventura.blogspot.com"
      },
      options:{
        type   : {elem:"input", type:'text', label:"Type"},
        target : 'linkedin-container'
      }
    },  
    
    _setup: function( options ) {
      // similar to facebook script load idea
      if ( !document.getElementById("linkedin-root") ) {
        var r = document.createElement( 'div' );
        r.setAttribute( 'div', "linkedin-root" );
        document.body.appendChild( r );
        
        (function() {
          var s = document.createElement( 'script' );
          s.setAttribute( 'src', "http://platform.linkedin.com/in.js" );
          s.setAttribute( 'type', "text/javascript" );
          s.setAttribute( 'async', 'true' );
          if ( typeof( api_key ) !== "undefined" ) {
            s.innerHTML = 'api_key: ' + api_key;
          }
          r.appendChild( s );
        }());
      }
      
      options._container = document.createElement( 'script' );
      options.type = options.type.toLowerCase();
      
      // Replace the LinkedIn plugin's error message to something more helpful
      var errorMsg = function () {
        options._container = document.createElement( 'p' );
        options._container.innerHTML = "Plugin requires a valid <a href=\"https://www.linkedin.com/secure/developer\">api_key</a>";
        document.getElementById( options.target ).appendChild( options._container );
      }
      
      var setOptions = (function ( options ) {
        return {
          share: function () {
            options._container.setAttribute( 'type', "IN/Share" );
            if ( options.counter ) {
              options._container.setAttribute( 'data-counter', options.counter );
            }
            if ( options.url ) {
              options._container.setAttribute( 'data-url', options.url);
            }
          },
          memberprofile: function () {
            options._container.setAttribute('type', "IN/MemberProfile");
            options._container.setAttribute( 'data-id', ( options.memberid ) );
            options._container.setAttribute( 'data-format', ( options.format || "inline" ) );
            if ( options.text && options.format.toLowerCase() !== "inline" ) {
              options._container.setAttribute( 'data-text', options.text );
            }
          },
          companyinsider: function () {
            options._container.setAttribute( 'type', "IN/CompanyInsider" );
            options._container.setAttribute( 'data-id', options.companyid );
            if( options.modules ) {
              options._container.setAttribute( 'data-modules', options.modules );
            }
          },
          companyprofile: function () {
            options._container.setAttribute( 'type', "IN/CompanyProfile" );
            options._container.setAttribute( 'data-id', ( options.companyid ) );
            options._container.setAttribute( 'data-format', ( options.format || "inline" ) );
            if ( options.text && options.format.toLowerCase() !== "inline" ) {
              options._container.setAttribute( 'data-text', options.text );
            }
            if ( options.related !== undefined ) {
              options._container.setAttribute( 'data-related', options.related );
            }
          },
          recommendproduct: function () {
            options._container.setAttribute( 'type', "IN/RecommendProduct" );
            options._container.setAttribute( 'data-company', ( options.companyid || "LinkedIn" ) );
            options._container.setAttribute( 'data-product', ( options.productid || "201714" ) );
            if ( options.counter ) {
              options._container.setAttribute( 'data-counter', options.counter );
            }
          }
        };
      })( options );
      
      if ( typeof( api_key ) === "undefined" ) {
        errorMsg();
      }
      else {
        setOptions[ options.type ] && setOptions[ options.type ]();
      }
      
      if ( document.getElementById( options.target ) ) {
        document.getElementById( options.target ).appendChild( options._container );
      }
    }
  });

})( Popcorn );