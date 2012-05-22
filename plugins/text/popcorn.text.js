// PLUGIN: Text

(function ( Popcorn ) {

  /**
   * Text Popcorn plug-in
   *
   * Places text in an element on the page.  Plugin options include:
   * Options parameter will need a start, end, target and text.
   *   Start: is the time that you want this plug-in to execute
   *   End: is the time that you want this plug-in to stop executing
   *   Text: is the text that you want to appear in the target
   *   Escape: {true|false} whether to escape the text (e.g., html strings)
   *   Multiline: {true|false} whether newlines should be turned into <br>s
   *   Target: is the ID of the element where the text should be placed.
   *
   * @param {Object} options
   *
   * Example:
   *  var p = Popcorn('#video')
   *
   *    // Simple text
   *    .text({
   *      start: 5, // seconds
   *      end: 15, // seconds
   *      text: 'This video made exclusively for drumbeat.org',
   *      target: 'textdiv'
   *     })
   *
   *    // HTML text, rendered as HTML
   *    .text({
   *      start: 15, // seconds
   *      end: 20, // seconds
   *      text: '<p>This video made <em>exclusively</em> for drumbeat.org</p>',
   *      target: 'textdiv'
   *    })
   *
   *    // HTML text, escaped and rendered as plain text
   *    .text({
   *      start: 20, // seconds
   *      end: 25, // seconds
   *      text: 'This is an HTML p element: <p>paragraph</p>',
   *      escape: true,
   *      target: 'textdiv'
   *    })
   *
   *    // Multi-Line HTML text, escaped and rendered as plain text
   *    .text({
   *      start: 25, // seconds
   *      end: 30, // seconds
   *      text: 'This is an HTML p element: <p>paragraph</p>\nThis is an HTML b element: <b>bold</b>',
   *      escape: true,
   *      multiline: true,
   *      target: 'textdiv'
   *    });
   **/

  /**
   * HTML escape code from mustache.js, used under MIT Licence
   * https://github.com/janl/mustache.js/blob/master/mustache.js
   **/
  var escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;'
  };

  function escapeHTML( string, multiline ) {
    return String( string ).replace( /&(?!\w+;)|[<>"']/g, function ( s ) {
      return escapeMap[ s ] || s;
    });
  }

  function newlineToBreak( string ) {
    // Deal with both \r\n and \n
    return string.replace( /\r?\n/gm, "<br>" );
  }

  Popcorn.plugin( "text", {

    manifest: {
      about: {
        name: "Popcorn Text Plugin",
        version: "0.1",
        author: "@humphd"
      },
      options: {
        start: {
          elem: "input",
          type: "text",
          label: "In"
        },
        end: {
          elem: "input",
          type: "text",
          label: "Out"
        },
        text: {
          elem: "input",
          type: "text",
          label: "Text"
        },
        escape: {
          elem: "input",
          type: "checkbox",
          label: "Escape"
        },
        multiline: {
          elem: "input",
          type: "checkbox",
          label: "Multiline"
        },
        target: "text-container"
      }
    },

    _setup: function( options ) {
      var target = Popcorn.dom.find( options.target );
      var container = options._container = document.createElement( "div" );

      container.style.display = "none";

      // Escape HTML text if requested
      var text = !!options.escape ? escapeHTML( options.text ) :
                                    options.text;

      // Swap newline for <br> if requested
      text = !!options.multiline ? newlineToBreak ( text ) : text;
      container.innerHTML = text;

      if ( !target ) {
        throw new Error( "target container doesn't exist" );
      }

      target.appendChild( container );
    },

    /**
     * @member text
     * The start function will be executed when the currentTime
     * of the video  reaches the start time provided by the
     * options variable
     */
    start: function( event, options ) {
      options._container.style.display = "inline";
    },

    /**
     * @member text
     * The end function will be executed when the currentTime
     * of the video  reaches the end time provided by the
     * options variable
     */
    end: function( event, options ) {
      options._container.style.display = "none";
    },

    _teardown: function( options ) {
      var target = document.getElementById( options.target );
      if ( target ) {
        target.removeChild( options._container );
      }
    }
  });
})( Popcorn );
