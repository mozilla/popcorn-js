test("Popcorn attribution Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 7, 
      count = 0,
      interval,
      interval2,
      interval3,
      attributiondiv = document.getElementById('attribdiv');
  
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
      nameOfWork: "A Shared Culture",
      copyrightHolder:"Jesse Dylan",
      licenseType: "CC-BY-N6",
      licenseUrl: "http://creativecommons.org/licenses/by-nc/2.0/",
      target: 'attribdiv'
    } )
    .attribution({
      start: 3, // seconds
      end: 10, // seconds
      nameOfWork: "Internet",
      nameOfWorkUrl:"http://www.archive.org/details/CC1232_internet",
      copyrightHolder:"The Computer Chronicles",
      licenseType:"CC-BY-NC-ND",
      licenseUrl: "http://creativecommons.org/licenses/by-nc-nd/2.0/",
      target: 'attribdiv'
    } )
    .volume(0)
    .play();
  
  
  interval = setInterval( function() {
    if( popped.currentTime() > 0 && popped.currentTime() <= 5 ) {
      equals ( attributiondiv.childElementCount, 2, "attributiondiv now has two inner elements" );
      plus();
      equals (attributiondiv.children[0].style.display , "inline", "attribution is visible on the page" );
      plus();
      clearInterval( interval );
    }
  }, 2000);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() > 3 && popped.currentTime() < 10  ) {
      equals (attributiondiv.children[1].style.display , "inline", "second attribution is visible on the page" );
      plus();
      clearInterval( interval2 );
    }
  }, 3000);
  
  interval3 = setInterval( function() {
    if( popped.currentTime() > 10) {
      equals (attributiondiv.children[1].style.display , "none", "second attribution is no longer visible on the page" );
      plus();
      equals (attributiondiv.children[0].style.display , "none", "first attribution is no longer visible on the page" );
      plus();
      clearInterval( interval3 );
    }
  }, 11000);
  
});
