test("Popcorn 0.1 XML Parser Plugin", function () {
  
  var expects = 7,
      count = 0,
      timeOut = 0,
      interval,
      poppercorn = Popcorn( "#video" );
      
  function plus() {
    if ( ++count === expects ) {
      start();
      // clean up added events after tests
      clearInterval( interval );
    }
  }
  
  expect(expects);
  
  stop( 10000 );

  Popcorn.plugin("parserTest1", {
    
    start: function ( event, options ) {
      ok( options.item2 === "item2", "parserTest1 has data directly from manifest" );
      plus();
      ok( options.item3 === "item3", "parserTest1 has cascading data from manifest" );
      plus();
    },
    end: function ( event, options ) {}
  });

  Popcorn.plugin("parserTest2", {
    
    start: function ( event, options ) {
      ok( options.text === "item4", "parserTest2 has text data" );
      plus();
      ok( options.item1 === "item1", "parserTest2 has cascading data from parent" );
      plus();
    },
    end: function ( event, options ) {}
  });

  Popcorn.plugin("parserTest3", {
    
    start: function ( event, options ) {
      ok( options.item1 === "item1", "parserTest3 has cascading data from parent" );
      plus();
      ok( options.item2 === "item2", "parserTest3 has data directly from manifest" );
      plus();
      ok( options.item3 === "item3", "parserTest3 has cascading data from manifest" );
      plus();
    },
    end: function ( event, options ) {}
  });

  poppercorn.parseXML("data/unit.XML");

  // interval used to wait for data to be parsed
  interval = setInterval( function() {
    poppercorn.currentTime(5).play().currentTime(6);
  }, 2000);
  
});
