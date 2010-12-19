// PLUGIN: WIKIPEDIA


var wikiCallback;

(function (Popcorn) {
  
  /**
   * Wikipedia popcorn plug-in 
   * Displays a wikipedia aricle in the target specified by the user
   * Options parameter will need a start, end, target, lang, src, and numOfWords.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing 
   * Target is the id of the document element that the iframe needs to be attached to, 
   * this target element must exist on the DOM
   * Lang (optional, defaults to english)is the language in which the article is in.
   * Src is the url of the article 
   * Title (optional) is the title of the article
   * NumOfWords (optional, defaults to 200) is  the number of words you want displaid.  
   *
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .wikipedia({
          start: 5, // seconds
          end: 15, // seconds
          src: 'http://en.wikipedia.org/wiki/Cape_Town',
          target: 'webpagediv'
        } )
   *
   */
   
  
  Popcorn.plugin( "wikipedia" , (function(){
      
    var temp, length, link, p, desc, text;
    
    
    return {
      /**
       * @member wikipedia 
       * The setup function will get all of the needed 
       * items in place before the start function is called
       */
      _setup : function( options ) {
        // if no language was specified default to english
        if (typeof options.lang === 'undefined') { options.lang ="en"; }
        temp    = document.getElementById( options.target );
        length  = options.numOfWords || 200;
        
        //get the wiki article on a separate thread
        setTimeout(function() {
          getJson("http://"+options.lang+".wikipedia.org/w/api.php?action=parse&props=text&page=" + ( options.title || options.src.slice(options.src.lastIndexOf("/")+1)) + "&format=json&callback=wikiCallback");
        }, 1000);
        var getJson  = function(url) {
          var head   = document.getElementsByTagName("head")[0];
          var script = document.createElement("script");
          script.src = url;
          head.insertBefore( script, head.firstChild );
        };
        wikiCallback     = function (data) { 
          wikidatastring = data; 
          link = document.createElement('a');
          link.setAttribute('href', options.src);
          link.setAttribute('target', '_blank');
          // add the title of the article to the link
          link.innerHTML = wikidatastring.parse.displaytitle;
          // get the content of the wiki article
          desc = document.createElement('p');
          text = wikidatastring.parse.text["*"].substr(wikidatastring.parse.text["*"].indexOf('<p>'));
          text = text.replace(/((<(.|\n)+?>)|(\((.*?)\) )|(\[(.*?)\]))/g, "");
          desc.innerHTML = text.substr(0,  length ) + " ...";
        };
      },
      /**
       * @member wikipedia 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        temp.appendChild(link);
        temp.appendChild(desc);
      },
      /**
       * @member wikipedia 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        temp.removeChild(link);
        temp.removeChild(desc);
      }
      
    };
    
  })());

})( Popcorn );