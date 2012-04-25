test( "Popcorn OpenMap Plugin", function() {

  var popped = Popcorn( "#video" ),
     expects = 15,
     count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "openmap" in popped, "openmap is a method of the popped instance" );
  plus();

  ok( document.getElementById( "map" ).innerHTML === "", "initially, there is nothing inside map" );
  plus();

  ok( document.getElementById( "map2" ).innerHTML === "", "initially, there is nothing inside map2" );
  plus();

  ok( document.getElementById( "map3" ).innerHTML === "", "initially, there is nothing inside map3" );
  plus();

  popped.openmap({
    start: 0,
    end: 4,
    type: "ROADMAP",
    target: "map",
    lat: 43.665429,
    lng: -79.403323,
    zoom: 10
  })
  .openmap({
    start: 0,
    end: 4,
    type: "SATELLITE",
    target: "map2",
    lat: 40.943926,
    lng: -78.968525,
    zoom: 9
  })
  .openmap({
    start: 0,
    end: 4,
    type: "TERRAIN",
    target: "map3",
    lat: 40.943926,
    lng: -78.968525,
    zoom: 14
  })
  .openmap({
    start: 0,
    end: 4,
    target: "map4",
    lat: 40.943926,
    lng: -78.968525,
    zoom: "14"
  })
  .volume( 0 )
  .play();

  setupId = popped.getLastTrackEventId();

  popped.exec( 3, function() {
    ok( OpenLayers, "OpenLayers is available" );
    plus();

    ok( document.getElementById( "openmapdiv1" ), "First map is on the page" );
    plus();

    equal( document.getElementById( "openmapdiv1" ).offsetParent.id, "map", "First map is inside the 'map' div" );
    plus();

    ok( document.getElementById( "openmapdiv2" ), "Second map is on the page" );
    plus();

    equal( document.getElementById( "openmapdiv2" ).offsetParent.id, "map2", "Second map is inside the 'map2' div" );
    plus();

    ok( document.getElementById( "openmapdiv3" ), "Third map is on the page" );
    plus();

    equal( document.getElementById( "openmapdiv3" ).offsetParent.id, "map3", "Third map is inside the 'map3' div" );
    plus();

    ok( document.getElementById( "openmapdiv4" ), "Fourth map is on the page" );
    plus();
    equal( document.getElementById( "openmapdiv4" ).offsetParent.id, "map4", "Fourth map is inside the 'map4' div" );
    plus();

  } )
  .exec( 5, function() {
    ok( document.getElementById( "openmapdiv2" ).style.display === "none" &&
        document.getElementById( "openmapdiv3" ).style.display === "none" &&
        document.getElementById( "openmapdiv4" ).style.display === "none" &&
        document.getElementById( "openmapdiv1" ).style.display === "none", "All three maps are no longer visible" );
    plus();
    popped.pause().removeTrackEvent( setupId );
    ok( !document.getElementById( "actualmap3" ), "removed map was properly destroyed" );
    plus();

  });
});
