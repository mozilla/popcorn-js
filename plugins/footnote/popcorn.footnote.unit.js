test("Popcorn Footnote Plugin", function () {
  
  var popped = Popcorn("#video"),
      expects = 7, 
      count = 0,
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
    end: 2, // seconds
    text: 'This video made exclusively for drumbeat.org',
    target: 'footnotediv'
  } )
  .footnote({
    start: 2, // seconds
    end: 4, // seconds
    text: 'Visit webmademovies.org for more details',
    target: 'footnotediv'
  } )
  .volume(0);

  popped.exec( 1, function() {
    equals ( footnotediv.childElementCount, 2, "footnotediv now has two inner elements" );
    plus();
    equals (footnotediv.children[0].innerHTML , "This video made exclusively for drumbeat.org", "footnote displaing correct information" );
    plus();
    equals (footnotediv.children[0].style.display , "inline", "footnote is visible on the page" );
    plus();
  });

  popped.exec( 3, function() {
    equals (footnotediv.children[1].style.display , "inline", "second footnote is visible on the page" );
    plus();
  });

  popped.exec( 5, function() {
    ok (footnotediv.children[1].style.display === 'none' &&  footnotediv.children[0].style.display === 'none', "footnote are no longer vidible on the page" );
    plus();
  });
  popped.play();
  
});
