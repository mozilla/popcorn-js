test("Popcorn 0.3 VTT Parser Plugin", function () {
  
  var count = 0,
      numSubs = 0,
      sub,
      poppercorn = Popcorn( "#video" ),
      subs = { // Expected values
        "1": {
          text: "Senator, we're making our final approach into Coruscant.",
          start: 2.4,
          end: 7.2
        },
        "2": {
          text: "Very good, Lieutenant.",
          start: 9.712,
          end: 13.399
        },
        "Track-3": {
          text: "It's a trap!",
          start: 15.042,
          end: 18.042
        }
      },
      expectSubs = 3,
      expects = expectSubs*4 + 1;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  poppercorn.parseVTT(document.getElementById('video').getAttribute('data-timeline-sources'));
  
  expect(expects);
  
  stop( 5000 );
  
  // Allow load time
  setTimeout(function () {
    Popcorn.forEach(poppercorn.getTrackEvents(), function(evt) {
      if(evt._natives.type === "subtitle") {
        numSubs++;
        sub = subs[evt.id.toString()];
        
        ok(!!sub , "Correctly parsed id of " + evt.id );
        plus();
        equals(evt.text, sub.text, "Correctly parsed text of " + evt.id );
        plus();
        equals(evt.start, sub.start, "Correctly parsed start at " + evt.id );
        plus();
        equals(evt.end, sub.end, "Correctly parsed end at " + evt.id );
        plus();
      }
    });
    
    equals(expectSubs, numSubs , "Parsed all subs" );
    plus();

  }, 500);
  
});