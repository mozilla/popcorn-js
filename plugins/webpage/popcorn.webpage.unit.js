test("Popcorn Webpage Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 11, 
      count = 0,
      iframeInterval,
      iframeInterval2,
      iframeInterval3,
      iframeInterval4;
      theiFrame = document.getElementsByTagName('iframe');
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();
   
  ok ('webpage' in popped, "webpages is a mehtod of the popped instance");
  plus();
  
  equals (theiFrame.length, 0, "initially, there is no iframes on the page" );
  plus();
  
  popped.webpage({
      id: "webpages-a", 
      start: 5, // seconds
      end: 25, // seconds
      src: 'http://webmademovies.org',
      target: 'webpagediv'
    })
    .webpage({
      id: "webpages-b", 
      start: 35, // seconds
      end: 50, // seconds
      src: 'http://zenit.senecac.on.ca/wiki/index.php/Processing.js',
      target: 'webpagediv'
    })
    .play();
  
  
  iframeInterval = setInterval( function() {
    if( popped.currentTime() > 7 && popped.currentTime() <= 25 ) {
      ok (!!theiFrame[0], "iframe was created" );
      plus();
      equals (theiFrame.length, 1, "there is only one iframe on the page" );
      plus();
      equals (theiFrame[0].id, "webpages-a", "iframe has the id 'webpages-a'" );
      plus();
      equals (theiFrame[0].src, "http://webmademovies.org/", "iframe has the src 'http://webmademovies.org/'" );
      plus();
      clearInterval( iframeInterval );
    }
  }, 5000);
  
  iframeInterval2 = setInterval( function() {
    if( popped.currentTime() > 27 && popped.currentTime() < 35  ) {
      equals (theiFrame.length, 0, "the iframe has been removed" );
      plus();
      clearInterval( iframeInterval2 );
    }
  }, 5000);
  
  iframeInterval3 = setInterval( function() {
    if( popped.currentTime() > 37 && popped.currentTime() <= 50 ) {
      ok (!!theiFrame[0], "iframe was created" );
      plus();
      equals (theiFrame.length, 1, "there is only one iframe on the page" );
      plus();
      equals (theiFrame[0].id, "webpages-b", "iframe has the id 'webpages-b'" );
      plus();
      equals (theiFrame[0].src,"http://zenit.senecac.on.ca/wiki/index.php/Processing.js", "iframe has the src 'http://zenit.senecac.on.ca/wiki/index.php/Processing.js'" );
      plus();
      clearInterval( iframeInterval3 );
    }
  }, 5000);
  
});
