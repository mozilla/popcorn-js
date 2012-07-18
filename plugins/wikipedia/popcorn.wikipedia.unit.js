test( "Popcorn wikipedia Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 13,
      count = 0,
      theArticle = document.getElementById( "wikidiv" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "wikipedia" in popped, "wikipedia is a mehtod of the popped instance" );
  plus();

  equal( theArticle.innerHTML, "", "initially, there is nothing in the wikidiv" );
  plus();

  popped.wikipedia({
      start: 1,
      end: 3,
      src: "http://en.wikipedia.org/wiki/Cape_Town",
      title: "this is an article",
      target: "wikidiv",
      numberofwords: 22
    })
    .wikipedia({
      start: 4,
      end: 5,
      src: "http://en.wikipedia.org/wiki/S%C3%A3o_Paulo",
      target: "wikidiv",
      numberofwords: 43
    })
    .wikipedia({
      start: 2,
      end: 4,
      src: "http://en.wikipedia.org/wiki/Bunny",
      title: "This is an article about bunnies",
      target: "wikidiv",
      numberofwords: 1000
    })
    .volume( 0 )
    .play();

  popped.cue( 2, function() {
    notEqual( theArticle.innerHTML, "", "wikidiv now contains information" );
    plus();
    equal( theArticle.childElementCount, 4, "wikidiv now contains four child elements" );
    plus();
    equal( theArticle.children[ 0 ].innerHTML, "this is an article", "wikidiv has the right title" );
    plus();
    notEqual( theArticle.children[ 1 ].innerHTML, "", "wikidiv has some content" );
    plus();
    // subtract 1 from length for the  '...' added in by the plugin
    equal( theArticle.children[ 1 ].innerHTML.split( " " ).length -1, 22, "wikidiv contains 22 words" );
    plus();
    equal( theArticle.children[ 3 ].innerHTML.split( " " ).length - 1, 1000, "redirected article successfully retrieved 1000 words" );
    plus();
  });

  popped.cue( 3, function() {
    equal( theArticle.childElementCount, 2, "first wikipedia article was cleared properly" );
    plus();
  });

  popped.cue( 4, function() {
    notEqual( theArticle.innerHTML, "", "wikidiv now contains information" );
    plus();
    equal( theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
    plus();
    notEqual( theArticle.children[ 1 ].innerHTML, "", "wikidiv has the right content" );
    plus();
    // subtract 1 from length for the  '...' added in by the plugin
    equal( theArticle.children[ 1 ].innerHTML.split(" ").length - 1, 43, "wikidiv contains 43 words" );
    plus();
  });

  popped.cue( 6, function() {
    popped.pause().removeTrackEvent( popped.data.trackEvents.byStart[ 4 ]._id );
    equal( theArticle.innerHTML, "", "wikidiv is now empty" );
    plus();
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;
  popped.wikipedia({});
});

asyncTest( "Overriding default toString", 2, function() {
  var p = Popcorn( "#video" ),
      srcText = "http://en.wikipedia.org/wiki/Jungle",
      lastEvent;

  function testLastEvent( compareText, message ) {
    lastEvent = p.getTrackEvent( p.getLastTrackEventId() );
    equal( lastEvent.toString(), compareText, message );
  }

  p.wikipedia({
    src: srcText
  });
  testLastEvent( srcText, "Custom text displayed with toString" );

  p.wikipedia({});
  testLastEvent( "http://en.wikipedia.org/wiki/Cat", "Custom text displayed with toString using default" );

  start();
});
