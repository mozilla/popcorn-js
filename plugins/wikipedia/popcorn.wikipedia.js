// PLUGIN: WEBPAGE

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
   * NumOfWords (optional, defaults to 200) is  the number of words you want displaid. 
   *
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .wikipedia({
          id: "webpages-a", 
          start: 5, // seconds
          end: 15, // seconds
          src: 'http://www.webmademovies.org',
          target: 'webpagediv'
        } )
   *
   */
  Popcorn.plugin( "wikipedia" , (function(){
      
    var temp, length;
    
    
    return {
      /**
       * @member wikipedia 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        if (typeof options.lang === 'undefined') {options.lang="en";}
        temp    = document.getElementById( options.target );
        length = options.numOfWords || 200;
        
      },
      /**
       * @member wikipedia 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        temp.removeChild(iframe);
      }
      
    };
    
  })());

})( Popcorn );