// PLUGIN: Google Maps
var googleCallback;
(function (Popcorn) {

    var i = 1,
        _mapFired = false,
        _mapLoaded = false,
        geocoder, loadMaps;
    //google api callback 
    googleCallback = function (data) {
        // ensure all of the maps functions needed are loaded 
        // before setting _maploaded to true
        if (typeof google !== "undefined" && google.maps && google.maps.Geocoder && google.maps.LatLng) {
            geocoder = new google.maps.Geocoder();
            _mapLoaded = true;
        } else {
            setTimeout(function () {
                googleCallback(data);
            }, 1);
        }
    };
    // function that loads the google api
    loadMaps = function () {
        // for some reason the Google Map API adds content to the body
        if (document.body) {
            _mapFired = true;
            Popcorn.getScript("http://maps.google.com/maps/api/js?sensor=false&callback=googleCallback");
        } else {
            setTimeout(function () {
                loadMaps();
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
     * -Location: the adress you want the map to display, must be present if lat and lng are not specified.
     * Note: using location requires extra loading time, also not specifying both lat/lng and location will
     * cause and error.
     *
     * Tweening works using the following specifications:
     * -location is the start point when using an auto generated route
     * -tween when used in this context is a string which specifies the end location for your route
     * Note that both location and tween must be present when using an auto generated route, or the map will not tween
     * -interval is the speed in which the tween will be executed, a reasonable time is 1000 ( time in milliseconds )
     * Heading, Zoom, and Pitch streetview values are also used in tweening with the autogenerated route
     *
     * -tween is an array of objects, each containing data for one frame of a tween
     * -position is an object with has two paramaters, lat and lng, both which are mandatory for a tween to work
     * -pov is an object which houses heading, pitch, and zoom paramters, which are all optional, if undefined, these values default to 0
     * -interval is the speed in which the tween will be executed, a reasonable time is 1000 ( time in milliseconds )
     *
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
    Popcorn.plugin("googlemap", function (options) {
        var newdiv, map, location;

        // if this is the firest time running the plugins
        // call the function that gets the sctipt
        if (!_mapFired) {
            loadMaps();
        }

        // create a new div this way anything in the target div is left intact
        // this is later passed on to the maps api
        newdiv = document.createElement("div");
        newdiv.id = "actualmap" + i;
        newdiv.style.width = "100%";
        newdiv.style.height = "100%";
        i++;

        // ensure the target container the user chose exists
        if (document.getElementById(options.target)) {
            document.getElementById(options.target).appendChild(newdiv);
        } else {
            throw ("map target container doesn't exist");
        }

        // ensure that google maps and its functions are loaded
        // before setting up the map parameters
        var isMapReady = function () {
                if (_mapLoaded) {
                    if (options.location) {
                        // calls an anonymous google function called on separate thread
                        geocoder.geocode({
                            "address": options.location
                        }, function (results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                options.lat = results[0].geometry.location.lat();
                                options.lng = results[0].geometry.location.lng();
                                location = new google.maps.LatLng(options.lat, options.lng);
                                map = new google.maps.Map(newdiv, {
                                    mapTypeId: google.maps.MapTypeId[options.type] || google.maps.MapTypeId.HYBRID
                                });
                                map.getDiv().style.display = "none";
                            }
                        });
                    } else {
                        location = new google.maps.LatLng(options.lat, options.lng);
                        map = new google.maps.Map(newdiv, {
                            mapTypeId: google.maps.MapTypeId[options.type] || google.maps.MapTypeId.HYBRID
                        });
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
            start: function (event, options) {
                var that = this;

                // ensure the map has been initialized in the setup function above
                var isMapSetup = function () {
                        if (map) {
                            map.getDiv().style.display = "block";
                            // reset the location and zoom just in case the user plaid with the map
                            google.maps.event.trigger(map, 'resize');
                            map.setCenter(location);

                            // make sure options.zoom is a number
                            if (options.zoom && typeof options.zoom !== "number") {
                                options.zoom = +options.zoom;
                            }

                            options.zoom = options.zoom || 0; // default to 0
                            map.setZoom(options.zoom);

                            //Make sure heading is a number
                            if (options.heading && typeof options.heading !== "number") {
                                options.heading = +options.heading;
                            }
                            //Make sure pitch is a number
                            if (options.pitch && typeof options.pitch !== "number") {
                                options.pitch = +options.pitch;
                            }

							

                            if (options.type === "STREETVIEW") {
                                // Switch this map into streeview mode
                                map.setStreetView(
                                // Pass a new StreetViewPanorama instance into our map

                                sView = new google.maps.StreetViewPanorama( newdiv, {
                                    position: location,
                                    pov: {
                                        heading: options.heading = options.heading || 0,
                                        pitch: options.pitch = options.pitch || 0,
                                        zoom: options.zoom
                                    }
                                })


                                );
                                         
                                //  Function to handle tweening using a set timeout
                                var tween = function ( rM, t ) {

                                  setTimeout( function () {
          
                                    //  Checks whether this is a generated route or not
                                    if( typeof options.tween === "array" ){

                                      for ( var i = 0; i < rM.length; i++ ) {

                                        //  Checks if this position along the tween should be displayed or not
                                        if( that.media.currentTime >= ( rM[ i ].interval*( i+1 ) )/1000 &&
                                          ( that.media.currentTime <= (rM[ i ].interval*( i+2 ) )/1000 || 
                                            that.media.currentTime >= rM[ i ].interval*( rM.length )/1000 ) ){

	                                        sView3.setPosition( new google.maps.LatLng( rM[ i ].position.lat, rM[ i ].position.lng ) );

	                                        sView3.setPov({
	                                          heading: rM[ i ].pov.heading || 0,
	                                          zoom:    rM[ i ].pov.zoom || 0,
	                                          pitch:   rM[ i ].pov.pitch || 0
	                                        });

                                        }

                                      }
                                      //  Calls the tween function again at the interval set by the user
                                      tween( rM, rM[ 0 ].interval );
                                    }
                                    else{

                                      for ( var i = 0; i < rM.length; i++ ) {

                                          if( that.media.currentTime >= (options.interval*( i+1 ) )/1000 &&
                                            ( that.media.currentTime <= (options.interval*( i+2 ) )/1000 ||
                                             that.media.currentTime >= options.interval*( rM.length )/1000 ) ){

                                          sView2.setPosition( checkpoints[i] );

                                          sView2.setPov({
	                                          heading: options.heading || 0,
	                                          zoom:    options.zoom,
	                                          pitch:   options.pitch || 0
	                                        }); 
                                      } 

                                    }
                                    tween( checkpoints, options.interval );
                                    }   
                                  }, t );

                                }

                                
                                //  Determines if we should use hardcoded values ( using options.tween ),
                                //  or if we should use a start and end location and let google generate
                                //  the route for us
                                if ( options.location && typeof options.tween === "string" ){

                                //  Creating another variable to hold the streetview map for tweening,
                                //  Doing this because if there was more then one streetview map, the tweening would sometimes appear in other maps
                                var sView2 = sView;
                                  
                                  //  Create an array to store all the lat/lang values along our route
                                  var checkpoints = [];

                                  //  Creates a new direction service, later used to create a route
                                  var directionsService = new google.maps.DirectionsService();

                                  //  Creates a new direction renderer using the current map
                                  //  This enables us to access all of the route data that is returned to us
                                  var directionsDisplay = new google.maps.DirectionsRenderer( sView2 );

                                  var request = {
                                    origin:      options.location,
                                    destination: options.tween,
                                    travelMode:  google.maps.TravelMode.DRIVING
                                  };

                                  //  Create the route using the direction service and renderer
                                  directionsService.route( request, function( response, status ) {

                                    if ( status == google.maps.DirectionsStatus.OK ) {
                                      directionsDisplay.setDirections( response );
                                      showSteps( response, that );
                                    }

                                  });

                                  function showSteps( directionResult, that ) {
                                    
                                    //  Push new google map lat and lng values into an array from our list of lat and lng values
                                    for ( var j = 0; j < directionResult.routes[ 0 ].overview_path.length; j++ ) {
                                      checkpoints.push( new google.maps.LatLng( directionResult.routes[ 0 ].overview_path[ j ].lat(), directionResult.routes[ 0 ].overview_path[ j ].lng() ) );
                                    }     
                                      
                                      //  Check to make sure the interval exists, if not, set to a default of 1000
                                      options.interval = options.interval || 1000;
                                      tween( checkpoints, 10);

                                  }
                                }
                                else if( typeof options.tween === "array" ){

                                  //  Same as the above to stop streetview maps from overflowing into one another
                                  var sView3 = sView;

                                  for ( var i = 0; i < options.tween.length; i++ ) {
                                   
                                    //  Make sure interval exists, if not, set to 1000
                                    options.tween[ i ].interval = options.tween[ i ].interval || 1000;
                                    tween( options.tween, 10 );
                                  }

                                }

                            }
                        } else {
                            setTimeout(function () {
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
            end: function (event, options) {
                // if the map exists hide it do not delete the map just in
                // case the user seeks back to time b/w start and end
                if (map) {
                    map.getDiv().style.display = "none";
                }
            },
            _teardown: function (options) {
                // the map must be manually removed
                document.getElementById(options.target).removeChild(newdiv);
                newdiv = map = location = null;
            }
        };
    }, {
        about: {
            name: "Popcorn Google Map Plugin",
            version: "0.1",
            author: "@annasob",
            website: "annasob.wordpress.com"
        },
        options: {
            start: {
                elem: "input",
                type: "text",
                label: "In"
            },
            end: {
                elem: "input",
                type: "text",
                label: "Out"
            },
            target: "map-container",
            type: {
                elem: "select",
                options: ["ROADMAP", "SATELLITE", "STREETVIEW", "HYBRID", "TERRAIN"],
                label: "Type"
            },
            zoom: {
                elem: "input",
                type: "text",
                label: "Zoom"
            },
            lat: {
                elem: "input",
                type: "text",
                label: "Lat"
            },
            lng: {
                elem: "input",
                type: "text",
                label: "Lng"
            },
            location: {
                elem: "input",
                type: "text",
                label: "Location"
            },
            heading: {
                elem: "input",
                type: "text",
                label: "Heading"
            },
            pitch: {
                elem: "input",
                type: "text",
                label: "Pitch"
            }
        }
    });
})(Popcorn);
