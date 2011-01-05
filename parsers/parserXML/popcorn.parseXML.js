// PARSER: 0.1 XML

(function (Popcorn) {

  /**
   *
   *
   */
  Popcorn.parser( "parseXML", "XML", function( data ) {

    // declare needed variables
    var returnData = {
          title: "",
          remote: "",
          data: []
        },
        manifestData = {};

    // turns a node tree element into a straight up javascript object
    // also converts in and out to start and end
    // also links manifest data with ids
    var objectifyAttributes = function ( nodeAttributes ) {

      var returnObject = {};

      for ( var i = 0, nal = nodeAttributes.length; i < nal; i++ ) {

        var key  = nodeAttributes.item(i).nodeName,
            data = nodeAttributes.item(i).nodeValue;

        // converts in into start
        if (key === "in") {
          returnObject.start = data;
        // converts out into end
        } else if ( key === "out" ){
          returnObject.end = data;
        // this is where ids in the manifest are linked
        } else if ( key === "resourceid" ) {
          Popcorn.extend( returnObject, manifestData[data] );
        // everything else
        } else {
          returnObject[key] = data;
        }

      }

      return returnObject;
    };

    // creates an object of all atrributes keyd by name
    var createTrack = function( name, attributes ) {
      var track = {};
      track[name] = attributes;
      return track;
    };

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
    };

    // this is where things actually start
    var x = data.xml.documentElement.childNodes;

    for ( var i = 0, xl = x.length; i < xl; i++ ) {

      if ( x[i].nodeType === 1 ) {

        // start the process of each main node type, manifest or timeline
        if ( x[i].nodeName === "manifest" ) {
          parseNode( x[i], {}, true );
        } else { // timeline
          parseNode( x[i], {}, false );
        }

      }
    }

    return returnData;
  });

})( Popcorn );
