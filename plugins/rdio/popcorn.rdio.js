//RDIO Plug-in

(function ( Popcorn ) {
  var _albums = {},
    loadResult = function( data ) {
	  
      if ( data.title ) {
        var htmlString = "";
        htmlString += "<div>" + data.html + "</div>";
        _albums[ data.title ].htmlString = htmlString;
      }
    };
 

  /**
  * Rdio popcorn plug-in
  * Appends Rdio album track listings to an element on the page.
  * Can also append a user's playlist to an element on the page.
  * Option paramter can be in two forms:
  * Options parameter will take a start, end, target, artist, and album or
  * Options parameter will take a start, end, target, person, id, and playlist
  * Start is the time that you want this plug-in to execute
  * End is the time that you want this plug-in to stop executing
  * Target is the id of the document element that the images are appended to
  * Artist is the name of who's album image will display
  * Album is the album that will display of the specified Artist
  * Person is the Rdio member who's playlist will display
  * ID is the playlist's unqiue Rdio playlist identifier
  * Playlist is the name of the playlist
  *

  *
  * @param {Object} options
  *
  * Example 1:
  var p = Popcorn( "#video" )
  .rdio({
    start: 2,
    end: 10,
    target: "rdiodiv",
    artist: "Jamiroquai",
    album: "Synkronized"
  })
  *
  * Example 2:
  var p = Popcorn( "#video" )
  .rdio({
    start: 10,
	end: 20,
	target: "rdiodiv",
	person: "diggywiggy",
	id: 413517,
	playlist: "sunday"
  })
  */
    
  Popcorn.plugin( "rdio", ( function() {
    return {

      _setup: function( options ) {
        options._container = document.createElement( "div" );
        options._container.style.display = "none";
        options._container.innerHTML = "";
	  
        var target = document.getElementById( options.target );
        if ( !target && Popcorn.plugin.debug )
          throw new Error( "target container doesn't exist" );
		
        target && target.appendChild( options._container );

        if ( options.person ) {
          if ( !_albums[ options.playlist ] ) {
            _albums[ options.playlist ] = {
              count: 0,
              htmlString: "Unknown Artist"
            };
		   
            Popcorn.getJSONP( "http://www.rdio.com/api/oembed/?format=json&url=http://www.rdio.com/%23/people/" + options.person + "/playlists/" + options.id + "/" + options.playlist + "/&callback=loadResult", loadResult, false );
          }
	      _albums[ options.playlist ].count++;
		   
        } else if ( options.artist ) {
          if ( !_albums[ options.album ] ) {
            _albums[ options.album ] = {
              count: 0,
              htmlString: "Unknown Artist"
            };
		  
		    Popcorn.getJSONP( "http://www.rdio.com/api/oembed/?format=json&url=http://www.rdio.com/%23/artist/" + options.artist + "/album/" + options.album + "/&callback=loadResult", loadResult, false );
          }
          _albums[ options.album ].count++;
        }
         
      },
      
      start: function( event, options ) {
        if ( options.person )
          options._container.innerHTML = _albums[ options.playlist ].htmlString;
        else if ( options.album )
          options._container.innerHTML = _albums[ options.album ].htmlString;
        options._container.style.display = "inline";
      },
      
      end: function( event, options ) {
        options._container.style.display = "none";
        options._container.innerHTML = "";
      },
      
      _teardown: function( options ) {
        // cleaning possible reference to _artist array;
        if ( options.album )
          _albums[ options.album ].count || delete _albums[ options.album ];
        else if ( options.person )
          _albums[ options.playlist ].count || delete _albums[ options.playlist ];
        document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
      }
	
    };
  })(),
  
  {
  
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
  });
  
})( Popcorn );

