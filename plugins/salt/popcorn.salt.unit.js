module( "Popcorn Salt Plugin" );

test( "Salt", function() {

  var popped = Popcorn( "#video" ),
      expects = 5,
      count = 0;



  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      popped.on( "pause", function onPause(){
        this.off( "pause", onPause );
        this.destroy();
        start();
      }).pause();
    }
  }


  stop();

  ok( "salt" in popped, "salt is a method of the popped instance" );
  plus();


  // Simple salt
 popped.salt( {
    start: 1,
    end: 3,
    target: 'inlineLayoutTest'
  } )
  .cue( 2, function() {
    equal(inlineLayoutTest.style.display, "inline", "the inline-displayed element is still inline");
    plus();
  } )
    .cue( 4, function() {
    equal(inlineLayoutTest.style.display, "none", "target element is hidden again" );
    plus();
  } )

  popped.salt( {
    start: 4,
    end: 6,
    target: 'blockLayoutTest'
  } )
  .cue( 5, function() {
    equal(blockLayoutTest.style.display, "block", "the block-displayed element is still block");
    plus();
  } )
    .cue( 7, function() {
    equal(blockLayoutTest.style.display, "none", "target element is hidden again" );
    plus();
  } )

  popped.salt( {
    start: 7,
    end: 9,
    target: ''
  } )
  .cue( 8, function() {
    equal(blockLayoutTest.style.display, "block", "the block-displayed element is still block");
    plus();
    popped.pause();
  } )
  

  popped.play();
});
