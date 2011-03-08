test("Popcorn Subtitle Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 5,
      count = 0,
      interval,
      interval2,
      interval3,
      interval4,
      subtitlediv;
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();
   
  ok ('subtitle' in popped, "subtitle is a method of the popped instance");
  plus();

  popped.subtitle({
      start: 3,
      text: 'this is the first subtitle of 2011',
      language: "en",
      languagesrc: "language",
      accessibilitysrc: "accessibility"
    } )
  .subtitle({
      start: 10,
      end: 15,
      text: 'this is the second subtitle of 2011',
      language: "en",
      languagesrc: "language",
      accessibilitysrc: "accessibility"
    } )
	.subtitle({
      start: 20,
      text: 'this is the third subtitle of 2011',
      language: "en",
      languagesrc: "language",
      accessibilitysrc: "accessibility"
    } )
    .volume(0)
    .play();
  
  interval = setInterval( function() {
    if( popped.currentTime() >= 3 && popped.currentTime() < 10 ) {
      subtitlediv = document.getElementById('subtitlediv'); // this div has only now been created
      equals (subtitlediv.innerHTML, "this is the first subtitle of 2011", "subtitle displaying correct information" );
      plus();
      clearInterval( interval );
    }
  }, 500);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() >= 10 && popped.currentTime() < 15  ) {
      equals (subtitlediv.innerHTML, "this is the second subtitle of 2011", "subtitle displaying correct information" );
      plus();
      clearInterval( interval2 );
    }
  }, 500);

  interval3 = setInterval( function() {
    if( popped.currentTime() >= 15 && popped.currentTime() < 20 ) {
      equals (subtitlediv.innerHTML, "" );
      plus();
      clearInterval( interval3 );
    }
  }, 500);
  
  interval4 = setInterval( function() {
    if( popped.currentTime() > 20) {
      equals (subtitlediv.innerHTML, "this is the third subtitle of 2011", "subtitle displaying correct information" );
      plus();
      clearInterval( interval4 );
    }
  }, 500);

});