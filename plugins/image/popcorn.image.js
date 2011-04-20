// PLUGIN: IMAGE

(function (Popcorn) {
  
  /**
   * Images popcorn plug-in 
   * Shows an image element
   * Options parameter will need a start, end, href, target and src.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing 
   * href is the url of the destination of a link - optional 
   * Target is the id of the document element that the iframe needs to be attached to, 
   * this target element must exist on the DOM
   * Src is the url of the image that you want to display
   * text is the overlayed text on the image - optional  
   *
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .image({
          start: 5, // seconds
          end: 15, // seconds
          href: 'http://www.drumbeat.org/',
          src: 'http://www.drumbeat.org/sites/default/files/domain-2/drumbeat_logo.png',
          text: 'DRUMBEAT',
          target: 'imagediv'
        } )
   *
   */
  Popcorn.plugin( "image", {

      manifest: {
        about:{
          name: "Popcorn image Plugin",
          version: "0.1",
          author: "Scott Downe",
          website: "http://scottdowne.wordpress.com/"
        },
        options:{
          start :  {elem:'input', type:'number', label:'In'},
          end :    {elem:'input', type:'number', label:'Out'},
          href :   {elem:'input', type:'text',   label:'Link URL'},
          target : 'Image-container',
          src :    {elem:'input', type:'text',   label:'Source URL'},
          text:    {elem:'input', type:'text',   label:'TEXT'}
        }
      },

      _setup: function( options ) {

        options.link = document.createElement( 'a' );
        options.link.style.position = "relative";
        options.link.style.textDecoration = "none";

        var img = document.createElement( 'img' );
        img.addEventListener( "load", function() {
          img.style.borderStyle = "none"; // borders look really bad, if someone wants it they can put it on their div target
          
          if ( options.href ) {
            options.link.href = options.href;
          }
          options.link.target = "_blank";
          if ( document.getElementById( options.target ) ) {
            document.getElementById( options.target ).appendChild( options.link ); // add the widget's div to the target div
          }
          
          var fontHeight = ( img.height / 12 ) + "px";
          
          var divText = document.createElement( 'div' );
          divTextStyle = {
              position: "relative",
              width: img.width + "px",
              textAlign: "center",
              fontSize: fontHeight,
              color: "black",
              fontWeight : "bold",
              zIndex: "10"
          };
          for ( var st in divTextStyle ) {
            divText.style[ st ] = divTextStyle[ st ];
          }
          
          divText.innerHTML = options.text || "";
          options.link.appendChild( divText );
          options.link.appendChild( img );
          divText.style.top = ( img.height / 2 ) - ( divText.offsetHeight / 2 ) + "px"; 
          options.link.style.display = "none";
        }, false );
        img.src = options.src;
      },

      /**
       * @member image 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function( event, options ) {
        options.link.style.display = "block";
      },
      /**
       * @member image 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function( event, options ) {
        options.link.style.display = "none";
      }
          
  });

})( Popcorn );
