// .noConflict() setup
var Popcorn = this.Popcorn || "Popcorn",
  pop = this.pop || "pop",
  originalPopcorn = Popcorn;

(function( global ) {

  var Setup = {};

  Setup.eventset = "loadstart progress suspend emptied stalled play pause " +
                   "loadedmetadata loadeddata waiting playing canplay canplaythrough " +
                   "seeking seeked timeupdate ended ratechange durationchange volumechange";

  Setup.events = Setup.eventset.split(/\s+/g);

  global.Setup = Setup;

})( window );
