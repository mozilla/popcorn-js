asyncTest( "Popcorn 0.3 SRT Parser Plugin", function () {
  
  var expects = 0,
      count = 0,
      sub = {},
      numSubs = 0,
      poppercorn = Popcorn( "#video" ),
      expectedSubs = [
        {
          id: 1,
          start: 2.4,
          end: 5.2,
          text: "[Background Music Playing]"
        },
        {
          id: 2,
          start: 15.712,
          end: 17.399,
          text: "Oh my god, Watch out!<br />It's coming!!"
        },
        {
          id: 3,
          start: 25.712,
          end: 30.399,
          text: "[Bird noises]"
        },
        {
          id: 4,
          start: 31,
          end: 31.999,
          text: 'This text is <font color="red">RED</font> and has not been positioned.'
        },
        {
          id: 5,
          start: 32,
          end: 32.999,
          text: "This is a<br />new line, as is<br />this"
        },
        {
          id: 6,
          start: 33,
          end: 33.999,
          text: "This contains nested <b>bold, <i>italic, <u>underline</u> and <s>strike-through</s></u></i></b> HTML tags"
        },
        {
          id: 7,
          start: 34,
          end: 34.999,
          text: "Unclosed but <b>supported HTML tags are left in,  SSA italics aren't"
        },
        {
          id: 8,
          start: 35,
          end: 35.999,
          text: "&lt;ggg&gt;Unsupported&lt;/ggg&gt; HTML tags are escaped and left in, even if &lt;hhh&gt;not closed."
        },
        {
          id: 9,
          start: 36,
          end: 36.999,
          text: "Multiple SSA tags are stripped"
        },
        {
          id: 10,
          start: 37,
          end: 37.999,
          text: "Greater than (&lt;) and less than (&gt;) are shown"
        }
      ];
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  poppercorn.parseSRT( "data/unit.srt", function() {

    Popcorn.forEach( poppercorn.getTrackEvents(), function( evt ) {
      if( evt._natives.type === "subtitle" ) {
        sub = expectedSubs[ numSubs++ ];
        
        equal( sub.id, evt.id, "Correct id" );
        plus();
        
        equal( sub.start, evt.start, "Correct start" );
        plus();
        
        equal( sub.end, evt.end, "Correct end" );
        plus();
        
        equal( sub.text, evt.text, "Correct text" );
        plus();
      }
    });
    
    equal( expectedSubs.length, numSubs, "Correctly parsed all subtitles" );
    plus();

  });
  
  expects = expectedSubs.length*4+1;
  expect( expects );

});
