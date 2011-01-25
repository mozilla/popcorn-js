// PLUGIN: LASTFM
var lastFMcallback;

(function (Popcorn) {
  
  /**
   * LastFM popcorn plug-in
   * Appends information about a LastFM artist to an element on the page.
   * Options parameter will need a start, end, target and artist.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Artist is the name of who's LastFM information you wish to show
   * Target is the id of the document element that the images are
   *  appended to, this target element must exist on the DOM
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .lastfm({
          start:          5,                 // seconds, mandatory
          end:            15,                // seconds, mandatory
          artist:         'yacht',           // mandatory
          target:         'lastfmdiv'        // mandatory
        } )
   *
   */
  Popcorn.plugin( "lastfm" , (function(){
      
    var _artists = [];
    
    return {
      manifest: {
        about:{
          name:    "Popcorn LastFM Plugin",
          version: "0.1",
          author:  "Steven Weerdenburg",
          website: "http://sweerdenburg.wordpress.com/"
        },
        options:{
          start    : {elem:'input', type:'text', label:'In'},
          end      : {elem:'input', type:'text', label:'Out'},
          target   : 'lastfm-container',
          artist   : {elem:'input', type:'text', label:'Artist'}
        }
      },

      _setup: function( options ) {
        options._container = document.createElement( 'div' );
        options._container.style.display = "none";
        options._container.innerHTML = "";
        
        options.artist = options.artist.toLowerCase();
        
        if ( document.getElementById( options.target ) ) {
          document.getElementById( options.target ).appendChild( options._container );
        }
        
        if(!_artists[options.artist]) {
          var loadScriptTime = (new Date).getTime();
          var head = document.getElementsByTagName('head')[0];
          var script = document.createElement('script');
         
          script.src = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist="+ options.artist +"&api_key=30ac38340e8be75f9268727cb4526b3d&format=json&callback=lastFMcallback";
          script.type = "text/javascript";
          head.insertBefore( script, head.firstChild );
          
          _artists[options.artist] = "Unknown Artist";
        }
        
        lastFMcallback = function(data){
          if (data.artist) {
            var htmlString = '<h3>'+data.artist.name+'</h3>';
            htmlString += '<a href="'+data.artist.url+'" target="_blank" style="float:left;margin:0 10px 0 0;"><img src="'+ data.artist.image[2]['#text'] +'" alt=""></a>';
            htmlString += '<p>'+ data.artist.bio.summary +'</p>';
            htmlString += '<hr /><p><h4>Tags</h4><ul>';
            
            Popcorn.forEach( data.artist.tags.tag, function( val, i) {
              htmlString += '<li><a href="'+ val.url +'">'+ val.name +'</a></li>';
            });
            
            htmlString += '</ul></p>';
            htmlString += '<hr /><p><h4>Similar</h4><ul>';
            
            Popcorn.forEach( data.artist.similar.artist, function( val, i) {
              htmlString += '<li><a href="'+ val.url +'">'+ val.name +'</a></li>';
            });
            
            htmlString += '</ul></p>';
            
            _artists[data.artist.name.toLowerCase()] = htmlString;
          }
        };
      },
      /**
       * @member LastFM 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function( event, options ) {
        options._container.innerHTML = _artists[options.artist];
        options._container.style.display = "inline";
      },
      /**
       * @member LastFM 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function( event, options ) {
        options._container.style.display = "none";
        options._container.innerHTML = "";
      }
    };
  })());

})( Popcorn );
