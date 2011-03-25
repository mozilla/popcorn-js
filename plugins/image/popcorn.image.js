// PLUGIN: IMAGE

(function (Popcorn) {
  
  /**
   * Images popcorn plug-in 
   * Shows an image element
   * Options parameter will need a start, end, href, target and src.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing 
   * href is the url of the destination of a link
   * Target is the id of the document element that the iframe needs to be attached to, 
   * this target element must exist on the DOM
   * Src is the url of the image that you want to display
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
        var s, st; 
        
        options.link = document.createElement( 'a' );
        options.link.style.display = "none"; // display none by default
        if ( options.href ) {
          options.link.href = options.href;
        }
        options.link.target = "_blank";
        if ( document.getElementById( options.target ) ) {
          document.getElementById( options.target ).appendChild( options.link ); // add the widget's div to the target div
        }
        var div = document.createElement( 'div' );
        divStyle = {
          width : '100%',
          height : '600px',
          background : "url( " + options.src + " ) no-repeat ",
          backgroundSize : '100%',
          MozBackgroundSize: '100%',
          borderStyle : 'none'
        };
        for ( s in divStyle ) {
          div.style[ s ] = divStyle[ s ];
        }
        
        var divText = document.createElement( 'div' ); // add the inner div for overlaying text
        divTextStyle = {
          width : '50%',
          margin : 'auto',
          marginTop : '20px',
          color : 'black',
          fontWeight : 'bold',
          textAlign : 'center'
        };
        for ( st in divTextStyle ) {
          divText.style[ st ] = divTextStyle[ st ];
        }
        divText.innerHTML = options.text;
        
        div.appendChild( divText ); 
        options.link.appendChild( div );
        
      },

      /**
       * @member image 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function( event, options ) {
        options.link.style.display = "inline";
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
