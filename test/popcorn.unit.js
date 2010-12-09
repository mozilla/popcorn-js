
module("Popcorn");
test("API", function () {
  
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

test("Utility", function () {
  
  expect(6);
  //  TODO: comprehensive tests for these utilities
  
  equals( typeof Popcorn.forEach, "function" , "Popcorn.forEach is a provided utility function");
  equals( typeof Popcorn.extend, "function" , "Popcorn.extend is a provided utility function");
  equals( typeof Popcorn.error, "function" , "Popcorn.error is a provided utility function");  
  equals( typeof Popcorn.guid, "function" , "Popcorn.guid is a provided utility function");
  equals( typeof Popcorn.sizeOf, "function" , "Popcorn.sizeOf is a provided utility function");
  equals( typeof Popcorn.nop, "function" , "Popcorn.nop is a provided utility function");
  
  
  
  
});


test("Protected", function () {
  
  expect(1);
  //  TODO: comprehensive tests for these utilities
  
  ok( !!Popcorn.protect , "Popcorn.protect exists");
  
  
});




test("Object", function () {

  
  var popped = Popcorn("#video"), 
      methods = "load play pause currentTime mute volume roundTime exec";
  
  
  
  ok( "video" in popped, "instance has `video` property" );
  ok( Object.prototype.toString.call(popped.video) === "[object HTMLVideoElement]", "video property is a HTMLVideoElement" );

  ok( "data" in popped, "instance has `data` property" );
  ok( Object.prototype.toString.call(popped.data) === "[object Object]", "data property is an object" );

  ok( "tracks" in popped.data, "instance has `tracks` property" );
  ok( Object.prototype.toString.call(popped.data.tracks) === "[object Array]", "tracks property is an array" )

  
  popped.play();


  methods.split(/\s+/g).forEach(function (k,v) {

    ok( k in popped, "instance has method: " + k );
    
  });
  
  
});

module("Popcorn Methods");



test("roundTime", function () {
  
  QUnit.reset();
  
  var popped = Popcorn("#video");
  
  popped.play().pause().currentTime( 0.98 );
  
  equals( 1, popped.roundTime(), ".roundTime() returns 1 when currentTime is 0.98s" );


});


test("exec", function () {
  
  QUnit.reset();
  
  var popped = Popcorn("#video"),
      expects = 1, 
      count = 0;

  expect(expects);
  
  function plus(){ 
    if ( ++count == expects ) start(); 
  }
  
  stop(); 
  


  popped.exec( 4, function () {
    
    
    ok(true, "exec function");
    plus();
    
  }).currentTime(3).play();
  
  

});


module("Popcorn Events");

test("Stored By Type", function () {
  
  QUnit.reset();
  
  expect(6)
  
  var p = Popcorn("#video"), 
      count = 0,
      fired = 0, 
      wants = 4
      ;

  function plus(){ 

    if ( ++count == 4 ) {
      
      equals( fired, wants, "Number of callbacks fired from 1 handler" );

      p.unlisten("play");
  
      ok( !p.data.events["play"], "play handlers removed" );
  
      start();
    } 
  }

  stop();  
  
  
  p.listen("play", function () {
    fired++;
    
    ok(true, "Play fired " + fired);
    plus();
  });
      
  p.listen("play", function () {
    fired++;

    ok(true, "Play fired " + fired);    
    plus();
  });

  p.listen("play", function () {
    fired++;

    ok(true, "Play fired " + fired);    
    plus();
  });

  p.listen("play", function () {
    fired++;

    ok(true, "Play fired " + fired);
    plus();
  });
  
  p.trigger("play");
  
  p.unlisten("play");
  
});


test("Simulated", function () {
  
  QUnit.reset();
  
  var p = Popcorn("#video"),
      completed = [];

  
  var expects = Setup.events.length, 
      count = 0;

  expect(expects);
  
  function plus(){ 
    if ( ++count == expects ) start(); 
  }
  
  stop();  
  
  
  Setup.events.forEach(function ( name ) {
    p.listen( name, function (event) {
      
      if ( completed.indexOf(name) === -1 ) {
        ok(true, name + " fired");
        plus();
        
        completed.push(name);
      }
      
      
    });  
  });

  Setup.events.forEach(function ( name ) {
    p.trigger( name );  
  });
  
  
});


test("Real", function () {
  
  QUnit.reset();

  var p = Popcorn("#video"),
      completed = [];                              
  
  
  var expects = 10, 
      count = 0;


  function plus(){ 
    if ( ++count == expects ) start(); 
  }
  
  stop();  
  
  
  Setup.events.forEach(function ( name ) {
    
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

  
  
});

test("Custom", function () {

  var expects = 1, 
      count = 0;
  
  expect(expects);
  
  function plus(){ if ( ++count == expects ) start(); }

  stop();
  
  var p = Popcorn("#video");
  
  
  p.listen("eventz0rz", function ( event ) {
  
    ok( true, "Custom event fired" );
    plus();

  });
  
  p.trigger("eventz0rz");

  
  
});


test("UI/Mouse", function () {

  var expects = 1, 
      count = 0;
  
  expect(expects);
  
  function plus(){ if ( ++count == expects ) start(); }

  stop();
  
  var p = Popcorn("#video");
  
  
  p.listen("click", function ( event ) {
  
    ok( true, "click event fired" );
    plus();

  });
  
  p.trigger("click");

  
  
});

module("Popcorn Plugin")
test("Plugin Factory", function () {
  
  QUnit.reset();
  
  // needs expectation

  var popped = Popcorn("#video"), 
      methods = "load play pause currentTime mute volume roundTime exec",
      expects = 22, 
      count = 0;
  
  //expect(expects);
  
  function plus() { 
    console.log(count);
    if ( ++count == expects ) {
      start(); 
    }
  }

  stop();

  Popcorn.plugin("executor", function () {
    
    return {
      
      start: function () {
        var self = this;

        // These ensure that a popcorn instance is the value of `this` inside a plugin definition

        methods.split(/\s+/g).forEach(function (k,v) {
          ok( k in self, "executor instance has method: " + k );
          
          plus();
        });

        ok( "video" in this, "executor instance has `video` property" );
        plus();
        ok( Object.prototype.toString.call(popped.video) === "[object HTMLVideoElement]", "video property is a HTMLVideoElement" );
        plus();

        ok( "data" in this, "executor instance has `data` property" );
        plus();
        ok( Object.prototype.toString.call(popped.data) === "[object Object]", "data property is an object" );
        plus();

        ok( "tracks" in this.data, "executor instance has `tracks` property" );
        plus();
        ok( Object.prototype.toString.call(popped.data.tracks) === "[object Array]", "executor tracks property is an array" )      
        plus();      
      }, 
      end: function () {
      
      }
    };
  });
 
  ok( "executor" in popped, "executor plugin is now available to instance" );
  plus();
  ok( Popcorn.registry.length === 1, "One item in the registry");
  plus();    
  
  
  
  popped.executor({
    start: 1, 
    end: 2
  });
  
  
  Popcorn.plugin("complicator", {
    
    start: function ( event ) {

      var self = this;

      // These ensure that a popcorn instance is the value of `this` inside a plugin definition

      methods.split(/\s+/g).forEach(function (k,v) {
        ok( k in self, "complicator instance has method: " + k );
        
        plus();
      });

      ok( "video" in this, "complicator instance has `video` property" );
      plus();
      ok( Object.prototype.toString.call(popped.video) === "[object HTMLVideoElement]", "video property is a HTMLVideoElement" );
      plus();

      ok( "data" in this, "complicator instance has `data` property" );
      plus();
      ok( Object.prototype.toString.call(popped.data) === "[object Object]", "complicator data property is an object" );
      plus();

      ok( "tracks" in this.data, " complicatorinstance has `tracks` property" );
      plus();
      ok( Object.prototype.toString.call(popped.data.tracks) === "[object Array]", "complicator tracks property is an array" )      
      plus();
      
    },
    end: function () {
    
      //start();
    
    }, 
    timeupdate: function () {
    }    
  });
  
  
  ok( "complicator" in popped, "complicator plugin is now available to instance" );
  plus();
  ok( Popcorn.registry.length === 2, "Two items in the registry");
  plus();
  
  popped.complicator({
    start: 3, 
    end: 4
  });  


  var breaker = {
    
    start: 0, 
    end: 0
    
  };

  Popcorn.plugin("breaker", {
    
    start: function () {
      
      breaker.start++;
    
      ok(true, "breaker started");
      plus();
    },
    end: function () {
      
      breaker.end++;
    
      ok(true, "breaker started");
      plus();

      
      equals( breaker.start, 1, "plugin start method fires only once");
      plus();
      equals( breaker.end, 1, "plugin end method fires only once");
      plus();
      
      
    } 
  });

  
  popped.breaker({
    start: 1, 
    end: 2
  });      
  
  
  popped.currentTime(0).play();

  
});

test("Protected Names", function () {
  
  //QUnit.reset();
  
  expect(8);

  var popped = Popcorn("#video");

  $.each( "load play pause currentTime playbackRate mute volume duration".split(/\s+/), function (k, name) {
    try {

      Popcorn.plugin( name, {});
    }   catch (e) {

      ok( name, "Attempting to overwrite '" + name + "' threw an exception " );

    };
  });
});



/*


  

  


test("Events Extended", function () {
  
  QUnit.reset();
  
  // needs expectation

  var popped = Popcorn("#video"), 
      expects = 11, 
      count = 0;

  expect(expects);
  // not in full use
  function plus(){ 
    if ( ++count == expects ) start(); 
  }
  
  stop();  
  
  
  Popcorn.plugin("extendedEvents", (function () {
  
    var fired = [];

    var pluginObj = {

      start: function() {

      },
      end: function() {

      }
    };
    
    $.each( Setup.events, function ( k, type ) {
      
      pluginObj[type]  = function (event, opts) {
      
        if ( fired.indexOf(type) === -1 ) {
          fired.push(type);
          
          ok( true, type + " fired" );
          
          plus();
        
        
          
        }
      };
    
    });
    
    return pluginObj;
    
  })());
  
  
  
  
  popped.extendedEvents({
    
    start: 20,
    end: 21
    
  });
  
  
  popped.currentTime(19).play();
  
  $.each( Setup.events, function ( k, type ) {
    
    popped.trigger(type);
      
  });

});
*/

/*
module("Popcorn Video Object")
test("wait()", function () {
  
  //QUnit.reset();
  
  // needs expectation

  var popped = Popcorn("#video"), 
      startat = +new Date();


  
  
  popped.play().wait(2).exec(function () {
    
    console.log( +new Date() - startat );
    
    ok(true)
    
  }).pause();
  
  
});
*/
