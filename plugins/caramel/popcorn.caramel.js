(function (Popcorn) {
      
   /* Caramel Popcorn plugin - a sweet and tasty add-on that triggers functions and/or opens URLs through a click
    * on the target element, being sure to pause the video while your user explores the other content!
    *
    *
    * @param {Object} options
    *
    * Required parameters: target, url OR function_name
    *
    *   target: ID of div to which click functionality should be added.
    *   url: URL string to open on click. Opens in a new tab or window.
    *   function_name: name of the function to execute on click. Click event is passed as first argument.
    *
    * Optional parameters
    *
    *   function_params: parameters object to be passed to function in addition to click event.
    *     Passed to function as optional second argument.
    *   pause_button_id: for use with custom video controls. If present, this div will be "clicked"
    *     to pause video, so that any other changes to the UI will take place as usual. 
    *
    *
    * Example:
    *
    *   var p = Popcorn('#video')
    *
    *   // Calling caramel
    *   .caramel({
    *     url: 'http://www.google.com', // URL to open in new tab/window OR
    *     function_name: 'functionName', //function to execute on click
    *     function_params: {"param_1":"string_param", "param_2":"another string", "param_3":37}
    *     target: 'div_id' //id of div to attach event to
    *     pause_button_id: 'button-id' // id of pause button in case of custom controls
    *   })
    *
    *
    */  
  
  Popcorn.plugin( "caramel" , {
    manifest: {
        about: {
            name: "Caramel Popcorn Plugin",
            version: "0.1",
            author: "Susan E. McGregor (@susanemcg)",
            website: "github/susanemcg"
        },
        options: {
            url: {
              elem: "input",
              type: "string",
              label: "URL"
            },
            function_name: {
              elem: "input",
              type: "string",
              label: "Function Name"
            },
            function_params: {
              elem:"input",
              type:"object",
              label:"function params"
            },
            pause_button_id: {
              elem: "input",
              type: "string",
              label:"pause button id"
            },
            target: "div-id" 
        } 
    },

    _setup : function( options ) {
        var targetDiv = Popcorn.dom.find( options.target );
      
        //flag existence of provided function
        var validFunction = window[options.function_name] ? true : false; 
        
        //make sure that target div and URL or function exist
        if ( targetDiv && (options.url || validFunction) ) { 
         
          // save a reference to the video, for use in function handler
          var videoEl = this; 

          options._container = targetDiv;

          //add basic pointer styling to indicate element is clickable
          targetDiv.style.cursor = "pointer";

          //add click function to div
          targetDiv.addEventListener( "click", function(e){
            
            
            if(options.pause_button_id){
              // if pause_button_id was passed, check for existence of actual div element
              var thePause = Popcorn.dom.find( options.pause_button_id );
              
              if ( thePause ) {
                 
                // if pause button div exists, execute click  
                thePause.click();
              } else {
                console.log( "Pause button with id "+options.pause_button_id+" not found." );
              }
            } else {

              // if using default video controls, simply pause the video
              videoEl.video.pause();
            }

            if ( options.url ) {

              //open provided URL in a new window
              window.open ( options.url,'_blank' );
            }

            if ( options.function_name ) {

              //call provided function, passing click event and any additional parameters
              window[options.function_name]( e, options.function_params );
            }
          });
        
        } else {
          console.log ( "Each caramel instance must reference a url or valid function." );
        }        
     },
   _teardown: function( options ) {
      var targetDiv = Popcorn.dom.find( options.target );
      if ( targetDiv ) {
        targetDiv.removeChild( options._container );
      }
    }
  });

})(Popcorn);