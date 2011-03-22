// PLUGIN: Timeline
(function (Popcorn) {

  /**
   * googlefeed popcorn plug-in
   * Adds a feed from the specified blog url at the target div
   * Options parameter will need a start, end, target, url and title
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing
   * -Target is the id of the DOM element that you want the map to appear in. This element must be in the DOM
   * -Url is the url of the blog's feed you are trying to access
   * -Title is the title of the blog you want displayed above the feed
   * -Orientation is the orientation of the blog, accepts either Horizontal or Vertical, defaults to Vertical
   * @param {Object} options
   *
   * Example:
    var p = Popcorn("#video")
      .googlefeed({
       start: 5, // seconds
       end: 15, // seconds
       target: "map",
       url: "http://zenit.senecac.on.ca/~chris.tyler/planet/rss20.xml",
       title: "Planet Feed"
    } )
  *
  */

  var i = 0;
   
    var head = document.getElementsByTagName("head")[0];
    var css = document.createElement('link');
    css.type = "text/css";
    css.rel = "stylesheet";
    css.href =  "asdf.css";
    head.insertBefore( css, head.firstChild ); 


  Popcorn.plugin( "timeline" , function( options ) {
    // create a new div and append it to the parent div so nothing
    // that already exists in the parent div gets overwritten
    var newdiv = document.createElement( "div" );
    newdiv.style.display = "none";
    newdiv.id = "asdf"+i;

    if ( document.getElementById( options.target ) ) {
      document.getElementById( options.target ).appendChild( newdiv );
      // if this isnt the first div added to the target div
      if( i ){
        // insert the current div before the previous div inserted
        document.getElementById( options.target ).insertBefore( newdiv, document.getElementById( "asdf" + ( i - 1 ) ) );
       }
    }
    
    i++;
    
    newdiv.innerHTML = "<p><span id='big'>" + options.title + "</span><br />" +
    "<span id='mid'>" + options.text + "<br />" +
"</span><a href='#'>" + options.links + "</a></p>";
    
    return {
      /**
       * @member webpage
       * The start function will be executed when the currentTime
       * of the video reaches the start time provided by the
       * options variable
       */
      start: function( event, options ){
        newdiv.setAttribute( "style", "display:block" );       
      },
      /**
       * @member webpage
       * The end function will be executed when the currentTime
       * of the video reaches the end time provided by the
       * options variable
       */
      end: function(event, options){
        newdiv.setAttribute( "style", "display:none" );
      }
    };
  },
  {
    about: {
      name: "Popcorn Timeline Plugin",
      version: "0.1",
      author: "David Seifried",
      website: "dseifried.wordpress.com"
    },
    options: {
      start          : { elem:"input", type:"text", label:"In" },
      end            : { elem:"input", type:"text", label:"Out" },
      target         : "feed-container",
      text           : { elem:"input", type:"text", label:"text" }
    }
  });
  
})( Popcorn );
