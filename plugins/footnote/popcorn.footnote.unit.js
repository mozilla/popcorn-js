test("Popcorn Footnote Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 7, 
      count = 0,
      interval,
      interval2,
      interval3,
      footnotediv = document.getElementById('footnotediv');
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects) {
      start();
    }
  }
  
  stop();
   
  ok ('footnote' in popped, "footnote is a mehtod of the popped instance");
  plus();
  
  equals ( footnotediv.childElementCount, 0, "initially, there is nothing inside the footnotediv" );
  plus();
  
  popped.footnote({
      start: 0, // seconds
      end: 5, // seconds
      text: 'This video made exclusively for drumbeat.org',
      target: 'footnotediv'
    } )
    .footnote({
      start: 7, // seconds
      end: 14, // seconds
      text: 'Visit webmademovies.org for more details',
      target: 'footnotediv'
    } )
    .volume(0)
    .play();
  
  
  interval = setInterval( function() {
    if( popped.currentTime() > 0 && popped.currentTime() <= 5 ) {
      equals ( footnotediv.childElementCount, 2, "footnotediv now has two inner elements" );
      plus();
      equals (footnotediv.children[0].innerHTML , "This video made exclusively for drumbeat.org", "footnote displaing correct information" );
      plus();
      equals (footnotediv.children[0].style.display , "inline", "footnote is visible on the page" );
      plus();
      clearInterval( interval );
    }
  }, 2000);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() > 7 && popped.currentTime() < 14  ) {
      equals (footnotediv.children[1].style.display , "inline", "second footnote is visible on the page" );
      plus();
      clearInterval( interval2 );
    }
  }, 3000);
  
  interval3 = setInterval( function() {
    if( popped.currentTime() > 14) {
      ok (footnotediv.children[1].style.display === 'none' &&  footnotediv.children[0].style.display === 'none', "footnote are no longer vidible on the page" );
      plus();
      clearInterval( interval3 );
    }
  }, 15000);
  
});
