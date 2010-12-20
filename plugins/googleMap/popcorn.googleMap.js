// PLUGIN: Google Maps

(function (Popcorn) {
  
  /**
   * googleMap popcorn plug-in 
   * Adds a map to the target div centered on the location specified 
   * by the user
   * Options parameter will need a start, end, target, type, lat and long, zoom
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing 
   * -Target is the id of the DOM element that you want the map to 
   * appear in. This element must be in the DOM
   * -Type [optional] either: HYBRID (default), ROADMAP, SATELLITE, TERRAIN
   * attached to, this target element must exist on the DOM
   * -Zoom [optional] defaults to 0
   * -Lat and Long: the coordinates of the map
   * 
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
  // 
  window.google = window.google || {};
  google.maps = google.maps || {};

  (function() {
    var modules = google.maps.modules = {};

    google.maps.__gjsload__ = function(name, text) {
      modules[name] = text;
    };

    google.maps.Load = function(apiLoad) {
      delete google.maps.Load;
      apiLoad([null,[[["http://mt0.google.com/vt?lyrs=m@140\u0026src=api\u0026hl=en-US\u0026","http://mt1.google.com/vt?lyrs=m@140\u0026src=api\u0026hl=en-US\u0026"]],[["http://khm0.google.com/kh?v=75\u0026hl=en-US\u0026","http://khm1.google.com/kh?v=75\u0026hl=en-US\u0026"],null,null,null,1],[["http://mt0.google.com/vt?lyrs=h@140\u0026src=api\u0026hl=en-US\u0026","http://mt1.google.com/vt?lyrs=h@140\u0026src=api\u0026hl=en-US\u0026"],null,null,"imgtp=png32\u0026"],[["http://mt0.google.com/vt?lyrs=t@126,r@140\u0026src=api\u0026hl=en-US\u0026","http://mt1.google.com/vt?lyrs=t@126,r@140\u0026src=api\u0026hl=en-US\u0026"]],null,[[null,0,7,7,[[[330000000,1246050000],[386200000,1293600000]],[[366500000,1297000000],[386200000,1320034790]]],["http://mt0.gmaptiles.co.kr/mt?v=kr1.12\u0026hl=en-US\u0026","http://mt1.gmaptiles.co.kr/mt?v=kr1.12\u0026hl=en-US\u0026"]],[null,0,8,9,[[[330000000,1246050000],[386200000,1279600000]],[[345000000,1279600000],[386200000,1286700000]],[[348900000,1286700000],[386200000,1293600000]],[[354690000,1293600000],[386200000,1320034790]]],["http://mt0.gmaptiles.co.kr/mt?v=kr1.12\u0026hl=en-US\u0026","http://mt1.gmaptiles.co.kr/mt?v=kr1.12\u0026hl=en-US\u0026"]],[null,0,10,19,[[[329890840,1246055600],[386930130,1284960940]],[[344646740,1284960940],[386930130,1288476560]],[[350277470,1288476560],[386930130,1310531620]],[[370277730,1310531620],[386930130,1320034790]]],["http://mt0.gmaptiles.co.kr/mt?v=kr1.12\u0026hl=en-US\u0026","http://mt1.gmaptiles.co.kr/mt?v=kr1.12\u0026hl=en-US\u0026"]],[null,3,7,7,[[[330000000,1246050000],[386200000,1293600000]],[[366500000,1297000000],[386200000,1320034790]]],["http://mt0.gmaptiles.co.kr/mt?v=kr1p.12\u0026hl=en-US\u0026","http://mt1.gmaptiles.co.kr/mt?v=kr1p.12\u0026hl=en-US\u0026"]],[null,3,8,9,[[[330000000,1246050000],[386200000,1279600000]],[[345000000,1279600000],[386200000,1286700000]],[[348900000,1286700000],[386200000,1293600000]],[[354690000,1293600000],[386200000,1320034790]]],["http://mt0.gmaptiles.co.kr/mt?v=kr1p.12\u0026hl=en-US\u0026","http://mt1.gmaptiles.co.kr/mt?v=kr1p.12\u0026hl=en-US\u0026"]],[null,3,10,null,[[[329890840,1246055600],[386930130,1284960940]],[[344646740,1284960940],[386930130,1288476560]],[[350277470,1288476560],[386930130,1310531620]],[[370277730,1310531620],[386930130,1320034790]]],["http://mt0.gmaptiles.co.kr/mt?v=kr1p.12\u0026hl=en-US\u0026","http://mt1.gmaptiles.co.kr/mt?v=kr1p.12\u0026hl=en-US\u0026"]]],[["http://cbk0.google.com/cbk?","http://cbk1.google.com/cbk?"]],[["http://khmdb0.google.com/kh?v=33\u0026hl=en-US\u0026","http://khmdb1.google.com/kh?v=33\u0026hl=en-US\u0026"]],[["http://mt0.google.com/mapslt?hl=en-US\u0026","http://mt1.google.com/mapslt?hl=en-US\u0026"]],[["http://mt0.google.com/mapslt/ft?hl=en-US\u0026","http://mt1.google.com/mapslt/ft?hl=en-US\u0026"]]],["en-US","US",null,0,null,"http://maps.google.com","http://maps.gstatic.com/intl/en_us/mapfiles/","http://gg.google.com","https://maps.googleapis.com","http://maps.googleapis.com"],["http://maps.gstatic.com/intl/en_us/mapfiles/api-3/3/3a","3.3.3a"],[3023581072],1,null,null,null,null,0,""], loadScriptTime);
    };
    var loadScriptTime = (new Date).getTime();
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');

    script.src = "http://maps.gstatic.com/intl/en_us/mapfiles/api-3/3/3a/main.js";
    script.type = "text/javascript";

    head.insertBefore( script, head.firstChild );  
  })();

  // IMPORTANT ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  Popcorn.plugin( "googleMap" , (function(){
      
    var newdiv, i = 1;
    
    return {
      manifest: {
        about:{
          name: "Popcorn Google Map Plugin",
          version: "0.1",
          author: "@annasob",
          website: "annasob.wordpress.com"
        },
        options:{
          start   : {elem:'input', type:'text', label:'In'},
          end     : {elem:'input', type:'text', label:'Out'},
          text    : {elem:'input', type:'text', label:'Text'}
        }
      },
      _setup : function( options ) {
        
        
        
       
        options.target  = document.getElementById(options.target),
        // create a new div this way anything in the target div
        // will stay intack 
        options._newdiv              = document.createElement('div');
        options._newdiv.id           = "actualmap"+i;
        options._newdiv.style.width  = "100%";
        options._newdiv.style.height = "100%";
        i++;
        options.target.appendChild(options._newdiv);
      },
      /**
       * @member webpage 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        var that = this,
            renderMap = function(){
            var location = new google.maps.LatLng(options.lat, options.long);
            options._map = new google.maps.Map(options._newdiv, {mapTypeId: google.maps.MapTypeId[options.type] || google.maps.MapTypeId.HYBRID });
            
            options._map.setCenter(location);
            options._map.setZoom(options.zoom || 0);
          }
        // If there is no lat/long, and there is location, geocode the location
        if ( (!options.lat || !options.long || options.lat == 'null' || options.long == 'null') && options.location) {
          var location ='boston',
              geocoder = new google.maps.Geocoder(),
              lat,
              long;

          geocoder.geocode({
              address: options.location
            }, function(results, status) {
               options.lat = results[0].geometry.location.va;
               options.long = results[0].geometry.location.wa;
               renderMap.call(that);  
          })
        } else {
          renderMap();
        }
      
      },
      /**
       * @member webpage 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        // remove the map from the target div
        options.target.removeChild(options._map.getDiv());
      }
      
    };
    
  })());

})( Popcorn );