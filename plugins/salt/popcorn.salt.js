(function (Popcorn) {
      
   /* Salt Popcorn plugin - as simple and essential as salt
    *
    * Adds the ability to show and hide arbitrary divs according to video timing.
    *
    * @param {Object} options
    *
    * Required parameters: start, end, target.
    *
    * start: the time in seconds when the div should be made visible
    * end: the time in seconds when the visible div should be made invisible
    * target: Is the ID of the element where whose visibility will be toggled. Display style is maintained.
    *
    *
    * Example:
    *
    *   var p = Popcorn('#video')
    *
    *   // Simple salt
    *   .salt({
    *     start: 5, // seconds
    *     end: 15, // seconds
    *     target: 'textdiv' //id of div to show/hide
    *   })
    *
    */  
  
  Popcorn.plugin( "salt" , {
    manifest: {
        about: {
            name: "Salt Popcorn Plugin",
            version: "0.1",
            author: "Susan E. McGregor (@susanemcg)",
            website: "github/susanemcg"
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
            target: "div-id"
        } 
    },

    _setup : function( options ) {
        var targetDiv = Popcorn.dom.find( options.target );

        if ( targetDiv ){
          //get the div element and save a reference to it
          options._container = targetDiv;
          var targetCSS = targetDiv.currentStyle || getComputedStyle(targetDiv,null);
          //remember its original display type
          options._displayType = targetCSS.display;
          //hide it
          options._container.style.display = "none";
        }        
     },
     
    start: function( event, options ){
      //when start time is reached, dispay div with original display type
       options._container.style.display = options._displayType;        
    },

    end: function( event, options ){
      //hide it when it's all over
       options._container.style.display = "none";
     },

   _teardown: function( options ) {
      var targetDiv = Popcorn.dom.find( options.target );
      if ( targetDiv ) {
        targetDiv.removeChild( options._container );
      }
    }
  });

})(Popcorn);