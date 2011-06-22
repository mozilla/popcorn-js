test("Popcorn Timeline Plugin", function () {
  
  var popped = Popcorn( "#video" ),
      expects = 8,
      setupId, 
      count = 0;
  
  expect( expects );
  
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  stop();

    ok ( 'timeline' in popped, "timeline is a method of the popped instance" );
    plus();
    ok ( document.getElementById( 'timeline' ).innerHTML === "", "initially, there is nothing inside the feed" );
    plus();
  
    popped.timeline({
      start: 1, // seconds
      target: "timeline",
      title: "This is a title",
      text: "this is some interesting text that goes inside",
      innerHTML: "Click here for <a href='http://www.google.ca'>Google</a>" 
    } )
    .timeline({
      start: 2, // seconds
      target: "timeline",
      title: "double as interesting",
      text: "this is some interesting text that goes inside",
      innerHTML: "Maybe a button? <button onClick=\"window.location.href='http://www.google.com'\">Click Me</button>" 
    } )
    .volume(0);

  setupId = popped.getLastTrackEventId();
  
  popped.exec( 2, function() {
    ok ( document.getElementById( 'timelineDiv1' ), "First timeline is on the page" );
    plus();
    equals ( document.getElementById('timelineDiv1' ).parentNode.id, "timeline", "First timeline is inside the 'timeline' div" );
    plus();
  });
  popped.exec( 3, function() {
    ok ( document.getElementById( 'timelineDiv2' ), "Second timeline is on the page" );
    plus();
    equals ( document.getElementById( 'timelineDiv2' ).parentNode.id, "timeline", "Second timelineDiv2 is inside the 'timeline' div" );
    plus();
  });
  popped.exec( 4, function() {
    ok (document.getElementById( 'timelineDiv1' ).style.display !== "none" && 
        document.getElementById( 'timelineDiv2' ).style.display !== "none", "Both timelines are not visible" );
	  plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !document.getElementById( 'timeline' ).children[ 0 ], "removed timeline was properly destroyed"  );
    plus();
  });
  
  popped.play();
  
});
