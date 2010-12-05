//  suppress console log errors
if ( !window['console'] ) {
  var console = {}, 
      methods = 'log debug info warn error exception assert dir dirxml trace group groupEnd groupCollapsed time timeEnd profile profileEnd count clear notifyFirebug getFirebugElement firebug element'.split(' ');
  
  for ( var m in methods ) {
    console[ methods[m] ] = function () {
      //Array.prototype.slice.call(arguments)
    };
  }  
}


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
  
  
  
  Setup.eventset  = "loadstart progress suspend emptied stalled play pause " + 
                          "loadedmetadata loadeddata waiting playing canplay canplaythrough " + 
                          "seeking seeked timeupdate ended ratechange durationchange volumechange";
  
  Setup.events = Setup.eventset.split(/\s+/g);                              

  
  
  global.Setup = Setup;

})(window);


Setup.getGlobalSize();

