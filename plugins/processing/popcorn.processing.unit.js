test( "Processing plugin tests", function() {
  var popped = Popcorn( "#video" ),
      expects = 18,
      count = 0,
      processingDiv = document.getElementById( "processing-div" ),
      processingDiv2 = document.getElementById( "processing-div-2" ),
      processingDiv3 = document.getElementById( "processing-div-3" ),
      canvases = [];

  expect( expects );
  
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  stop();
  
  ok( "processing" in popped, "processing is a method of the popped instance" );
  plus();

  equals( processingDiv.innerHTML, "", "'processing-div' is empty" );
  plus();
  
  equals( processingDiv2.innerHTML, "", "'processing-div-2' is empty" );
  plus();
  
  equals( processingDiv3.innerHTML, "", "'processing-div-3' is empty" );
  plus();

  popped.processing({
    start: 0,
    end: 1,
    target: "processing-div",
    sketch: "test.pjs"
  })
  .processing({
    start: 1,
    end: 3,
    target: "processing-div-2",
    sketch: "test2.pjs"
  })
  .processing({
    start: 3,
    end: 4,
    target: "processing-div-3",
    sketch: "test.pjs"
  })
  .exec( 0.5, function() {
    equals( processingDiv.children[ 0 ].style.display, "inline", "canvas '" + processingDiv.children[ 0 ].id + "' is displayed" );
    plus();
    //TODO: David Humphrey has written code that allows for listening to events on Processing instances. when 
    // it lands In the next processing release we'll be able to detect if a processing instance is looping or not.
    // this is required in order to test the noPause functionality (automatically)
  })
  .exec( 1.5, function() {
    equals( processingDiv.children[ 0 ].style.display, "none", "canvas '" + processingDiv.children[ 0 ].id + "' is hidden" );
    plus();
    equals( processingDiv2.children[ 0 ].style.display, "inline", "canvas '" + processingDiv2.children[ 0 ].id + "' is displayed" );
    plus();
    equals( processingDiv3.children[ 0 ].style.display, "none", "canvas '" + processingDiv3.children[ 0 ].id + "' is hidden" );
    plus();
  }).exec( 3.5, function() {
    equals( processingDiv.children[ 0 ].style.display, "none", "canvas '" + processingDiv.children[ 0 ].id + "' is hidden" );
    plus();
    equals( processingDiv2.children[ 0 ].style.display, "none", "canvas '" + processingDiv2.children[ 0 ].id + "' is hidden" );
    plus();
    equals( processingDiv3.children[ 0 ].style.display, "inline", "canvas '" + processingDiv3.children[ 0 ].id + "' is displayed" );
    plus();
  });
  
  //check that three canvases were created
  canvases = document.querySelectorAll( "canvas" ); 
  equals( canvases.length, 3, "Three canvases are present" );
  plus();

  var called = 0;
  
  //enable this when ticket #583 lands
  //Popcorn.forEach( canvases, function( ctx, idx ) {
  [].forEach.call( canvases, function( ctx ) {
 
    var idCount = 0, i = -1, len = canvases.length;
    for ( ; ++i < len; ){
      if ( ctx.id === canvases[ i ].id ) {
        idCount++;
      }
    }

    equals( idCount, 1, ctx.id + " is a unique canvas id" );
    plus();

    equals( ctx.style.display, "none", ctx.id + " is hidden initially" );
    plus();
  });
  
  popped.play();
});
