asyncTest( "Popcorn Subtitle Plugin", function() {

  var popped = Popcorn( "#video" ),
      popped2 = Popcorn( "#video2" ),
      expects = 12,
      count = 0,
      subTop = 9001,
      subLeft = 9001,
      subtitlediv,
      subtitle2div;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  ok( "subtitle" in popped, "subtitle is a method of the popped instance" );
  plus();

  popped.subtitle({
      start: 0,
      end: 2,
      text: "this is the first subtitle of 2011"
    })
  .subtitle({
      start: 2,
      end: 4,
      text: "this is the second subtitle of 2011"
    })
  .subtitle({
      start: 5,
      end: 7,
      text: "this is the third subtitle of 2011"
    } )
    .volume( 0 )
    .play();

  subtitlediv = popped.getTrackEvent( popped.getLastTrackEventId() ).container;

  popped.subtitle({
    start: 7,
    end: 9,
    text: "instance one test"
  });

  popped2.subtitle({
      start: 7,
      end: 9,
      text: "instance two test"
    })
    .volume( 0 )
    .play().pause();

  subtitle2div = popped2.getTrackEvent( popped2.getLastTrackEventId() ).container;

  popped.exec( 1, function() {

    popped.media.pause();
    equal( subtitlediv.children[ 0 ].innerHTML, "this is the first subtitle of 2011", "subtitle displaying correct information" );
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
    popped.media.play();

  });

  popped.exec( 3, function() {

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
    equal( subtitlediv.style.left, popped.position().left + "px", "subtitle left position moved" );
    plus();
    ok( Popcorn.position( subtitlediv ).top > popped.position().top, "subtitle top position moved" );
    plus();

    equal( subtitlediv.children[ 1 ].innerHTML, "this is the second subtitle of 2011", "subtitle displaying correct information" );
    plus();

    popped.media.play();

  });

  popped.exec( 4, function() {

    popped.media.pause();
    equal( subtitlediv.children[ 1 ].innerHTML, "", "subtitle is clear" );
    plus();

    popped.media.play();

  });

  popped.exec( 8, function() {
    popped.pause();
    popped2.currentTime( 8 ).play();
  });

  popped2.exec( 8, function() {
    popped2.media.pause();

    equal( subtitlediv.children[ 3 ].innerHTML, "instance one test", "subtitle displaying correct information" );
    plus();
    equal( subtitle2div.children[ 0 ].innerHTML, "instance two test", "subtitle displaying correct information" );
    plus();

    popped.media.play();
  });

  popped.exec( 10, function() {
    ok( document.getElementById( "subtitle-0" ).style.display === "none" &&
        document.getElementById( "subtitle-1" ).style.display === "none" &&
        document.getElementById( "subtitle-2" ).style.display === "none", "All subtitles are no longer visible" );
    plus();

    popped.pause().removeTrackEvent( popped.data.trackEvents.byStart[ 6 ]._id );

    ok( !document.getElementById( "subtitle-2" ), "removed subtitle div was properly destroyed"  );
    plus();
  });
});

asyncTest( "subtitle data tests", function() {

  var popped = Popcorn( "#video" ),
      expects = 1,
      count = 0,
      container = document.getElementById( "sub-content" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  popped.subtitle({
    start: 0,
    end: 10,
    target: "sub-content"
  });

  popped.pause( 0 );

  equal( container.children[ 0 ].innerHTML, "", "subtitle with no text defaults to an empty string" );
  plus();
});

asyncTest( "subtitle container creation tests", function() {

  var popped = Popcorn( "#video" ),
      expects = 3,
      containerAtLoad = document.getElementById("divThatDoesntExist"),
      containerAfterParse,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  popped.subtitle({
    start: 0,
    end: 10,
    text: "My Text",
    target: "divThatDoesntExist"
  });

  popped.pause( 0 );

  containerAfterParse = document.getElementById("divThatDoesntExist");

  equal( !!containerAtLoad, false, "Container doesn't exist initially" );
  plus();
  equal( !!containerAfterParse, true, "Container exists now" );
  plus();
  equal( containerAfterParse.children[ 0 ].innerHTML, "My Text", "Subtitle displayed in created container" );
  plus();

  // Cleanup
  containerAfterParse.parentNode.removeChild( containerAfterParse );
});
