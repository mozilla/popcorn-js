//PLUGIN: linkedin

(function (Popcorn){
/**
   * Facebook Popcorn plug-in 
   * Places Facebook's "social plugins" inside a div ( http://developers.facebook.com/docs/plugins/ )
   * Sets options according to user input or default values
   * Options parameter will need a target and a type
   * Type is the name of the plugin in fbxml format. i.e: <fb:like> would have a type of like, respectively
   * Target is the id of the document element that the text needs to be 
   * attached to, this target element must exist on the DOM
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .facebook({
          id: "fb-likebox",
          href: "http://www.facebook.com/senecacollege",
          type: "LIKE-BOX",
          show_faces: "true",
          header: "false",
          target: 'likeboxdiv'
        } )

    This will show how many people "like" Seneca College's Facebook page, and show their profile pictures (show_faces)
   *
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
        id     : {elem:'input', type:'text', label:'Id'},
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
          document.getElementById( 'linkedin-root' ).appendChild( s );
        }());
      }
      
      options._container = document.createElement( 'script' );
      options.type = options.type.toLowerCase();
      
      var setOptions = (function ( options ) {
        return {
          share: function () {
            options._container.setAttribute( 'type', "IN/Share" );
            if ( !!options.data-counter ) {
              options._container.setAttribute( 'data-counter', options.data-counter );
            }
            if ( !!options.data-url ) {
              options._container.setAttribute( 'data-url', options.data-url);
            }
            /*
  SHARE BTN
  <script type="IN/Share" data-counter="right"></script> 
  options:
  data-url (default = this. no element)
  data-counter (top/right/null. no element)
  */
          },
          memberprofile: function () {
            options._container.setAttribute( 'type', "IN/MemberProfile" );
            options._container.setAttribute( 'data-format', "IN/MemberProfile" );
            options._container.setAttribute( 'data-counter', options.data-counter );
            if ( !!options.data-text && options.data-counter.toLowerCase() !== "inline" ) {
              options._container.setAttribute( 'data-text', options.data-text );
            }
          /*
  MEMBER PROFILE
  <script type="IN/MemberProfile" data-id="/in/jeffweiner08" data-format="inline"></script>
  options:
  data-id (profile page)
  data-format (inline/hover/click)
  data-text (optional. no element)
  */            
          },
          companyinsider: function () {
            options._container.setAttribute( 'type', "IN/CompanyInsider" );
            options._container.setAttribute( 'data-id', ( options.data-id || "LinkedIn" ) );
            if( !!options.data-modules ) {
              options._container.setAttribute( 'data-modules', options.data-modules );
            }
          /*
  COMPANY INSIDER
  <script type="IN/CompanyInsider" data-id="LinkedIn" data-modules="innetwork,newhires,jobchanges"></script>
  options:
  data-id="LinkedIn" <- requires some string of numbers. possibly available to comapny site?
  data-modules="innetwork,newhires,jobchanges" [no element = all? wtf?]
  */            
          },
          companyprofile: function () {
            options._container.setAttribute( 'type', "IN/CompanyProfile" );
            options._container.setAttribute( 'data-id', ( options.data-id || "LinkedIn" ) );
            options._container.setAttribute( 'data-format', options.data-format );
            if ( !!options.data-text && options.data-format.toLowerCase() !== "inline" ) {
              options._container.setAttribute( 'data-text', options.data-text );
            }
            if ( options.data-related != undefined ) {
              options._container.setAttribute( 'data-related', options.data-related );
            }
            /*
  COMPANY PROFILE
  <script type="IN/CompanyProfile" data-id="LinkedIn" data-format="inline"></script>
  options:
  data-id="LinkedIn" <- again, needs some fucked up number
  data-format="inline/hover/click"
  data-text (optional. no element)
  data-related="false" (no element for true)
  */       
          },
          recommendproduct: function () {
            options._container.setAttribute( 'type', "IN/RecommendProduct" );
            options._container.setAttribute( 'data-company', ( options.data-id || "LinkedIn" ) );
            options._container.setAttribute( 'data-company', ( options.data-product || "201714" ) );
            options._container.setAttribute( 'data-format', options.data-format );
            if ( !!options.data-counter ) {
              options._container.setAttribute( 'data-counter', options.data-counter );
            }
            /*
  RECOMMEND BTN
  <script type="IN/RecommendProduct" data-company="LinkedIn" data-product="201714" data-counter="top"></script>
  options:
  data-company="LinkedIn" <- number
  data-product="201714" <- number
  data-counter="top/right/null. no element"
   */
          }
        };
      })( options );
      
      setOptions[ options.type ] && setOptions[ options.type ]();
      
      if ( document.getElementById( options.target ) ) {
        document.getElementById( options.target ).appendChild( options._container );
      }
    }
  });

})( Popcorn );