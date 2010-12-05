test("Popcorn Webpage Plugin", function () {
  
  var popped = Popcorn("#video")
      expects = 2, 
      count = 0
    ;
  
  expect(expects);
  
  function plus() {
    if( ++count===expects) {
      start();
    }
  }
  
  stop();
  
  
  ok( 'webpages' in popped, "webpages is a mehtod of the popped instance");
  plus();
  
  popped.webpages({
      id: "webpages-a", 
      start: 1, // seconds
      end: 30, // seconds
      src: 'http://www.webmademovies.org',
      target: 'webpagediv'
    }).play();
  
  
  
  setTimeout(function() {
    ok( !!document.getElementsByTagName('iframe')[0], "iframe was created" );
    plus();
  }, 5000);
  
  
  
});
