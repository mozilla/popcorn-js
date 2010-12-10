// PLUGIN: Google Maps

(function (Popcorn) {
  
  /**
   * googleMap popcorn plug-in 
   * Adds a map to the target div centered on the location specified 
   * by the user
   * Options parameter will need a start, end, target, lat and long, zoom
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing 
   * Target is the id of the document element that the text needs to be 
   * Type either: HYBRID (default), ROADMAP, SATELLITE, TERRAIN
   * attached to, this target element must exist on the DOM
   * Src [optional]
   * MapInfo [optional]
   * Note: 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .googleMap({
          start: 5, // seconds
          end: 15, // seconds
          type: 'ROADMAP',
          target: 'map'
        } )
   *
   */
  Popcorn.plugin( "googleMap" , (function(){
      
    var temp,head, script,location, map, link;
    
    return {
      _setup : function( event, options ) {
        // check if google map api is already loaded
        head = document.getElementsByTagName('head')[0];
	      script = document.createElement('script');
        script.onload = function() {
          alert("he");
          location = new google.maps.LatLng(options.lat, options.long);
          map = new google.maps.Map(document.getElementById(options.target), {mapTypeId: options.type | google.maps.MapTypeId.HYBRID });
          
        }
        script.src = "http://maps.google.com/maps/api/js?sensor=false";
        script.type = 'text/javascript';
        head.appendChild(script)
        //head.insertBefore( script, head.firstChild );
        // setup isready
        
      },
      /**
       * @member webpage 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        temp  = document.getElementById( options.target );
        temp.innerHTML  = options.text;
        
        map.setCenter(location);
        map.setZoom(options.zoom);
        if (options.src && options.mapinfo) {
          link = document.createElement("a");
          link.setAttribute("href", options.src);
          link.setAttribute("target", "_blank");
          link.appendChild(document.createTextNode(options.description||options.src));
          document.getElementById(options.mapinfo).appendChild(link);
        }
      },
      /**
       * @member webpage 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        //temp.innerHTML  = "";
        //figure out how to delete map
      }
      
    };
    
  })());

})( Popcorn );