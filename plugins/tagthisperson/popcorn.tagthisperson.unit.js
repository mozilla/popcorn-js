test("Popcorn tagthisperson Plugin", function () {
  
  var popped = Popcorn( "#video" ),
      expects = 7, 
      count = 0,
      interval,
      interval2,
      interval3,
      tagdiv = document.getElementById( 'tagdiv' );
  
  expect(expects);
  
  function plus() {
    if ( ++count===expects ) {
      start();
    }
  }
  
  stop();
   
  ok ( 'tagthisperson' in popped, "tagthisperson is a method of the popped instance" );
  plus();
  
  equals ( tagdiv.innerHTML, "", "initially, there is nothing inside the tagdiv" );
  plus();
  
  popped.tagthisperson({
      start: 0, // seconds
      end: 5, // seconds
      person: 'Anna Sob',
      image: 'http://newshour.s3.amazonaws.com/photos%2Fspeeches%2Fguests%2FRichardNSmith_thumbnail.jpg',
      target: 'tagdiv'
    } )
    .tagthisperson({
      start: 3, // seconds
      end: 10, // seconds
      person: 'Scott',
      target: 'tagdiv'
    } )
    .volume(0)
    .play();
  
  
  interval = setInterval( function() {
    if( popped.currentTime() > 0 && popped.currentTime() <= 5 ) {
      equals ( tagdiv.childElementCount, 1, "tagdiv now contains one child elements" );
      plus();
      equals ( tagdiv.textContent.trim() , "Anna Sob" ,"tagdiv shows the first tag" );
      plus();
      clearInterval( interval );
    }
  }, 2000);
  
  interval2 = setInterval( function() {
    if( popped.currentTime() > 3 && popped.currentTime() < 5  ) {
      equals ( tagdiv.textContent.trim() , "Anna Sob, Scott", "tagdiv shows the first & second tag" );
      plus();
      clearInterval( interval2 );
    }
  }, 2000);
  
  interval3 = setInterval( function() {
    if( popped.currentTime() > 5 ) {
      equals ( tagdiv.innerHTML.trim() , "Scott" ,"tagdiv shows the second tag only" );
      plus();
      clearInterval( interval3 );
    }
  }, 5000);
  interval4 = setInterval( function() {
    if( popped.currentTime() > 10 ) {
      equals ( tagdiv.innerHTML , "" ,"tagdiv is now cleared" );
      plus();
      clearInterval( interval4 );
    }
  }, 4000);
});
