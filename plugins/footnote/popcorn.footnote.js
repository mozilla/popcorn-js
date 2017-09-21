// PLUGIN: Footnote/Text

(function ( Popcorn ) {

  /**
   * Footnote popcorn plug-in
   * Adds text to an element on the page.
   * Options parameter will need a start, end, target and text.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Text is the text that you want to appear in the target
   * Target is the id of the document element that the text needs to be
   * attached to, this target element must exist on the DOM
   * Options parameter can take element or selector.
   * Element will override the default div element and append a valid HTML element to the DOM
   * Selector will add the CSS class of your choice to the appended footnotes
   *
   * @param {Object} options
   *
   * Example:
   *  var p = Popcorn('#video')
   *    .footnote({
   *      start: 5, // seconds
   *      end: 15, // seconds
   *      text: 'This video made exclusively for drumbeat.org',
   *      element: 'li',
   *      selector: 'footnote',
   *      target: 'footnotediv'
   *    });
   **/

  Popcorn.plugin( "footnote", {

    manifest: {
      about: {
        name: "Popcorn Footnote Plugin",
        version: "0.2",
        author: "@annasob, @rwaldron",
        website: "annasob.wordpress.com"
      },
      options: {
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
        text: {
          elem: "input",
          type: "text",
          label: "Text"
        },
        element: {
          elem: "input",
          type: "text",
          label: "Element"
        },
        selector: {
          elem: "input",
          type: "text",
          label: "Selector"
        },
        target: "footnote-container"
      }
    },

    _setup: function( options ) {

      var target = Popcorn.dom.find( options.target );

      if (options.element) {
        options._container = document.createElement(options.element);
      } else {
        options._container = document.createElement("div");
      }
      if (options.selector) {
        options._container.classList.add(options.selector);
      }
      options._container.style.display = "none";
      options._container.innerHTML  = options.text;

      target.appendChild( options._container );
    },

    /**
     * @member footnote
     * The start function will be executed when the currentTime
     * of the video  reaches the start time provided by the
     * options variable
     */
    start: function( event, options ){
      options._container.style.display = "inline";
    },

    /**
     * @member footnote
     * The end function will be executed when the currentTime
     * of the video  reaches the end time provided by the
     * options variable
     */
    end: function( event, options ){
      options._container.style.display = "none";
    },

    _teardown: function( options ) {
      var target = Popcorn.dom.find( options.target );
      if ( target ) {
        target.removeChild( options._container );
      }
    }

  });
})( Popcorn );
