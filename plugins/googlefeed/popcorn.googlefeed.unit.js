test("Popcorn Google Feed Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 11,
      setupId, 
      count = 0;
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();

    ok ('googlefeed' in popped, "googlefeed is a method of the popped instance");
    plus();
    ok ( document.getElementById('feed').innerHTML === "", "initially, there is nothing inside the feed" );
    plus();
    ok ( document.getElementById('feed1').innerHTML === "", "initially, there is nothing inside the feed1" );
    plus();
  
  popped.googlefeed({
    start: 0, // seconds
    end: 1, // seconds
    target: "feed",
    url: "http://zenit.senecac.on.ca/~chris.tyler/planet/rss20.xml",
    title: "Planet Feed",
    orientation: "Vertical"
	})
	.googlefeed({
    start: 0, // seconds
    end: 2, // seconds
    target: "feed1",
    url: "http://blog.pikimal.com/geek/feed/",
    title: "pikiGeek",
    orientation: "Horizontal"
  })
  .volume(0);

  setupId = popped.getLastTrackEventId();
  
  popped.exec( 0, function() {
    ok(google.load, "Google Feed is available");
    plus();
    ok(GFdynamicFeedControl, "Dynamic Feed Control Available");
    plus();
    ok (document.getElementById('_feed1'), "First feed is on the page" );
    plus();
    equals (document.getElementById('_feed1').offsetParent.id, "feed", "First feed is inside the 'feed' div" );
    plus();
  });
  popped.exec( 1, function() {
    ok (document.getElementById('_feed2'), "Second feed is on the page" );
    plus();
    equals (document.getElementById('_feed2').offsetParent.id, "feed1", "Second feed is inside the 'feed2' div" );
    plus();
  });
  popped.exec( 2, function() {
    ok (document.getElementById('_feed2').style.display === "none" && 
        document.getElementById('_feed1').style.display === "none", "Both feeds are no lnger visible" );
	  plus();

    popped.pause().removeTrackEvent( setupId );
    ok( !document.getElementById('feed1').children[0], "removed footnote was properly destroyed"  );
    plus();
  });
  
  popped.play();
  
});
