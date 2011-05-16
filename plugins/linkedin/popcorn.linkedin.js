//PLUGIN: linkedin
(function (Popcorn){
/**
   * LinkedIn Popcorn plug-in
   * Places a  LinkedIn plugin inside a div ( http://developers.facebook.com/docs/plugins/ )
   * Options parameter will need a start, end, target, type, and an api key
   * Optional parameters are url, counter, format, companyid, and productid
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Target is the id of the document element that the plugin needs to be attached to, this target element must exist on the DOM
   * Type is the name of the plugin, options are share, memberprofile, companyinsider, companyprofile, or recommendproduct  
   * Apikey is your own api key from obtained from https://www.linkedin.com/secure/developer
   * Url is the desired url to share via LinkedIn. Defaults to the current page if no url is specified
   * Counter is the position where the counter will be positioned. This is used if the type is "share" or "recommendproduct"
   *  The options are right and top (don't include this option if you do not want a counter)
   * Format is is the data format of the member and company profile plugins. The options are inlined, hover, and click. Defaults to inline 
   * Companyid must be specified if the type is "companyprofile," "companyinsider," or "recommendproduct"
   * Productid must be specified if the type is "recommendproduct"
   * 
   * @param {Object} options
   * 
   * Example:
   * <script src="popcorn.linkedin.js"></script>
   * ...
   * var p = Popcorn('#video')
   *     .linkedin({
   *       type    : 'share',
   *       url     : "http://www.google.ca",
   *       counter : "right",
   *       target  : 'sharediv'
   *       apikey : 'ZOLRI2rzQS_oaXELpPF0aksxwFFEvoxAFZRLfHjaAhcGPfOX0Ds4snkJpWwKs8gk',
   *       start   : 1,
   *       end     : 3
   *     } )
   *
   * This plugin will be displayed between 1 and 3 seconds, inclusive, in the video. This will show how many people have "shared" Google via LinkedIn,
   * with the number of people (counter) displayed to the right of the share plugin.
   */
   
  Popcorn.plugin( "linkedin", {

    manifest: {

      about: {

        name   : "Popcorn LinkedIn Plugin",
        version: "0.1",
        author : "Dan Ventura",
        website: "dsventura.blogspot.com"
      },
      options: {

        type   : {elem:"input", type:'text', label:"Type"},
        target : 'linkedin-container'
      }
    },
    
    _setup: function( options ) {

      var apikey = options.apikey,
          target  = document.getElementById( options.target );

      if ( !document.getElementById("linkedin-root") ) {
        var root = document.createElement( 'div' );
        root.setAttribute( 'div', "linkedin-root" );
        document.body.appendChild( root );
        
        (function() {
          var linkedinAPIScript = document.createElement( 'script' );
          linkedinAPIScript.setAttribute( 'src', "http://platform.linkedin.com/in.js" );
          linkedinAPIScript.setAttribute( 'type', "text/javascript" );
          linkedinAPIScript.setAttribute( 'async', 'true' );
          root.appendChild( linkedinAPIScript );
        }());
      }
      
      options._container = document.createElement( 'script' );
      
      if ( apikey ) {
        options._container.innerHTML = 'api_key: ' + apikey;
      }
      
      options.type = options.type.toLowerCase();
      
      // Replace the LinkedIn plugin's error message to something more helpful
      var errorMsg = function() {

        options._container = document.createElement( "p" );
        options._container.innerHTML = "Plugin requires a valid <a href='https://www.linkedin.com/secure/developer'>apikey</a>";
        document.getElementById( options.target ).appendChild( options._container );
      };
      
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

            options._container.setAttribute( 'type', "IN/MemberProfile" );
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
      
      if ( !apikey ) {

        errorMsg();
      } else {

        setOptions[ options.type ] && setOptions[ options.type ]();
      }
      
      if ( document.getElementById( options.target ) ) {
        document.getElementById( options.target ).appendChild( options._container );
      }

      target.style.display = "none";
    },
    
    /**
     * @member linkedin
     * The start function will be executed when the currentTime
     * of the video reaches the start time provided by the
     * options variable
     */
    start: function( event, options ) {
      
      options._container.parentNode.style.display = "block";
    },
    
    /**
     * @member linkedin
     * The end function will be executed when the currentTime
     * of the video reaches the end time provided by the
     * options variable
     */    
    end: function( event, options ) {
      
      options._container.parentNode.style.display = "none";
    }
  });

})( Popcorn );