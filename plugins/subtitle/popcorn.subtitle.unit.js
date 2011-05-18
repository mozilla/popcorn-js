test("Popcorn Subtitle Plugin", function () {
 
  var popped = Popcorn("#video"),
      expects = 9,
      count = 0,
      subTop = 9001,
      subLeft = 9001,
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
   
    popped.media.pause();
    equals( subtitlediv.innerHTML, "this is the first subtitle of 2011", "subtitle displaying correct information" );
    plus();
   
 
    // capturing location now, to check against later,
    // a subtitle must be displayed to get valid data
    // which is why we do this in exec
    subLeft = subtitlediv.style.left;
    subTop  = subtitlediv.style.top;
 
    // changing position
    popped.media.style.position = "absolute";
    popped.media.style.left = "400px";
    popped.media.style.top = "600px";
    popped.media.play()
   
  });
 
  popped.exec( 1.5, function() {
 
    popped.media.pause();
    // check position of subttile that should of moved with video,
    // a subtitle must be displayed to get valid data
    ok( subtitlediv.style.left !== subLeft, "subtitle's left position has changed" );
    plus();
    ok( subtitlediv.style.top !== subTop, "subtitle's top position has changed" );
    plus();
 
    // we know values have changed, but how accurate are they?
    // check values against the video's values
    // we need four checks because if we just check against video's position,
    // and video's position hasn't updated either, we'll pass when we should fail
    equals( subtitlediv.style.left, popped.position().left + "px", "subtitle left position moved" );
    plus();
    ok( Popcorn.position( subtitlediv ).top > popped.position().top, "subtitle top position moved" );
    plus();
 
    equals (subtitlediv.innerHTML, "this is the second subtitle of 2011", "subtitle displaying correct information" );
    plus();
    popped.media.play();
   
  });
 
  popped.exec( 2.5, function() {
   
    popped.media.pause();
    equals (subtitlediv.innerHTML, "", "subtitle is clear" );
    plus();
    popped.media.play();
 
  });
 
  popped.exec( 3.5, function() {
 
    popped.media.play();
    equals (subtitlediv.innerHTML, "this is the third subtitle of 2011", "subtitle displaying correct information" );
    plus();
    popped.media.play();
   
  });
});

