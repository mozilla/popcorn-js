test("Popcorn Mustache Plugin", function () {

  var popped = Popcorn("#video"),
      expects = 3,
      count = 0,
      interval,
      mustacheDiv = document.getElementById('mustache-div');

  expect( expects );

  function plus() {
    if ( ++count === expects) {
      start();
    }
  }

  stop();

  ok('mustache' in popped, "mustache is a method of the popped instance");
  plus();

  equals ( mustacheDiv.innerHTML, "", "initially, there is nothing inside the mustache-div" );
  plus();

  popped.mustache({
    start: 1, // seconds
    end: 3, // seconds
    template: "<h1>{{heading}}</h1>",
    data: '{"heading": "mustache"}',
    target: 'mustache-div',
    static: true
  } );

  interval = setInterval( function() {
    if( popped.currentTime() > 1 && popped.currentTime() < 3 ) {
      ok( /<h1>mustache<\/h1>/.test( mustacheDiv.innerHTML ), "Mustache template rendered" );
      plus();
      clearInterval( interval );
    }
  }, 500);

  popped.volume(0);
  popped.play();
});
