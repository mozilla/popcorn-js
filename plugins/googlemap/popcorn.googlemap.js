// PLUGIN: Google Maps
var googleCallback;
(function (Popcorn) {

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

  var newdiv,
      i = 1,
      _mapFired = false,
      _mapLoaded = false;

  // callback function fires when the script is run
  googleCallback = function() {
    _mapLoaded = true;
  };
  // insert google api script once
  if (!_mapFired) {
    _mapFired = true;
    Popcorn.getScript("http://maps.google.com/maps/api/js?sensor=false&callback=googleCallback");
  }


  Popcorn.plugin( "googlemap" , function( options ) {
    var newdiv,
        map,
        location;

    // create a new div this way anything in the target div
    // this is later passed on to the maps api
    newdiv = document.createElement("div");
    newdiv.id = "actualmap" + i;
    newdiv.style.width = "100%";
    newdiv.style.height = "100%";
    i++;
    if (document.getElementById(options.target)) {
      document.getElementById(options.target).appendChild(newdiv);
    }

    // If there is no lat/lng, and there is location, geocode the location
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
          geocoder.geocode({ "address": options.location}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              options.lat = results[0].geometry.location.lat();
              options.lng = results[0].geometry.location.lng();
              location = new google.maps.LatLng(options.lat, options.lng);
              map = new google.maps.Map(newdiv, {mapTypeId: google.maps.MapTypeId[options.type] || google.maps.MapTypeId.HYBRID });
              map.getDiv().style.display = "none";
            }
          });
        } else {
          location = new google.maps.LatLng(options.lat, options.lng);
          map = new google.maps.Map(newdiv, {mapTypeId: google.maps.MapTypeId[options.type] || google.maps.MapTypeId.HYBRID });
          map.getDiv().style.display = "none";
        }
      }
    };
    isGeoReady();

    return {
      /**
       * @member webpage
       * The start function will be executed when the currentTime
       * of the video reaches the start time provided by the
       * options variable
       */
      start: function(event, options){
        // dont do anything if the information didn't come back from google map
        var isReady = function () {
          if (!map) {
            setTimeout(function () {
              isReady();
            }, 13);
          } else {
            map.getDiv().style.display = "block";
            // reset the location and zoom just in case the user plaid with the map
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

            google.maps.event.trigger(map, 'resize');

            if ( options.type === "STREETVIEW" ) {
              // Switch this map into streeview mode
              map.setStreetView(
                // Pass a new StreetViewPanorama instance into our map
                new google.maps.StreetViewPanorama( newdiv, {
                  position: location,
                  pov: {
                    heading: options.heading = options.heading || 0,
                    pitch: options.pitch = options.pitch || 0,
                    zoom: options.zoom
                  }
                })
              );
            }
          }
        };

        isReady();
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
