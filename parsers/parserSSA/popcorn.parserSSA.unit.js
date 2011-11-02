test( "Popcorn 0.3 SSA/ASS Parser Plugin", function () {

  var count = 0,
      numSubs = 0,
      sub,
      poppercorn = Popcorn( "#video" ),
      subs = [
        {
          text: "Senator, we're <br />making our final <br />approach into Coruscant.",
          start: 2.4,
          end: 7.2
        },
        {
          text: "Very good, Lieutenant.",
          start: 9.71,
          end: 13.39
        },
        {
          text: "It's <br />a <br />trap!",
          start: 15.04,
          end: 18.04
        }
      ],
      expects = subs.length * 3 + 1;

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  poppercorn.parseSSA( "data/data.ssa" );

  expect( expects );
  stop( 5000 );

  // Allow load time
  setTimeout(function () {
    Popcorn.forEach( poppercorn.getTrackEvents(), function( evt ) {
      if( evt._natives.type === "subtitle" ) {
        sub = subs[ numSubs++ ];

        equals( evt.start, sub.start, "Correctly parsed start of " + evt.start );
        plus();
        equals( evt.text, sub.text, "Correctly parsed text of " + evt.start );
        plus();
        equals( evt.end, sub.end, "Correctly parsed end at " + evt.start );
        plus();
      }
    });

    equals( subs.length, numSubs, "Parsed all subtitles" );
    plus();

  }, 500);
});
