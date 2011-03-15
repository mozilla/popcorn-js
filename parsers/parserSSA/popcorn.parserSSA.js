// PARSER: 0.3 SSA/ASS

(function (Popcorn) {
  /**
   * SSA/ASS popcorn parser plug-in 
   * Parses subtitle files in the identical SSA and ASS formats.
   * Style information is ignored, and may be found in these
   * formats: (\N    \n    {\pos(400,570)}     {\kf89})
   * Out of the [Script Info], [V4 Styles], [Events], [Pictures],
   * and [Fonts] sections, only [Events] is processed.
   * Data parameter is given by Popcorn, will need a text.
   * Text is the file contents to be parsed
   * 
   * @param {Object} data
   * 
   * Example:
     [Script Info]
      Title: Testing subtitles for the SSA Format
      [V4 Styles]
      Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, TertiaryColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, AlphaLevel, Encoding
      Style: Default,Arial,20,65535,65535,65535,-2147483640,-1,0,1,3,0,2,30,30,30,0,0
      [Events]
      Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
      Dialogue: 0,0:00:02.40,0:00:07.20,Default,,0000,0000,0000,,Senator, {\kf89}we're \Nmaking our final \napproach into Coruscant.
      Dialogue: 0,0:00:09.71,0:00:13.39,Default,,0000,0000,0000,,{\pos(400,570)}Very good, Lieutenant.
      Dialogue: 0,0:00:15.04,0:00:18.04,Default,,0000,0000,0000,,It's \Na \ntrap!
   *
   */
  
  // Register for SSA extensions
  Popcorn.parser( "parseSSA", function( data ) {
  
    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        subs = [],
        startIdx,
        endIdx,
        textIdx,
        lines,
        fields,
        numFields,
        sub,
        text,
        i = 0,
        j = 0,
        len = 0,
        fieldLen = 0;
    
    // h:mm:ss.cc (centisec) string to SS.mmm
    // Returns -1 if invalid
    var toSeconds = function( t_in ) {
      var t = t_in.split( ":" ),
          l = t.length - 1;
      
      // Not all there
      if ( t_in.length !== 10 ) {
        return -1;
      }
      
      return parseInt( t[0], 10 )*3600 + parseInt( t[l-1], 10 )*60 + parseFloat( t[l], 10 );
    };
    
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };
  
    // Here is where the magic happens
    // Split on line breaks
    lines = data.text.split( /(?:\r\n|\r|\n)/gm );
    len = lines.length;
    
    // Ignore non-textual info
    while ( i < len && lines[i] !== "[Events]" ) {
      i++;
    }
    
    fields = lines[++i].substr( 8 ).split( ", " ); // Trim 'Format: ' off front, split on delim
    numFields = fields.length;
    
    //Find where in Dialogue string the start, end and text info is
    for ( ; j < numFields; j++ ) {
      if ( fields[j] === "Start" ) {
        startIdx = j;
      } else if ( fields[j] === "End" ) {
        endIdx = j;
      } else if ( fields[j] === "Text" ) {
        textIdx = j;
      }
    }
    
    while ( ++i < len && lines[i] && lines[i][0] !== "[" ) {
      sub = {};
      
      // Trim beginning 'Dialogue: ' and split on delim
      fields = lines[i].substr( 10 ).split( "," );
      
      sub.start = toSeconds( fields[startIdx] );
      sub.end = toSeconds( fields[endIdx] );
      
      // Invalid time, skip
      if ( sub.start === -1 || sub.end === -1 ) {
        continue;
      }
      
      if ( ( fieldLen = fields.length ) === numFields ) {
        sub.text = fields[textIdx];
      } else {
        // There were commas in the text which were split, append back together into one line
        text = [];
        
        for( j = textIdx; j < fieldLen; j++ ) {
          text.push( fields[j] );
        }
        sub.text = text.join( "," );
      }
      
      // Eliminate advanced styles and convert forced line breaks
      sub.text = sub.text.replace( /\{(\\[\w]+\(?([\w\d]+,?)+\)?)+\}/gi, "" ).replace( /\\N/gi, "<br />" );
      subs.push( createTrack( "subtitle", sub ) );
    }
    
    retObj.data = subs;
    return retObj;
  });

})( Popcorn );
