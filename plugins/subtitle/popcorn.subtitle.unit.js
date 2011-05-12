test("Popcorn Subtitle Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 9,
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
      start: 0,
      end: 1,
      text: 'this is the first subtitle of 2011',
      language: "en",
      languagesrc: "language",
      accessibilitysrc: "accessibility"
    } )
  .subtitle({
      start: 1,
      end: 2,
      text: 'this is the second subtitle of 2011',
      language: "en",
      languagesrc: "language",
      accessibilitysrc: "accessibility"
    } )
	.subtitle({
      start: 3,
      end: 4,
      text: 'this is the third subtitle of 2011',
      language: "en",
      languagesrc: "language",
      accessibilitysrc: "accessibility"
    } )
    .volume(0)
    .play();

  subtitlediv = document.getElementById('subtitlediv');

  popped.exec( 0.5, function() {

console.log(subtitlediv.style.top);
    equals ( subtitlediv.style.left, "400px", "subtitle left position moved" );
    plus();
    equals ( subtitlediv.style.top, "657px", "subtitle top position moved" );
    plus();
    equals (subtitlediv.innerHTML, "this is the first subtitle of 2011", "subtitle displaying correct information" );
    plus();
  });

  popped.exec( 1.5, function() {

    equals (subtitlediv.innerHTML, "this is the second subtitle of 2011", "subtitle displaying correct information" );
    plus();
  });

  popped.exec( 2.5, function() {

    equals (subtitlediv.innerHTML, "", "subtitle is clear" );
    plus();
  });

  popped.exec( 3.5, function() {

    equals (subtitlediv.innerHTML, "this is the third subtitle of 2011", "subtitle displaying correct information" );
    plus();
  });

  equals ( "8px", subtitlediv.style.left, "subtitle left position default" );
  plus();
  equals ( "247px", subtitlediv.style.top, "subtitle top position default" );
  plus();

  popped.media.style.position = "absolute";
  popped.media.style.left = "400px";
  popped.media.style.top = "600px";

});
