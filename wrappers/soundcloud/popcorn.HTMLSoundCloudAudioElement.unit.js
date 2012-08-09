
var testData = {

  videoSrc: "http://soundcloud.com/corbanbrook/leaving-on-a-spaceship",
  expectedDuration: 242.22,

  createMedia: function( id ) {
    return Popcorn.HTMLSoundCloudAudioElement( id );
  },

  shortVideoSrc: "http://soundcloud.com/user9067901/tone-pad",
  shortExpectedDuration: 5

};
