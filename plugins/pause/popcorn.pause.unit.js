test( "Popcorn Pause Plugin", function() {

  var expectedTests = 3 ,
      anchorA = document.getElementById( "anchorA" ),
      anchorB = document.getElementById( "anchorB" ),
      tolerance = 0.250;

  var simulateClickOn = function ( paramElement ) {

    if ( typeof paramElement.click === "Function" ) {
      paramElement.click() ;
      return ;
    }

    var evt = document.createEvent( "MouseEvents" );

    evt.initMouseEvent(
      "click", true, true, window,
      0, 0, 0, 0, 0, false, false,
      false, false, 0, null
    );

    paramElement.dispatchEvent( evt );
  };

  var otherVideo = Popcorn( "#video2" , {
        pauseOnLinkClicked: true
  });
  otherVideo.play() ;

  var popped = Popcorn( "#video" , {
        pauseOnLinkClicked: true
  });

  popped.code ({
    start: 2.000,
    end: 4,
    onStart: function ( options ) {
      var currentTime = popped.currentTime() ;
      simulateClickOn( anchorA ) ;
      ok(
        ( currentTime + tolerance >= 2 ) && ( currentTime - tolerance <= 2 ) ,
        "Video successfully stopped with a click on an anchor at " +
        "second 2 approximately (" + currentTime + ")"
      );
      //Continue playing
      popped.play() ;
    }
  })
  .code ({
    start: 5.561,
    end : 7,
    onStart: function ( options ) {
      var currentTime = popped.currentTime() ;
      simulateClickOn( anchorB ) ;
      ok(
        ( currentTime + tolerance >= 5.561 ) && ( currentTime - tolerance <= 5.561 ) ,
        "Video successfully stopped with a click on an anchor at " +
        "second 5.561 approximately (" + currentTime + ")"
      );
    start() ;
    }
  });

  popped.volume(0);
  popped.play();
  stop() ;
});
