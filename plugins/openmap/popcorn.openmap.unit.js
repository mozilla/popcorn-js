test("Popcorn OpenMap Plugin", function () {
  
  var popped = Popcorn("#video"),
    expects = 14, 
    count = 0,
    mapInterval,
    mapInterval2,
    mapInterval3,
    mapInterval4;
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();

  ok ('openmap' in popped, "openmap is a method of the popped instance");
  plus();
  
  ok ( document.getElementById('map').innerHTML === "", "initially, there is nothing inside map" );
  plus();
  
  ok ( document.getElementById('map2').innerHTML === "", "initially, there is nothing inside map2" );
  plus();

  ok ( document.getElementById('map3').innerHTML === "", "initially, there is nothing inside map3" );
  plus();
  
  popped.openmap({
    start: 0,
    end: 5,
    type: 'ROADMAP',
    target: 'map',
    lat: 43.665429,
    lng: -79.403323,
    zoom: 10
  } )
  .openmap({
    start: 0,
    end: 5,
    type: 'SATELLITE',
    target: 'map2',
    lat: 40.943926,
    lng: -78.968525,
    zoom: 9
  } )
  .openmap( {
    start: 0,
    end: 5,
    type: 'TERRAIN',
    target: 'map3',
    lat: 40.943926,
    lng: -78.968525,
    zoom: 14
  } )
  .openmap( {
    start: 0,
    end: 5,
    target: 'map4',
    lat: 40.943926,
    lng: -78.968525,
    zoom: "14"
  } )
  .volume(0)
  .play();

  mapInterval = popped.exec( 4, function() {
    if( popped.currentTime() > 3 && popped.currentTime() <= 5 ) {
      ok(OpenLayers, "OpenLayers is available");
      plus();
      ok (document.getElementById('actualmap1'), "First map is on the page" );
      plus();
      equals (document.getElementById('actualmap1').offsetParent.id, "map", "First map is inside the 'map' div" );
      plus();
      clearInterval( mapInterval );
    }
  } );
  mapInterval2 = popped.exec( 4, function() {
    if( popped.currentTime() > 3 && popped.currentTime() <= 5 ) {
      ok (document.getElementById('actualmap2'), "Second map is on the page" );
      plus();
      equals (document.getElementById('actualmap2').offsetParent.id, "map2", "Second map is inside the 'map2' div" );
      plus();
      clearInterval( mapInterval2 );
    }
  } );
  mapInterval3 = popped.exec( 4, function() {
    if( popped.currentTime() > 3 && popped.currentTime() <= 5 ) {
      ok (document.getElementById('actualmap3'), "Third map is on the page" );
      plus();
      equals (document.getElementById('actualmap3').offsetParent.id, "map3", "Third map is inside the 'map3' div" );
      plus();
      clearInterval( mapInterval3 );
    }
  } );
  mapInterval4 = popped.exec( 4, function() {
    if( popped.currentTime() > 3 && popped.currentTime() <= 5 ) {
      ok (document.getElementById('actualmap4'), "Fourth map is on the page" );
      plus();
      equals (document.getElementById('actualmap4').offsetParent.id, "map4", "Fourth map is inside the 'map4' div" );
      plus();
      clearInterval( mapInterval4 );
    }
  } );
  mapInterval5 = popped.exec( 6, function() {
    if( popped.currentTime() > 5  ) {
      ok (document.getElementById('actualmap2').style.display === "none" && 
          document.getElementById('actualmap3').style.display === "none" && 
          document.getElementById('actualmap4').style.display === "none" &&
          document.getElementById('actualmap1').style.display === "none", "All three maps are no longer visible" );
      plus();
      clearInterval( mapInterval5 );
    }
  } );
} );