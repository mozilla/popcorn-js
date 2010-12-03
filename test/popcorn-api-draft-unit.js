

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

  ok( "timelines" in popped.data, "instance has `timelines` property" );
  ok( Object.prototype.toString.call(popped.data.timelines) === "[object Array]", "timelines property is an array" )
  
});


test("Popcorn Plugin", function () {

  
  Popcorn.plugin("subtitles", function ( ) {
  
    
    console.log(this);
  
  
  
  });
  
  
  var popped = Popcorn("#video");
  
  
  ok( "subtitles" in popped, "plugin is now available to instance" );
  
  
  
  
  
});


test("Popcorn Events", function () {


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

