test("Popcorn Flickr Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 7, 
      count = 0,
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
    end: 3,   // seconds
    userid: '35034346917@N01',
    numberofimages: '1',
    target: 'flickrdiv'
  } )
  .flickr({
    start: 4, // seconds
    end: 7,   // seconds
    username: 'AniaSob',
    apikey: 'd1d249260dd1673ec8810c8ce5150ae1',
    numberofimages: '1',
    target: 'flickrdiv'
  } );;

  popped.exec( 2, function() {
    ok( /display: inline;/.test( flickrdiv.innerHTML ), "Div contents are displayed" );
    plus();
    ok( /img/.test( flickrdiv.innerHTML ), "An image exists" );
    plus();
  });
  
  popped.exec( 5, function() {
    ok( /display: inline;/.test( flickrdiv.innerHTML ), "Div contents are displayed" );
    plus();
    ok( /img/.test( flickrdiv.innerHTML ), "An image exists" );
    plus();
  });

  popped.exec( 7, function() {
    ok( /display: none;/.test( flickrdiv.innerHTML ), "Div contents are hidden again" );
    plus();
  });
  popped.volume(0);
  popped.play();
  
});
