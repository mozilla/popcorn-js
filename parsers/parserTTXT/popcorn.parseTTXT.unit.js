test("Popcorn 0.3 TTXT Parser Plugin", function () {
  
  var expects = 0,
      count = 0,
      sub = {},
      numSubs = 0,
      poppercorn = Popcorn( "#video" ),
      subs = [ // Expected values
        {
          start: 2.4,
          end: 5.199,
          text: "[Background Music Playing]"
        },
        {
          start: 15.712,
          end: 17.398,
          text: "Heay!!"
        },
        {
          start: 25.712,
          end: 30.398,
          text: "[Bird noises]"
        }
      ];
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  poppercorn.parseTTXT(document.getElementById('video').getAttribute('data-timeline-sources'));
  
  expects = subs.length*3+1;
  expect(expects);
  
  stop( 5000 );

  // Allow load time
  setTimeout(function () {
    Popcorn.forEach(poppercorn.getTrackEvents(), function(evt) {
      if(evt._natives.type === "subtitle") {
        sub = subs[numSubs++];
        
        equals(sub.end,  evt.end , "Correct end" );
        plus();
        
        equals(sub.start,  evt.start , "Correct start" );
        plus();
        
        equals(sub.text,  evt.text , "Correct text" );
        plus();
      }
    });
    
    equals(subs.length, numSubs , "Correctly parsed all subs" );
    plus();

  }, 500);
  
});
