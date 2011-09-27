test( "Popcorn GML Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 8,
      count = 0,
      setupId,
      gmldiv = document.getElementById( "gmldiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop( 10000 );

  ok( "gml" in popped, "gml is a method of the popped instance" );
  plus();

  equals( gmldiv.childElementCount, 0, "initially, there is nothing inside the gmldiv" );
  plus();

  popped.gml({
    start: 0,
    end: 2,
    gmltag: "29582",
    target: "gmldiv"
  })
  .gml({
    start: 2,
    end: 4,
    gmltag: "155",
    target: "gmldiv"
  }).volume( 0 );

  setupId = popped.getLastTrackEventId();

  popped.exec( 0, function() {
    equals( gmldiv.children[ 0 ].style.display , "block", "first GML is visible on the page" );
    plus();
  });

  popped.exec( 3, function() {
    equals( gmldiv.children[ 1 ].style.display, "block", "second GML is visible on the page" );
    plus();
  });

  popped.exec( 4, function() {
    equals( gmldiv.children[ 1 ].style.display, "none", "second GML is no longer visible on the page" );
    plus();
    equals( gmldiv.children[ 0 ].style.display, "none", "first GML is no longer visible on the page" );
    plus();

    popped.pause().removeTrackEvent( setupId );

    ok( !Processing.getInstanceById( "canvas155" ), "Processing insteance was properly destroyed"  );
    plus();

    ok( !gmldiv.children[ 1 ], "canvas element was properly removed"  );
    plus();
  });

  popped.play();

});
