test("Popcorn 0.3 TTXT Parser Plugin", function () {
  
  var expects = 8,
      count = 0,
      numSubs = 0,
      poppercorn = Popcorn( "#video" ),
      subs = { // Expected values
        "0": "",
        "2.4": "[Background Music Playing]",
        "5.2": "",
        "15.712": "Heay!!",
        "17.399": "",
        "25.712": "[Bird noises]",
        "30.399": ""
      };
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  poppercorn.parseTTXT(document.getElementById('video').getAttribute('data-timeline-sources'));
  
  expect(expects);
  
  stop( 5000 );

  // Allow load time
  setTimeout(function () {
    Popcorn.forEach(poppercorn.getTrackEvents(), function(evt) {
      if(evt._natives.type === "subtitle") {
        numSubs++;
        equals(subs[evt.start.toString()],  evt.text , "Correct text" );
        plus();
      }
    });
    
    equals(7, numSubs , "Correctly parsed all subs" );
    plus();

  }, 1500);
  
});
