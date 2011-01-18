// PLUGIN: Google Maps
var googleCallback;
(function (Popcorn) {
  
  /**
   * googlemap popcorn plug-in 
   * Adds a map to the target div centered on the location specified by the user
   * Options parameter will need a start, end, target, type, zoom, lat and long, and location
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing 
   * -Target is the id of the DOM element that you want the map to appear in. This element must be in the DOM
   * -Type [optional] either: HYBRID (default), ROADMAP, SATELLITE, TERRAIN 
   * -Zoom [optional] defaults to 0
   * -Lat and Long: the coordinates of the map must be present if location is not specified.
   * -Location: the adress you want the map to display, bust be present if lat and log are not specified.
   *  Note: using location requires extra loading time, also not specifying both lat/long and location will
   * cause and error. 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .googlemap({
          start: 5, // seconds
          end: 15, // seconds
          type: 'ROADMAP',
          target: 'map',
          lat: 43.665429,
          long: -79.403323
        } )
   *
   */
  Popcorn.plugin( "googlemap" , (function(){
      
    var newdiv, i = 1, _mapFired = false, _mapLoaded = false;
    
    return {
      manifest: {
        about:{
          name: "Popcorn Google Map Plugin",
          version: "0.1",
          author: "@annasob",
          website: "annasob.wordpress.com"
        },
        options:{
          start    : {elem:'input', type:'text', label:'In'},
          end      : {elem:'input', type:'text', label:'Out'},
          target   : 'map-container',
          type     : {elem:'select', options:['ROADMAP','SATELLITE', 'HYBRID', 'TERRAIN'], label:'Type'},
          zoom     : {elem:'input', type:'text', label:'Zoom'},
          lat      : {elem:'input', type:'text', label:'Lat'},
          long     : {elem:'input', type:'text', label:'Long'},
          location : {elem:'input', type:'text', label:'Location'}
        }
      },
      _setup : function( options ) {
        // create a new div this way anything in the target div 
        // this is later passed on to the maps api
        options._newdiv               = document.createElement('div');
        options._newdiv.id            = "actualmap"+i;
        options._newdiv.style.width   = "100%";
        options._newdiv.style.height  = "100%";
        i++;
        if (document.getElementById(options.target)) {
          document.getElementById(options.target).appendChild(options._newdiv);
        }
        
        // insert google api script once
        if (!_mapFired) {
          _mapFired = true;
          var loadScriptTime = (new Date).getTime();
          var head = document.getElementsByTagName('head')[0];
          var script = document.createElement('script');
         
          script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=googleCallback";
          script.type = "text/javascript";
          head.insertBefore( script, head.firstChild ); 
        }
        // callback function fires when the script is run
        googleCallback = function() {
          _mapLoaded    = true;
        };
        // If there is no lat/long, and there is location, geocode the location
        // you can only do this once google.maps exists
        var isGeoReady = function() {
          if ( !_mapLoaded ) {
            setTimeout(function () {
              isGeoReady();
            }, 5);
          } else {
            if (options.location) {
              var geocoder = new google.maps.Geocoder();
              // calls an anonymous function called on separate thread
              geocoder.geocode({ 'address': options.location}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                  options.lat  = results[0].geometry.location.lat();
                  options.long = results[0].geometry.location.lng(); 
                  options._location = new google.maps.LatLng(options.lat, options.long);
                  options._map = new google.maps.Map(options._newdiv, {mapTypeId: google.maps.MapTypeId[options.type] || google.maps.MapTypeId.HYBRID }); 
                  options._map.getDiv().style.display = 'none';
                } 
              });
            } else {
              options._location = new google.maps.LatLng(options.lat, options.long);
              options._map = new google.maps.Map(options._newdiv, {mapTypeId: google.maps.MapTypeId[options.type] || google.maps.MapTypeId.HYBRID });  
              options._map.getDiv().style.display = 'none';
            }
          }
        };
        isGeoReady();
        
      },
      /**
       * @member webpage 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        // dont do anything if the information didn't come back from google map
        var isReady = function () {    
          if (!options._map) {
            setTimeout(function () {
              isReady();
            }, 13);
          } else {
            options._map.getDiv().style.display = 'block';
            // reset the location and zoom just in case the user plaid with the map
            options._map.setCenter(options._location);

            // make sure options.zoom is a number
            if ( options.zoom && typeof options.zoom !== "number" ) {
              options.zoom = +options.zoom;
            }
            options.zoom = options.zoom || 0; // default to 0
            options._map.setZoom( options.zoom );
          }
        };
        
        isReady();
      },
      /**
       * @member webpage 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        // if the map exists hide it do not delete the map just in 
        // case the user seeks back to time b/w start and end
        if (options._map) {
          options._map.getDiv().style.display = 'none';          
        }
      }
      
    };
    
  })());

})( Popcorn );
