test("Popcorn Image Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 6,
      count = 0,
      setupId,
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
    text: 'DRUMBEAT',
    target: 'imagediv'
  });

  setupId = popped.getLastTrackEventId();

  popped.exec( 2, function() {
    ok( /display: block;/.test( imagediv.innerHTML ), "Div contents are displayed" );
    plus();
    ok( /img/.test( imagediv.innerHTML ), "An image exists" );
    plus();
  });
  
  popped.exec( 4, function() {
    ok( /display: none;/.test( imagediv.innerHTML ), "Div contents are hidden again" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !imagediv.children[0], "removed image was properly destroyed" );
    plus();
  });
  popped.volume(0).play();  
  
});
