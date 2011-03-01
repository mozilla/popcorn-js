test("Popcorn Image Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 5,
      count = 0,
      interval,
      interval2,
      imagediv = document.getElementById('imagediv');
  
  expect( expects );
  
  function plus() {
    if ( ++count === expects) {
      start();
    }
  }

  stop();
 
  ok('image' in popped, "image is a method of the popped instance");
  plus();

  equals ( imagediv.innerHTML, "", "initially, there is nothing inside the imagediv" );
  plus();
  
  popped.image({
    start: 1, // seconds
    end: 3, // seconds
    href: 'http://www.drumbeat.org/',
    src: 'https://www.drumbeat.org/media//images/drumbeat-logo-splash.png',
    target: 'imagediv'
  } );

  interval = setInterval( function() {
    if( popped.currentTime() > 1 && popped.currentTime() < 3 ) {
      ok( /display: inline;/.test( imagediv.innerHTML ), "Div contents are displayed" );
      plus();
      ok( /img/.test( imagediv.innerHTML ), "An image exists" );
      plus();
      clearInterval( interval );
    }
  }, 500);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() > 3 ) {
      ok( /display: none;/.test( imagediv.innerHTML ), "Div contents are hidden again" );
      plus();
      clearInterval( interval2 );
    }
  }, 500);
  popped.volume(0);
  popped.play();
  
});
