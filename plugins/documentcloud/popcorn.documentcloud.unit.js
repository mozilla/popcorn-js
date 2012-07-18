(function( Popcorn, doc ) {
  test( "DocumentCloud Plug-in", function() {
    var popped = Popcorn( "#video" ),
        expects = 10,
        count = 0,
        cloudDiv1 = doc.getElementById( "cloud-div-1" ),
        cloudDiv2 = doc.getElementById( "cloud-div-2" ),
        setupIds = [];

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
    equal( cloudDiv1.childElementCount, 0, " #cloud-div-1 is initially empty" );
    plus();

    popped.documentcloud({
      start: 2,
      end: 4,
      url: "http://www.documentcloud.org/documents/70050-urbina-day-1-in-progress.html",
      width: 900,
      height: 500,
      target: "cloud-div-1"
    });

    setupIds.push( popped.getLastTrackEventId() );

    popped.documentcloud({
      start: 5,
      end: 8,
      url: "http://www.documentcloud.org/documents/70050-urbina-day-1-in-progress.html",
      showAnnotations: true,
      aid: 9899,
      target: "cloud-div-1"
    });

    setupIds.push( popped.getLastTrackEventId() );

    popped.documentcloud({
      start: 5,
      end: 8,
      url: "http://www.documentcloud.org/documents/238187-letter-to-canadians-from-jack-layton.html",
      width: 900,
      height: 500,
      target: "cloud-div-2"
    });

    var wrapper1,
        wrapper2,
        // this helps figure out when both wrappers are ready
        docCount = 0;

    popped.listen ( "documentready", function(  ) {
      if ( ++docCount === 2 ) {
        wrapper1 = cloudDiv1.querySelector( "div" );
        wrapper2 = cloudDiv2.querySelector( "div" );
        equal( cloudDiv1.childElementCount > 0, true, "wrapper div is present in cloud-div-1" );
        plus();
      }
    })
    .cue( 3, function() {
      equal( wrapper1.style.visibility, "visible", "Document in cloud-div-1 div is visible" );
      plus();
      equal( wrapper2.style.visibility, "hidden", "Document in cloud-div-2 div is visible" );
      plus();
    })
    .cue( 4.5, function() {
      equal( wrapper1.style.visibility, "hidden", "Document in cloud-div-1 div is not visible" );
      plus();
    })
    .cue( 7, function() {
      equal( wrapper1.style.visibility, "visible", "Document in cloud-div-1 div is visible" );
      plus();
      equal( wrapper2.style.visibility, "visible", "Document in cloud-div-2 is visible" );
      plus();
    })
    .cue( 8, function() {
      popped.removeTrackEvent( setupIds.pop() );
      equal( cloudDiv1.childElementCount > 0, true, "wrapper div is still present in cloud-div-1" );
      plus();
      popped.removeTrackEvent( setupIds.pop() );
      equal( cloudDiv1.childElementCount === 0, true, "wrapper div is no longer present in cloud-div-1" );
      plus();
    })
    .listen( "canplayall", function() {
      this.play( 0 );
    });
  });

  asyncTest( "Overriding default toString", 2, function() {
    var p = Popcorn( "#video" ),
        testSrc = "Test Source",
        lastEvent;

    function testLastEvent( compareText, message ) {
      lastEvent = p.getTrackEvent( p.getLastTrackEventId() );
      equal( lastEvent.toString(), compareText, message );
    }

    p.documentcloud({
      src: testSrc
    });
    testLastEvent( testSrc, "Custom text displayed with toString" );

    p.documentcloud({});
    testLastEvent( "http://www.documentcloud.org/documents/70050-urbina-day-1-in-progress.html", "Custom text displayed with toString using default" );

    start();
  });
})( Popcorn, document );
