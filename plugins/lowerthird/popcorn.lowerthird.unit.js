test( "Popcorn lower third Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 7,
      count = 0,
      lowerthirddiv = document.getElementById( "lowerthirddiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "lowerthird" in popped, "lowerthird is a method of the popped instance" );
  plus();

  equal( lowerthirddiv.innerHTML, "", "initially, there is nothing inside the lowerthirddiv" );
  plus();

  ok( !popped.container, "initially, there is no default div" );
  plus();

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.lowerthird({});

  popped.lowerthird({
      start: 0,
      end: 2,
      salutation: "Mr",
      name: "Hyde",
      role: "Monster"
    })
    .lowerthird({
      start: 2,
      end: 4,
      target: "lowerthirddiv",
      salutation: "Dr",
      name: "Jekyll",
      role: "Person"
    })
    .volume( 0 );

  popped.exec( 1, function() {
    equal( popped.container.innerHTML, "Mr Hyde<br>Monster", "first lowerthird is visible" );
    plus();
  });

  popped.exec( 3, function() {
    equal( lowerthirddiv.innerHTML, "<div>Dr Jekyll<br>Person</div>", "second lowerthird is visible" );
    plus();
  });

  popped.exec( 5, function() {
    equal( popped.container.innerHTML, "", "first lowerthird is empty" );
    plus();
    equal( lowerthirddiv.innerHTML, "<div></div>", "second lowerthird is empty" );
    plus();
  });

  popped.play();

});
