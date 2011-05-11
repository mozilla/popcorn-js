// PLUGIN: Google Maps
var googleCallback;
(function (Popcorn) {

  var i = 1,
      _mapFired = false,
      _mapLoaded = false,
      geocoder,
      loadMaps;
  //google api callback 
  googleCallback  = function( data ) {
    // ensure all of the maps functions needed are loaded 
    // before setting _maploaded to true
    if ( typeof google !== "undefined" && google.maps && google.maps.Geocoder && google.maps.LatLng ) {
      geocoder = new google.maps.Geocoder();
      _mapLoaded = true;
    } else {
      setTimeout( function() {
        googleCallback( data );
      }, 1);
    }
  };
  // function that loads the google api
  loadMaps = function () {
    // for some reason the Google Map API adds content to the body
    if ( document.body ) {
      _mapFired = true;
      Popcorn.getScript( "http://maps.google.com/maps/api/js?sensor=false&callback=googleCallback" );
    } else {
      setTimeout( function() {
          loadMaps( );
        }, 1);
    }
  };

  /**
   * googlemap popcorn plug-in
   * Adds a map to the target div centered on the location specified by the user
   * Options parameter will need a start, end, target, type, zoom, lat and lng, and location
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing
   * -Target is the id of the DOM element that you want the map to appear in. This element must be in the DOM
   * -Type [optional] either: HYBRID (default), ROADMAP, SATELLITE, TERRAIN, STREETVIEW
   * -Zoom [optional] defaults to 0
   * -Heading [optional] STREETVIEW orientation of camera in degrees relative to true north (0 north, 90 true east, ect)
   * -Pitch [optional] STREETVIEW vertical orientation of the camera (between 1 and 3 is recommended)
   * -Lat and Lng: the coordinates of the map must be present if location is not specified.
   * -Location: the adress you want the map to display, bust be present if lat and log are not specified.
   * Note: using location requires extra loading time, also not specifying both lat/lng and location will
   * cause and error.
   * @param {Object} options
   *
   * Example:
    var p = Popcorn("#video")
      .googlemap({
       start: 5, // seconds
       end: 15, // seconds
       type: "ROADMAP",
       target: "map",
       lat: 43.665429,
       lng: -79.403323
    } )
  *
  */
  Popcorn.plugin( "googlemap" , function( options ) {
    var newdiv,
        map,
        location;
        
    // if this is the firest time running the plugins
    // call the function that gets the sctipt
    if ( !_mapFired ) {
      loadMaps();
    }

    // create a new div this way anything in the target div is left intact
    // this is later passed on to the maps api
    newdiv              = document.createElement( "div" );
    newdiv.id           = "actualmap" + i;
    newdiv.style.width  = "100%";
    newdiv.style.height = "100%";
    i++;
    
    // ensure the target container the user chose exists
    if ( document.getElementById( options.target ) ) {
      document.getElementById(options.target).appendChild(newdiv);
    } else { 
      throw ( "map target container doesn't exist" ); 
    }
    
    // ensure that google maps and its functions are loaded
    // before setting up the map parameters
    var isMapReady = function() {
      if ( _mapLoaded ) {
        if ( options.location ) {
          // calls an anonymous google function called on separate thread
          geocoder.geocode( { "address": options.location }, function( results, status ) {
            if ( status === google.maps.GeocoderStatus.OK ) {
              options.lat = results[0].geometry.location.lat();
              options.lng = results[0].geometry.location.lng();
              location    = new google.maps.LatLng( options.lat, options.lng );
              map         = new google.maps.Map( newdiv, { mapTypeId: google.maps.MapTypeId[ options.type ] || google.maps.MapTypeId.HYBRID } );
              map.getDiv().style.display = "none";
            }
          } );
        } else {
          location = new google.maps.LatLng( options.lat, options.lng );
          map      = new google.maps.Map( newdiv, { mapTypeId: google.maps.MapTypeId[ options.type ] || google.maps.MapTypeId.HYBRID } );
          map.getDiv().style.display = "none";
        }        
      } else {
        setTimeout(function () {
          isMapReady();
        }, 5);
      }
    };
    
    isMapReady();

    return {
      /**
       * @member webpage
       * The start function will be executed when the currentTime
       * of the video reaches the start time provided by the
       * options variable
       */
      start: function(event, options){
        // ensure the map has been initialized in the setup function above
        var isMapSetup = function () {
          if ( map ) {
            map.getDiv().style.display = "block";                               

            // reset the location and zoom just in case the user manually moved the map
						google.maps.event.trigger(map, "resize");
            map.setCenter(location);       

            // make sure options.zoom is a number
            if ( options.zoom && typeof options.zoom !== "number" ) {
              options.zoom = +options.zoom;
            }

            options.zoom = options.zoom || 0; // default to 0
            map.setZoom( options.zoom );

            //Make sure heading is a number
            if ( options.heading && typeof options.heading !== "number" ) {
              options.heading = +options.heading;
            }
            //Make sure pitch is a number
            if ( options.pitch && typeof options.pitch !== "number" ) {
              options.pitch = +options.pitch;
            }

            if ( options.type === "STREETVIEW" ) {
              // Switch this map into streeview mode
              map.setStreetView(
                // Pass a new StreetViewPanorama instance into our map
                new google.maps.StreetViewPanorama( newdiv, {
                  position: location,
                  pov: {
                    heading: options.heading = options.heading || 0,
                    pitch: options.pitch     = options.pitch || 0,
                    zoom: options.zoom
                  }
                } )
              );
            }
          } else {
            setTimeout( function () {
              isMapSetup();
            }, 13);
          }
        };

        isMapSetup();
      },
      /**
       * @member webpage
       * The end function will be executed when the currentTime
       * of the video reaches the end time provided by the
       * options variable
       */
      end: function(event, options){
        // if the map exists hide it do not delete the map just in
        // case the user seeks back to time b/w start and end
        if (map) {
          map.getDiv().style.display = "none";
        }
      },
      _teardown: function( options ) {
        // the map must be manually removed
        document.getElementById( options.target ).removeChild( newdiv );
        newdiv = map = location = null;
      }
    };
  },
  {
    about: {
      name: "Popcorn Google Map Plugin",
      version: "0.1",
      author: "@annasob",
      website: "annasob.wordpress.com"
    },
    options: {
      start    : {elem:"input", type:"text", label:"In"},
      end      : {elem:"input", type:"text", label:"Out"},
      target   : "map-container",
      type     : {elem:"select", options:["ROADMAP","SATELLITE", "STREETVIEW", "HYBRID", "TERRAIN"], label:"Type"},
      zoom     : {elem:"input", type:"text", label:"Zoom"},
      lat      : {elem:"input", type:"text", label:"Lat"},
      lng      : {elem:"input", type:"text", label:"Lng"},
      location : {elem:"input", type:"text", label:"Location"},
      heading  : {elem:"input", type:"text", label:"Heading"},
      pitch    : {elem:"input", type:"text", label:"Pitch"}
    }
  });
})( Popcorn );
