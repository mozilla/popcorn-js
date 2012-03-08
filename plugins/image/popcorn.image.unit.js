asyncTest( "Popcorn Image Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 9,
      count = 0,
      setupId,
      imagediv = document.getElementById( "imagediv" ),
      sources = [
        "https://www.drumbeat.org/media//images/drumbeat-logo-splash.png",
        "http://www.petmountain.com/category/mini/organic-dog-supplies/520/organic-dog-supplies.jpg",
        "http://www.botskool.com/sites/default/files/images/javascript.png"
      ];

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      popped.destroy();
      start();
    }
  }

  ok( "image" in popped, "image is a method of the popped instance" );
  plus();

  equal( imagediv.innerHTML, "", "initially, there is nothing inside the imagediv" );
  plus();

  popped.image({
    start: 1,
    end: 3,
    href: "http://www.drumbeat.org/",
    src: sources[ 0 ],
    text: "DRUMBEAT",
    target: "imagediv"
  })
  .image({
    start: 4,
    end: 6,
    src: sources[ 1 ],
    target: "imagediv"
  })
  .image({
    start: 5,
    end: 6,
    src: sources[ 2 ],
    target: "imagediv"
  });

  setupId = popped.getLastTrackEventId();

  popped.cue( 2, function() {
    ok( imagediv.children[ 0 ].style.display !== "none", "inline", "Div contents are displayed" );
    plus();
    equal( imagediv.querySelector("img").nodeName, "IMG", "An image exists" );
    plus();
  });

  popped.cue( 3, function() {
    equal( imagediv.children[ 0 ].style.display, "none", "Div contents are hidden again" );
    plus();
  });

  popped.cue( 5, function() {
    [].forEach.call( document.querySelectorAll( "#imagediv a img" ), function( img, idx ) {
      ok( img.src === sources[ idx ], "Image " + idx + " is in the right order" );
      plus();
    });
  });

  popped.cue( 7, function() {
    popped.pause().removeTrackEvent( setupId );
    ok( !imagediv.children[ 2 ], "removed image was properly destroyed" );
    plus();
  });

  popped.volume( 0 ).play();
});


asyncTest( "Zerostart doesn't rehide", 1, function() {
  var popped = Popcorn( "#video" ),
      zerostart = document.getElementById( "zerostart" );

  popped.on( "canplayall", function() {
    popped.currentTime(0);

    popped.image({
      start: 0,
      end: 3,
      src: "https://www.drumbeat.org/media/images/drumbeat-logo-splash.png",
      target: "zerostart"
    });

    popped.cue( 1, function() {
      ok( zerostart.children[ 0 ].style.display !== "none", "display area displayed at start: 0 without re-hiding" );
      start();
    });

    popped.play();
  });
});
