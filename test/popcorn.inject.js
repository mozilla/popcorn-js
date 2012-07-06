(function( global ) {

  var combineFn = function( first, second ) {

    first = first || function() {};
    second = second || function() {};

    return function( message ) {
      first.call( this, message );
      second.call( this, message );
    };
  };

  if ( QUnit && global.parent ) {
    QUnit.done = combineFn( QUnit.done, function( message ) {
      global.parent.postMessage( JSON.stringify( message ), "*" );
    });
    QUnit.testDone = combineFn( QUnit.testDone, function( message ) {
      global.parent.postMessage( JSON.stringify( message ),  "*" );
    });
    // Fail tests that don't complete in 60s
    QUnit.config.testTimeout = 60000;

    window.addEventListener( "message", function( e ) {
      if ( e.data === "getFocus" ) {
        window.focus();
      }
    }, false );
  }

})( window );
