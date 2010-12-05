test("Popcorn Webpage Plugin", function () {
  
  
  // needs expectation

  var popped = Popcorn("#video"),
      expects = 4,
      count = 0;
      
  expect(expects);
      
  function plus (){
    if(++count === expects){
      stop();
    }
  }
  
  popped.webpages({
      id: "webpages-a", 
      start: 0, // seconds
      end: 5, // seconds
      src: 'http://www.webmademovies.org',
      target: 'webpagediv'
    });
    
  popped.play();
  
  
  ok( 'data' in popped, "popped has the data prop and therefore is a Popcorn object" )
  
  ok( 'webpages' in popped, "webpages is a mehtod of the popped instance");
  
  ok( typeof popped.webpages === "function" , "webpages is a function");
  
  popped.exec(2, function(){
    ok( document.getElementById('webpages-a') , "iframe exists");  
  })
});
