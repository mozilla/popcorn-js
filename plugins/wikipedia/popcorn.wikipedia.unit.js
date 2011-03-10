test("Popcorn wikipedia Plugin", function () {
  
  var popped        = Popcorn("#video"),
      expects       = 9, 
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
      start: 5, // seconds
      end: 10, // seconds
      src: 'http://en.wikipedia.org/wiki/Cape_Town',
      title: "this is an article",
      target: 'wikidiv'
    } )
    .wikipedia({
      start: 12, // seconds
      end: 20, // seconds
      src: 'http://en.wikipedia.org/wiki/S%C3%A3o_Paulo',
      target: 'wikidiv'
    } )
    .volume(0)
    .play();
    
  popped.exec( 5, function() {
    ok (theArticle.innerHTML !== "", "wikidiv now contains information" );
    plus();
    equals (theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
    plus();
    equals (theArticle.childElement[0].innerHTML, "this is an article", "wikidiv has the right title" );
    plus();
    equals (theArticle.childElement[1].innerHTML, "Cape Town metropolitan municipality. It is the provincial capital and primate city ...", "wikidiv has the right content" );
    plus();
  });
  
  popped.exec( 10, function() {
    equals (theArticle.innerHTML, "", "wikidiv was cleared properly" );
    plus();
  });
  
  popped.exec( 13, function() {
    ok (theArticle.innerHTML !== "", "wikidiv now contains information" );
    plus();
    equals (theArticle.childElementCount, 2, "wikidiv now contains two child elements" );
    plus();
    equals (theArticle.childElement[1].innerHTML, "São Paulo is the largest city in Brazil, the largest city in the southern hemisphere, and the world's 7th largest metropolitan area. The city is the capital of the state of São Paulo, the most populou ...", "wikidiv has the right content" );
    plus();
  });
   
});
