// PARSER: 0.3 SRT

(function (Popcorn) {
  Popcorn.parser( "parseSRT", "SRT", function( data ) {

    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        subs = [];
    
    var toSeconds = function(t_in) {
      var t = t_in.split(':');
      var time = 0;
      
      try {
        var s = t[2].split(',');
        
        time += parseFloat(t[0], 10)*60*60; // hours => seconds
        time += parseFloat(t[1], 10)*60; // minutes => seconds
        time += parseFloat(s[0], 10);
        time += parseFloat(s[1], 10)/1000;
      } catch (e) { time = 0; }
      
      return time;
    };
    
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };
  
    var lines = data.text.replace("\r",'').split("\n");
    
    for(var i=0, l=lines.length; i<l;i++) {
      var sub = {};
      
      i++; // Bypass idx
      var time = lines[i++].split(" --> ");
      var text = "";
      
      sub.start = toSeconds(time[0]);
      sub.end = toSeconds(time[1]);
      
      while (lines[i] && lines[i] !== "\r") {
        text += lines[i++].replace("\r", "");
      }
      
      sub.text = text;
      
      subs.push( createTrack("subtitle", sub) );
    }
    
    retObj.data = subs;

    return retObj;
  });

})( Popcorn );
