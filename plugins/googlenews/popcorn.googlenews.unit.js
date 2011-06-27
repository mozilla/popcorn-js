test( "Popcorn google news Plugin", function () {
  
  var popped = Popcorn( "#video" ),
      expects = 8, 
      count = 0,
      setupId,
      googlenewsdiv = document.getElementById( "googlenewsdiv" );

  expect(expects);
  
  function plus() {
    if ( ++count===expects ) {
      start();
    }
  }
  
  stop();
   
  ok ( "googlenews" in popped, "googlenews is a method of the popped instance" );
  plus();
  
  equals ( googlenewsdiv.innerHTML, "", "initially, there is nothing inside the googlenewsdiv" );
  plus();
  
  popped.googlenews({
    start: 0, // seconds
    end: 2, // seconds
    topic: "Oil Spill",
    target: "googlenewsdiv"
  })
  .googlenews({
    start: 2, // seconds
    end: 4, // seconds
    topic: "Village Telco",
    target: "googlenewsdiv"
  })
  .volume( 0 );

  setupId = popped.getLastTrackEventId();
    
  popped.exec( 0, function() {
    equals( googlenewsdiv.childElementCount, 2, "googlenewsdiv now has two inner elements" );
    plus();
    equals( googlenewsdiv.children[0].style.display , "inline", "first googlenews is visible on the page" );
    plus();
  });
  
  popped.exec( 3, function() {
    equals( googlenewsdiv.children[1].style.display , "inline", "second googlenews is visible on the page" );
    plus();
  });
  
  popped.exec( 4, function() {
    equals( googlenewsdiv.children[1].style.display , "none", "second googlenews is no longer visible on the page" );
    plus();
    equals( googlenewsdiv.children[0].style.display , "none", "first googlenews is no longer visible on the page" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !googlenewsdiv.children[1], "removed google news was properly destroyed" );
    plus();
  });
  
  popped.play();

});
