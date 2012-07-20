// PLUGIN: tagthisperson

(function ( Popcorn ) {

  var peopleArray = [];
  // one People object per options.target
  var People = function() {
    this.name = "";
    this.contains = { };
    this.toString = function() {
      var r = [];
      for ( var j in this.contains ) {
        if ( this.contains.hasOwnProperty( j ) ) {
          r.push( " " + this.contains[ j ] );
        }
      }
      return r.toString();
    };
  };

  /**
   * tagthisperson popcorn plug-in
   * Adds people's names to an element on the page.
   * Options parameter will need a start, end, target, image and person.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Person is the name of the person who you want to tag
   * Image is the url to the image of the person - optional
   * href is the url to the webpage of the person - optional
   * Target is the id of the document element that the text needs to be
   * attached to, this target element must exist on the DOM
   *
   * @param {Object} options
   *
   * Example:
     var p = Popcorn('#video')
        .tagthisperson({
          start: 5, // seconds
          end: 15, // seconds
          person: '@annasob',
          image:  'http://newshour.s3.amazonaws.com/photos%2Fspeeches%2Fguests%2FRichardNSmith_thumbnail.jpg',
          href:   'http://annasob.wordpress.com',
          target: 'tagdiv'
        } )
   *
   */
  Popcorn.plugin( "tagthisperson" , ( function() {

    return {

      _setup: function( options ) {
        var exists = false,
            target = document.getElementById( options.target );

        if ( target ) {

          // loop through the existing objects to ensure no duplicates
          // the idea here is to have one object per unique options.target
          for ( var i = 0; i < peopleArray.length; i++ ) {
            if ( peopleArray[ i ].name === options.target ) {
              options._p = peopleArray[ i ];
              exists = true;
              break;
            }
          }
          if ( !exists ) {
            options._p = new People();
            options._p.name = options.target;
            peopleArray.push( options._p );
          }
        }
      },
      /**
       * @member tagthisperson
       * The start function will be executed when the currentTime
       * of the video  reaches the start time provided by the
       * options variable
       */
      start: function( event, options ){
        options._p.contains[ options.person ] = ( options.image ) ? "<img src='" + options.image + "'/> " : "" ;
        options._p.contains[ options.person ] += ( options.href ) ? "<a href='" + options.href + "' target='_blank'> " + options.person + "</a>" : options.person ;

        if ( document.getElementById( options.target ) ) {
          document.getElementById( options.target ).innerHTML = options._p.toString();
        }
      },
      /**
       * @member tagthisperson
       * The end function will be executed when the currentTime
       * of the video  reaches the end time provided by the
       * options variable
       */
      end: function( event, options ){
        delete options._p.contains[ options.person ];

        if ( document.getElementById( options.target ) ) {
          document.getElementById( options.target ).innerHTML = options._p.toString();
        }
      }
   };
  })(),
  {
    about:{
      name: "Popcorn tagthisperson Plugin",
      version: "0.1",
      author: "@annasob",
      website: "annasob.wordpress.com"
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
      target : "tagthisperson-container",
      person: {
        elem: "input",
        type: "text",
        label: "Person's Name",
        "default": "Popcorn.js"
      },
      image: {
        elem: "input",
        type: "url",
        label: "Image URL",
        optional: true
      },
      href: {
        elem: "input",
        type: "url",
        label: "Link",
        optional: true
      }
    }
  });

})( Popcorn );
