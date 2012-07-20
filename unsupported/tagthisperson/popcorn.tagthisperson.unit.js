test( "Popcorn tagthisperson Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 8,
      count = 0,
      tagdiv = document.getElementById( "tagdiv" );
      tagdiv2 = document.getElementById( "tagdiv2" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  stop();

  ok( "tagthisperson" in popped, "tagthisperson is a method of the popped instance" );
  plus();

  equal( tagdiv.innerHTML, "", "initially, there is nothing inside the tagdiv" );
  plus();

  popped.tagthisperson({
    start: 0,
    end: 1,
    person: "Anna Sob",
    image: "http://newshour.s3.amazonaws.com/photos%2Fspeeches%2Fguests%2FRichardNSmith_thumbnail.jpg",
    href: "http://annasob.wordpress.com",
    target: "tagdiv"
  })
  .tagthisperson({
    start: 1,
    end: 2,
    person: "Scott",
    href: "http://scottdowne.wordpress.com/",
    target: "tagdiv"
  })
  .tagthisperson({
    start: 1,
    end: 2,
    person: "Mike",
    target: "tagdiv2"
  })
  .tagthisperson({
    start: 1,
    end: 2,
    person: "Daniel",
    target: "tagdiv2"
  })
  .volume( 0 );

  popped.exec( 0, function() {
    equal( tagdiv.childElementCount, 2, "tagdiv now contains two child elements" );
    plus();
    equal( tagdiv.textContent.trim() , "Anna Sob" ,"tagdiv shows the first tag" );
    plus();
  });

  popped.exec( 1, function() {
    equal( tagdiv.innerHTML.search( "<a href" ) , 1 ,"second tag in tagdiv has a url" );
    plus();
    equal( tagdiv2.textContent.trim(), "Mike, Daniel" ,"tagdiv2 shows the first & second tag" );
    plus();
  });

  popped.exec( 2, function() {
    equal( tagdiv.innerHTML , "" ,"tagdiv is now cleared" );
    plus();
    equal( tagdiv2.innerHTML , "" ,"tagdiv2 is now cleared" );
    plus();
  });

  popped.play();

});
