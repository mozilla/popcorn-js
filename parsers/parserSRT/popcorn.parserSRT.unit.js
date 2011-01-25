test("Popcorn 0.3 SRT Parser Plugin", function () {
  
  var expects = 4,
      count = 0,
      key,
      numSubs = 0,
      poppercorn = Popcorn( "#video" ),
      subs = { // Expected values
        "2.4": "[Background Music Playing]",
        "15.712": "Heay!!",
        "25.712": "[Bird noises]"
      };
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  poppercorn.parseSRT("data/unit.srt");
  
  expect(expects);
  
  stop( 10000 );

  alert("HI");
  // Allow load time
  setTimeout(function () {
    Popcorn.forEach(poppercorn.getTrackEvents(), function(evt) {
      if(evt._natives.type === "subtitle") {
        numSubs++;
        key = Math.ceil(evt.start).toString();
        equals(subs[key], evt.text , "Correct amounts" );
        plus();
      }
    });
    
    equals(3, numSubs , "Correctly parsed all subs" );
    plus();

  }, 500);
  
});