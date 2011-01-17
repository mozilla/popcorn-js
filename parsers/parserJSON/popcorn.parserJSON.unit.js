test("Popcorn 0.3 JSON Parser Plugin", function () {
  
  var expects = 9,
      count = 0,
      timeOut = 0,
      numLoadingEvents = 5, 
      trackData,
      trackEvents, 
      interval,
      poppercorn = Popcorn( "#video" );
      
  function plus() {
    if ( ++count === expects ) {
      start();
      // clean up added events after tests
      clearInterval( interval );
    }
  }
  
  poppercorn.parseJSON("data/data.json");
  
  expect(expects);
  
  stop( 10000 );
  
  

  
  setTimeout(function () {
  
    trackData = poppercorn.data;
    trackEvents = trackData.trackEvents;
    

    equals( trackEvents.byStart.length,  numLoadingEvents + 2 , "trackEvents.byStart.length === (5 loaded, 2 padding) " );
    plus();  
  
  
    Popcorn.xhr({
      url: 'data/data.json', 
      success: function( data ) {
        
        var idx = 0;
        
        Popcorn.forEach( data.json.data, function (dataObj) {
          Popcorn.forEach( dataObj, function ( obj, key ) {
          
            
            equals( trackData.history[idx].indexOf(key), 0, "history item '" + trackData.history[idx] + "' matches data key '"+ key+ "' at correct index" );
            plus();
            
            idx++;
          });
        });
        
        
      }
    });
    
    
    
    
    poppercorn.listen("timeupdate", function ( event ) {

      if ( Math.round( this.currentTime()) === 3 ) {
      
        equals( $("#iframe-container").children().length, 2, '$("#iframe-container").children().length' )
        plus();
        equals( $("#map-container").children().length, 1, '$("#map-container").children().length'  );
        plus();
        equals( $("#footnote-container").children().length, 2, '$("#footnote-container").children().length'  );
        plus();
        
        this.pause();
      
      }

    
    });
    
    
    poppercorn.currentTime(0).play()

  
  }, 500);
  
  
  
  
  
  
  
  

  // interval used to wait for data to be parsed
  //interval = setInterval( function() {
    //poppercorn.currentTime(5).play().currentTime(6);
  //}, 2000);
  
});
