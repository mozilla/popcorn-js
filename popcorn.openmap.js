// PLUGIN: OPENMAP
var openlayersCallback;
(function (Popcorn) {
  
  /**
   * openmap popcorn plug-in 
   * Adds an OpenLayers + OpenStreetMap map to the target div centered on the location specified by the user
   * Based on the googlemap popcorn plug-in, location option not available
   * Options parameter will need a start, end, target, type, zoom, lat and lng
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing 
   * -Target is the id of the DOM element that you want the map to appear in. This element must be in the DOM
   * -Type [optional] either: ROADMAP (OpenStreetMap), SATELLITE (NASA LandSat)... Coming Soon: TERRAIN (USGS), HYBRID
   * -Zoom [optional] defaults to 2
   * -Lat and Lng: the coordinates of the map must be present if location is not specified.
   * -Markers: array of marker objects to be added to the map at given times
   *  Note: using location requires extra loading time, also not specifying both lat/lng and location will
   * cause a JavaScript error. 
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
          lng: -79.403323
        } )
   *
   */
  Popcorn.plugin( "openmap" , (function(){
      
    var newdiv, i = 1, _mapFired = false, _mapLoaded = false;
    
    return {
      manifest: {
        about:{
          name: "Popcorn OpenMap Plugin",
          version: "0.1",
          author: "@mapmeld",
          website: "mapuganda.blogspot.com"
        },
        options:{
          start    : {elem:'input', type:'text', label:'In'},
          end      : {elem:'input', type:'text', label:'Out'},
          target   : 'map-container',
          type     : {elem:'select', options:['ROADMAP','SATELLITE'], label:'Type'},
          zoom     : {elem:'input', type:'text', label:'Zoom'},
          lat      : {elem:'input', type:'text', label:'Lat'},
          lng     : {elem:'input', type:'text', label:'Lng'},
		  markers  : {elem:'input', type:'text', label:'List Markers'},
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
        
        // insert openlayers api script once
        if (!_mapFired) {
          _mapFired = true;
          var loadScriptTime = (new Date).getTime();
          var head = document.getElementsByTagName('head')[0];
          var script = document.createElement('script');
          script.src = "http://openlayers.org/api/OpenLayers.js";
		  script.onload = function() {
				_mapLoaded    = true;
			};
          script.type = "text/javascript";
          head.insertBefore( script, head.firstChild ); 
		  /*Popcorn.getScript("http://openlayers.org/api/OpenLayers.js",
			function() {
				_mapLoaded    = true;
			}); */
        }
        // callback function fires when the script is run
        // geolocation is not possible, only give lat and lng properties
        var isGeoReady = function() {
          if ( !_mapLoaded ) {
            setTimeout(function () {
              isGeoReady();
            }, 5);
          } else {

		  options._location = new OpenLayers.LonLat(options.lng, options.lat);

			if(options.type == "ROADMAP"){
				// add OpenStreetMap layer
				options._projection = new OpenLayers.Projection('EPSG:900913');
				options._displayProjection = new OpenLayers.Projection('EPSG:4326');
				options._location = options._location.transform(options._displayProjection, options._projection);
				options._map = new OpenLayers.Map({div: options._newdiv, projection: options._projection, 'displayProjection': options._displayProjection});
				var osm = new OpenLayers.Layer.OSM();
				options._map.addLayer(osm);
			}
			else if(options.type == "SATELLITE"){
				// add NASA WorldWind / LANDSAT map
				var ww2 = new OpenLayers.Layer.WorldWind( "LANDSAT",
                "http://worldwind25.arc.nasa.gov/tile/tile.aspx", 2.25, 4,
                {T:"105"});
				options._map = new OpenLayers.Map({div: options._newdiv, 'maxResolution': .28125, tileSize: new OpenLayers.Size(512, 512)});
				options._map.addLayer(ww2);
				options._displayProjection = new OpenLayers.Projection('EPSG:4326');
				options._projection = new OpenLayers.Projection('EPSG:4326');
			}
			options._map.div.style.display = 'none';
          }
        };
        isGeoReady();
      },
      /**
       * @member openmap 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        // wait until OpenLayers is loaded, then check repeatedly if markers need to be added/removed
		
        var isReady = function () {    
          if (!options._map) {
            setTimeout(function () {
              isReady();
            }, 13);
          } else {
            options._map.div.style.display = 'block';
            // make sure options.zoom is a number
            if ( options.zoom && typeof options.zoom !== "number" ) {
              options.zoom = +options.zoom;
            }
            options.zoom = options.zoom || 2; // default to 2

            // reset the location and zoom just in case the user played with the map
            options._map.setCenter(options._location, options.zoom);
			if(options.markers){
				setInterval(function() {
					for(var m=0;m<options.markers.length;m++){
						var myMarker=options.markers[m];
						if(myMarker.isOn){
							//check if marker should be removed
							if((myMarker.popcorn.popped.currentTime() < myMarker.start)||(myMarker.popcorn.popped.currentTime() > myMarker.end)){
								options._pointLayer.removeFeatures([myMarker.isOn]);
								myMarker.isOn=false;
							}
						}
						else{
							//check if marker should be added
							if((myMarker.popcorn.popped.currentTime() > myMarker.start)&&(myMarker.popcorn.popped.currentTime() < myMarker.end)){
								var layerStyle = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
								if(!options._pointLayer){
									options._pointLayer = new OpenLayers.Layer.Vector("Point Layer",{style: layerStyle});
									options._map.addLayer(options._pointLayer);
								}
								var myPoint = new OpenLayers.Geometry.Point(myMarker.lng,myMarker.lat).transform( options._displayProjection,options._projection);
								var myPointStyle = OpenLayers.Util.extend({},layerStyle);
									myPointStyle.pointRadius = 18;
									myPointStyle.graphicOpacity = 1;
									myPointStyle.externalGraphic = myMarker.icon;
								var myPointFeature = new OpenLayers.Feature.Vector(myPoint,null,myPointStyle);
								options._pointLayer.addFeatures([myPointFeature]);
								myMarker.isOn=myPointFeature;
							}
						}
					}
				}, 300);
			}
          }
        };
        
        isReady();
      },
      /**
       * @member openmap
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        // if the map exists hide it do not delete the map just in 
        // case the user seeks back to time b/w start and end
        if (options._map) {
          options._map.div.style.display = 'none';          
        }
      }
      
    };
    
  })());

})( Popcorn );
