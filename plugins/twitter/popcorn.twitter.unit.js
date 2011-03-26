test("Popcorn Twitter Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 6, 
      count = 0,
      twitterdiv = document.getElementById('twitterdiv');
  
  expect( expects );
  
  function plus() {
    if ( ++count === expects) {
      start();
    }
  }

  stop();   
 
  ok('twitter' in popped, "twitter is a method of the popped instance");
  plus();

  equals ( twitterdiv.innerHTML, "", "initially, there is nothing inside the twitterdiv" );
  plus();
  
  try {
    
    ok( TWTR, "Twitter constructor exists");
    plus();
    
  } catch (e) {};

  popped.twitter({
    start: 1, // seconds
    end: 2, // seconds
    title: 'Steve Song',
    src: '@stevesong',
    target: 'twitterdiv',
  } );

  popped.exec( 1, function() {
    ok( /display: inline;/.test( twitterdiv.innerHTML ), "Div contents are displayed" );
    plus();
    ok( /twtr-widget/.test( twitterdiv.innerHTML ), "A Twitter widget exists" );
    plus();
  });

  popped.exec( 2, function() {
    ok( /display: none;/.test( twitterdiv.innerHTML ), "Div contents are hidden again" );
    plus();
  });
  
  popped.play();
  
});
