test("Popcorn Facebook Plugin", function () {
  
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
   
  ok ('facebook' in popped, "facebook is a method of the popped instance");
  plus();

  popped.facebook({
        target: "likediv",
        start : 1,
        end   : 6
      } )
      .facebook({
        href  : "http://www.facebook.com/senecacollege",
        type  : "LIKE_BOX",
        target: "likeboxdiv",
        start : 2,
        end   : 6
      } )
      .facebook({
        site   : "http://popcornjs.org/",
        type   : "ACTIVITY",
        target : "activitydiv",
        start  : 3,
        end    : 6
      } )
      .facebook({
        href   : "http://www.facebook.com/senecacollege",
        type   : "FACEPILE",
        target : "facepilediv",
        start  : 4,
        end    : 6,
        width  : 300
      } )
    .volume(0)
    .play();
    
  ok (document.getElementById('likediv'), "likediv exists on the page" );
  plus();
  ok (document.getElementById('likeboxdiv'), "likeboxdiv exists on the page" );
  plus();
  ok (document.getElementById('activitydiv'), "activitydiv exists on the page" );
  plus();
  ok (document.getElementById('facepilediv'), "facepilediv exists on the page" );
  plus();
  
  popped.exec( 2, function() {
    ok ( document.getElementById( "likediv" ).innerHTML.length > 0, "No type specified. Like button added to div" );
    plus();
  });
  
  popped.exec( 3, function() {
    ok ( document.getElementById( "likeboxdiv" ).innerHTML.length === 0, "Like box is not added to div" );
    plus();
  });
  
  popped.exec( 4, function() {
    ok ( document.getElementById( "activitydiv" ).innerHTML.length > 0, "Activity feed is added to div" );
    plus();
  });
  
  popped.exec( 5, function() {
    ok ( document.getElementById( "facepilediv" ).innerHTML.length > 0, "Facepile is added to div" );
    plus();
  });
});

