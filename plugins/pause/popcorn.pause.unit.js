asyncTest( "Popcorn Pause Plugin", 2, function() {

  var anchorA = document.getElementById( "anchorA" ),
      anchorB = document.getElementById( "anchorB" );

  anchorA.addEventListener( "click", function( e ) {
    e.preventDefault();
  }, false );

  var simulateClickOn = function( paramElement ) {

    if ( typeof paramElement.click === "Function" ) {
      paramElement.click();
      return;
    }

    var evt = document.createEvent( "MouseEvents" );

    evt.initMouseEvent(
      "click", true, true, window,
      0, 0, 0, 0, 0, false, false,
      false, false, 0, null
    );

    paramElement.dispatchEvent( evt );
  };

  var otherVideo = Popcorn( "#video2", {
    pauseOnLinkClicked: true
  });
  otherVideo.play();

  var popped = Popcorn( "#video", {
    pauseOnLinkClicked: true
  });

  popped.code({
    start: 2.000,
    end: 4,
    onStart: function ( options ) {
      simulateClickOn( anchorA );
      ok(
        this.paused,
        "Video successfully stopped with a click on an anchor at " +
        "second 2 approximately (" + this.currentTime() + ")"
      );
      //Continue playing
      popped.play();
    }
  })
  .code({
    start: 5.561,
    end: 7,
    onStart: function( options ) {
      var currentTime = popped.currentTime();
      simulateClickOn( anchorB );
      ok(
        this.paused,
        "Video successfully stopped with a click on an anchor at " +
        "second 5.561 approximately (" + this.currentTime() + ")"
      );
    start();
    }
  });

  popped.volume(0);
  popped.play();
});
