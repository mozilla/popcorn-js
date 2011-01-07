// PLUGIN: Subtitle

(function (Popcorn) {
  
  /**
   */

  // just a little tool function
  // calculates the top and left position of an element
  var offset = function(elem) {
    if(!elem) elem = this;

    var x = elem.offsetLeft;
    var y = elem.offsetTop;

    while (elem = elem.offsetParent) {
      x += elem.offsetLeft;
      y += elem.offsetTop;
    }

    return { left: x, top: y };
  }

  Popcorn.plugin( "subtitle" , {
    
      manifest: {
        about:{
          name: "Popcorn Subtitle Plugin",
          version: "0.1",
          author:  "Scott Downe",
          website: "http://scottdowne.wordpress.com/"
        },
        options:{
          start    : {elem:'input', type:'text', label:'In'},
          end      : {elem:'input', type:'text', label:'Out'},
          target  :  'Subtitle-container',
          text     : {elem:'input', type:'text', label:'Text'}
        }
      },

      _setup: function( options ) {

        // Creates a div for all subtitles to use
        if ( !this.container ) {
          this.container = document.createElement('div');

          this.container.style.position   = "absolute";
          this.container.style.color      = "white";
          this.container.style.textShadow = "black 2px 2px 6px";
          this.container.style.fontSize   = "18px";
          this.container.style.fontWeight = "bold";
          this.container.style.textAlign  = "center";

          // the video element must have height and width defined
          this.container.style.width      = this.video.offsetWidth + "px";
          //this.container.style.top        = offset( this.video ).top + "px";
          this.container.style.left       = offset( this.video ).left + "px";

          this.video.parentNode.appendChild( this.container );
        }

        // if a target is specified, use that
        if ( options.target && options.target !== 'Subtitle-container' ) {
          options.container = document.getElementById( options.target );
        } else { // use shared default container
          options.container = this.container;
        }

        options.translatedText = options.text;
        var selectedLanguage = ( options.language || "" ),
            // declared as a function, it can be called, but does nothing if not needed
            toggleSubtitles = function() {},
            accessibility = document.getElementById( options.accessibilitysrc ),
            that = this;

        if ( options.languagesrc ) {
          var languageSrc = document.getElementById( options.languagesrc );

          var updateLanguage = function() {

            selectedLanguage = document.getElementById( options.languagesrc ).options[ languageSrc.selectedIndex ].value;

            google.language.translate( options.text, '', selectedLanguage, function( result ) {

              options.translatedText = result.translation;

            } );

            google.language.translate( options.container.innerHTML, '', selectedLanguage, function( result ) {

              options.container.innerHTML = result.translation;
              toggleSubtitles(); // update visuals if accessibility is used

            } );

            that.container.style.top = offset( that.video ).top + that.video.offsetHeight - ( 40 + that.container.offsetHeight ) + "px";

          };

          languageSrc.addEventListener( "click", updateLanguage, false );

          // initiate it once to set starting state
          updateLanguage();
        }

        if ( accessibility ) {

          toggleSubtitles = function() {

            if ( accessibility.checked || selectedLanguage !== ( options.language || "") ) {
              options.container.style.display = "inline";
            } else if ( selectedLanguage === ( options.language || "") ) {
              options.container.style.display = "none";
            }
            that.container.style.top = offset( that.video ).top + that.video.offsetHeight - ( 40 + that.container.offsetHeight ) + "px";

          };

          accessibility.addEventListener( "click", toggleSubtitles, false );

          // initiate it once to set starting state
          toggleSubtitles();
        }

      },
      /**
       * @member subtitle 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        options.container.innerHTML = options.translatedText;
        this.container.style.top = offset( this.video ).top + this.video.offsetHeight - ( 40 + this.container.offsetHeight ) + "px";
      },
      /**
       * @member subtitle 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        options.container.innerHTML = "";
      }
   
  } );

})( Popcorn );
