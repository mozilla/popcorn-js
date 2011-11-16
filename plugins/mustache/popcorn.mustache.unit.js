test( "Popcorn Mustache Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 6,
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

  equals ( mustacheDiv.innerHTML, "", "initially, there is nothing inside the mustache-div" );
  plus();

  // Static strings
  popped.mustache({
    start: 0,
    end: 2,
    template: "<h1>{{heading}}</h1>",
    data: '{"heading": "mustache - test 1/3"}',
    target: "mustache-div",
    dynamic: false
  });

  // Dynamic functions
  popped.mustache({
    start: 2,
    end: 4,
    template: function( plugin, options ) {
      return "<h1>{{heading}}</h1>";
    },
    data: function( plugin, options ) {
      return JSON.parse( '{"heading": "mustache - test 2/3"}' );
    },
    target: "mustache-div"
  });

  // Template + Object literal
  popped.mustache({
    start: 4,
    end: 5,
    template: function( plugin, options ) {
      return "<h1>{{heading}}</h1>";
    },
    data: { heading: "mustache - test 3/3" },
    target: "mustache-div",
    dynamic: false
  });

  var video = document.getElementById( "video" );
  var two, six, ten;
      two = six = ten = false;

  video.addEventListener( "timeupdate", function() {

    function pass( a, b ) {
      equals( mustacheDiv.innerHTML, "<h1>mustache - test " + a + "/" + b + "<\/h1>","Mustache template rendered" );
      plus();
    }

    var t = Math.floor( video.currentTime );

    if ( t === 1 && !two ) {
      pass( 1, 3 );
      two = true;
    } else if ( t === 3 && !six ) {
      pass( 2, 3 );
      six = true;
    } else if ( t === 4 && !ten ) {
      pass( 3, 3 );
      ten = true;
    }

    if ( t === 6 ) {
      video.pause();
    }

  }, false);

  // empty track events should be safe
  popped.mustache({});

  // debug should log errors on empty track events
  Popcorn.plugin.debug = true;
  try {
    popped.mustache({});
  } catch( e ) {
    ok( true, "empty event was caught by debug" );
    plus();
  }

  popped.volume( 0 );
  popped.play();
});
