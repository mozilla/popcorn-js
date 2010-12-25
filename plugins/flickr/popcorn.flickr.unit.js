test("Popcorn Flickr Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 5, 
      count = 0,
      interval,
      interval2,
      flickrdiv = document.getElementById('flickrdiv');
  
  expect( expects );
  
  function plus() {
    if ( ++count === expects) {
      start();
    }
  }

  stop();   
 
  ok('flickr' in popped, "flickr is a method of the popped instance");
  plus();

  equals ( flickrdiv.innerHTML, "", "initially, there is nothing inside the flickrdiv" );
  plus();
  
  popped.flickr({
    start: 1, // seconds
    end: 3, // seconds
    userid: '35034346917@N01',
    numberofimages: '1',
    target: 'flickrdiv'
  } );

  interval = setInterval( function() {
    if( popped.currentTime() > 1 && popped.currentTime() < 3 ) {
      ok( /display: inline;/.test( flickrdiv.innerHTML ), "Div contents are displayed" );
      plus();
      ok( /img/.test( flickrdiv.innerHTML ), "An image exists" );
      plus();
      clearInterval( interval );
    }
  }, 500);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() > 3 ) {
      ok( /display: none;/.test( flickrdiv.innerHTML ), "Div contents are hidden again" );
      plus();
      clearInterval( interval2 );
    }
  }, 500);
  popped.volume(0);
  popped.play();
  
});
