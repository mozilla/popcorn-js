
var testData = {

  videoSrc: "http://soundcloud.com/corbanbrook/leaving-on-a-spaceship",
  expectedDuration: 242.22,

  createMedia: function( id ) {
    return Popcorn.HTMLSoundCloudAudioElement( id );
  },

  playerSpecificSyncTests: function() {

    // Testing the id property inherited from MediaElementProto
    test( "SoundCloud 01 - id property accessible on wrapper object", 1, function() {

      var video = testData.createMedia( "#video" );

      ok( video.id, "id property on wrapper object isn't null" );
    });

    // Testing the style property inherited from MediaElementProto
    test( "SoundCloud 02 - style property accessible on wrapper object", 1, function() {

      var video = testData.createMedia( "#video" );

      ok( video.style, "Style property on wrapper object isn't null" );
    });

    test( "SoundCloud 03 - canPlaySrc for HTTPS sources", 1, function() {
      var video = testData.createMedia( "#video" );

      ok( video._canPlaySrc( "https://soundcloud.com/user9067901/tone-pad" ), "SoundCloud returns true for HTTPS sources." );
    });
  },

  shortVideoSrc: "http://soundcloud.com/user9067901/tone-pad",
  shortExpectedDuration: 5

};
