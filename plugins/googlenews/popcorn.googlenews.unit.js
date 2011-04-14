test( "Popcorn google news Plugin", function () {
  
  var popped = Popcorn( "#video" ),
      expects = 7, 
      count = 0,
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
    end: 5, // seconds
    topic: "Oil Spill",
    target: "googlenewsdiv"
  })
  .googlenews({
    start: 3, // seconds
    end: 10, // seconds
    topic: "Village Telco",
    target: "googlenewsdiv"
  })
  .volume( 0 );
    
  popped.exec( 1, function() {
    equals( googlenewsdiv.childElementCount, 2, "googlenewsdiv now has two inner elements" );
    plus();
    equals( googlenewsdiv.children[0].style.display , "inline", "first googlenews is visible on the page" );
    plus();
  });
  
  popped.exec( 4, function() {
    equals( googlenewsdiv.children[1].style.display , "inline", "second googlenews is visible on the page" );
    plus();
  });
  
  popped.exec( 11, function() {
    equals( googlenewsdiv.children[1].style.display , "none", "second googlenews is no longer visible on the page" );
    plus();
    equals( googlenewsdiv.children[0].style.display , "none", "first googlenews is no longer visible on the page" );
    plus();
  });
  
  popped.play();

});