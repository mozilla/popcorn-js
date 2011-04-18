test( "Popcorn lower third Plugin", function () {
  
  var popped = Popcorn( "#video" ),
      expects = 7, 
      count = 0,
      lowerthirddiv = document.getElementById( "lowerthirddiv" );

  expect(expects);
  
  function plus() {
    if ( ++count===expects ) {
      start();
    }
  }
  
  stop();
   
  ok ( "lowerthird" in popped, "lowerthird is a method of the popped instance" );
  plus();
  
  equals ( lowerthirddiv.innerHTML, "", "initially, there is nothing inside the lowerthirddiv" );
  plus();

  ok( !popped.container, "initially, there is no default div" );
  plus();
  
  
  popped.lowerthird({
      start: 0, // seconds
      end: 5, // seconds
      salutation: "Mr",
      name: "Hyde",
      role: "Monster"
    } )
    .lowerthird({
      start: 3, // seconds
      end: 10, // seconds
      target: "lowerthirddiv",
      salutation: "Dr",
      name: "Jekyll",
      role: "Person"
    } )
    .volume(0);
    
  popped.exec( 1, function() {
    equals ( popped.container.innerHTML, "Mr Hyde<br>Monster", "first lowerthird is visible" );
    plus();
  });
  
  popped.exec( 4, function() {
    equals ( lowerthirddiv.innerHTML, "Dr Jekyll<br>Person", "second lowerthird is visible" );
    plus();
  });
  
  popped.exec( 11, function() {
    equals ( popped.container.innerHTML, "", "first lowerthird is empty" );
    plus();
    equals ( lowerthirddiv.innerHTML, "", "second lowerthird is empty" );
    plus();
  });
  
  popped.play();

});