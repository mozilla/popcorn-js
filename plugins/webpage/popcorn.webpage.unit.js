test("Popcorn Webpage Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 11, 
      count = 0,
      iframeInterval,
      iframeInterval2,
      iframeInterval3,
      iframeInterval4;
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();
   
  ok ('webpage' in popped, "webpages is a mehtod of the popped instance");
  plus();
  
  ok (document.getElementsByTagName('iframe').length === 0, "initially, there is no iframes on the page" );
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
    if( popped.currentTime() > 5 && popped.currentTime() <= 25 ) {
      ok (!!document.getElementsByTagName('iframe')[0], "iframe was created" );
      plus();
      ok (document.getElementsByTagName('iframe').length === 1, "there is only one iframe on the page" );
      plus();
      ok (document.getElementsByTagName('iframe')[0].id === "webpages-a", "iframe has the id 'webpages-a'" );
      plus();
      ok (document.getElementsByTagName('iframe')[0].src === "http://webmademovies.org/", "iframe has the src 'http://webmademovies.org/'" );
      plus();
      clearInterval( iframeInterval );
    }
  }, 5000);
  
  iframeInterval2 = setInterval( function() {
    if( popped.currentTime() > 25 && popped.currentTime() < 35  ) {
      ok (document.getElementsByTagName('iframe').length === 0, "the iframe has been removed" );
      plus();
      clearInterval( iframeInterval2 );
    }
  }, 5000);
  
  iframeInterval3 = setInterval( function() {
    if( popped.currentTime() > 35 && popped.currentTime() <= 50 ) {
      ok (!!document.getElementsByTagName('iframe')[0], "iframe was created" );
      plus();
      ok (document.getElementsByTagName('iframe').length === 1, "there is only one iframe on the page" );
      plus();
      ok (document.getElementsByTagName('iframe')[0].id === "webpages-b", "iframe has the id 'webpages-b'" );
      plus();
      ok (document.getElementsByTagName('iframe')[0].src === "http://zenit.senecac.on.ca/wiki/index.php/Processing.js", "iframe has the src 'http://zenit.senecac.on.ca/wiki/index.php/Processing.js'" );
      plus();
      clearInterval( iframeInterval3 );
    }
  }, 5000);
  
});
