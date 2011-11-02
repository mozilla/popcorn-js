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
    var returnData = {
          title: "",
          remote: "",
          data: []
        },
        node,
        numTracks = 0,
        region;

    // Null checks
    if ( !data.xml || !data.xml.documentElement )
      return returnData;

    node = data.xml.documentElement.firstChild;

    if ( !node ) {
      return returnData;
    }

    // Find body tag
    while ( node.nodeName !== "body" ) {
      node = node.nextSibling;
    }

    if ( node ) {
      region = node.getAttribute( "region" );
      parseChildren( node, 0 );
    }

    return returnData;


    // Parse the children of the given node
    function parseChildren( node, timeOffset ) {
      var currNode = node.firstChild,
          sub,
          newOffset;

      while ( currNode ) {
        if ( currNode.nodeType === 1 ) {
          if ( currNode.nodeName === "p" ) {
            // p is a textual node, process contents as subtitle
            sub = parseNode( currNode, timeOffset );
            returnData.data.push( createTrack( "subtitle", sub ) );
            numTracks++;
          } else if ( currNode.nodeName === "div" ) {
            // div is container for subtitles, recurse
            newOffset = toSeconds( currNode.getAttribute( "begin" ) );

            if (newOffset < 0 ) {
              newOffset = timeOffset;
            }

            parseChildren( currNode, newOffset );
          }
        }

        currNode = currNode.nextSibling;
      }
    }

    // Parse a node for text content
    function parseNode( node, timeOffset ) {
      var rWhitespace = /^[\s]+|[\s]+$/gm,
          rLineBreak = /(?:\r\n|\r|\n)/gm,
          sub = {};

      // Trim left and right whitespace from text and convert non-explicit line breaks
      sub.text = node.textContent.replace( rWhitespace, "" ).replace( rLineBreak, "<br />" );
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
    }
  });


  // Convert time expression to SS.mmm
  // Expression may be absolute to timeline (hh:mm:ss.ms)
  //   or relative ( decimal followed by metric ) ex: 3.4s, 5.7m
  // Returns -1 if invalid
  function toSeconds( t_in, offset ) {
    var i;

    if ( !t_in ) {
      return -1;
    }

    try {
      return Popcorn.util.toSeconds( t_in );
    } catch ( e ) {
      i = getMetricIndex( t_in );
      return parseFloat( t_in.substr( 0, i ) ) * getMultipler( t_in.substr( i ) ) + ( offset || 0 );
    }


    // In a time string such as 3.4ms, get the index of the first character (m) of the time metric (ms)
    function getMetricIndex( t_in ) {
      var i = t_in.length - 1;

      while ( i >= 0 && t_in[ i ] <= "9" && t_in[ i ] >= "0" ) {
        i--;
      }

      return i;
    }

    // Determine multiplier for metric relative to seconds
    function getMultipler( metric ) {
      return {
        "h" : 3600,
        "m" : 60,
        "s" : 1,
        "ms" : 0.001
      }[ metric ] || -1;
    }
  }

  // Creates an object of all attributes keyed by name
  function createTrack( name, attributes ) {
    var track = {};
    track[ name ] = attributes;
    return track;
  }
})( Popcorn );
