test("Popcorn Webpage Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 10, 
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
      start: 0, // seconds
      end: 5, // seconds
      src: 'http://webmademovies.org',
      target: 'webpagediv'
    })
    .webpage({
      id: "webpages-b", 
      start: 7, // seconds
      end: 10, // seconds
      src: 'http://zenit.senecac.on.ca/wiki/index.php/Processing.js',
      target: 'webpagediv'
    })
    .volume(0)
    .play();
  
  
  iframeInterval = setInterval( function() {
    if( popped.currentTime() > 1 && popped.currentTime() <= 5 ) {
      ok (!!theiFrame[0], "iframe was created" );
      plus();
      equals (theiFrame.length, 2, "there is only two iframes on the page" );
      plus();
      equals (theiFrame[0].id, "webpages-a", "the first iframe has the id 'webpages-a'" );
      plus();
      equals (theiFrame[0].src, "http://webmademovies.org/", "iframe has the src 'http://webmademovies.org/'" );
      plus();
      clearInterval( iframeInterval );
    }
  }, 5000);
  
  iframeInterval2 = setInterval( function() {
    if( popped.currentTime() > 10 ) {
      ok (theiFrame[0].style.display === 'none' && theiFrame[1].style.display === 'none', "both iframes are hidden" );
      plus();
      clearInterval( iframeInterval2 );
    }
  }, 15000);
  
  iframeInterval3 = setInterval( function() {
    if( popped.currentTime() > 8 && popped.currentTime() <= 10 ) {
      ok (!!theiFrame[1], "iframe was created" );
      plus();
      equals (theiFrame[1].id, "webpages-b", "iframe second has the id 'webpages-b'" );
      plus();
      equals (theiFrame[1].src,"http://zenit.senecac.on.ca/wiki/index.php/Processing.js", "iframe has the src 'http://zenit.senecac.on.ca/wiki/index.php/Processing.js'" );
      plus();
      clearInterval( iframeInterval3 );
    }
  }, 5000);
  
});
