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

    // turns a node tree element into a straight up javascript object
    // also converts in and out to start and end
    // also links manifest data with ids
    /*var objectifyAttributes = function ( nodeAttributes ) {

      var returnObject = {};

      for ( var i = 0, nal = nodeAttributes.length; i < nal; i++ ) {

        var key  = nodeAttributes.item(i).nodeName,
            data = nodeAttributes.item(i).nodeValue;

        // converts in into start
        if (key === "in") {
          returnObject.start = toSeconds( data );
        // converts out into end
        } else if ( key === "out" ){
          returnObject.end = toSeconds( data );
        // this is where ids in the manifest are linked
        } else if ( key === "resourceid" ) {
          Popcorn.extend( returnObject, manifestData[data] );
        // everything else
        } else {
          returnObject[key] = data;
        }

      }

      return returnObject;
    };*/

    // creates an object of all atrributes keyed by name
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };
/*
    // recursive function to process a node, or process the next child node
    var parseNode = function ( node, allAttributes, manifest ) {
      var attributes = {};
      Popcorn.extend( attributes, allAttributes, objectifyAttributes( node.attributes ), { text: node.textContent } );

      var childNodes = node.childNodes;

      // processes the node
      if ( childNodes.length < 1 || ( childNodes.length === 1 && childNodes[0].nodeType === 3 ) ) {

        if ( !manifest ) {
          returnData.data.push( createTrack( node.nodeName, attributes ) );
        } else {
          manifestData[attributes.id] = attributes;
        }

      // process the next child node
      } else {

        for ( var i = 0; i < childNodes.length; i++ ) {

          if ( childNodes[i].nodeType === 1 ) {
            parseNode( childNodes[i], attributes, manifest );
          }

        }
      }
    };*/

    // this is where things actually start
    // Timings start as second element, but don't assume can jump right to children[1]
    var node = data.xml.documentElement.lastChild;
    var last;
    
    while (node = node.previousSibling) {
      var sub = {};
      sub.start = toSeconds(node.getAttribute('sampleTime'));
      sub.text = node.getAttribute('text');
      
      // Infer end time, ms accuracy
      sub.end = last ? (last.start - 0.001) : (3.4028235e+38);
      
      returnData.data.push( createTrack("subtitle", sub) );
      last = node;
    }

    return returnData;
  });

})( Popcorn );
