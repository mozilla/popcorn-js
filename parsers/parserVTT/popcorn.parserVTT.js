// PARSER: 0.3 VTT

(function (Popcorn) {
  Popcorn.parser( "parseVTT", "VTT", function( data ) {

    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        subs = [],
        lines,
        i = 0, len = 0, idx = 0;
    
    // [HH]:MM:SS.mmm string to SS.mmm
    var toSeconds = function(t_in) {
      var t = t_in.split(':');
      var time, l = t.length-1;
      
      try {
        time = parseInt(t[l-1], 10)*60 + parseFloat(t[l], 10);
        
        if (l === 2) // Hours given
          time += parseInt(t[0], 10)*60*60; // hours => seconds
      } catch (e) { throw "Bad cue"; }
      
      return time;
    };
    
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };
  
    // Here is where the magic happens
    // Split on line breaks
    lines = data.text.split(/(?:\r\n|\r|\n)/gm);
    len = lines.length;
    
    while (i < len) {
      var sub = {};
      
      sub.id = lines[i++];
      
      var time = lines[i++].split(" --> ");
      var text = [];
      
      try {
        sub.start = toSeconds(time[0]);
        
        // Filter out any trailing styling info
        idx = time[1].indexOf(" ");
        sub.end = toSeconds(idx === -1 ? time[1] : time[1].substr(0, idx));
        
        while (i < len && lines[i]) {
          text.push(lines[i++]);
        }
        
        sub.text = text.join(" ");
        subs.push( createTrack("subtitle", sub) );
      } catch (e) { // Bad cue
        while (i < len && lines[i++]); // Advance to end of cue
      }
      
      // Consume empty whitespace
      while (i < len && !lines[i]) { i++; }
    }
    
    retObj.data = subs;

    return retObj;
  });

})( Popcorn );
