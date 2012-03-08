asyncTest( "Popcorn 0.3 TTML Parser Plugin", function () {
  var count = 0,
      numSubs = 0,
      sub,
      poppercorn = Popcorn( "#video" ),
      subs = [
        {
          id: "subtitle1",
          text: "It seems a paradox, does it not,",
          start: 0.76,
          end: 3.45
        },
        {
          id: "subtitle2",
          text: "that the image formed on<br />the Retina should be inverted?",
          start: 5,
          end: 10
        },
        {
          id: "subtitle3",
          text: "It is puzzling, why is it<br />we do not see things upside-down?",
          start: 10,
          end: 16
        },
        {
          id: "subtitle4",
          text: "You have never heard the Theory,<br />then, that the Brain also is inverted?",
          start: 17.2,
          end: 23
        },
        {
          id: "subtitle5",
          text: "No indeed! What a beautiful fact!",
          start: 23,
          end: 27
        },
        {
          id: "subtitle6",
          text: "It seems a paradox, does it not,",
          start: 27.76,
          end: 30.45
        },
        {
          id: "subtitle7",
          text: "that the image formed on<br />the Retina should be inverted?",
          start: 33,
          end: 37
        },
        {
          id: "subtitle8",
          text: "It is puzzling, why is it<br />we do not see things upside-down?",
          start: 37,
          end: 43
        },
        {
          id: "subtitle9",
          text: "You have never heard the Theory,<br />then, that the Brain also is inverted?",
          start: 44.2,
          end: 50
        },
        {
          id: "subtitle10",
          text: "No indeed! What a beautiful fact!",
          start: 50,
          end: 54
        }
      ],
      expects = subs.length * 4 + 1;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  poppercorn.parseTTML( "data/unit.ttml", function(){

    Popcorn.forEach( poppercorn.getTrackEvents(), function( evt ) {
      if( evt._natives.type === "subtitle" ) {
        sub = subs[ numSubs++ ];
        
        strictEqual( evt.id, sub.id, "Correctly parsed id of " + evt.id );
        plus();
        strictEqual( evt.start, sub.start, "Correctly parsed start of " + evt.id + " at " + evt.start );
        plus();
        strictEqual( evt.text, sub.text, "Correctly parsed text of " + evt.id + " at " + evt.start );
        plus();
        strictEqual( evt.end, sub.end, "Correctly parsed end of " + evt.id + " at " + evt.start );
        plus();
      }
    });
    
    strictEqual( subs.length, numSubs, "Parsed all subtitles" );
    plus();

  });

  expect( expects );
  
});
