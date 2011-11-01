// PARSER: 0.3 TTML

(function (Popcorn) {

  /**
   * TTML popcorn parser plug-in 
   * Parses subtitle files in the TTML format.
   * Times may be absolute to the timeline or relative
   *   Absolute times are ISO 8601 format (hh:mm:ss[.mmm])
   *   Relative times are a fraction followed by a unit metric (d.ddu)
   *     Relative times are relative to the time given on the parent node
   * Styling information is ignored
   * Data parameter is given by Popcorn, will need an xml.
   * Xml is the file contents to be processed
   * 
   * @param {Object} data
   * 
   * Example:
    <tt xmlns:tts="http://www.w3.org/2006/04/ttaf1#styling" xmlns="http://www.w3.org/2006/04/ttaf1">
      <body region="subtitleArea">
        <div>
          <p xml:id="subtitle1" begin="0.76s" end="3.45s">
            It seems a paradox, does it not,
          </p>
        </div>
      </body>
    </tt>
   */
  Popcorn.parser( "parseTTML", function( data ) {

    // declare needed variables
    var returnData = {
          title: "",
          remote: "",
          data: []
        },
        node,
        numTracks = 0,
        region;
    
    // Convert time expression to SS.mmm
    // Expression may be absolute to timeline (hh:mm:ss.ms)
    //   or relative ( fraction followedd by metric ) ex: 3.4s, 5.7m
    // Returns -1 if invalid    
    var toSeconds = function ( t_in, offset ) {
      if ( !t_in ) {
        return -1;
      }
      
      var t = t_in.split( ":" ),
          l = t.length - 1,
          metric,
          multiplier,
          i;
          
      // Try clock time
      if ( l >= 2 ) {
        return parseInt( t[0], 10 )*3600 + parseInt( t[l-1], 10 )*60 + parseFloat( t[l], 10 );
      }
      
      // Was not clock time, assume relative time
      // Take metric from end of string (may not be single character)
      // First find metric
      for( i = t_in.length - 1; i >= 0; i-- ) {
        if ( t_in[i] <= "9" && t_in[i] >= "0" ) {
          break;
        }
      }
      
      // Point i at metric and normalize offsete time
      i++;
      metric = t_in.substr( i );
      offset = offset || 0;
      
      // Determine multiplier for metric relative to seconds
      if ( metric === "h" ) {
        multiplier = 3600;
      } else if ( metric === "m" ) {
        multiplier = 60;
      } else if ( metric === "s" ) {
        multiplier = 1;
      } else if ( metric === "ms" ) {
        multiplier = 0.001;
      } else {
        return -1;
      }
      
      // Valid multiplier
      return parseFloat( t_in.substr( 0, i ) ) * multiplier + offset;
    };

    // creates an object of all atrributes keyd by name
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };
    
    // Parse a node for text content
    var parseNode = function( node, timeOffset ) {
      var sub = {};
      
      // Trim left and right whitespace from text and change non-explicit line breaks to spaces
      sub.text = node.textContent.replace(/^[\s]+|[\s]+$/gm, "").replace(/(?:\r\n|\r|\n)/gm, "<br />");
      sub.id = node.getAttribute( "xml:id" ) || node.getAttribute( "id" );
      sub.start = toSeconds ( node.getAttribute( "begin" ), timeOffset );
      sub.end = toSeconds( node.getAttribute( "end" ), timeOffset );
      sub.target = region;
      
      if ( sub.end < 0 ) {
        // No end given, infer duration if possible
        // Otherwise, give end as MAX_VALUE
        sub.end = toSeconds( node.getAttribute( "duration" ), 0 );
        
        if ( sub.end >= 0 ) {
          sub.end += sub.start;
        } else {
          sub.end = Number.MAX_VALUE;
        }
      }
      
      return sub;
    };
    
    // Parse the children of the given node
    var parseChildren = function( node, timeOffset ) {
      var currNode = node.firstChild,
          sub,
          newOffset;
      
      while ( currNode ) {
        if ( currNode.nodeType === 1 ) {
          if ( currNode.nodeName === "p" ) {
            // p is a teextual node, process contents as subtitle
            sub = parseNode( currNode, timeOffset );
            returnData.data.push( createTrack( "subtitle", sub ) );
            numTracks++;
          } else if ( currNode.nodeName === "div" ) {
            // div is container for subtitles, recurse
            newOffset = toSeconds( currNode.getAttribute("begin") );
            
            if (newOffset < 0 ) {
              newOffset = timeOffset;
            }
           
            parseChildren( currNode, newOffset );
          }
        }
        
        currNode = currNode.nextSibling;
      }
    };
    
    // Null checks
    if ( !data.xml || !data.xml.documentElement || !( node = data.xml.documentElement.firstChild ) ) {
      return returnData;
    }
    
    // Find body tag
    while ( node.nodeName !== "body" ) {
      node = node.nextSibling;
    }
    
    region = "";
    parseChildren( node, 0 );

    return returnData;
  });

})( Popcorn );
