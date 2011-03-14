test("Popcorn wikipedia Plugin", function () {
  
  var popped        = Popcorn("#video"),
      expects       = 10, 
      count         = 0,
      theArticle    = document.getElementById('wikidiv');
       
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
      start: 1, // seconds
      end: 3, // seconds
      src: 'http://en.wikipedia.org/wiki/Cape_Town',
      title: "this is an article",
      target: 'wikidiv'
    } )
    .wikipedia({
      start: 4, // seconds
      end: 8, // seconds
      src: 'http://en.wikipedia.org/wiki/S%C3%A3o_Paulo',
      target: 'wikidiv'
    } )
    .volume(0)
    .play();
    
  popped.exec( 2, function() {
    ok (theArticle.innerHTML !== "", "wikidiv now contains information" );
    plus();
    equals (theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
    plus();
    equals (theArticle.childNodes[0].innerHTML, "this is an article", "wikidiv has the right title" );
    plus();
    ok (theArticle.childNodes[1].innerHTML !=="", "wikidiv has some content" );
    plus();
  });
  
  popped.exec( 3, function() {
    equals (theArticle.innerHTML, "", "wikidiv was cleared properly" );
    plus();
  });
  
  popped.exec( 5, function() {
    ok (theArticle.innerHTML !== "", "wikidiv now contains information" );
    plus();
    equals (theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
    plus();
    ok (theArticle.childNodes[1].innerHTML !== "", "wikidiv has the right content" );
    plus();
  });
});
