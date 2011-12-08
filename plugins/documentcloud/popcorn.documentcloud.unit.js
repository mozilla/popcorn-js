(function( Popcorn, doc ) {
  test( "DocumentCloud Plug-in", function() {
    var popped = Popcorn( "#video" ),
        expects = 8,
        count = 0,
        cloudDiv1 = doc.getElementById( "cloud-div-1" ),
        setupId;

    popped.volume( 0 );

    expect( expects );

    var plus = function plus() {
      if ( ++count === expects ) {
        start();
      }
    };

    stop();

    ok( "documentcloud" in popped, "documentcloud is a method of the popped instance" );
    plus();

    equals( cloudDiv1.childElementCount, 0, " #cloud-div-1 is initially empty" );
    plus();

    popped.documentcloud({
      start: 2,
      end: 4,
      url: "http://www.documentcloud.org/documents/70050-urbina-day-1-in-progress.html",
      width: 900,
      height: 500,
      target: "cloud-div-1"
    })
    .documentcloud({
      start: 5,
      end: 8,
      url: "http://www.documentcloud.org/documents/238187-letter-to-canadians-from-jack-layton.html",
      width: 900,
      height: 500,
      target: "cloud-div-1"
    });

    setupId = popped.getLastTrackEventId();

    popped.cue( 0, function() {
      equals( cloudDiv1.childElementCount > 0, true, "data is present in cloud-div-1" );
      plus();
    })
    .cue( 3, function() {
      equals( cloudDiv1.style.display, "inline", "Document is visible" );
    });

    popped.play();

  });

})( Popcorn, document );