test( "Processing plugin tests", function() {
  var popped = Popcorn( "#video" ),
      expects = 31,
      count = 0,
      processingDiv = document.getElementById( "processing-div-1" ),
      processingDiv2 = document.getElementById( "processing-div-2" ),
      processingDiv3 = document.getElementById( "processing-div-3" ),
      processingDiv4 = document.getElementById( "processing-div-4" ),
      canvases = [],
      trackids = [];

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "processing" in popped, "processing is a method of the popped instance" );
  plus();

  equal( processingDiv.innerHTML, "", "'processing-div-1' is empty" );
  plus();

  equal( processingDiv2.innerHTML, "", "'processing-div-2' is empty" );
  plus();

  equal( processingDiv3.innerHTML, "", "'processing-div-3' is empty" );
  plus();

  equal( processingDiv4.innerHTML, "", "'processing-div-4' is empty" );
  plus();

  popped.processing({
    start: 0.25,
    end: 1,
    target: "processing-div-1",
    sketch: "test.pjs"
  });
  trackids.push( popped.getLastTrackEventId() );

  popped.processing({
    start: 1,
    end: 3,
    target: "processing-div-2",
    sketch: "test2.pjs"
  });
  trackids.push( popped.getLastTrackEventId() );

  popped.processing({
    start: 3,
    end: 4,
    target: "processing-div-3",
    sketch: "test.pjs"
  });
  trackids.push( popped.getLastTrackEventId() );

  popped.processing({
    start: 3,
    end: 4,
    target: "processing-div-4",
    sketch: "test2.pjs"
  });
  trackids.push( popped.getLastTrackEventId() );

  popped.exec( 0.5, function() {
    equal( processingDiv.children[ 0 ].style.display, "inline", "canvas '" + processingDiv.children[ 0 ].id + "' is displayed" );
    plus();
    equal( processingDiv2.children[ 0 ].style.display, "none", "canvas '" + processingDiv2.children[ 0 ].id + "' is hidden" );
    plus();
    equal( processingDiv3.children[ 0 ].style.display, "none", "canvas '" + processingDiv3.children[ 0 ].id + "' is hidden" );
    plus();
    equal( processingDiv4.children[ 0 ].style.display, "none", "canvas '" + processingDiv4.children[ 0 ].id + "' is hidden" );
    plus();
    //TODO: David Humphrey has written code that allows for listening to events on Processing instances. when
    // it lands In the next processing release we'll be able to detect if a processing instance is looping or not.
    // this is required in order to test the noPause functionality (automatically)
  })
  .exec( 1.5, function() {
    equal( processingDiv.children[ 0 ].style.display, "none", "canvas '" + processingDiv.children[ 0 ].id + "' is hidden" );
    plus();
    equal( processingDiv2.children[ 0 ].style.display, "inline", "canvas '" + processingDiv2.children[ 0 ].id + "' is displayed" );
    plus();
    equal( processingDiv3.children[ 0 ].style.display, "none", "canvas '" + processingDiv3.children[ 0 ].id + "' is hidden" );
    plus();
    equal( processingDiv4.children[ 0 ].style.display, "none", "canvas '" + processingDiv4.children[ 0 ].id + "' is hidden" );
    plus();
  }).exec( 3.5, function() {
    equal( processingDiv.children[ 0 ].style.display, "none", "canvas '" + processingDiv.children[ 0 ].id + "' is hidden" );
    plus();
    equal( processingDiv2.children[ 0 ].style.display, "none", "canvas '" + processingDiv2.children[ 0 ].id + "' is hidden" );
    plus();
    equal( processingDiv3.children[ 0 ].style.display, "inline", "canvas '" + processingDiv3.children[ 0 ].id + "' is displayed" );
    plus();
    equal( processingDiv4.children[ 0 ].style.display, "inline", "canvas '" + processingDiv4.children[ 0 ].id + "' is displayed" );
    plus();
  }).exec( 4.5, function() {
    var idx = 5;
    while ( --idx ) {
      popped.removeTrackEvent( trackids.pop() );
      ok( !document.getElementById( "processing-div-" + ( idx ) ).children[ 0 ], "track event was removed" );
      plus();
    }
  });

  ok( "processing" in popped, "processing is a method of the popped instance" );
  plus();

  //check that four canvases were created
  canvases = document.querySelectorAll( "canvas" );
  equal( canvases.length, 4, "four canvases are present" );
  plus();

  //enable this when ticket #583 lands
  //Popcorn.forEach( canvases, function( ctx, idx ) {
  [].forEach.call( canvases, function( ctx ) {

    var idCount = 0, i = -1, len = canvases.length;
    for ( ; ++i < len; ){
      if ( ctx.id === canvases[ i ].id ) {
        idCount++;
      }
    }

    equal( idCount, 1, ctx.id + " is a unique canvas id" );
    plus();

    equal( ctx.style.display, "none", ctx.id + " is hidden initially" );
    plus();
  });

  // set debug back to false, empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.processing({});

  popped.play();
});
