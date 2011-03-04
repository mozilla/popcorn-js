// PLUGIN: Google Feed
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

  var newdiv, i = 1, _mapFired = false, _mapLoaded = false;

  // callback function fires when the script is run
  googleCallback = function() {
  			google.load("feeds", "1", {"callback" : reallyLoaded});
  };
  
  var reallyLoaded = function() {
				_mapLoaded = true;
			};
  
  // insert google api script once
  if (!_mapFired) {
    _mapFired = true;
    var loadScriptTime = (new Date).getTime();
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
	var script2 = document.createElement("script");
	var css = document.createElement('link');
	
    script.src = "https://www.google.com/jsapi?callback=googleCallback";
    script.type = "text/javascript";
	script2.src = "http://www.google.com/uds/solutions/dynamicfeed/gfdynamicfeedcontrol.js";
    script2.type = "text/javascript";
	css.type = "text/css";
	css.rel = "stylesheet";
	css.href =  "http://www.google.com/uds/solutions/dynamicfeed/gfdynamicfeedcontrol.css";
	
	head.insertBefore( script2, head.firstChild );	
    head.insertBefore( script, head.firstChild );
	head.insertBefore( css, head.firstChild );
  }


  Popcorn.plugin( "googlefeed" , function( options ) {
    // create a new div this way anything in the target div
    // this is later passed on to the maps api
    var newdiv = document.createElement("div");
	newdiv.style.display = "none";
    if (document.getElementById(options.target)) {
      document.getElementById(options.target).appendChild(newdiv);
    }

    var initialize = function() {
	if ( !_mapLoaded ) {
        setTimeout(function () {
          initialize();
        }, 5);
      } else {
      var container = new GFdynamicFeedControl(options.url, newdiv, {
		vertical: true,
		title: options.title
		});
	  }
	};
	initialize();
    return {
      /**
       * @member webpage
       * The start function will be executed when the currentTime
       * of the video reaches the start time provided by the
       * options variable
       */
      start: function(event, options){
            newdiv.setAttribute( 'style', 'display:inline' );
      },
      /**
       * @member webpage
       * The end function will be executed when the currentTime
       * of the video reaches the end time provided by the
       * options variable
       */
      end: function(event, options){
          newdiv.setAttribute( 'style', 'display:none' );
      }
    };
  },
  {
    about: {
      name: "Popcorn Google Feed Plugin",
      version: "0.1",
      author: "David Seifried",
      website: "dseifried.wordpress.com"
    },
    options: {
      start    : {elem:"input", type:"text", label:"In"},
      end      : {elem:"input", type:"text", label:"Out"},
      target   : "map-container",
      url      : {elem:"input", type:"text", label:"url"},
	  title    : {elem:"input", type:"text", label:"title"}
    }
  });
})( Popcorn );
