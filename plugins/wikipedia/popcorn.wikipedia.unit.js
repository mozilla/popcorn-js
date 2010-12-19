test("Popcorn wikipedia Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 5, 
      count = 0,
      wikiInterval,
      wikiInterval2,
      wikiInterval3,
      wikiInterval4;
      theArticle = document.getElementById('wikidiv');
      
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();
   
  ok ('wikipedia' in popped, "wikipedia is a mehtod of the popped instance");
  plus();
  
  equals (theArticle.innerHTML, "", "initially, there is nothing in the wikidiv" );
  plus();
  
  popped.wikipedia({
      start: 5, // seconds
      end: 10, // seconds
      src: 'http://en.wikipedia.org/wiki/Cape_Town',
      target: 'wikidiv'
    } )
    .wikipedia({
      start: 12, // seconds
      end: 20, // seconds
      src: 'http://en.wikipedia.org/wiki/S%C3%A3o_Paulo',
      target: 'wikidiv'
    } )
    .play();
  
  
  wikiInterval = setInterval( function() {
    if( popped.currentTime() > 7 && popped.currentTime() <= 10 ) {
      ok (theArticle.innerHTML !== "", "wikidiv now contains information" );
      plus();
      equals (theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
      plus();
      
      clearInterval( wikiInterval );
    }
  }, 5000);
  
  wikiInterval2 = setInterval( function() {
    if( popped.currentTime() > 10 && popped.currentTime() < 12  ) {
      equals (theArticle.innerHTML, "", "wikidiv was cleared properly" );
      plus();
      clearInterval( wikiInterval2 );
    }
  }, 5000);
  
  wikiInterval3 = setInterval( function() {
    if( popped.currentTime() > 13 && popped.currentTime() <= 20 ) {
      ok (theArticle.innerHTML !== "", "wikidiv now contains information" );
      plus();
      equals (theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
      plus();
      
      clearInterval( wikiInterval3 );
    }
  }, 5000);
  
  
  
});
