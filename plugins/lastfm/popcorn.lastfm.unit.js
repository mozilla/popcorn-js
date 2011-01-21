test("Popcorn LastFM Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 8, 
      count = 0,
      interval,
      interval2,
      interval3,
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
      end: 4, // seconds
      artist: 'yacht',
      target: 'lastfmdiv'
    } )
    .lastfm({
      start: 2.5, // seconds
      end: 7, // seconds
      artist: 'the beatles',
      target: 'lastfmdiv'
    } )
    .lastfm({
      start: 4.5, // seconds
      end: 7, // seconds
      artist: '',
      target: 'lastfmdiv'
    } );

  interval = setInterval( function() {
    if( popped.currentTime() > 1 && popped.currentTime() < 4 ) {
    
      equals ( lastfmdiv.childElementCount, 3, "lastfmdiv now has three inner elements" );
      plus();
      equals (lastfmdiv.children[0].style.display , "inline", "yachtdiv is visible on the page" );
      plus();
      clearInterval( interval );
    }
  }, 1000);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() > 2.5 && popped.currentTime() < 3 ) {
      equals (lastfmdiv.children[0].style.display , "inline", "yachtdiv is visible on the page" );
      plus();
      equals (lastfmdiv.children[1].style.display , "inline", "beatlesdiv is visible on the page" );
      plus();
      equals (lastfmdiv.children[2].style.display , "none", "nulldiv is not visible on the page" );
      plus();
      clearInterval( interval2 );
    }
  }, 1000);
  
  interval3 = setInterval( function() {
    if( popped.currentTime() > 4.5 && popped.currentTime() < 7 ) {
      equals (lastfmdiv.children[2].innerHTML , "Unknown Artist", "Artist information could not be found" );
      plus();
      clearInterval( interval3 );
    }
  }, 1000);
  
  popped.volume(0);
  popped.play();
});
