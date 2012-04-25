// PLUGIN: IMAGE

(function ( Popcorn ) {

/**
 * Images popcorn plug-in
 * Shows an image element
 * Options parameter will need a start, end, href, target and src.
 * Start is the time that you want this plug-in to execute
 * End is the time that you want this plug-in to stop executing
 * href is the url of the destination of a anchor - optional
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
        about: {
          name: "Popcorn image Plugin",
          version: "0.1",
          author: "Scott Downe",
          website: "http://scottdowne.wordpress.com/"
        },
        options: {
          start: {
            elem: "input",
            type: "number",
            label: "In"
          },
          end: {
            elem: "input",
            type: "number",
            label: "Out"
          },
          href: {
            elem: "input",
            type: "url",
            label: "anchor URL",
            optional: true
          },
          target: "image-container",
          src: {
            elem: "input",
            type: "url",
            label: "Source URL"
          },
          text: {
            elem: "input",
            type: "text",
            label: "TEXT",
            optional: true
          }
        }
      },
      _setup: function( options ) {
        var img = document.createElement( "img" ),
            target = document.getElementById( options.target );

        options.anchor = document.createElement( "a" );
        options.anchor.style.position = "relative";
        options.anchor.style.textDecoration = "none";
        options.anchor.style.display = "none";


        if ( !target && Popcorn.plugin.debug ) {
          throw new Error( "target container doesn't exist" );
        }
        // add the widget's div to the target div
        target && target.appendChild( options.anchor );

        img.addEventListener( "load", function() {

          // borders look really bad, if someone wants it they can put it on their div target
          img.style.borderStyle = "none";

          options.anchor.href = options.href || options.src || "#";
          options.anchor.target = "_blank";

          var fontHeight, divText;


          // If display text was provided, display it:
          if ( options.text ) {
            fontHeight = ( img.height / 12 ) + "px";
            divText = document.createElement( "div" );

            Popcorn.extend( divText.style, {
              color: "black",
              fontSize: fontHeight,
              fontWeight: "bold",
              position: "relative",
              textAlign: "center",
              width: img.width + "px",
              zIndex: "10"
            });

            divText.innerHTML = options.text || "";
            divText.style.top = ( img.height / 2 ) - ( divText.offsetHeight / 2 ) + "px";
            options.anchor.appendChild( divText );
          }

          options.anchor.appendChild( img );
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
        options.anchor.style.display = "inline";
      },
      /**
       * @member image
       * The end function will be executed when the currentTime
       * of the video  reaches the end time provided by the
       * options variable
       */
      end: function( event, options ) {
        options.anchor.style.display = "none";
      },
      _teardown: function( options ) {
        document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options.anchor );
      }
  });
})( Popcorn );
