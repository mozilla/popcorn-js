asyncTest( "Popcorn Caramel Plugin", 3, function() {

  var urlTestDiv = document.getElementById( "urlClickTest" ),
      functionTestDiv = document.getElementById( "functionClickTest" ); 

  var simulateClickOn = function( paramElement ) {

    if ( typeof paramElement.click === "Function" ) {
      paramElement.click();
      return;
    }

    var evt = document.createEvent( "MouseEvents" );

    evt.initMouseEvent(
      "click", true, true, window,
      0, 0, 0, 0, 0, false, false,
      false, false, 0, null
    );

    paramElement.dispatchEvent( evt );
  };

  var popped = Popcorn( "#video");

  popped.caramel( {
    url: 'http://popcornjs.org/',
    target: 'urlClickTest'
  } );

  popped.caramel( {
    function_name:'showParams',
    function_params:{'param_1':'This function has','param_2': 3, 'param_3':'optional parameters.' },
    target: 'functionClickTest'
  } ); 

  popped.code({
    start: 2,
    end: 4,
    onStart: function ( options ) {
      simulateClickOn( urlTestDiv );
      ok(
        this.paused,
        "Video successfully stopped with a click url test div, window to popcornjs homepage opened in new tab/window."
      );
      //Continue playing
      popped.play();
    }
  })
  .code({
    start: 5,
    end: 7,
    onStart: function( options ) {
      simulateClickOn( functionTestDiv );
      ok(
        this.paused,
        "Video successfully stopped"
      );
      equal( functionTestDiv.innerHTML, "This function has 3 optional parameters.", "Div contents replaced with function parameters, per 'showParams' function." );
    start();
    }
  });

  popped.volume(0);
  popped.play();
});
