// PARSER: 0.1 TTXT

(function (Popcorn) {

  /**
   * 
   *
   */
  Popcorn.parser( "parseTTXT", "TTXT", function( data ) {

    // declare needed variables
    var returnData = {
          title: "",
          remote: "",
          data: []
        };

    // Simple function to convert HH:MM:SS.MMM to SS.MMM
    var toSeconds = function(t_in) {
      var t = t_in.split(":");
      var time = 0;
      
      try {
        var s = t[2].split('.');
        
        time += parseFloat(t[0], 10)*60*60;   // hours => seconds
        time += parseFloat(t[1], 10)*60;      // minutes => seconds
        time += parseFloat(s[0], 10);
        time += parseFloat(s[1], 10)/1000;
      } catch (e) { throw "Invalid time"; }
      
      return time;
    };

    // creates an object of all atrributes keyed by name
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };

    // this is where things actually start
    // Timings should start at second element, but don't assume can jump right to children[1]
    
    var node = data.xml.lastChild.lastChild; // Last Child of TextStreamHeader
    var lastStart = 3.4028235e+38;
    var cmds = [];
    
    while (node) {
      if ( node.nodeType === 1 && node.nodeName === "TextSample") {
        var sub = {};
        sub.start = toSeconds(node.getAttribute('sampleTime'));
        sub.text = node.getAttribute('text');
        
        // Infer end time, ms accuracy
        sub.end = lastStart;
        
        cmds.push( createTrack("subtitle", sub) );
        lastStart = sub.start - 0.001;
      }
      node = node.previousSibling;
    }
    
    returnData.data = cmds.reverse();

    return returnData;
  });

})( Popcorn );
