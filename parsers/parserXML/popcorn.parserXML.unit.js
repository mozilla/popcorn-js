asyncTest( "Popcorn 0.1 XML Parser Plugin", 7, function () {

  var poppercorn = Popcorn( "#video" );

  Popcorn.plugin( "parserTest1", {
    start: function ( event, options ) {
      ok( options.item2 === "item2", "parserTest1 has data directly from manifest" );
      ok( options.item3 === "item3", "parserTest1 has cascading data from manifest" );
    }
  });

  Popcorn.plugin( "parserTest2", {
    start: function ( event, options ) {
      ok( options.text === "item4", "parserTest2 has text data" );
      ok( options.item1 === "item1", "parserTest2 has cascading data from parent" );
    }
  });

  Popcorn.plugin( "parserTest3", {
    start: function ( event, options ) {
      ok( options.item1 === "item1", "parserTest3 has cascading data from parent" );
      ok( options.item2 === "item2", "parserTest3 has data directly from manifest" );
      ok( options.item3 === "item3", "parserTest3 has cascading data from manifest" );
      start();
    }
  });

  poppercorn.parseXML( "data/unit.XML", function() {
    poppercorn.play( 5 );
    poppercorn.mute();
  });
});
