test("Popcorn Flickr Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 6, 
      count = 0,
      interval,
      interval2,
      interval3,
      flickrdiv = document.getElementById('flickrdiv');

  var images = document.getElementsByTagName('img');
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }

  stop();   
 
  ok('flickr' in popped, "flickr is a method of the popped instance");
  plus();

  equals ( flickrdiv.innerHTML, "", "initially, there is nothing inside the flickrdiv" );
  plus();
  
  popped.flickr({
    start: 5, // seconds
    end: 15, // seconds
    userid: '35034346917@N01',
    numberofimages: '1',
    target: 'flickrdiv'
  } );

  console.log(images);

  /*interval = setInterval( function() {
    if( popped.currentTime() > 5 && popped.currentTime() <= 15 ) {
      console.log(images[0].style);
      ok( images[0].style.display === "inline" && images[1].style.display === "none", "first image is displayed, second is not" );
      plus();
      clearInterval( interval );
    }
  }, 5000);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() > 15 && popped.currentTime() < 35  ) {
      console.log(images);
      ok( images[0].style.display === "none" && images[1].style.display === "none", "neither image is displayed" );
      plus();
      clearInterval( interval2 );
    }
  }, 5000);
  
  interval3 = setInterval( function() {
    if( popped.currentTime() > 35 && popped.currentTime() < 45 ) {
      console.log(images);
      ok( images[0].style.display === "none" && images[1].style.display === "inline", "second image is displayed, first is not" );
      plus();
      clearInterval( interval3 );
    }
  }, 5000);*/

  popped.play();
  
});
