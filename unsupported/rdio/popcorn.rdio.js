// Rdio Plug-in
/**
  * Rdio popcorn plug-in
  * Appends Rdio album track listings to an element on the page.
  * Can also append a user's playlist to an element on the page.
  * Option paramter can be in two forms:
  * Options parameter will take a start, end, target, artist, album, and type or
  * Options parameter will take a start, end, target, person, id, playlist, and type
  * Start is the time that you want this plug-in to execute
  * End is the time that you want this plug-in to stop executing
  * Target is the id of the document element that the images are appended to
  * Artist is the name of who's album image will display
  * Album is the album that will display of the specified Artist
  * Person is the Rdio member who's playlist will display
  * ID is the playlist's unqiue Rdio playlist identifier
  * Playlist is the name of the playlist
  * Type specifies if the element is an album or playlist
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
    album: "Synkronized",
    type: "album"
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
    playlist: "sunday",
    type: "playlist"
  })
**/

(function( Popcorn ) {
  var _album = {},
  _container = {},
  _target = {},
  _rdioURL = "http://www.rdio.com/api/oembed/?format=json&url=http://www.rdio.com/%23";

  Popcorn.plugin( "rdio", (function( options ) {
    var _loadResults = function( data, options ) {
      var title = data.title,
      html = data.html;
      if ( data && title && html ) {
        _album[ options.containerid ].htmlString = "<div>" + html + "</div>";
      }
    },

    // Handle AJAX Request
    _getResults = function( options ) {
      var urlBuilder = function( type ) {
        var path = {
          playlist: function() {
            return "/people/" + ( options.person ) + "/playlists/" + options.id + "/";
          },
          album: function() {
            return "/artist/" + ( options.artist ) + "/album/";
          }
        }[ type ]();

        return _rdioURL + path + options[ type ] + "/&callback=_loadResults";
      },
      url = urlBuilder( options.type );
      Popcorn.getJSONP( url, function( data ) {
        _loadResults( data, options );
      }, false );
    };

    return {
      _setup: function( options ) {
        var key = options.containerid = Popcorn.guid(),
        container = _container[ key ] = document.createElement( "div" ),
        target = _target[ key ] = document.getElementById( options.target );
        container.style.display = "none";
        container.innerHTML = "";
        target && target.appendChild( container );
        _album[ key ] = {
          htmlString: ( options.playlist || "Unknown Source" ) || ( options.album || "Unknown Source" )
        };
        options.type && _getResults( options );

        options.toString = function() {
          return options.artist || options._natives.manifest.options.artist[ "default" ];
        }
      },
      start: function( event, options ) {
        var key = options.containerid,
        container = _container[ key ];
        container.innerHTML = _album[ key ].htmlString;
        container.style.display = "inline";
      },
      end: function( event, options ) {
        container = _container[ options.containerid ];
        container.style.display = "none";
        container.innerHTML = "";
      },
      _teardown: function( options ) {
        var key = options.containerid,
        target = _target[ key ];
        if ( _album[ key ] ) {
          delete _album[ key ];
        }
        target && target.removeChild( _container[ key ] );
        delete _target[ key ];
        delete _container[ key ];
      }
    };
  })(),
  {
    about: {
      name: "Popcorn Rdio Plugin",
      version: "0.1",
      author: "Denise Rigato"
    },
    options: {
      start: {
        elem: "input",
        type: "number",
        label: "Start"
      },
      end: {
        elem: "input",
        type: "number",
        label: "End"
      },
      target: "rdio-container",
      artist: {
        elem: "input",
        type: "text",
        label: "Artist",
        "default": "The Beatles"
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
      },
      type: {
        elem: "select",
        options: [ "album", "playlist" ],
        label: "Type"
      }
    }
  });
}( Popcorn ));
