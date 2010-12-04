(function (Popcorn) {
  /**
   * Webpages popcorn plug-in 
   * Creates an iframe showing a website specified by the user
   * Options parameter will need a start, duration or out, and src.
   * Start is the time that you want this plug-in to execute
   * Out is the time that you want this plug-in to stop executing [not currently implemented]
   * Duration can be used instead of out to state how long you want the plug-in to execute for
   * Target is the id of the document element that the iframe needs to be attached to
   * @param {Object} options
   * @param {Object} object element to be added to the list
   */
  Popcorn.plugin( "webpages" , function ( options ) {
    
    var iframe = document.createElement('iframe'),
        page = [], 
        context = this.video;
    
    // set the style of the iframe
    iframe.setAttribute('width', "100%");
    iframe.setAttribute('height', "100%");
    
    
    
    // get the options that the user included
    if ( typeof options === "object" && "join" in options ) {
      page = options;
    } else {
      page.push(options);
    }
    
    this.listen("timeupdate", function (event) {
      // loop threw all of the webpages 
      Popcorn.forEach(page, function ( thispage ) {
               
        var temp  = document.getElementById( thispage.target );
        iframe.setAttribute('id', thispage.id);
        var exists  = document.getElementById( thispage.id );
        
        if ( this.currentTime() >= thispage.start && !exists &&  this.currentTime() <= thispage.end) {
          //div.innerHTML = div.innerHTML + thispage.html;
          // set the source of the webpage that this plugin should display
          iframe.setAttribute('src', thispage.src);
          temp.appendChild(iframe);
        }

        if ( this.currentTime() >= thispage.end  && exists) {         
          temp.removeChild(iframe);
        }
      }, this);
    });
  });

})(Popcorn);