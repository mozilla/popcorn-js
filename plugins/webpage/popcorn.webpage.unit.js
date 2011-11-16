test( "Popcorn Webpage Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 11,
      count = 0,
      setupId,
      theiFrame = document.getElementsByTagName( "iframe" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "webpage" in popped, "webpages is a mehtod of the popped instance" );
  plus();

  equal( theiFrame.length, 0, "initially, there is no iframes on the page" );
  plus();

  popped.webpage({
    id: "webpages-a",
    start: 0,
    end: 1,
    src: "webmademovies.org",
    target: "webpagediv"
  })
  .webpage({
    id: "webpages-b",
    start: 1,
    end: 2,
    src: "http://zenit.senecac.on.ca/wiki/index.php/Processing.js",
    target: "webpagediv"
  })
  .volume( 0 );

  setupId = popped.getLastTrackEventId();

  popped.exec( 0, function() {
    ok( !!theiFrame[ 0 ], "iframe was created" );
    plus();
    equal( theiFrame.length, 2, "there is only two iframes on the page" );
    plus();
    equal( theiFrame[ 0 ].id, "webpages-a", "the first iframe has the id 'webpages-a'" );
    plus();
    ok( /webmademovies/.test( theiFrame[ 0 ].src ), "iframe has the src 'http://webmademovies.org/'" );
    plus();
  });

  popped.exec( 1, function() {
    ok( !!theiFrame[ 1 ], "iframe was created" );
    plus();
    equal( theiFrame[ 1 ].id, "webpages-b", "iframe second has the id 'webpages-b'" );
    plus();
    equal( theiFrame[ 1 ].src, "http://zenit.senecac.on.ca/wiki/index.php/Processing.js", "iframe has the src 'http://zenit.senecac.on.ca/wiki/index.php/Processing.js'" );
    plus();
  });

  popped.exec( 2, function() {
    ok( theiFrame[ 0 ].style.display === "none" && theiFrame[ 1 ].style.display === "none", "both iframes are hidden" );
    plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !theiFrame[ 1 ], "removed webpage was properly destroyed" );
    plus();
  });

  popped.play();

});
