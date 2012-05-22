test( "Popcorn text Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 10,
      count = 0,
      setupId,
      textdiv = document.getElementById( "textdiv" ),
      childElem;

  var strings = {
    PLAIN: "This is plain text",
    HTML: "<p>This is <em>HTML</em> text</p>",
    ESCAPED: "&lt;p&gt;This is &lt;em&gt;HTML&lt;/em&gt; text&lt;/p&gt;",
    MULTILINE_NO_BREAKS: "a\nb\r\nc",
    MULTILINE_BREAKS: "a<br>b<br>c"
  };

  expect( expects );

  function plus() {
    if ( ++count===expects ) {
      start();
    }
  }

  function injectString( s ) {
    var elem = document.createElement( "div" );
    elem.innerHTML = s;
    return elem.innerHTML;
  }

  stop();

  ok( "text" in popped, "text is a mehtod of the popped instance" );
  plus();

  equal( textdiv.childElementCount, 0, "initially, there is nothing inside textdiv" );
  plus();

  // Simple text
  popped.text( {
    start: 1,
    end: 3,
    text: strings.PLAIN,
    target: 'textdiv'
  } )
  .cue( 2, function() {
    equal( textdiv.childElementCount, 1, "textdiv now has two inner elements" );
    plus();

    childElem = textdiv.children[ 0 ];
    equal( childElem.innerHTML, strings.PLAIN, "textdiv correctly displaying plain text" );
    plus();
    equal( childElem.style.display, "inline", "textdiv is visible on the page" );
    plus();
  } )
  .cue( 4, function() {
    equal( childElem && childElem.style.display, "none", "textdiv is hidden again" );
    plus();

    popped.pause();
  } )

  // Setup the rest of events (first tests only want 1 text event)
  .on( "pause", function secondarySetup() {
    popped.off( "pause", secondarySetup )

    // HTML text, rendered as HTML
    .text( {
      start: 5,
      end: 7,
      text: strings.HTML,
      target: 'textdiv'
    } )
    .cue( 6, function() {
      equal(
        textdiv.children[ 1 ].innerHTML,
        injectString( strings.HTML ),
        "textdiv correctly displaying HTML text"
      );
      plus();
    } )

    // HTML text, escaped and rendered as plain text
    .text( {
      start: 8,
      end: 10,
      text: strings.HTML,
      escape: true,
      target: 'textdiv'
    } )
    .cue( 9, function() {
      equal(
        textdiv.children[ 2 ].innerHTML,
        injectString( strings.ESCAPED ),
        "textdiv correctly displaying escaped HTML text"
      );
      plus();
    } )

    // Multi-Line HTML text, escaped and rendered as plain text without breaks
    .text( {
      start: 11,
      end: 13,
      text: strings.MULTILINE_NO_BREAKS,
      target: 'textdiv'
    } )
    .cue( 12, function() {
      equal(
        textdiv.children[ 3 ].innerHTML,
        injectString( strings.MULTILINE_NO_BREAKS ),
        "textdiv correctly displaying multiline with no breaks"
      );
      plus();
    } )

    // Multi-Line HTML text, escaped and rendered as plain text with breaks
    .text( {
      start: 14,
      end: 16,
      text: strings.MULTILINE_NO_BREAKS,
      multiline: true,
      target: 'textdiv'
    } )
    .cue( 15, function() {
      equal(
        textdiv.children[ 4 ].innerHTML,
        injectString( strings.MULTILINE_BREAKS ),
        "textdiv correctly displaying multiline with breaks"
      );
      plus();

      // Test is done
      popped.pause();
    } );

    // Continue tests
    popped.play();
  } );

  // Start tests
  popped.play().volume( 0 );

});
