// PARSER: 0.3 WebSRT/VTT

(function ( Popcorn ) {
  /**
   * WebSRT/VTT popcorn parser plug-in 
   * Parses subtitle files in the WebSRT/VTT format.
   * Styles which appear after timing information are ignored.
   * Inline styling tags follow HTML conventions and are left in for the browser to handle
   * TrackEvents (cues) which are malformed are ignored.
   * Data parameter is given by Popcorn, will need a text.
   * Text is the file contents to be parsed
   * 
   * @param {Object} data
   * 
   * Example:
    Track-3
    00:00:15.542 --> 00:00:18.542 A:start D:vertical L:98%
    It's a <i>trap!</i>
   */
  Popcorn.parser( "parseVTT", function( data ) {
  
    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        subs = [],        
        i = 0,
        len = 0,
        idx = 0,
        lines,
        time,
        text,
        sub;
    
    // [HH:]MM:SS.mmm string to SS.mmm float
    // Throws exception if invalid
    var toSeconds = function( t_in ) {
      var t = t_in.split( ":" ),
          l = t_in.length,
          time;
      
      // Invalid time string provided
      if ( l !== 12 && l !== 9 ) {
        throw "Bad cue";
      }
      
      l = t.length - 1;
      
      try {        
        time = parseInt( t[l-1], 10 )*60 + parseFloat( t[l], 10 );
        
        // Hours were given
        if ( l === 2 ) {
          time += parseInt( t[0], 10 )*3600;
        }
      } catch ( e ) {
        throw "Bad cue";
      }
      
      return time;
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
    
    while ( i < len ) {
      sub = {};
      text = [];
      
      try {
        sub.id = lines[i++];
        // Ignore if id contains "-->"
        if ( !sub.id || sub.id.indexOf( "-->" ) !== -1 ) {
          throw "Bad cue";
        }
        
        time = lines[i++].split( /[\t ]*-->[\t ]*/ );
        
        sub.start = toSeconds(time[0]);
        
        // Filter out any trailing styling info
        idx = time[1].indexOf( " " );
        if ( idx !== -1 ) {
          time[1] = time[1].substr( 0, idx );
        }
        
        sub.end = toSeconds( time[1] );
        
        // Build single line of text from multi-line subtitle in file
        while ( i < len && lines[i] ) {
          text.push( lines[i++] );
        }
        
        // Join lines together to one and build subtitle
        sub.text = text.join( "<br />" );
        subs.push( createTrack( "subtitle", sub ) );
      } catch ( e ) {
         // Bad cue, advance to end of cue
        while ( i < len && lines[i] ) {
          i++;
        }
      }
      
      // Consume empty whitespace after a cue
      while ( i < len && !lines[i] ) {
        i++;
      }
    }
    
    retObj.data = subs;
    return retObj;
  });

})( Popcorn );
