// PLUGIN: Subtitle

(function (Popcorn) {

  var scriptLoaded = false,
      callBack     = function( data ) {

        if ( typeof google !== 'undefined' && google.load ) {

          google.load("language", "1", {callback: function() {scriptLoaded = true;}});
        } else {

          setTimeout( function() {

            callBack( data );
          }, 1);
        }
      };

  Popcorn.getScript( "http://www.google.com/jsapi", callBack );

  /**
   * Subtitle popcorn plug-in 
   * Displays a subtitle over the video, or in the target div
   * Options parameter will need a start, and end.
   * Optional parameters are target and text.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Target is the id of the document element that the content is
   *  appended to, this target element must exist on the DOM
   * Text is the text of the subtitle you want to display.
   *
   * Language is the expected language the subtitle text is in
   * Languagesrc is the target id of the element that contains 
   *  the language value ("en", "fr", etc.) to translate the text into
   *  example:
   *  <select id="language">
   *    <option value="zh" selected="selected">Chinese</option>
   *    <option value="en">English</option>
   *    <option value="fr">French</option>
   *    <option value="de">German</option>
   *    <option value="it">Italian</option>
   *    <option value="ja">Japanese</option>
   *    <option value="ko">Korean</option>
   *    <option value="fa">Persian</option>
   *    <option value="pl">Polish</option>
   *    <option value="pt">Portuguese</option>
   *    <option value="es">Spanish</option>
   *  </select>
   * Accessibilitysrc is the target id of a checkbox element
   *  checked means show all subtitles regardless of language and languagesrc
   *  not checked means only translate if language and languagesrc are different
   *  if no accessibilitysrc exists, default is to display all subtitles regardless
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .footnote({
          start:            5,                 // seconds, mandatory
          end:              15,                // seconds, mandatory
          text:             'Hellow world',    // optional
          target:           'subtitlediv',     // optional
          language:         'en',              // optional
          languagesrc:      'language',        // optional
          accessibilitysrc: 'accessibility'    // optional
        } )
   *
   */

  // translates whatever is in options.container into selected language
  var translate = function( options, text ) {

    options.selectedLanguage = options.languageSrc.options[ options.languageSrc.selectedIndex ].value;

    google.language.translate( text, '', options.selectedLanguage, function( result ) {

      options.container.innerHTML = result.translation;

    } );
  };

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
          this.container.id = "subtitlediv";
          this.container.style.position   = "absolute";
          this.container.style.color      = "white";
          this.container.style.textShadow = "black 2px 2px 6px";
          this.container.style.fontSize   = "18px";
          this.container.style.fontWeight = "bold";
          this.container.style.textAlign  = "center";

          // the video element must have height and width defined
          this.container.style.width      = this.media.offsetWidth + "px";
          this.container.style.top        = this.position().top + this.media.offsetHeight - 65 + "px";
          this.container.style.left       = this.position().left + "px";

          document.body.appendChild( this.container );
        }

        // if a target is specified, use that
        if ( options.target && options.target !== 'Subtitle-container' ) {
          options.container = document.getElementById( options.target );
        } else { // use shared default container
          options.container = this.container;
        }

        var accessibility = document.getElementById( options.accessibilitysrc ),
            that = this;

        options.showSubtitle = function() {
          options.container.innerHTML = options.text;
        };
        options.toggleSubtitles = function() {};
        options.that = this;
        
        var readyCheck = setInterval(function() {
          if ( !scriptLoaded ) {
            return;
          }
          clearInterval(readyCheck);

          if ( options.languagesrc ) {
            options.showSubtitle = translate;
            options.languageSrc = document.getElementById( options.languagesrc );
            options.selectedLanguage = options.languageSrc.options[ options.languageSrc.selectedIndex ].value;

            if ( !this.languageSources ) {
              this.languageSources = {};
            }

            if ( !this.languageSources[ options.languagesrc ] ) {
              this.languageSources[ options.languagesrc ] = {};
            
            }

            if ( !this.languageSources[ options.languagesrc ][ options.target ] ) {
              this.languageSources[ options.languagesrc ][ options.target ] = true;

              options.languageSrc.addEventListener( "change", function() {

                options.toggleSubtitles();
                options.showSubtitle( options, options.container.innerHTML );

              }, false );

            }

          }
          if ( accessibility ) {
            options.accessibility = accessibility;

            options.toggleSubtitles = function() {
              options.selectedLanguage = options.languageSrc.options[ options.languageSrc.selectedIndex ].value;
              if ( options.accessibility.checked || options.selectedLanguage !== ( options.language || "") ) {
                options.display = "inline";
                options.container.style.display = options.display;
              } else if ( options.selectedLanguage === ( options.language || "") ) {
                options.display = "none";
                options.container.style.display = options.display;
              }

            };

            options.accessibility.addEventListener( "change", options.toggleSubtitles, false );

            // initiate it once to set starting state
            options.toggleSubtitles();
          }
        }, 5);






      },
      /**
       * @member subtitle 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        options.container.style.display = options.display;
        options.showSubtitle( options, options.text );
      },
      /**
       * @member subtitle 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        options.container.style.display = options.display;
        options.container.innerHTML = "";
      }
   
  } );

})( Popcorn );
