test("Popcorn API", function () {
  
  var expects = 3, 
      count = 0;
  
  expect(expects);
  
  function plus(){ if ( ++count == expects ) start(); }

  stop();

  
  try {
    
    ok( Popcorn, "Popcorn exists");
    plus();
    
  } catch (e) {};
    
  
  try {
    
    ok( typeof Popcorn === "function", "Popcorn is a function");
    plus();
    
  } catch (e) {};
  
  try {  
    
    equals( Setup.getGlobalSize(), Setup.globalSize + 1 , "Popcorn API creates only 1 global reference");
    plus();
    
  } catch (e) {};

  
});

test("Popcorn Utility", function () {
  
  equals( typeof Popcorn.forEach, "function" , "Popcorn.forEach is a provided utility function");
  equals( typeof Popcorn.extend, "function" , "Popcorn.extend is a provided utility function");

});


test("Popcorn Object", function () {

  
  var popped = Popcorn("#video"), 
      methods = "load play pause currentTime mute volume";
  
  //console.log(popped);
  
  popped.play();

  methods.split(/\s+/g).forEach(function (k,v) {

    ok( k in popped, "instance has method: " + k );

  });

  ok( "video" in popped, "instance has `video` property" );
  ok( Object.prototype.toString.call(popped.video) === "[object HTMLVideoElement]", "video property is a HTMLVideoElement" );

  ok( "data" in popped, "instance has `data` property" );
  ok( Object.prototype.toString.call(popped.data) === "[object Object]", "data property is an object" );

  ok( "tracks" in popped.data, "instance has `tracks` property" );
  ok( Object.prototype.toString.call(popped.data.tracks) === "[object Array]", "tracks property is an array" )
  
});


test("Popcorn Plugin", function () {
  
  
  // needs expectation

  var popped = Popcorn("#video"), 
      methods = "load play pause currentTime mute volume";
  
  
  Popcorn.plugin("subtitles", function ( ) {
    
    var self = this;
    
    // These ensure that a popcorn instance is the value of `this` inside a plugin definition
    
    methods.split(/\s+/g).forEach(function (k,v) {
      ok( k in self, "instance has method: " + k );
    });

    ok( "video" in this, "instance has `video` property" );
    ok( Object.prototype.toString.call(popped.video) === "[object HTMLVideoElement]", "video property is a HTMLVideoElement" );

    ok( "data" in this, "instance has `data` property" );
    ok( Object.prototype.toString.call(popped.data) === "[object Object]", "data property is an object" );

    ok( "tracks" in this.data, "instance has `tracks` property" );
    ok( Object.prototype.toString.call(popped.data.tracks) === "[object Array]", "tracks property is an array" )
  });
  
  
  
  
  ok( "subtitles" in popped, "plugin is now available to instance" );
  
  popped.subtitles();
  
  
  ok( Popcorn.registry.length === 1, "One item in the registry");
  
});

test("Popcorn Events Stored By Type", function () {
  
  expect(6)
  
  var p = Popcorn("#video"), 
      count = 0,
      fired = 0
      ;

  function plus(){ 
    if ( ++count == 4 ) {
      
      if ( fired === 4 ) {
        ok( true, fired + " callbacks fired from 1 handler" );
      }
      else {
        ok( false, fired + " callbacks fired - CHECK HANDLERS" );
      }

      p.unlisten("play");
  
      ok( !p.data.events["play"], "play handlers removed" );
  
      start();
    } 
  }

  stop();  
  
  
  p.listen("play", function () {
    fired++;
    
    ok(true, "Play fired");
    plus();
  });
      
  p.listen("play", function () {
    fired++;

    ok(true, "Play fired");    
    plus();
  });

  p.listen("play", function () {
    fired++;

    ok(true, "Play fired");    
    plus();
  });

  p.listen("play", function () {
    fired++;

    ok(true, "Play fired");
    plus();
  });
  
  p.trigger("play");
  

  
});


test("Popcorn Events Simulated", function () {

  var p = Popcorn("#video"),
      completed = [], 
      eventtest = "loadstart progress suspend emptied stalled play pause " + 
                  "loadedmetadata loadeddata waiting playing canplay canplaythrough " + 
                  "seeking seeked timeupdate ended ratechange durationchange volumechange", 
      events = eventtest.split(/\s+/g);                              

  
  var expects = events.length, 
      count = 0;

  expect(expects);
  
  function plus(){ 
    if ( ++count == expects ) start(); 
  }
  
  stop();  
  
  
  events.forEach(function ( name ) {
    p.listen( name, function (event) {
      
      if ( completed.indexOf(name) === -1 ) {
        ok(true, name + " fired");
        plus();
        
        completed.push(name);
      }
      
      
    });  
  });

  events.forEach(function ( name ) {
    p.trigger( name );  
  });
  
  
});


test("Popcorn Events Real", function () {


  var p = Popcorn("#video"),
      completed = [], 
      eventtest = "loadstart progress suspend emptied stalled play pause " + 
                        "loadedmetadata loadeddata waiting playing canplay canplaythrough " + 
                        "seeking seeked timeupdate ended ratechange durationchange volumechange", 
      events = eventtest.split(/\s+/g);                              
  
  
  var expects = events.length, 
      count = 0;

  //expect(expects);
  // not in full use
  function plus(){ 
    if ( ++count == expects ) start(); 
  }
  
  stop();  
  
  
  events.forEach(function ( name ) {
    p.listen( name, function (event) {
      
      if ( completed.indexOf(name) === -1 ) {
        ok(true, name + " fired");
        plus();
        
        completed.push(name);
      }
      
      
    });  
  });


  
  p.pause();
  
  p.mute(true);
  
  p.play();
  
  p.volume(0.9);
  
  p.currentTime(49);

  
  
  
  setTimeout(function() {
  
    //console.log(completed);
  
    start();
    
  }, 5000);
  
  
  
});

