// PLUGIN: WEBPAGE

(function (Popcorn) {
  
  /**
   * Footnote popcorn plug-in 
   * Adds text to an element on the page.
   * Options parameter will need a start, end, target and text.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing 
   * Text is the text that you want to appear in the target
   * Target is the id of the document element that the text needs to be 
   * attached to, this target element must exist on the DOM
   * 
   * Note: anything in the target element will be overwritten by the text 
   * specified by the user
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .footnote({
          start: 5, // seconds
          end: 15, // seconds
          text: 'This video made exclusively for drumbeat.org',
          target: 'footnotediv'
        } )
   *
   */
  Popcorn.plugin( "footnote" , (function(){
      
    var temp;
    
    return {
      /**
       * @member webpage 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        temp  = document.getElementById( options.target );
        temp.innerHTML  = options.text;
      },
      /**
       * @member webpage 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */
      end: function(event, options){
        temp.innerHTML  = "";
      }
      
    };
    
  })());

})( Popcorn );