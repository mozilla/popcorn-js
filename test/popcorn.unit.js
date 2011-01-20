
module("Popcorn");
test("API", function () {
  
  var expects = 4, 
      count = 0;
  
  expect(expects);
  
  function plus(){ if ( ++count == expects ) start(); }

  stop( 10000 );

  
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
  
  
  try {  
  
    Popcorn(function() { 
    
      ok(1, "Popcorn calls its function argument"); 
      plus();
      
      
    });
    
  } catch (e) {};  

  
});

test("Utility", function () {
  
  expect(7);
  //  TODO: comprehensive tests for these utilities
  
  equals( typeof Popcorn.forEach, "function" , "Popcorn.forEach is a provided utility function");
  equals( typeof Popcorn.extend, "function" , "Popcorn.extend is a provided utility function");
  equals( typeof Popcorn.error, "function" , "Popcorn.error is a provided utility function");  
  equals( typeof Popcorn.guid, "function" , "Popcorn.guid is a provided utility function");
  equals( typeof Popcorn.sizeOf, "function" , "Popcorn.sizeOf is a provided utility function");
  equals( typeof Popcorn.nop, "function" , "Popcorn.nop is a provided utility function");
  equals( typeof Popcorn.addTrackEvent, "function" , "Popcorn.addTrackEvent is a provided utility function");
  
  
  
  
});


test("guid", function () {
  
  expect(6);
  
  var count = 3, 
      guids = [], 
      temp;
  
  for ( var i = 0; i < count; i++ ) {
    
    temp = Popcorn.guid();
    
    if ( i > 0 ) {
      notEqual( temp, guids[ guids.length - 1 ], "Current guid does not equal last guid" );
    } else {
      ok( temp, "Popcorn.guid() returns value" );
    }
    
    guids.push(temp);
  }

  guids = [];
  
  for ( var i = 0; i < count; i++ ) {
    
    temp = Popcorn.guid( "pre" );
    
    if ( i > 0 ) {
      notEqual( temp, guids[ guids.length - 1 ], "Current guid does not equal last guid" );
    } else {
      ok( temp, "Popcorn.guid( 'pre' ) returns value" );
    }
    
    guids.push(temp);
  }  
  
});


test("Protected", function () {
  
  expect(1);
  //  TODO: comprehensive tests for these utilities
  
  ok( !!Popcorn.protect , "Popcorn.protect exists");
  
  
});




test("Object", function () {

  
  var popped = Popcorn("#video"), 
      methods = "load play pause currentTime mute volume roundTime exec removePlugin";
  
  
  
  ok( "video" in popped, "instance has `video` property" );
  ok( Object.prototype.toString.call(popped.video) === "[object HTMLVideoElement]", "video property is a HTMLVideoElement" );

  ok( "data" in popped, "instance has `data` property" );
  ok( Object.prototype.toString.call(popped.data) === "[object Object]", "data property is an object" );

  ok( "trackEvents" in popped.data, "instance has `trackEvents` property" );
  ok( Object.prototype.toString.call(popped.data.trackEvents) === "[object Object]", "trackEvents property is an object" )

  
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
      expects = 2, 
      count = 0;

  expect(expects);
  
  function plus(){ 
    if ( ++count == expects ) start(); 
  }
  
  stop( 10000 ); 
  


  popped.exec( 4, function () {
    
    
    ok(true, "exec callback fired");
    plus();
    
    
    equal( popped.data.events.timeupdate, null, "exec callback removed");
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
      wants = 4;

  function plus(){ 

    if ( ++count === 4 ) {
      
      equals( fired, wants, "Number of callbacks fired from 1 handler" );

      p.unlisten("play");
  
      ok( !p.data.events["play"], "play handlers removed" );
  
      start();
    } 
  }

  stop( 10000 );  
  
  
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

  if (fired < 4) {
    start();
  }
  
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
  
  stop( 10000 );  
  
  
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
  
  
  var expects = 5, 
      count = 0;


  function plus(){ 
    if ( ++count == expects ) start(); 
  }
  
  stop( 10000 );  
  
  
  [ "play", "pause", "volumechange", "seeking", "seeked" ].forEach(function ( name ) {
    
    p.listen( name, function (event) {
    
      if ( completed.indexOf(name) === -1 ) {
        ok(true, name + " fired");
        plus();
        
        completed.push(name);
      }
      
      
    });  
  });


  
  p.pause();
  
  p.play();
  
  p.volume(0.9);
  
  p.currentTime(49);

  
  
});

test("Custom", function () {

  var expects = 1, 
      count = 0;
  
  expect(expects);
  
  function plus(){ if ( ++count == expects ) start(); }

  stop( 10000 );
  
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

  stop( 10000 );
  
  var p = Popcorn("#video");
  
  
  p.listen("click", function ( event ) {
  
    ok( true, "click event fired" );
    plus();

  });
  
  p.trigger("click");

  
  
});

module("Popcorn Plugin")
test("Manifest", function () {



  var p = Popcorn("#video"),                         
      expects = 5,
      run = 1,  
      count   = 0;

  function plus() {
    if ( ++count === expects ) {
      start(); 
      // clean up added events after tests
      p.removePlugin("footnote");
    }
  }
  
  stop( 10000 );
  Popcorn.plugin( "footnote" , (function(){
      
    return {
      manifest: {
        about:{
          name: "Popcorn Manifest Plugin",
          version: "0.0",
          author: "Rick Waldron",
          website: ""
        },
        options: {
          start   : { elem:'input', type:'text', label:'In' },
          end     : { elem:'input', type:'text', label:'Out' },
          text    : { elem:'input', type:'text', label:'Manifest Text' }, 
          target  : 'text-container'
        }
      },    
      _setup: function( options ) {
        ok( options.target, "`options.target exists`" );
        plus();
         
        if ( run === 2 ) {
          equals( options.target, 'custom-target', "Uses custom target if one is specified" );
          plus();
        }         

        if ( run === 1 ) {
          equals( options.target, 'text-container', "Uses manifest target by default" );
          plus();
          
          run++; 
        }
      },
      start: function(event, options){
      },

      end: function(event, options){

      }
      
    };
    
  })());
  
  
  expect(expects);
  
  equal( Popcorn.sizeOf( Popcorn.manifest ), 1, "One manifest stored" );
  plus();
  
  // add more tests
  
  p.footnote({});
  
  p.footnote({
    target: "custom-target"
  })
  
  
});

test("Update Timer", function () {

  QUnit.reset();

  var p2 = Popcorn("#video"),                         
      expects = 4, 
      count   = 0,
      // These make sure events are only fired once
      // any second call will produce a failed test
      forwardStart  = false,
      forwardEnd    = false,
      backwardStart = false,
      backwardEnd   = false;

  function plus() {
    if ( ++count === expects ) {
      start(); 
      // clean up added events after tests
      p2.removePlugin("forwards");
      p2.removePlugin("backwards");
    }
  }
  
  stop( 10000 );  

  Popcorn.plugin("forwards", function () {
    return {
      start: function () {
        forwardStart = !forwardStart;
        ok( forwardStart, "forward's start fired");
        plus();
      },
      end: function () {
        forwardEnd = !forwardEnd;
        p2.currentTime(1).play();
        ok( forwardEnd, "forward's end fired");
        plus();
      }
    };
  });

  p2.forwards({
    start: 3, 
    end: 4
  });

  Popcorn.plugin("backwards", function () {
    return {
      start: function () {
        backwardStart = !backwardStart;
        p2.currentTime(0).play();
        ok( true, "backward's start fired");
        plus();
      },
      end: function () {
        backwardEnd = !backwardEnd;
        ok( backwardEnd, "backward's end fired");
        plus();
      }
    };
  });

  p2.backwards({
    start: 1, 
    end: 2
  });

  p2.currentTime(3).play();

});

test("Plugin Factory", function () {
  
  QUnit.reset();
  
  // needs expectation

  var popped = Popcorn("#video"), 
      methods = "load play pause currentTime mute volume roundTime exec removePlugin",
      expects = 24, 
      count = 0;
  
  //expect(expects);
  
  function plus() { 
    if ( ++count == expects ) {
      start(); 
    }
  }

  stop( 10000 );

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

        ok( "trackEvents" in this.data, "executor instance has `trackEvents` property" );
        plus();
        ok( Object.prototype.toString.call(popped.data.trackEvents) === "[object Object]", "executor trackEvents property is an object" )      
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

      ok( "trackEvents" in this.data, " complicatorinstance has `trackEvents` property" );
      plus();
      ok( Object.prototype.toString.call(popped.data.trackEvents) === "[object Object]", "complicator trackEvents property is an object" )      
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
    
      ok(true, "breaker ended");
      plus();

      
      equals( breaker.start, 1, "plugin start method fires only once");
      plus();
      equals( breaker.end, 1, "plugin end method fires only once");
      plus();
      
      
    } 
  });

  ok( "breaker" in popped, "breaker plugin is now available to instance" );
  plus();
  ok( Popcorn.registry.length === 3, "Three items in the registry");
  plus();
  
  popped.breaker({
    start: 1, 
    end: 2
  });     

  popped.currentTime(0).play();
});

test("removePlugin", function () {
  
  expect(10);
  
  var p = Popcorn("#video"), 
      rlen = Popcorn.registry.length;
  
  equals( rlen, 3, "Popcorn.registry.length is 3");
  
  
  equals( p.data.trackEvents.byStart.length, 2, "p.data.trackEvents.byStart is initialized and has 2 entries");
  equals( p.data.trackEvents.byEnd.length, 2, "p.data.trackEvents.byEnd is initialized and has 2 entries");
  
  p.breaker({
    start: 2, 
    end: 30
  });     
  
  equals( p.data.trackEvents.byStart.length, 3, "p.data.trackEvents.byStart is updated and has 3 entries");
  equals( p.data.trackEvents.byEnd.length, 3, "p.data.trackEvents.byEnd is updated and has 3 entries");
  
  
  p.removePlugin("breaker");
  
  
  ok( !("breaker" in p), "breaker plugin is no longer available to instance" );
  ok( !("breaker" in Popcorn.prototype), "breaker plugin is no longer available to Popcorn.prototype" );
  
  
  equals( Popcorn.registry.length, 2, "Popcorn.registry.length is 2");
  
  equals( p.data.trackEvents.byStart.length, 2, "p.data.trackEvents.byStart is updated and has 2 entries");
  equals( p.data.trackEvents.byEnd.length, 2, "p.data.trackEvents.byEnd is updated and has 2 entries");
  
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

module("Popcorn TrackEvents");
test("Functions", function () {

  //  TODO: break this into sep. units per function
  expect(19);
  
  var popped = Popcorn("#video"), ffTrackId, rwTrackId, rw2TrackId, rw3TrackId, historyRef, trackEvents;
  

  Popcorn.plugin("ff", function () {
    return {
      start: function () {},
      end: function () {}
    };
  });

  popped.ff({
    start: 3, 
    end: 4
  });
  
  
  ffTrackId = popped.getLastTrackEventId();
  
  

  Popcorn.plugin("rw", function () {
    return {
      start: function () {},
      end: function () {}
    };
  });

  popped.rw({
    start: 1, 
    end: 2
  });  
  
  
  rwTrackId = popped.getLastTrackEventId();
  
  historyRef = popped.data.history;
  
  
  equals( historyRef.length, 2, "2 TrackEvents in history index");
  
  equals( popped.data.trackEvents.byStart.length, 4, "4 TrackEvents in popped.data.trackEvents.byStart ");
  equals( popped.data.trackEvents.byEnd.length, 4, "4 TrackEvents in popped.data.trackEvents.byEnd ");
  
  
  trackEvents = popped.getTrackEvents();
  
  equals( trackEvents.length, 2, "2 user created trackEvents returned by popped.getTrackEvents()" )
  

  ok( ffTrackId !== rwTrackId, "Track Events have different ids" );
  
  popped.removeTrackEvent( rwTrackId );
  
  equals( popped.data.history.length, 1, "1 TrackEvent in history index - after popped.removeTrackEvent( rwTrackId ); ");
  equals( popped.data.trackEvents.byStart.length, 3, "3 TrackEvents in popped.data.trackEvents.byStart ");
  equals( popped.data.trackEvents.byEnd.length, 3, "3 TrackEvents in popped.data.trackEvents.byEnd ");  
  
  trackEvents = popped.getTrackEvents();
  
  equals( trackEvents.length, 1, "1 user created trackEvents returned by popped.getTrackEvents()" )

  popped.rw({
    start: 1, 
    end: 2
  });  
  
  
  rw2TrackId = popped.getLastTrackEventId();
  
  equals( popped.data.history.length, 2, "2 TrackEvents in history index - after new track added ");
  
  
  ok( rw2TrackId !== rwTrackId, "rw2TrackId !== rwTrackId" );
  
  equals( popped.data.trackEvents.byStart.length, 4, "4 TrackEvents in popped.data.trackEvents.byStart  - after new track added");
  equals( popped.data.trackEvents.byEnd.length, 4, "4 TrackEvents in popped.data.trackEvents.byEnd  - after new track added");  
  
  
  trackEvents = popped.getTrackEvents();
  
  equals( trackEvents.length, 2, "2 user created trackEvents returned by popped.getTrackEvents()" )
  
  
  popped.rw({
    id: "my-track-id", 
    start: 3, 
    end: 10
  });  
  
  rw3TrackId = popped.getLastTrackEventId();
  
  equals( popped.data.history.length, 3, "3 TrackEvents in history index - after new track added ");
  equals( popped.data.trackEvents.byStart.length, 5, "5 TrackEvents in popped.data.trackEvents.byStart  - after new track added");
  equals( popped.data.trackEvents.byEnd.length, 5, "5 TrackEvents in popped.data.trackEvents.byEnd  - after new track added");  
  
  equals( rw3TrackId, "my-track-id", "TrackEvent has user defined id");
  
  trackEvents = popped.getTrackEvents();
  
  equals( trackEvents.length, 3, "3 user created trackEvents returned by popped.getTrackEvents()" )  
  

  
  
});

test("Index Integrity", function () {
  
  
  
  var trackLen, hasrun = false, lastrun = false;
  
  
  Popcorn.plugin("ff", function () {
    return {
      start: function () {
        var div = document.createElement('div');
        div.id = "index-test";
        div.innerHTML = "foo";
        
        document.body.appendChild(div);
      },
      end: function () {
        document.getElementById('index-test').parentNode.removeChild(document.getElementById('index-test'));
      }
    };
  });
  
  
  var p = Popcorn("#video");
  
  p.ff({
    id: "removeable-track-event",
    start: 40, 
    end: 41
  });
  
  p.currentTime(40).pause();  
  
  stop( 10000 );
  
  equals(p.data.trackEvents.endIndex, 0, "p.data.trackEvents.endIndex is 0");
  equals(p.data.trackEvents.startIndex, 0, "p.data.trackEvents.startIndex is 0");
  equals(p.data.trackEvents.byStart.length, 3, "p.data.trackEvents.byStart.length is 3 - before play" );
  
  
  
  
  p.listen("timeupdate", function () {
  
    if ( p.roundTime() > 40 && p.roundTime() < 42 && !hasrun ) {
    }
    
    if ( p.roundTime() > 40 && p.roundTime() < 42 && hasrun && !lastrun ) {
      
      lastrun = true;
      
      equals( document.getElementById('index-test'), null, "document.getElementById('index-test') is null on second run - after removeTrackEvent" );
      
      start();
    }
    
    if ( p.roundTime() >= 42 && !hasrun ) {
      
      hasrun  = true;
      p.pause();
      
      equals(p.data.trackEvents.byStart.length, 3, "p.data.trackEvents.byStart.length is 3 - after play, before removeTrackEvent" );
      equals(p.data.trackEvents.startIndex, 2, "p.data.trackEvents.startIndex is 2 - after play, before removeTrackEvent");      
      equals(p.data.trackEvents.endIndex, 2, "p.data.trackEvents.endIndex is 2 - after play, before removeTrackEvent");
      

      
      p.removeTrackEvent("removeable-track-event");
      
      equals(p.data.trackEvents.byStart.length, 2, "p.data.trackEvents.byStart.length is 2 - after removeTrackEvent" );
      equals(p.data.trackEvents.startIndex, 1, "p.data.trackEvents.startIndex is 1 - after removeTrackEvent");
      equals(p.data.trackEvents.endIndex, 1, "p.data.trackEvents.endIndex is 1 - after removeTrackEvent");
      
      
      
      p.currentTime(40).play();
      
      
      
    }
  });
  
  p.play();

  
});




module("Popcorn XHR");
test("Basic", function () {
  
  expect(2);
  
  equals( typeof Popcorn.xhr, "function" , "Popcorn.xhr is a provided utility function");
  equals( typeof Popcorn.xhr.httpData, "function" , "Popcorn.xhr.httpData is a provided utility function");
  

});

test("Text Response", function () {

  var expects = 2, 
      count = 0;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  stop()

  Popcorn.xhr({
    url: 'data/test.txt', 
    success: function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      equals( data.text, "This is a text test", "test.txt returns the string 'This is a text test'");
      plus();
      
    }
  });
});

test("dataType: Text Response", function () {

  var expects = 2, 
      count = 0;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  stop()

  Popcorn.xhr({
    url: 'data/test.txt', 
    dataType: "text",
    success: function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      equals( data, "This is a text test", "dataType: 'text', test.txt returns the string 'This is a text test'");
      plus();
      
    }
  });
});


test("JSON Response", function () {

  var expects = 2, 
      count = 0;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  stop()


  var testObj = { "data": {"lang": "en", "length": 25} };  

  Popcorn.xhr({
    url: 'data/test.js', 
    success: function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      
      ok( QUnit.equiv(data.json, testObj) , "data.json returns an object of data");
      plus();
      
    }
  });

});


test("dataType: JSON Response", function () {

  var expects = 2, 
      count = 0;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  stop()


  var testObj = { "data": {"lang": "en", "length": 25} };  

  Popcorn.xhr({
    url: 'data/test.js', 
    dataType: "json",
    success: function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      
      ok( QUnit.equiv(data, testObj) , "dataType: 'json',  data returns an object of data");
      plus();
      
    }
  });

});

test("JSONP Response", function () {

  var expects = 6, 
      count = 0;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  stop();


  var testObj = { "data": {"lang": "en", "length": 25} };  

  Popcorn.xhr({
    
    url: 'data/jsonp.json?callback=jsonp',
    dataType: 'jsonp', 
    success: function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      
      
      ok( QUnit.equiv(data, testObj) , "Popcorn.xhr({}) data.json returns an object of data");
      plus();
      
    }
  });

  Popcorn.xhr.getJSONP(
    'data/jsonp.json?callback=jsonp',

    function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      
      
      ok( QUnit.equiv(data, testObj) , "Popcorn.xhr.getJSONP data.json returns an object of data");
      plus();
      
    }
  );
  

  Popcorn.xhr.getJSONP(
    'data/jsonp.json',

    function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      
      
      ok( QUnit.equiv(data, testObj) , "Popcorn.xhr.getJSONP data.json returns an object of data");
      plus();
      
    }
  );  

});

test("XML Response", function () {

  var expects = 2, 
      count = 0;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  stop()


  Popcorn.xhr({
    url: 'data/test.xml', 
    success: function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      var parser = new DOMParser(), 
      xml = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><dashboard><locations class="foo"><location for="bar"><infowindowtab> <tab title="Location"><![CDATA[blabla]]></tab> <tab title="Users"><![CDATA[blublu]]></tab> </infowindowtab> </location> </locations> </dashboard>',"text/xml");
      
      
      equals( data.xml.toString(), xml.toString(), "data.xml returns a document of xml");
      plus();
      
    }
  });

});

test("dataType: XML Response", function () {

  var expects = 2, 
      count = 0;
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  stop()


  Popcorn.xhr({
    url: 'data/test.xml', 
    dataType: "xml",
    success: function( data ) {
      
      ok(data, "xhr returns data");
      plus();
      
      var parser = new DOMParser(), 
      xml = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><dashboard><locations class="foo"><location for="bar"><infowindowtab> <tab title="Location"><![CDATA[blabla]]></tab> <tab title="Users"><![CDATA[blublu]]></tab> </infowindowtab> </location> </locations> </dashboard>',"text/xml");
      
      
      equals( data.toString(), xml.toString(), "dataType: 'xml', data.xml returns a document of xml");
      plus();
      
    }
  });

});


module("Popcorn Parser");

test("Parsing Functions", function () {

  var expects = 3,
      count = 0,
      popperly = Popcorn("#video");
      
  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }
  
  expect(expects);
  
  stop( 10000 );

  ok(typeof Popcorn.parser === "function", "Popcorn.parser is a function");
  plus();

  Popcorn.parser( "parseJSON" , "json", function( data ){
    return data.json;
  });

  ok(typeof popperly.parseJSON === "function", "Popcorn.parser created a parseJSON function");
  plus();

  ok(typeof popperly.parseJSON().parseJSON("data/test.js").parseJSON === "function" , "parseJSON function is chainable");
  plus();

});

test("Parsing Integrity", function () {

  var expects = 2,
      count = 0,
      timeOut = 0,
      interval,
      poppercore = Popcorn( "#video" );
      
  function plus() {
    if ( ++count === expects ) {
      start();
      // clean up added events after tests
      clearInterval( interval );
      poppercore.removePlugin( "parserTest" );
    }
  }
  
  expect(expects);
  
  stop( 10000 );

  Popcorn.parser( "parseJSON2" , "json", function( data ){
    return data.json;
  });

  Popcorn.plugin("parserTest", {
    
    start: function () {
      ok(true, "parserTest started");
      plus();
    },
    end: function () {
      ok(true, "parserTest ended");
      plus();
    }
  });

  poppercore.parseJSON2("data/parserData.json");

  // interval used to wait for data to be parsed
  interval = setInterval( function() {
    poppercore.currentTime(5).play().currentTime(6);
  }, 2000);

});



module("Popcorn Test Runner End");
test("Last Check", function () {
  
  //   ALWAYS RUN LAST
  
  expect(1)
  try {  
    
    equals( Setup.getGlobalSize(), Setup.globalSize + 1 , "Popcorn API did not leak");
    plus();
    
  } catch (e) {};
  
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
  
  stop( 10000 );  
  
  
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
