QUnit.config.reorder = false;

module( "Player events" );
asyncTest( "loadstart", 1, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "loadstart", function() {
      ok( true, "loadstart fired" );
      p.destroy();
      start();
    });
});

asyncTest( "durationchange", 1, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "durationchange", function() {
      ok( true, "durationchange fired" );
      p.destroy();
      start();
    });
});

asyncTest( "loadedmetadata", 1, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "loadedmetadata", function() {
      ok( true, "loadedmetadata fired" );
      p.destroy();
      start()
    });
});

asyncTest( "loadeddata", 1, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "loadeddata", function() {
      ok( true, "loadeddata fired" );
      p.destroy();
      start()
    });
});

asyncTest( "canplay", 1, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "canplay", function() {
      ok( true, "canplay fired" );
      p.destroy();
      start()
    });
});

asyncTest( "progress", 1, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "progress", function() {
      ok( true, "progress fired" );
      p.destroy();
      start()
    })
    .play();
});

asyncTest( "play", 3, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "play", function() {
      ok( true, "play fired" );
      ok( !this.paused(), "paused attribute is false" );
      p.destroy();
      start()
    });

  ok( p.paused(), "paused attribute is true" );
  p.play();
});

asyncTest( "timeupdate", 1, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "timeupdate", function() {
      ok( true, "timeupdate fired" );
      p.destroy();
      start()
    })
    .play();
});

asyncTest( "pause", 3, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "play", function() {
      this.pause();
    })
    .on( "pause", function() {
      ok( true, "pause fired" );
      ok( this.paused(), "paused attribute is true" );
      p.destroy();
      start()
    });

  ok( p.paused(), "paused attribute is true" );
  p.play();
});

asyncTest( "ended", 6, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "ended", function() {
      ok( true, "ended fired" );
      ok( this.media.ended, "ended is false after ended event" );
      ok( this.paused(), "paused attribute is true" );
      p.on( "seeked", function() {
        ok( !this.media.ended, "ended is false after seeking" );
        p.destroy();
        start();
      })
      .off( "ended" )
      .off( "play" )
      .currentTime( 0 );
    })
    .on( "play", function() {
      this.currentTime( this.duration() - 2 );
    });

  ok( p.paused(), "paused attribute is true" );
  ok( !p.media.ended, "ended is false before playback" );
  p.play();
});

asyncTest( "volumechange (volume)", 3, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "volumechange", function() {
      ok( true, "volumechange fired" );
      equal( 0.5, this.volume(), "volume attribute was set to 0.5" );
      p.destroy();
      start()
    });

  equal( p.volume(), 1, "volume attribute is intially 1" );
  p.volume( 0.5 );
});

asyncTest( "volumechange (mute)", 4, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "volumechange", function() {
      ok( true, "volumechange fired" );
      ok( this.muted(), "muted attribute is true" );
      equal( 1, this.volume(), "volume attribute is 1" );
      p.destroy();
      start()
    });

  ok( !p.muted(), "muted attribute is false" );
  p.mute();
});

asyncTest( "seeking and seeked from start", 5, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .on( "loadedmetadata", function() {
      this.currentTime( 5 );
    })
    .on( "seeking", function() {
      ok( true, "seeking fired" );
      ok( this.seeking(), "seeking attribute is true" );
    })
    .on( "seeked", function() {
      ok( true, "seeked fired" );
      ok( !this.seeking(), "seeking attribute is false" );
      p.destroy();
      start()
    });

  ok( !p.seeking(), "seeking attribute is false" );
});

asyncTest( "seeking and seeked from buffer", 5, function() {
  var p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811" )
    .cue( 1, function() {
      this.pause();
      this.currentTime( 0 );
    })
    .on( "seeking", function() {
      ok( true, "seeking fired" );
      ok( this.seeking(), "seeking attribute is true" );
    })
    .on( "seeked", function() {
      ok( true, "seeked fired" );
      ok( !this.seeking(), "seeking attribute is false" );
      p.destroy();
      start()
    });

  ok( !p.seeking(), "seeking attribute is false" );
  p.play();
});

module( "Options" );
asyncTest( "URL Options Check", 1, function() {
  var options = {
        title: 0,
        byline: 0,
        portrait: 0,
        color: 333,
        autoplay: 1,
        loop: 1
      },
      p = Popcorn.vimeo( "#player", "http://player.vimeo.com/video/11336811?title=0&byline=0&portrait=0&color=333&autoplay=1&loop=1" );

  p.on( "loadstart", function() {
    var iframe = document.querySelector( "#player iframe" ).src.match( /\?(.*)$/ )[1].split("&");
    var reflected = {};

    iframe.forEach( function( value, index, array ) {
      var pair = value.split( "=" );
      reflected[ pair[ 0 ] ] = +pair[1];
    });
    delete reflected.api;
    delete reflected.player_id;

    deepEqual( options, reflected, "Vimeo options passed by Vimeo URL are reflected in URL" );

    p.destroy();
    start();
  });
});

module( "URLs" );
asyncTest( "Known good short URL", 1, function() {

  var url = "http://vimeo.com/11336811",
      expected = "http://player.vimeo.com/video/11336811",
      p = Popcorn.vimeo( "#player", url ).on( "error", function() {
        ok( false, "Vimeo failed to load short URL" );
        p.destroy();
        start();
      })
      .on( "loadstart", function() {
        ok( true, "Vimeo loaded short URL" );
        p.destroy();
        start();
      });
});

asyncTest( "Known bad URL", 1, function() {
  var url = "http://google.com",
      expected = "",
      p = Popcorn.vimeo( "#player", url )
      .on( "error", function() {
        ok( true, "Vimeo failed to load bad URL" );
        p.destroy();
        start();
      })
      .on( "loadstart", function() {
        ok( false, "Vimeo loaded bad URL" );
        p.destroy();
        start();
      });
});

module( "Display attributes" );
asyncTest( "Width and Height", 2, function() {

  var p = Popcorn.vimeo( "#player", "http://vimeo.com/11336811" )
    .on( "loadedmetadata", function() {
      var elem = document.querySelector( "#player iframe" );
      equal( this.media.width, elem.width, "The media object has the correct width" );
      equal( this.media.width, elem.width, "The media object has the correct width" );
      p.destroy();
      start();
    });
});
