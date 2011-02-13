test("Popcorn Mustache Plugin", function () {

  var popped = Popcorn("#video"),
      expects = 5,
      count = 0,
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

  // Static strings
  popped.mustache({
    start: 1, // seconds
    end: 3, // seconds
    template: "<h1>{{heading}}</h1>",
    data: '{"heading": "mustache"}',
    target: 'mustache-div',
    static: true
  } );

  // Dynamic functions
  popped.mustache({
    start: 5, // seconds
    end: 7, // seconds
    template: function(plugin, options) {
      return "<h1>{{heading}}</h1>";
    },
    data: function(plugin, options) {
      return JSON.parse('{"heading": "mustache"}');
    },
    target: 'mustache-div',
  } );

  // Template + Object literal
  popped.mustache({
    start: 9, // seconds
    end: 11, // seconds
    template: function(plugin, options) {
      return "<h1>{{heading}}</h1>";
    },
    data: { heading: "mustache" },
    target: 'mustache-div',
    static: true
  } );

  var video = document.getElementById('video');
  var two = six = ten = false;

  video.addEventListener('timeupdate', function() {

    function pass() {
      ok( /<h1>mustache<\/h1>/.test( mustacheDiv.innerHTML ), "Mustache template rendered" );
      plus();
    }

    var t = Math.floor(video.currentTime);

    if (t === 2 && !two) {
      pass();
      two = true;
    } else if (t === 6 && !six) {
      pass();
      six = true;
    } else if (t === 10 && !ten) {
      pass();
      ten = true;
    }

    if (t === 11) {
      video.pause();
    }

  }, false);

  popped.volume(0);
  popped.play();
});
