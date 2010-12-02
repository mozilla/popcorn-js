// http://www.w3.org/2010/05/video/mediaevents.html

var poppy = popcorn( [ vid_elem_ref | 'id_string' ] );

poppy
  
  // pass-through video control methods
  .load()
  .play()
  .pause()
  
  // property setters
  .currentTime( time ) // skip forward or backwards `time` seconds
  .playbackRate( rate )
  .volume( delta )
  .mute( [ state ] )
  
  // sugar?
  .rewind() // to beginning + stop??
  .loop( [ state ] ) // toggle looping
  
  // queuing (maybe unnecessary):
  
  // enqueue method w/ optional args
  .queue( 'method', args )
  
  // enqueue arbitrary callback
  .queue(function(next){ /* do stuff */ next(); })
  
  // clear the queue
  .clearQueue()
  
  // execute arbitrary code @ time
  poppy.exec( 1.23, function(){
    // exec code
  });

// plugin factory sample
popcorn.plugin( 'myPlugin' [, super_plugin ], init_options );

// call plugin (defined above)
poppy.myPlugin( time, options );


// define subtitle plugin
popcorn.plugin( 'subtitle', {
  
});
  
poppy
  .subtitle( 1.5, {
    html: '<p>SUPER AWESOME MEANING</p>',
    duration: 5
  })
  
  .subtitle({
    start: 1.5,
    end: 6.5,
    html: '<p>SUPER AWESOME MEANING</p>'
  })
  
  .subtitle([
    {
      start: 1.5,
      html: '<p>SUPER AWESOME MEANING</p>'
    },
    {
      start: 2.5,
      end: 3.5,
      html: '<p>OTHER NEAT TEXT</p>'
    }
  ])
  
  .data([
    {
      subtitle: [
        {
          start: 1.5,
          html: '<p>SUPER AWESOME MEANING</p>'
        },
        {
          start: 2.5,
          end: 3.5,
          html: '<p>OTHER NEAT TEXT</p>'
        }
      ]
    }
  ]);

// jQuery-dependent plugin, using $.ajax - extend popcorn.data
popcorn.plugin( 'data', popcorn.data, {
  _setup: function( options ) {
    // called when plugin is first registered (?)
  },
  _add: function( options ) {
    // called when popcorn.data is called
    // this == plugin (?)
    if ( typeof options === 'string' ) {
      $.ajax({
        url: options
        // stuff
      });
    } else {
      return this.super.data.apply( this, arguments );
    }
  }
});
  
poppy.data( '/data.php' ) // data.php returns JSON?

/*
poppy.twitter( dom_elem | 'id_of_dom_elem', options ); // multiple twitters?? FAIL

poppy.twitter( 'load', options ); 
*/

var widget1 = $(dom_elem).twitter( options ); // ui widget factory initializes twitter widget

poppy.jQuery( 5.9, {
  elem: widget1,
  method: 'twitter',
  args: [ 'search', '@cowboy' ]
})

poppy.jQuery( time, selector, methodname [, args... ] );

poppy.jQuery( 5.9, widget1, 'twitter', 'search', '@cowboy' );

poppy.jQuery( 5.9, '.div', 'css', 'color', 'red' );

poppy.jQuery( 5.9, '#form', 'submit' );

// sugar methods for jQuery
$(selector).popcorn( time, methodname [, args... ] );
$(selector).popcorn( time, fn );

// another idea, using jQuery special events api
$(selector).bind( 'popcorn', { time: 5.9 }, function(e){
  $(this).css( 'color', 'red' );
});

// does $.fn[ methodname ].apply( $(selector), args );


