test( "Popcorn Mustache Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 5,
      count = 0,
      mustacheDiv = document.getElementById( "mustache-div" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "mustache" in popped, "mustache is a method of the popped instance" );
  plus();

  equal( mustacheDiv.innerHTML, "", "initially, there is nothing inside the mustache-div" );
  plus();

  // Static strings
  popped.mustache({
    start: 0,
    end: 2,
    template: "<h1>{{heading}}</h1>",
    data: '{"heading": "mustache - test 1/3"}',
    target: "mustache-div",
    dynamic: false
  })
  .mustache({
    start: 2,
    end: 4,
    template: function( plugin, options ) {
      return "<h1>{{heading}}</h1>";
    },
    data: function( plugin, options ) {
      return JSON.parse( '{"heading": "mustache - test 2/3"}' );
    },
    target: "mustache-div"
  })
  .mustache({
    start: 4,
    end: 5,
    template: function( plugin, options ) {
      return "<h1>{{heading}}</h1>";
    },
    data: { heading: "mustache - test 3/3" },
    target: "mustache-div",
    dynamic: false
  });

  function runTest( a, b ) {
    equal( mustacheDiv.innerHTML, "<h1>mustache - test " + a + "/3<\/h1>", "Mustache template rendered" );
    plus();
  }

  popped.exec( 1, function() {
    runTest( 1 );
  })
  .exec( 3, function() {
    runTest( 2 );
  })
  .exec( 4.5, function() {
    runTest( 3 );
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.mustache({});

  popped.volume( 0 );
  popped.play();
});
