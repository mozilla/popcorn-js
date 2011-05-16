test("Popcorn LinkedIn Plugin", function () {
  
  if ( /localhost/.test( location.hostname ) ) {
    
    // run tests on localhost
    var popped   = Popcorn("#video"),
        expects  = 5,
        count    = 0,
        linkedin = document.getElementById('linkedindiv');
    
    expect( expects );
    
    function plus() {
  
      if ( ++count === expects ) {
        start();
      }
    }
  
    stop();
   
    ok( 'linkedin' in popped, "linkedin is a method of the popped instance" );
    plus();
  
    equals( linkedin.innerHTML, "", "initially, there is nothing inside the linkedin div" );
    plus();
    
    popped.linkedin({
  
      type      : 'share',
      counter   : 'right',
      url       : "http://www.google.ca",
      target    : "linkedindiv",
      apikey    : 'ZOLRI2rzQS_oaXELpPF0aksxwFFEvoxAFZRLfHjaAhcGPfOX0Ds4snkJpWwKs8gk',
      start     : 1,
      end       : 3
    });
  
    popped.exec( 2, function() {
  
        ok( /block/.test( linkedin.style.display ), "Div contents are displayed" );
        plus();
        ok( /script/.test( linkedin.innerHTML ), "LinkedIn plugin exists" );
        plus();
    });
    
    popped.exec( 4, function() {
  
        ok( /none/.test( linkedin.style.display ), "Div contents are hidden again" );
        plus();
    });
  
    popped.volume(0).play();
  } else {

    // tests must be run on localhost
    ok(false, "LinkedIn apikey will only work under localhost");
  }
});
