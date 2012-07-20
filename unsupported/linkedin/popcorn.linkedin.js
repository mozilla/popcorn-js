//PLUGIN: linkedin

(function ( Popcorn ){

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
   * Format is the data format of the member and company profile plugins. The options are inlined, hover, and click. Defaults to inline
   * Companyid must be specified if the type is "companyprofile," "companyinsider," or "recommendproduct"
   * Productid must be specified if the type is "recommendproduct"
   *
   * @param {Object} options
   *
   * Example:
   * <script src="popcorn.linkedin.js"></script>
   * ...
   * var p = Popcorn("#video")
   *     .linkedin({
   *       type: "share",
   *       url: "http://www.google.ca",
   *       counter: "right",
   *       target: "sharediv"
   *       apikey: "ZOLRI2rzQS_oaXELpPF0aksxwFFEvoxAFZRLfHjaAhcGPfOX0Ds4snkJpWwKs8gk",
   *       start: 1,
   *       end: 3
   *     })
   *
   * This plugin will be displayed between 1 and 3 seconds, inclusive, in the video. This will show how many people have "shared" Google via LinkedIn,
   * with the number of people (counter) displayed to the right of the share plugin.
   */
  Popcorn.plugin( "linkedin", {
    manifest: {
      about: {
        name: "Popcorn LinkedIn Plugin",
        version: "0.1",
        author: "Dan Ventura",
        website: "dsventura.blogspot.com"
      },
      options: {
        type: {
          elem: "input",
          type: "text",
          label: "Type"
        },
        url: {
          elem: "input",
          type: "url",
          label: "URL"
        },
        apikey: {
          elem: "input",
          type: "text",
          label: "API Key"
        },
        counter: {
          elem: "input",
          type: "text",
          label: "Counter"
        },
        memberid: {
          elem: "input",
          type: "text",
          label: "Member ID",
          optional: true
        },
        format: {
          elem: "input",
          type: "text",
          label: "Format",
          optional: true
        },
        companyid: {
          elem: "input",
          type: "text",
          label: "Company ID",
          optional: true
        },
        modules: {
          elem: "input",
          type: "text",
          label: "Modules",
          optional: true
        },
        productid: {
          elem: "input",
          type: "text",
          label: "Product Id",
          optional: true
        },
        related: {
          elem: "input",
          type: "text",
          label: "Related",
          optional: true
        },
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

        target: "linkedin-container"
      }
    },
    _setup: function( options ) {

      var apikey = options.apikey,
          target = document.getElementById( options.target ),
          script = document.createElement( "script" );

      Popcorn.getScript( "//platform.linkedin.com/in.js" );

      options._container = document.createElement( "div" );
      options._container.appendChild( script );

      if ( apikey ) {
        script.innerHTML = "api_key: " + apikey;
      }

      options.type = options.type && options.type.toLowerCase() || "";

      // Replace the LinkedIn plugin's error message to something more helpful
      var errorMsg = function() {
        options._container = document.createElement( "p" );
        options._container.innerHTML = "Plugin requires a valid <a href='https://www.linkedin.com/secure/developer'>apikey</a>";

        target && target.appendChild( options._container );
      };

      var setOptions = (function ( options ) {

        return {
          share: function () {

            script.setAttribute( "type", "IN/Share" );

            if ( options.counter ) {
              script.setAttribute( "data-counter", options.counter );
            }
            if ( options.url ) {
              script.setAttribute( "data-url", options.url );
            }
          },
          memberprofile: function () {

            script.setAttribute( "type", "IN/MemberProfile" );
            script.setAttribute( "data-id", ( options.memberid ) );
            script.setAttribute( "data-format", ( options.format || "inline" ) );

            if ( options.text && options.format.toLowerCase() !== "inline" ) {
              script.setAttribute( "data-text", options.text );
            }
          },
          companyinsider: function () {

            script.setAttribute( "type", "IN/CompanyInsider" );
            script.setAttribute( "data-id", options.companyid );

            if( options.modules ) {
              options._container.setAttribute( "data-modules", options.modules );
            }
          },
          companyprofile: function () {

            script.setAttribute( "type", "IN/CompanyProfile" );
            script.setAttribute( "data-id", ( options.companyid ) );
            script.setAttribute( "data-format", ( options.format || "inline" ) );

            if ( options.text && options.format.toLowerCase() !== "inline" ) {
              script.setAttribute( "data-text", options.text );
            }
            if ( options.related !== undefined ) {
              script.setAttribute( "data-related", options.related );
            }
          },
          recommendproduct: function () {

            script.setAttribute( "type", "IN/RecommendProduct" );
            script.setAttribute( "data-company", ( options.companyid || "LinkedIn" ) );
            script.setAttribute( "data-product", ( options.productid || "201714" ) );

            if ( options.counter ) {
              script.setAttribute( "data-counter", options.counter );
            }
          }
        };
      })( options );

      if ( !apikey ) {
        errorMsg();
      } else {
        setOptions[ options.type ] && setOptions[ options.type ]();
      }

      target && target.appendChild( options._container );

      options._container.style.display = "none";
    },
    /**
     * @member linkedin
     * The start function will be executed when the currentTime
     * of the video reaches the start time provided by the
     * options variable
     */
    start: function( event, options ) {
      options._container.style.display = "block";
    },
    /**
     * @member linkedin
     * The end function will be executed when the currentTime
     * of the video reaches the end time provided by the
     * options variable
     */
    end: function( event, options ) {
      options._container.style.display = "none";
    },
    _teardown: function( options ) {
      var tar = document.getElementById( options.target );
      tar && tar.removeChild( options._container );
    }
  });
})( Popcorn );
