test("Popcorn Facebook Plugin", function () {
  
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
   
  ok ('facebook' in popped, "facebook is a method of the popped instance");
  plus();

  popped.facebook({
  type:"LIKE",
        target: "likediv"
      } )
      .facebook({
        href  : "http://www.facebook.com/senecacollege",
        type  : "LIKE_BOX",
        show_faces : "true",
        header: "false",
        target: "likeboxdiv"
      } )
      .facebook({
        href   : "http://popcornjs.org/",
        type   : "ACTIVITY",
        target : "activitydiv"
      } )
      .facebook({
        href   : "http://www.facebook.com/senecacollege",
        type   : "FACEPILE",
        target : "facepilediv"
      } )
    .volume(0)
    .play();
  
  popped.exec( 5, function() {
    ok ( document.getElementById( "likediv" ).innerHTML.length > 0, "No type specified. Like button added to div" );
    plus();
    ok ( document.getElementById( "likeboxdiv" ).innerHTML.length === 0, "Like box is not added to div" );
    plus();
    ok ( document.getElementById( "activitydiv" ).innerHTML.length > 0, "Activity feed is added to div" );
    plus();
    ok ( document.getElementById( "facepilediv" ).innerHTML.length > 0, "Facepile is added to div" );
    plus();
  });
});