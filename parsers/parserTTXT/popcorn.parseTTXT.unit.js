test("Popcorn 0.3 TTXT Parser Plugin", function () {
  
  var expects = 8,
      count = 0,
      key,
      numSubs = 0,
      poppercorn = Popcorn( "#video" ),
      subs = { // Expected values
        "0": "",
        "3": "[Background Music Playing]",
        "6": "",
        "16": "Heay!!",
        "18": "",
        "26": "[Bird noises]",
        "31": ""
        }
      };
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  poppercorn.parseTTXT("data/data.ttxt");
  
  expect(expects);
  
  stop( 10000 );

  // Allow load time
  setTimeout(function () {
    Popcorn.forEach(poppercorn.getTrackEvents(), function(evt) {
      if(evt._natives.type === "subtitle") {
        numSubs++;
        key = Math.ceil(evt.start).toString();
        equals(subs[key],  evt.text , "Correct amounts" );
        plus();
      }
    });
    
    equals(7, numSubs , "Correctly parsed all subs" );
    plus();

  }, 1500);
  
});
