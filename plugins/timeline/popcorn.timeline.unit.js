test( "Popcorn Timeline Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 17,
      upIds = [],
      downIds = [],
      count = 0,
      timelineUp = document.getElementById( "timeline-up" ),
      timelineDown = document.getElementById( "timeline-down" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

    ok( "timeline" in popped, "timeline is a method of the popped instance" );
    plus();
    equal( document.getElementById( "timeline-up" ).firstChild, undefined, "initially, there is nothing inside the 'timeline-up' feed" );
    plus();
    equal( document.getElementById( "timeline-down" ).firstChild, undefined, "initially, there is nothing inside the 'timeline-down' feed" );
    plus();

    popped.timeline({
      start: 1,
      target: "timeline-up",
      title: "This is a title",
      text: "this is some interesting text that goes inside",
      innerHTML: "Click here for <a href='http://www.google.ca'>Google</a>"
    });
    upIds.push( popped.getLastTrackEventId() );

    popped.timeline({
      start: 2,
      target: "timeline-up",
      title: "double as interesting",
      text: "this is some interesting text that goes inside",
      innerHTML: "Maybe a button? <button onClick=\"window.location.href='http://www.google.com'\">Click Me</button>"
    });
    upIds.push( popped.getLastTrackEventId() );

    popped.timeline({
      start: 1,
      target: "timeline-down",
      title: "This is a title",
      text: "this is some interesting text that goes inside",
      innerHTML: "Maybe a button? <button onClick=\"window.location.href='http://www.google.com'\">Click Me</button>",
      direction: "down"
    });
    downIds.push( popped.getLastTrackEventId() );

    popped.timeline({
      start: 2,
      target: "timeline-down",
      title: "double as interesting",
      text: "this is some interesting text that goes inside",
      innerHTML: "Maybe a button? <button onClick=\"window.location.href='http://www.google.com'\">Click Me</button>",
      direction: "down"
    });
    downIds.push( popped.getLastTrackEventId() );

    popped.volume( 0 );

  popped.exec( 1.5, function() {
    //up
    ok( document.getElementById( "timelineDiv1" ), "First timeline is on the page" );
    plus();
    equal( document.getElementById("timelineDiv1" ).parentNode.parentNode.id, "timeline-up", "First timeline is inside the 'timeline-up' div" );
    plus();

    //down
    ok( document.getElementById( "timelineDiv3" ), "First timeline is on the page" );
    plus();
    equal( document.getElementById("timelineDiv3" ).parentNode.parentNode.id, "timeline-down", "First Timeline is inside the 'timeline-down' div" );
    plus();

  });
  popped.exec( 2.5, function() {
   //up
    var timelinediv2 = document.getElementById( "timelineDiv2" ),
        timelinediv4 = document.getElementById( "timelineDiv4" );
    ok( timelinediv2, "Second timeline is on the page" );
    plus();
    equal( timelinediv2 && timelinediv2.parentNode.parentNode.id, "timeline-up", "Second timelineDiv2 is inside the 'timeline-up' div" );
    plus();
    equal( timelineUp.firstChild.firstChild.id,  "timelineDiv2", "'timelineDiv2' is the first child in 'timeline-up'" );
    plus();

    //down

    ok( timelinediv4, "Second down timeline is on the page" );
    plus();
    equal( timelinediv4.parentNode.parentNode.id, "timeline-down", "timelineDiv4 is inside the 'timeline-down' div" );
    plus();
    equal( timelineDown.firstChild.firstChild.id, "timelineDiv3", "'timelineDiv3' is the first child in 'timeline-down'" );
    plus();
  });
  popped.exec( 4, function() {
    ok( document.getElementById( "timelineDiv1" ).style.display !== "none" &&
        document.getElementById( "timelineDiv2" ).style.display !== "none", "Both timelines in 'timeline-up are not visible" );
	  plus();

	  ok( document.getElementById( "timelineDiv3" ).style.display !== "none" &&
        document.getElementById( "timelineDiv4" ).style.display !== "none", "Both timelines in 'timeline-down' are not visible" );
	  plus();

    var uid, did;
    uid = upIds.pop();
    did = upIds.pop();

    while ( uid ) {
      popped.removeTrackEvent( uid );
      uid = upIds.pop();
    }
    while ( did ) {
      popped.removeTrackEvent( did );
      did = downIds.pop();
    }

    popped.pause();
    equal( document.getElementById( "timeline-up" ).firstChild, null, "removed timeline was properly destroyed"  );
    plus();
    equal( document.getElementById( "timeline-down" ).firstChild, null, "removed timeline was properly destroyed"  );
    plus();
  });

  popped.play();

});
