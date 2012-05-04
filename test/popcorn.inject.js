(function( global ) {

  var combineFn = function( first, second ) {

    first = first || function() {};
    second = second || function() {};

    return function() {
      first.apply( this, arguments );
      second.apply( this, arguments );
    };
  };

  if ( QUnit && global.parent ) {
    QUnit.done = combineFn ( QUnit.done, function() {
      global.parent.postMessage( JSON.stringify(arguments), "*" );
    });
  }

})( window );