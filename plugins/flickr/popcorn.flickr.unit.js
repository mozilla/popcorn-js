test("Popcorn Flickr Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 8, 
      count = 0,
      setupId,
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
    start: 0, // seconds
    end: 1,   // seconds
    userid: '35034346917@N01',
    numberofimages: '1',
    target: 'flickrdiv'
  } )
  .flickr({
    start: 1, // seconds
    end: 2,   // seconds
    username: 'AniaSob',
    apikey: 'd1d249260dd1673ec8810c8ce5150ae1',
    numberofimages: '1',
    target: 'flickrdiv'
  });

  setupId = popped.getLastTrackEventId();

  popped.exec( 0.5, function() {
    ok( /display: inline;/.test( flickrdiv.innerHTML ), "Div contents are displayed" );
    plus();
    ok( /img/.test( flickrdiv.innerHTML ), "An image exists" );
    plus();
  });
  
  popped.exec( 1.5, function() {
    ok( /display: inline;/.test( flickrdiv.innerHTML ), "Div contents are displayed" );
    plus();
    ok( /img/.test( flickrdiv.innerHTML ), "An image exists" );
    plus();
  });

  popped.exec( 2, function() {
    ok( /display: none;/.test( flickrdiv.innerHTML ), "Div contents are hidden again" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !flickrdiv.children[1], "removed flickr was properly destroyed"  );
    plus();
  });
  popped.volume(0).play();
  
});
