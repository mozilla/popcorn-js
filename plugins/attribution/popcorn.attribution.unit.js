test("Popcorn attribution Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 7, 
      count = 0,
      attributiondiv = document.getElementById('attribdiv');
  
console.log(expects);

  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();
   
  ok ('attribution' in popped, "attribution is a method of the popped instance");
  plus();
  
  equals ( attributiondiv.childElementCount, 0, "initially, there is nothing inside the attributiondiv" );
  plus();
  
  
  popped.attribution({
      start: 0, // seconds
      end: 5, // seconds
      nameofwork: "A Shared Culture",
      copyrightholder:"Jesse Dylan",
      license: "CC-BY-N6",
      licenseurl: "http://creativecommons.org/licenses/by-nc/2.0/",
      target: 'attribdiv'
    } )
    .attribution({
      start: 3, // seconds
      end: 10, // seconds
      nameofwork: "Internet",
      nameofworkurl:"http://www.archive.org/details/CC1232_internet",
      copyrightholder:"The Computer Chronicles",
      license:"CC-BY-NC-ND",
      licenseurl: "http://creativecommons.org/licenses/by-nc-nd/2.0/",
      target: 'attribdiv'
    } )
    .volume(0);

  popped.exec( 1, function() {
    equals ( attributiondiv.childElementCount, 2, "attributiondiv now has two inner elements" );
    plus();
    equals (attributiondiv.children[0].style.display , "inline", "attribution is visible on the page" );
    plus();
  });
  
  popped.exec( 4, function() {
    equals (attributiondiv.children[1].style.display , "inline", "second attribution is visible on the page" );
    plus();
  });
  
  popped.exec( 11, function() {
    equals (attributiondiv.children[1].style.display , "none", "second attribution is no longer visible on the page" );
    plus();
    equals (attributiondiv.children[0].style.display , "none", "first attribution is no longer visible on the page" );
    plus();
  });
  
  popped.play();

});
