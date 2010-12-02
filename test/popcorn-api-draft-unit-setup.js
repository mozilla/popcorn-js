
(function (global) { 
  
  //  Store the number of global properties that exist prior to Popcorn API definition
  
  var Setup = {
    globalSize: 0
  };

  Setup.getGlobalSize = function() {

    var size = 0;

    for( var p in window ) {
      if ( p !== "_firebug" ) {
        size++;
      }
    }

    //  account for self
    size++;
    
    //  Store the number of global properties internally
    if ( !Setup.globalSize ) {
      Setup.globalSize = size;
    }

    return size;
  };
  
  
  global.Setup = Setup;

})(window);


Setup.getGlobalSize();