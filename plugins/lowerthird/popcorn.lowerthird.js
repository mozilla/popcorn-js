// PLUGIN: lowerthird
(function ( Popcorn ) {

  /**
   * Lower Third popcorn plug-in
   * Displays information about a speaker over the video, or in the target div
   * Options parameter will need a start, and end.
   * Optional parameters are target, salutation, name and role.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Target is the id of the document element that the content is
   *  appended to, this target element must exist on the DOM
   * salutation is the speaker's Mr. Ms. Dr. etc.
   * name is the speaker's name.
   * role is information about the speaker, example Engineer.
   *
   * @param {Object} options
   *
   * Example:
     var p = Popcorn('#video')
        .lowerthird({
          start:          5,                 // seconds, mandatory
          end:            15,                // seconds, mandatory
          salutation:     'Mr',              // optional
          name:           'Scott Downe',     // optional
          role:           'Programmer',      // optional
          target:         'subtitlediv'      // optional
        } )
   *
   */

  Popcorn.plugin( "lowerthird", {

      manifest: {
        about:{
          name: "Popcorn lowerthird Plugin",
          version: "0.1",
          author: "Scott Downe",
          website: "http://scottdowne.wordpress.com/"
        },
        options:{
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
          target: "lowerthird-container",
          salutation : {
            elem: "input",
            type: "text",
            label: "Salutation",
            "default": "hello",
            optional: true
          },
          name: {
            elem: "input",
            type: "text",
            label: "Name",
            "default": "Popcorn.js"
          },
          role: {
            elem: "input",
            type: "text",
            label: "Role",
            "default": "JavaScript library",
            optional: true
          }
        }
      },

      _setup: function( options ) {

        var target = document.getElementById( options.target );

        // Creates a div for all Lower Thirds to use
        if ( !this.container ) {
          this.container = document.createElement( "div" );

          this.container.style.position = "absolute";
          this.container.style.color = "white";
          this.container.style.textShadow = "black 2px 2px 6px";
          this.container.style.fontSize = "24px";
          this.container.style.fontWeight = "bold";
          this.container.style.paddingLeft = "40px";

          // the video element must have height and width defined
          this.container.style.width = this.video.offsetWidth + "px";
          this.container.style.left = this.position().left + "px";

          this.video.parentNode.appendChild( this.container );
        }

        // if a target is specified, use that
        if ( options.target && options.target !== "lowerthird-container" ) {
          options.container = document.createElement( "div" );

          target && target.appendChild( options.container );
        // use shared default container
        } else {
          options.container = this.container;
        }

      },
      /**
       * @member lowerthird
       * The start function will be executed when the currentTime
       * of the video reaches the start time provided by the
       * options variable
       */
      start: function(event, options){
        options.container.innerHTML = ( options.salutation ? options.salutation + " " : "" ) + options.name + ( options.role ? "<br />" + options.role : "" );
        this.container.style.top = this.position().top + this.video.offsetHeight - ( 40 + this.container.offsetHeight ) + "px";
      },
      /**
       * @member lowerthird
       * The end function will be executed when the currentTime
       * of the video reaches the end time provided by the
       * options variable
       */
      end: function( event, options ) {
        // Empty child nodes
        while ( options.container.firstChild ) {
          options.container.removeChild( options.container.firstChild );
        }
      }

  });
})( Popcorn );
