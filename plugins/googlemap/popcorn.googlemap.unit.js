test( "Popcorn Google Map Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 25,
      count = 0,
      setupId;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "googlemap" in popped, "googlemap is a method of the popped instance" );
  plus();

  ok( document.getElementById( "map" ).innerHTML === "", "initially, there is nothing inside the map" );
  plus();

  ok( document.getElementById( "map2" ).innerHTML === "", "initially, there is nothing inside the map2" );
  plus();

  ok( document.getElementById( "map3" ).innerHTML === "", "initially, there is nothing inside the map3" );
  plus();

  popped.googlemap({
    start: 0,
    end: 2,
    type: "ROADMAP",
    target: "map",
    lat: 43.665429,
    lng: -79.403323
  })
  .googlemap({
      start: 0,
      end: 2,
      type: "SATELLITE",
      target: "map2",
      location: "toronto",
      zoom: 15
  });

  var mapz = popped.googlemap({
    start: 2,
    end: 4,
    type: "STREETVIEW",
    target: "map3",
    location: "6th Line, Oakville, Ontario",
    zoom: "1",
    heading: "180",
    pitch: "1",
	  interval: 1000,
	  tween: "York university",
    onmaploaded: function( options, map ) {
      ok( map === options._map && !!map, "Map was loaded and attached to the plugin." );
      plus();
    }
  })
  .volume( 0 );

  setupId = popped.getLastTrackEventId();

  popped.exec( 1, function() {
    ok( google.maps, "Google maps is available" );
    plus();
    ok( google.maps.Geocoder, "Google maps Geocoder is available" );
    plus();
    ok( document.getElementById( "actualmap1" ), "First map is on the page" );
    plus();
    equal( document.getElementById( "actualmap1" ).offsetParent.id, "map", "First map is inside the 'map' div" );
    plus();
    equal( popped.data.trackEvents.byStart[ 1 ].zoom, 1, "Defaulting to zoom of 1 from start." );
    plus();
  });

  popped.exec( 1, function() {
    ok( document.getElementById( "actualmap2" ), "Second map is on the page" );
    plus();
    equal( document.getElementById( "actualmap2" ).offsetParent.id, "map2", "Second map is inside the 'map2' div" );
    plus();
  });

  popped.exec( 3, function() {
    equal( document.getElementById( "actualmap3" ).offsetParent.id, "map3", "Tweening map is inside the 'map3' div" );
    plus();
  });

  popped.exec( 5, function() {
    ok( document.getElementById( "actualmap2" ).style.display === "none" &&
        document.getElementById( "actualmap1" ).style.display === "none" &&
        document.getElementById( "actualmap3" ).style.display === "none", "All maps are no longer visible" );
    plus();
    popped.pause().removeTrackEvent( setupId );

    ok( !document.getElementById( "actualmap4" ), "removed map was properly destroyed" );
    plus();
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.googlemap({});

  equal( 1, popped.getTrackEvent( popped.getLastTrackEventId() ).zoom, "zoom is defaulted to 1 from setup" );
  plus();
  equal( 0, popped.getTrackEvent( popped.getLastTrackEventId() ).lng, "lng is defaulted to 0" );
  plus();
  equal( 0, popped.getTrackEvent( popped.getLastTrackEventId() ).lat, "lat is defaulted to 0" );
  plus();
  equal( "ROADMAP", popped.getTrackEvent( popped.getLastTrackEventId() ).type, "type is defaulted to ROADMAP" );
  plus();

  popped.googlemap({
    target: "height1",
    location: "Toronto"
  });

  equal( 400, document.getElementById( "height1" ).children[ 0 ].offsetHeight, "target's css height is used." );
  plus();
  equal( 300, document.getElementById( "height1" ).children[ 0 ].offsetWidth, "target's css width is used." );
  plus();

  popped.googlemap({
    target: "height2",
    location: "Toronto",
    height: "100px",
    width: "120px"
  });

  equal( 100, document.getElementById( "height2" ).children[ 0 ].offsetHeight, "target's plugin options height is used." );
  plus();
  equal( 120, document.getElementById( "height2" ).children[ 0 ].offsetWidth, "target's plugin options width is used." );
  plus();

  popped.googlemap({
    target: "height3",
    location: "Toronto",
    height: "100px",
    width: "120px"
  });

  equal( 100, document.getElementById( "height3" ).children[ 0 ].offsetHeight, "target's plugin options height is used over css." );
  plus();
  equal( 120, document.getElementById( "height3" ).children[ 0 ].offsetWidth, "target's plugin options width is used over css." );
  plus();

  popped.play();
});

asyncTest( "Overriding default toString", 3, function() {
  var p = Popcorn( "#video" ),
      locationText = "London, England",
      latText = "43.665429",
      lngText = "-79.403323",
      lastEvent;

  function testLastEvent( compareText, message ) {
    lastEvent = p.getTrackEvent( p.getLastTrackEventId() );
    equal( lastEvent.toString(), compareText, message );
  }

  p.googlemap({
    location: locationText,
    target: "height3",
    height: "100px",
    width: "120px"
  });
  testLastEvent( locationText, "Custom text displayed with toString using location" );

  p.googlemap({
    lat: latText,
    lng: lngText,
    target: "height3",
    height: "100px",
    width: "120px"
  });
  testLastEvent( latText + ", " + lngText, "Custom text displayed with toString using lat and lng" );

  p.googlemap({
    target: "height3",
    height: "100px",
    width: "120px"
  });
  testLastEvent( "Toronto, Ontario, Canada", "Custom text displayed with toString using default" );

  start();
});
