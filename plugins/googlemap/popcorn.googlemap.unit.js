test("Popcorn Google Map Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 10, 
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

  ok ('googlemap' in popped, "googlemap is a mehtod of the popped instance");
  plus();
  
  ok ( document.getElementById('map').innerHTML === "", "initially, there is nothing inside the map" );
  plus();
  
  ok ( document.getElementById('map2').innerHTML === "", "initially, there is nothing inside the map2" );
  plus();
  
  popped.googlemap({
        start: 0, // seconds
        end: 5, // seconds
        type: 'ROADMAP',
        target: 'map',
        lat: 43.665429,
        lng: -79.403323,
        zoom: 10
      } )
      .googlemap({
        start: 0, // seconds
        end: 5, // seconds
        type: 'SATELLITE',
        target: 'map2',
        location:'boston',
        zoom: 15
      } )
    .volume(0)
    .play();
  
  
  mapInterval = setInterval( function() {
    if( popped.currentTime() > 3 && popped.currentTime() <= 5 ) {
      ok(google.maps, "Google maps is available");
      plus();
      ok(google.maps.Geocoder, "Google maps Geocoder is available");
      plus();
      ok (document.getElementById('actualmap1'), "First map is on the page" );
      plus();
      equals (document.getElementById('actualmap1').offsetParent.id, "map", "First map is inside the 'map' div" );
      plus();
      clearInterval( mapInterval );
    }
  }, 1000);
  mapInterval2 = setInterval( function() {
    if( popped.currentTime() > 3 && popped.currentTime() <= 5 ) {
      ok (document.getElementById('actualmap2'), "Second map is on the page" );
      plus();
      equals (document.getElementById('actualmap2').offsetParent.id, "map2", "Second map is inside the 'map2' div" );
      plus();
      clearInterval( mapInterval2 );
    }
  }, 1000);
  mapInterval3 = setInterval( function() {
    if( popped.currentTime() > 5  ) {
      ok (document.getElementById('actualmap2').style.display === "none" && 
          document.getElementById('actualmap1').style.display === "none", "Both maps are no lnger visible" );
      plus();
      clearInterval( mapInterval3 );
    }
  }, 1000);
  
});
