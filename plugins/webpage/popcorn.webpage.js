(function (Popcorn) {
  /**
   * Webpages popcorn plug-in 
   * Creates an iframe showing a website specified by the user
   * Options parameter will need a start, duration or out, and src.
   * Start is the time that you want this plug-in to execute
   * Out is the time that you want this plug-in to stop executing [not currently implemented]
   * Duration can be used instead of out to state how long you want the plug-in to execute for
   * Target is the id of the document element that the iframe needs to be attached to
   *
   * @param {Object} options
   *
   */
  Popcorn.plugin( "webpages" , function ( options ) {
    
    var exists,
        iframe  = document.createElement( 'iframe' ),
        page    = [], 
        temp    = document.getElementById( options.target );
          
    // set the style of the iframe
    iframe.setAttribute('width', "100%");
    iframe.setAttribute('height', "100%");
    iframe.id  = options.id;
    iframe.src = options.src;
   
    // listen function will add/remove the iframe from the page at the appropriate times
    this.listen("timeupdate", function (event) {
      exists  = document.getElementById( options.id );
      if ( this.currentTime() >= options.start && !exists &&  this.currentTime() <= options.end ) {
        temp.appendChild(iframe);
      }
      // remove the iframe if the current time of the video is greater than 
      // the end time specified by the user 
      if ( this.currentTime() >= options.end  && exists ) {           
        temp.removeChild(iframe);
      }
      // if the user seeks to a time before the webpage command
      // ensure that the iframe was removed
      if ( this.currentTime() < options.start && exists ) {
        temp.removeChild(iframe);
      }
    });
    
    return this;
  });

})(Popcorn);