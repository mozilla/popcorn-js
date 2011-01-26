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
        i = 0, l = 0;
    
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
    lines = data.text.replace("\r",'').split("\n");
    l = lines.length;
    
    while (i < l) {
      var sub = {};
      
      sub.id = lines[i++].replace('\r', '');
      
      var time = lines[i++].split(" --> ");
      var text = [];
      
      try {
        sub.start = toSeconds(time[0]);
        
        // Filter out any trailing styling info
        time[1] = time[1].replace("\r", " ");
        sub.end = toSeconds(time[1].substr(0, time[1].indexOf(" ")));
        
        while (lines[i] && lines[i] !== "\r") {
          text.push(lines[i++].replace("\r", ""));
        }
        
        sub.text = text.join(" ");
        subs.push( createTrack("subtitle", sub) );
      } catch (e) { // Bad cue
        while (i < l && !lines[i++] !== "\r"); // Advance to end of cue
      }
      
      // Consume empty whitespace
      while (i < l && !lines[i++] === "\r");
    }
    
    retObj.data = subs;

    return retObj;
  });

})( Popcorn );
