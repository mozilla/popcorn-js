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
  
  equals( theArticle.innerHTML, "", "initially, there is nothing in the wikidiv" );
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
    .volume( 0 )
    .play();
    
  popped.exec( 2, function() {
    notEqual( theArticle.innerHTML, "", "wikidiv now contains information" );
    plus();
    equals( theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
    plus();
    equals( theArticle.children[ 0 ].innerHTML, "this is an article", "wikidiv has the right title" );
    plus();
    notEqual( theArticle.children[ 1 ].innerHTML, "", "wikidiv has some content" );
    plus();
    // subtract 1 from length for the  '...' added in by the plugin
    equals( theArticle.children[ 1 ].innerHTML.split( " " ).length -1, 22, "wikidiv contains 22 words" );
    plus();
  });
  
  popped.exec( 3, function() {
    equals( theArticle.innerHTML, "", "wikidiv was cleared properly" );
    plus();
  });
  
  popped.exec( 4, function() {
    notEqual( theArticle.innerHTML, "", "wikidiv now contains information" );
    plus();
    equals( theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
    plus();
    notEqual( theArticle.children[ 1 ].innerHTML, "", "wikidiv has the right content" );
    plus();
    // subtract 1 from length for the  '...' added in by the plugin
    equals( theArticle.children[ 1 ].innerHTML.split(" ").length - 1, 43, "wikidiv contains 43 words" );
    plus();
  });

  popped.exec( 6, function() {
    popped.pause().removeTrackEvent( popped.data.trackEvents.byStart[ 4 ]._id );
    equals( theArticle.innerHTML, "", "wikidiv is now empty" );
    plus();
  });

  // empty track events should be safe
  popped.wikipedia({});

  // debug should log errors on empty track events
  Popcorn.plugin.debug = true;
  try {
    popped.wikipedia({});
  } catch( e ) {
    ok( true, "empty event was caught by debug" );
    plus();
  }
});
