asyncTest( "Popcorn 1.0 WebSRT/VTT Parser Plugin", function () {

  var count = 0,
      numSubs = 0,
      sub,
      poppercorn = Popcorn( "#video" ),
      expectedSubs = [
        {
          id: "00:00:02.400 --> 00:00:07.200",
          text: "A typical multiline<br />subtitle.",
          start: 2.4,
          end: 7.2
        },
        {
          id: "00:09.712-->00:13.399",
          text: "No whitespace between time tokens",
          start: 9.712,
          end: 13.399
        },
        {
          id: "00:00:15.042 --> 00:00:18.042 A:start D:vertical L:98%",
          text: "It's a trap! Ignore the timeline styling for now!",
          start: 15.042,
          end: 18.042
        },
        {
          id: "00:00:20.000--> 00:00:21.670",
          text: "This text is <b>boldy <i>italicized</i></b>",
          start: 20.000,
          end: 21.670
        }
      ],
      expects = expectedSubs.length * 4 + 1;

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  poppercorn.parseVTT( "data/unit.vtt", function(){

    Popcorn.forEach( poppercorn.getTrackEvents(), function( evt ) {
      if( evt._natives.type === "subtitle" ) {
        sub = expectedSubs[ numSubs++ ];

        strictEqual( evt.id, sub.id, "Correctly parsed id" );
        plus();
        strictEqual( evt.text, sub.text, "Correctly parsed text of '" + evt.id + "'" );
        plus();
        strictEqual( evt.start, sub.start, "Correctly parsed start at '" + evt.id + "'" );
        plus();
        strictEqual( evt.end, sub.end, "Correctly parsed end at '" + evt.id + "'" );
        plus();
      }
    });

    equal( expectedSubs.length, numSubs, "Parsed all subtitles" );
    plus();

  });

  expect( expects );

});
