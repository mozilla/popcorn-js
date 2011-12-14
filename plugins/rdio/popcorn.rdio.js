// Rdio Plug-in
(function( Popcorn ) {

	var _album = {},
		_container = {},
		_target = {},

		_rdioURL = "http://www.rdio.com/api/oembed/?format=json&url=http://www.rdio.com/%23",


	// Handle AJAX Response
	_loadResults = function( data ) {
		// Received data from server
		if( data && data.title && data.html ) {
			_album[ data.title ].htmlString = "<div>" + data.html + "</div>";
		
		// Didn't receive data from server
		} else {
			if( Popcorn.plugin.debug ) {
				throw new Error( "Did not receive data from server." );
			}
		}
	},

	// Handle AJAX Request
	_getResults = function( options ) {
		var urlBuilder = {
			playlist : (function() {
				return _rdioURL + "/people/" + ( options.person ) + "/playlists/" + options.id + "/" + options.playlist + "/&callback=_loadResults";
			}()),
			album : (function() {
				return _rdioURL + "/artist/" + ( options.artist ) + "/album/" + options.album + "/&callback=_loadResults";
			}())
		},
		url = urlBuilder[ options.type ];
		Popcorn.getJSONP( url, _loadResults, false );
	};

	// Arguments for Plugin
	var _args 	= {
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
	      target: "rdio",
	      artist: {
	        elem: "input",
	        type: "text",
	        label: "Artist"
	      },
	      album: {
	        elem: "input",
	        type: "text",
	        label: "Album"
	      },
	      person: {
	        elem: "input",
	        type: "text",
	        label: "Person"
	      },
	      id: {
	        elem: "input",
	        type: "text",
	        label: "Id"
	      },
	      playlist: {
	        elem: "input",
	        type: "text",
	        label: "Playlist"
	      }
	    }
	  };

	// Start Rdio Plugin
	Popcorn.plugin( "rdio", ( function( options ) {

		// Return object as argument
		return {
			
			// Setup plugin????
			_setup	: function( options ) {
				var key = (options.album || options.playlist);

        		_target[ key ] = document.getElementById( options.target );
        		
        		if( !_target[ key ] && Popcorn.plugin.debug ) {
        			throw new Error( "Target container could not be found." );
	        	}

	        	_container[ key ] = document.createElement( "div" );
        		_container[ key ].style.display = "none";
        		_container[ key ].innerHTML = "";

        		_target[ key ] && _target[ key ].appendChild( _container[ key ] );

        		_album[ key ] = {
        			htmlString	: ( options.playlist || "Unknown Source") || ( options.album || "Unknown Source" )
        		};
        		_getResults( options );
			},

			// Start of event
			start	: function( event, options) {
				var key = (options.album || options.playlist);

				_container[ key ].innerHTML = _album[ key ].htmlString;
				_container[ key ].style.display = "inline";
			},

			// End of event
			end		: function( event, options) {
				var key = (options.album || options.playlist);

				_container[ key ].style.display = "none";
        		_container[ key ].innerHTML = "";
			},

			// Destroy method?
			_teardown	: function( options ) {
				var key = (options.album || options.playlist);
				_target[ key ] = document.getElementById( options.target );

				//delete _album[ key ] && delete _container[ key ] && delete _target[ key ];
				_album[ key ].count && delete album[ key ];
				_target[ key ] && _target[ key ].removeChild( _container[ key ] );
			}

		};

	}()), _args);

	
}( Popcorn ));