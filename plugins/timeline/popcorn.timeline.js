// PLUGIN: Timeline
(function (Popcorn) {

  var i = 0;
   
  var head = document.getElementsByTagName("head")[0];
  var css = document.createElement('link');
  css.type = "text/css";
  css.rel = "stylesheet";
  css.href = "asdf.css";
  head.insertBefore( css, head.firstChild );


  Popcorn.plugin( "timeline" , function( options ) {

    // create a new div and append it to the parent div so nothing
    // that already exists in the parent div gets overwritten
    var newdiv = document.createElement( "div" );
    newdiv.style.display = "none";
    newdiv.id = "timelineDiv"+i;

    if ( document.getElementById( options.target ) ) {

      document.getElementById( options.target ).appendChild( newdiv );

      // if this isnt the first div added to the target div
      if( i ){

        // insert the current div before the previous div inserted
        document.getElementById( options.target ).insertBefore( newdiv, document.getElementById( "timelineDiv" + ( i - 1 ) ) );
       }
    }
    
    i++;
    
    newdiv.innerHTML = "<p><span id='big'>" + options.title + "</span><br />" +
    "<span id='mid'>" + options.text + "<br />" +
    "</span><a href='#'>" + options.links + "</a></p>";
    
    return {

      start: function( event, options ){
        newdiv.setAttribute( "style", "display:block" );
      },
 
      end: function(event, options){
        newdiv.setAttribute( "style", "display:none" );
      }
    };
  },
  {

    about: {
      name: "Popcorn Timeline Plugin",
      version: "0.1",
      author: "David Seifried @dcseifried",
      website: "dseifried.wordpress.com"
    },

    options: {
      start :  { elem:"input", type:"text", label:"In" },
      end :    { elem:"input", type:"text", label:"Out" },
      target : "feed-container",
      text :   { elem:"input", type:"text", label:"text" }
    }
  });
  
})( Popcorn );
