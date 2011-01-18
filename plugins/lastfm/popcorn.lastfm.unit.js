test("Popcorn LastFM Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 5, 
      count = 0,
      interval,
      interval2,
      lastfmdiv = document.getElementById('lastfmdiv');
  
  expect( expects );
  
  function plus() {
    if ( ++count === expects) {
      start();
    }
  }

  stop();   
 
  ok('lastfm' in popped, "lastfm is a method of the popped instance");
  plus();

  equals ( lastfmdiv.innerHTML, "", "initially, there is nothing inside the lastfmdiv" );
  plus();
  
  popped.lastfm({
    start: 1, // seconds
    end: 3, // seconds
    artist: 'yacht',
    target: 'lastfmdiv'
  } );

  interval = setInterval( function() {
    if( popped.currentTime() > 1 && popped.currentTime() < 3 ) {
      ok( /display: inline;/.test( lastfmdiv.innerHTML ), "Div contents are displayed" );
      plus();
      ok( /img/.test( lastfmdiv.innerHTML ), "An image exists" );
      plus();
      clearInterval( interval );
    }
  }, 500);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() > 3 ) {
      ok( /display: none;/.test( lastfmdiv.innerHTML ), "Div contents are hidden again" );
      plus();
      clearInterval( interval2 );
    }
  }, 500);
  popped.volume(0);
  popped.play();
  
});
