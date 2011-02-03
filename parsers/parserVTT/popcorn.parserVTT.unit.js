test( "Popcorn 0.3 WebSRT/VTT Parser Plugin", function () {
  
  var count = 0,
      numSubs = 0,
      sub,
      poppercorn = Popcorn( "#video" ),
      expectedSubs = [
        {
          id: "1",
          text: "Senator, we're making<br />our final approach into Coruscant.",
          start: 2.4,
          end: 7.2
        },
        {
          id: "2",
          text: "Very good, Lieutenant.",
          start: 9.712,
          end: 13.399
        },
        {
          id: "Track-3",
          text: "It's a trap!",
          start: 15.042,
          end: 18.042
        },
        {
          id: "ID9",
          text: "This text is <b>boldy <i>italicized</i></b>",
          start: 20.000,
          end: 21.670
        }
      ],
      expects = expectedSubs.length*4 + 1;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  poppercorn.parseVTT( document.getElementById( 'video' ).getAttribute( 'data-timeline-sources' ) );
  expect( expects );
  stop( 5000 );
  
  // Allow load time
  setTimeout(function () {
    Popcorn.forEach( poppercorn.getTrackEvents(), function( evt ) {
      if( evt._natives.type === "subtitle" ) {
        sub = expectedSubs[numSubs++];
        
        strictEqual( evt.id, sub.id, "Correctly parsed id" );
        plus();
        strictEqual( evt.text, sub.text, "Correctly parsed text of " + evt.id );
        plus();
        strictEqual( evt.start, sub.start, "Correctly parsed start at " + evt.id );
        plus();
        strictEqual( evt.end, sub.end, "Correctly parsed end at " + evt.id );
        plus();
      }
    });
    
    equals( expectedSubs.length, numSubs, "Parsed all subtitles" );
    plus();

  }, 500);
  
});