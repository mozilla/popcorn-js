$(function(){

  test("Popcorn Webpage Plugin", function () {
    
    
    // needs expectation

    var popped = Popcorn("#video");
     
    popped.webpages();
    
    
    ok( 'data' in popped, "popped has the data prop and therefore is a Popcorn object" )
    
    ok( 'webpages' in popped, "webpages is a mehtod of the popped instance");
    
    ok( typeof popped.webpages === "function" , "webpages is in the plugins registry");

    
  });
});