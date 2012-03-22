module( "Core" );
test( "Core", function() {

  var expects = 3;

  expect( expects );

  try {
    ok( Popcorn, "Popcorn exists" );
  } catch ( e ) {};

  try {
    ok( typeof Popcorn === "function", "Popcorn is a function" );
  } catch ( e ) {};

  try {
    Popcorn( function() {
      ok( 1, "Popcorn calls its function argument" );
    });
  } catch ( e ) {};
});

test( "noConflict", function() {

  expect( 6 );

  ok( Popcorn.noConflict, "Popcorn.noConflict exists" );
  equal( typeof Popcorn.noConflict, "function", "Popcorn.noConflict is a function" );

  var $$ = Popcorn;

  deepEqual( Popcorn, Popcorn.noConflict(), "noConflict returned the Popcorn object" );
  deepEqual( Popcorn, $$, "Make sure Popcorn wasn't touched." );


  Popcorn = $$;

  deepEqual( Popcorn.noConflict( true ), $$, "noConflict returned the Popcorn object" );
  deepEqual( Popcorn, originalPopcorn, "Make sure Popcorn was reverted." );

  Popcorn = $$;
});

test( "isSupported", function() {

  expect( 2 );

  ok( "isSupported" in Popcorn, "Popcorn.isSupported boolean flag exists" );
  ok( Popcorn.isSupported, "Popcorn.isSupported boolean flag is true" );
});

test( "Popcorn.* Static Methods", function() {

  var statics = [ "forEach", "extend", "error", "guid", "sizeOf", "nop",
                  "addTrackEvent", "removeTrackEvent", "getTrackEvents", "getTrackEvent", "position", "disable", "enable", "timeUpdate" ],
    substatics = [ "addTrackEvent", "removeTrackEvent", "getTrackEvents", "getTrackEvent" ];

  expect( statics.length + substatics.length );

  statics.forEach(function( val, idx ) {

    equal( typeof Popcorn[ val ], "function" , "Popcorn." + val + "() is a provided static function" );
  });

  substatics.forEach(function( val, idx ) {

    equal( typeof Popcorn[ val ].ref, "function" , "Popcorn." + val + ".ref() is a private use static function" );
  });
});

test( "Popcorn.error", function() {

  expect( 2 );
  equal( typeof Popcorn.error, "function", "Popcorn.error() is a provided static function" );

  try{
    Popcorn.error( "This is a Popcorn error" );
  }
  catch( e ) {
    equal( e.message, "This is a Popcorn error", "Popcorn.error throwing custom error messages" );
  }
});

test( "Popcorn.sizeOf", function() {

  expect( 6 );

  equal( typeof Popcorn.sizeOf, "function", "Popcorn.sizeOf() is a provided static function" );

  equal( Popcorn.sizeOf([ "a", "b", "c" ]), 3, "Popcorn.sizeOf working with arrays" );

  equal( Popcorn.sizeOf([ ]), 0, "Popcorn.sizeOf working with empty arrays" );

  equal( Popcorn.sizeOf({ a: 1, b: "test" }), 2, "Popcorn.sizeOf working with objects" );

  equal( Popcorn.sizeOf({ }), 0, "Popcorn.sizeOf working with empty objects" );

  equal( Popcorn.sizeOf(), 0, "Popcorn.sizeOf safely handling no parameter being passed in" );
});

test( "Popcorn.nop", function() {

  expect( 2 );

  equal( typeof Popcorn.nop, "function", "Popcorn.nop is a provided static function" );

  equal( typeof Popcorn.nop(), "undefined", "Popcorn.nop returning undefined" );
});

test( "Popcorn.getTrackEvents", function() {

  expect( 7 );

  var popcorn = Popcorn( "#video" );

  equal( typeof Popcorn.getTrackEvents, "function", "Popcorn.getTrackEvents() is a provided static function" );

  equal( typeof Popcorn.getTrackEvents.ref, "function", "Popcorn.getTrackEvents.ref() is a private use  static function" );

  equal( typeof Popcorn.getTrackEvents( popcorn ), "object", "Popcorn.getTrackEvents() returns an object" );

  equal( Popcorn.getTrackEvents( popcorn ).length, 0, "Popcorn.getTrackEvents() currently has no trackEvents" );

  popcorn.cue( 1, function(){ });

  equal( Popcorn.getTrackEvents( popcorn ).length, 1, "Currently only one track event" );

  equal( typeof Popcorn.getTrackEvents( popcorn ), "object", "Popcorn.getTrackEvents() returns an object" );

  Popcorn.removeTrackEvent( popcorn, Popcorn.getTrackEvents( popcorn )[ 0 ]._id );

  equal( Popcorn.getTrackEvents( popcorn ).length, 0, "Popcorn.getTrackEvents() has no items after removal" );
});

test( "Popcorn.getTrackEvent", function() {

  var popcorn = Popcorn( "#video" ),
      count = 0,
      expects = 3;

  expect( expects );

  function plus() {

    if ( ++count === expects ) {
      Popcorn.removePlugin( "temp" );
      Popcorn.removeTrackEvent( popcorn, Popcorn.getTrackEvents( popcorn )[ 0 ]._id );
    }
  }

  equal( typeof Popcorn.getTrackEvent, "function", "Popcorn.getTrackEvent() is a provided static function" );
  plus();

  equal( typeof Popcorn.getTrackEvent.ref, "function", "Popcorn.getTrackEvent.ref() is a private use  static function" );
  plus();

  Popcorn.plugin( "temp", {
    setup: function( options ) { },
    start: function( event, options ) { },
    end: function( event, options ) { }
  });

  popcorn.temp({
    id: "asdf",
    start: 1,
    end: 2,
  });

  equal( typeof Popcorn.getTrackEvent( popcorn, "asdf" ), "object", "Popcorn.getTrackEvent() returns an object" );
  plus();

});

test( "Popcorn.removeTrackEvent", function() {

  var pop = Popcorn( "#video" ),
      count = 0,
      aId, bId, cId, dId, byStart, byEnd;

  expect( 5 );

  Popcorn.plugin( "a", {
    _setup: function( options ) {},
    start: function( event, options ) {},
    end: function( event, options ) {},
    _teardown: function( options ) {}
  });

  Popcorn.plugin( "b", {
    _setup: function( options ) {},
    start: function( event, options ) {},
    end: function( event, options ) {},
    _teardown: function( options ) {}
  });

  Popcorn.plugin( "c", {
    _setup: function( options ) {},
    start: function( event, options ) {},
    end: function( event, options ) {},
    _teardown: function( options ) {}
  });

  Popcorn.plugin( "d", {
    _setup: function( options ) {},
    start: function( event, options ) {},
    end: function( event, options ) {},
    _teardown: function( options ) {}
  });

  pop.a({
    start: 1,
    end: 5
  });

  // Store track event id for "plugin a"
  aId = pop.getLastTrackEventId();

  pop.b({
    start: 3,
    end: 4
  });

  // Store track event id for "plugin b"
  bId = pop.getLastTrackEventId();

  pop.c({
    start: 0,
    end: 3
  });

  // Store track event id for "plugin c"
  cId = pop.getLastTrackEventId();

  pop.d({
    start: 1,
    end: 2
  });

  // Store track event id for "plugin d"
  dId = pop.getLastTrackEventId();

  // Capture the pre-removal track event count
  count = pop.data.trackEvents.byStart.length;

  // Remove the first track event for "plugin a"
  pop.removeTrackEvent( aId );

  // Shorthand references
  byStart = pop.data.trackEvents.byStart;
  byEnd = pop.data.trackEvents.byEnd;

  equal( byStart.length, count - 1, "One less track event" );

  // Iterate all byStart track events to prove that _only_ track events
  // created by "plugin b" have survived
  Popcorn.forEach( byStart, function( start ) {
    if ( start._id ) {
      // This condition should NEVER evaluate to true
      if ( start._id === aId ) {
        ok( false, "No byStart track events with " + aId + " should exist" );
      }
      // This condition should ALWAYS evaluate to true
      if ( start._id === bId ) {
        ok( true, "Only byStart track events with " + bId + " should exist" );
      }
    }
  });

  // Iterate all byEnd track events to prove that _only_ track events
  // created by "plugin b" have survived
  Popcorn.forEach( byEnd, function( end ) {
    if ( end._id ) {
      // This condition should NEVER evaluate to true
      if ( end._id === aId ) {
        ok( false, "No byEnd track events with " + aId + " should exist" );
      }
      // This condition should ALWAYS evaluate to true
      if ( end._id === bId ) {
        ok( true, "Only byEnd track events with " + bId + " should exist" );
      }
    }
  });

  // after the removal, byStart's first element is c
  // console.log( byStart );

  // after the removal, byEnd's first element should be d (if c, then broken)
  // console.log( byEnd );

  // Test to ensure order was preserved
  equal( byStart[1]._id, cId, "byStart[1]._id matches cId" );
  equal( byEnd[1]._id, dId, "byEnd[1]._id matches dId" );


  Popcorn.forEach([ "a", "b", "c", "d" ], function( name ) {
    Popcorn.removePlugin( name );
  });
});

test( "Popcorn.forEach", function() {

  expect( 3 );

  var count = 0,
      nodelist = document.querySelectorAll( "div[id^='qunit-']" ),
      array = [ 1, 2 ],
      object = {
        a: "1",
        b: "2"
      };

  Popcorn.forEach( nodelist, function() {
    count++;
  });

  equal( count, nodelist.length, nodelist.length + " elements in NodeList" );
  count = 0;

  Popcorn.forEach( array, function() {
    count++;
  });

  equal( count, array.length, array.length + " items in Array" );
  count = 0;

  Popcorn.forEach( object, function() {
    count++;
  });

  equal( count, Popcorn.sizeOf( object ), Popcorn.sizeOf( object ) + " properties in object" );
});

test( "Popcorn.version", function() {
  // We can't know the version itself, but we can make sure that we get a string.
  // Popcorn.version should give something like "1.0.1" or a git sha "9a3e67" or
  // the string "@VERSION" if it hasn't yet been replaced.
  expect( 1 );

  equal( typeof Popcorn.version, "string", "Popcorn.version exists and returns a string" );
});

test( "Popcorn.util.toSeconds" , function() {
  var framerate = 24,
      storedStartTime,
      storedEndTime,
      areEquivalent,
      currentPeriod,
      startTimeStr,
      endTimeStr,
      message;

  //Time period data
  //The correct times that specify frame are calculated with a framerate of
  //24fps. Quotation is mixes (single and double) for testing purposes.
  var timePeriods = [
    {
      //Testing double quotes
      start: "01.234",
      end: "4.003",
      correctStartTime: 1.234,
      correctEndTime: 4.003
    },
    {
      //Tesing actual numbers
      start: 5.333,
      end: 6,
      correctStartTime: 5.333,
      correctEndTime: 6.000
    },
    {
      //Testing times in different data types (number and string)
      start: 6.004,
      end: "6.78",
      correctStartTime: 6.004,
      correctEndTime: 6.780
    },
    {
      //Testing times in different data types (string and number)
      start: "8.090",
      end: 9.11111111,
      correctStartTime: 8.090,
      correctEndTime: 9.11111111
    },
    {
      //Testing double quotes
      start: "10;4",
      end: "10;17",
      correctStartTime: 10.1666,
      correctEndTime: 10.7083
    },
    {
      //Testing single quotes
      start: '12;1',
      end: '13;2',
      correctStartTime: 12.0416,
      correctEndTime: 13.0833
    },
    {
      //Testing mixed quotes
      start: "20;11",
      end: '23;17',
      correctStartTime: 20.4583,
      correctEndTime: 23.7083
    },
    {
      //Testing mixed quotes
      start: '27;7',
      end: "27;22",
      correctStartTime: 27.2916,
      correctEndTime: 27.9166
    },
    {
      //Testing double quotes
      start: "12:04;12",
      end: "22:59;23",
      correctStartTime: 724.5,
      correctEndTime: 1379.9583
    },
    {
      //Testing single quotes
      start: '1:48:27;9',
      end: '3:23:15;1',
      correctStartTime: 6507.375,
      correctEndTime: 12195.0416
    },
    {
      //Testing mixed quotes
      start: '12:56;7',
      end: "2:02:42;8",
      correctStartTime: 776.2916,
      correctEndTime: 7362.3333
    }
  ];

  var equivalentTimes = function( testedTime, correctTime ) {
    var tolerance = 0.0001;
    return ( testedTime < ( correctTime + tolerance ) ) &&
           ( testedTime > ( correctTime - tolerance ) );
  };

  var logMessage = function( timeStr, correctTime, incorrectTime ) {
    return "Time stored in seconds for '" + timeStr +
           "' should be " + correctTime +
           ". Time stored was " + incorrectTime;
  };

  for ( var periodsIdx = 0, timPeriodsLength = timePeriods.length; periodsIdx < timPeriodsLength; periodsIdx++ ) {
    currentPeriod = timePeriods[ periodsIdx ];
    startTimeStr = currentPeriod.start;
    endTimeStr = currentPeriod.end;

    storedStartTime = Popcorn.util.toSeconds( startTimeStr, framerate );
    storedEndTime = Popcorn.util.toSeconds( endTimeStr, framerate );

    message = logMessage(
      startTimeStr,
      currentPeriod.correctStartTime,
      storedStartTime
    );

    areEquivalent = equivalentTimes( storedStartTime, currentPeriod.correctStartTime );
    equal( areEquivalent, true, message );

    message = logMessage(
      endTimeStr,
      currentPeriod.correctEndTime,
      storedEndTime
    );

    areEquivalent = equivalentTimes( storedEndTime, currentPeriod.correctEndTime ) ;
    equal( areEquivalent, true, message );
  }
});

test( "guid", function() {

  expect( 6 );

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

    guids.push( temp );
  }

  guids = [];

  for ( var i = 0; i < count; i++ ) {

    temp = Popcorn.guid( "pre" );

    if ( i > 0 ) {
      notEqual( temp, guids[ guids.length - 1 ], "Current guid does not equal last guid" );
    } else {
      ok( temp, "Popcorn.guid( 'pre' ) returns value" );
    }

    guids.push( temp );
  }
});
test( "isArray", function() {

  expect( 18 );

  var empty = [],
      fastSmall = [ 1 ],
      slow = [],
      slowSmall = [],
      all = null;

  slowSmall[ 999999 ] = 0;
  slowSmall.length = 0;
  slow.slow = 0;

  all = [ [], [ 1 ], new Array, Array( 0 ), "abc".match( /(a)/g ), slow, slowSmall ];

  all.forEach(function( a ) {
    ok( Popcorn.isArray( a ), "Popcorn.isArray(" + JSON.stringify( a ) + ")" );
  });

  equal( Popcorn.isArray.length, 1, "Popcorn.isArray.length, 1" );

  ok( !Popcorn.isArray(), "!Popcorn.isArray(), false" );
  ok( !Popcorn.isArray({}), "!Popcorn.isArray({}), false" );
  ok( !Popcorn.isArray( null ), "!Popcorn.isArray(null), false" );
  ok( !Popcorn.isArray( undefined ), "!Popcorn.isArray(undefined)" );
  ok( !Popcorn.isArray( 17 ), "!Popcorn.isArray(17), false" );
  ok( !Popcorn.isArray( "Array" ), "!Popcorn.isArray('Array'), false" );
  ok( !Popcorn.isArray( Math.PI ), "!Popcorn.isArray(Math.PI), false" );
  ok( !Popcorn.isArray( true ), "!Popcorn.isArray(true), false" );
  ok( !Popcorn.isArray( false ), "!Popcorn.isArray(false), false" );
  ok( !Popcorn.isArray( { __proto__: Array.prototype, length:1, 0:1, 1:2 } ), "{__proto__: Array.prototype, length:1, 0:1, 1:2}" );
});

test( "Protected", function() {

  expect( 1 );
  //  TODO: comprehensive tests for these utilities

  ok( !!Popcorn.protect , "Popcorn.protect exists" );
});

test( "Protected from removal", function() {

  expect( Popcorn.protect.natives.length * 2 );

  Popcorn.protect.natives.forEach(function( name ) {

    try {
      Popcorn.plugin( name );
    } catch( e ) {
      ok( true, e.message + " and cannot be used as a plugin name" );
    }

    try {
      Popcorn.removePlugin( name );
    } catch( e ) {
      ok( true, e.message + " and cannot be removed with this API" );
    }
  });
});

test( "Object", function() {

  var popped = Popcorn( "#video" ),
      popObj = Popcorn( document.getElementById( "video" ) ),
      methods = "load play pause currentTime mute volume roundTime exec removePlugin duration " +
                "preload playbackRate autoplay loop controls volume muted buffered readyState seeking paused played seekable ended",
      count = 0,
      expects = 60;

  expect( expects );

  function plus() {

    if ( ++count === expects ) {

      start();
    }
  }

  stop();

  // testing element passed by id
  ok( "video" in popped, "instance by id has `video` property" );
  plus();
  equal( Object.prototype.toString.call( popped.video ), "[object HTMLVideoElement]", "instance by id video property is a HTMLVideoElement" );
  plus();

  ok( "data" in popped, "instance by id has `data` property" );
  plus();
  equal( Object.prototype.toString.call( popped.data ), "[object Object]", "instance by id data property is an object" );
  plus();

  ok( "trackEvents" in popped.data, "instance by id has `trackEvents` property" );
  plus();
  equal( Object.prototype.toString.call( popped.data.trackEvents ), "[object Object]", "instance by id trackEvents property is an object" );
  plus();

  popped.play();

  methods.split( /\s+/g ).forEach(function( k,v ) {

    ok( k in popped, "instance by id has method: " + k );
    plus();
  });

  // testing element passed by reference
  ok( "video" in popObj, "instance by reference has `video` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.video ), "[object HTMLVideoElement]", "instance by reference video property is a HTMLVideoElement" );
  plus();

  ok( "data" in popObj, "instance by reference has `data` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.data ), "[object Object]", "instance by reference data property is an object" );
  plus();

  ok( "trackEvents" in popObj.data, "instance by reference has `trackEvents` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.data.trackEvents ), "[object Object]", "instance by reference trackEvents property is an object" );
  plus();

  popObj.play();

  methods.split( /\s+/g ).forEach(function( k,v ) {

    ok( k in popObj, "instance by reference has method: " + k );
    plus();
  });
});

test( "Instance", function() {

  var a = Popcorn( "#video" ),
      b = Popcorn( "#video", { frameAnimation: true });

  expect( 36 );

  ok( a.options, "instance a has options property" );
  ok( b.options, "instance b has options property" );

  ok( a.isDestroyed === false , "instance a has isDestroyed property" );
  ok( b.isDestroyed === false, "instance b has isDestroyed property" );

  ok( a.data, "instance a has data property" );
  ok( b.data, "instance b has data property" );

  ok( a.data.timeUpdate, "instance a has data.timeUpdate property" );
  ok( b.data.timeUpdate, "instance b has data.timeUpdate property" );

  ok( a.data.disabled, "instance a has data.disabled property" );
  ok( b.data.disabled, "instance b has data.disabled property" );

  ok( a.data.events, "instance a has data.events property" );
  ok( b.data.events, "instance b has data.events property" );

  ok( a.data.hooks, "instance a has data.hooks property" );
  ok( b.data.hooks, "instance b has data.hooks property" );

  ok( a.data.history, "instance a has data.history property" );
  ok( b.data.history, "instance b has data.history property" );

  ok( a.data.state, "instance a has data.state property" );
  ok( b.data.state, "instance b has data.state property" );

  ok( a.data.state.volume, "instance a has data.state.volume property" );
  ok( b.data.state.volume, "instance b has data.state.volume property" );

  ok( a.data.trackRefs, "instance a has data.trackRefs property" );
  ok( b.data.trackRefs, "instance b has data.trackRefs property" );

  ok( a.data.trackEvents, "instance a has data.trackEvents property" );
  ok( b.data.trackEvents, "instance b has data.trackEvents property" );

  ok( a.data.trackEvents.byStart, "instance a has data.trackEvents.byStart property" );
  ok( b.data.trackEvents.byStart, "instance b has data.trackEvents.byStart property" );

  ok( a.data.trackEvents.byEnd, "instance a has data.trackEvents.byEnd property" );
  ok( b.data.trackEvents.byEnd, "instance b has data.trackEvents.byEnd property" );

  ok( a.data.trackEvents.animating, "instance a has data.trackEvents.animating property" );
  ok( b.data.trackEvents.animating, "instance b has data.trackEvents.animating property" );

  equal( typeof a.data.trackEvents.startIndex, "number", "instance a has data.trackEvents.startIndex property and it is a number" );
  equal( typeof b.data.trackEvents.startIndex, "number", "instance b has data.trackEvents.startIndex property and it is a number" );

  equal( typeof a.data.trackEvents.endIndex, "number", "instance a has data.trackEvents.endIndex property and it is a number" );
  equal( typeof b.data.trackEvents.endIndex, "number", "instance b has data.trackEvents.endIndex property and it is a number" );

  ok( a.data.trackEvents.previousUpdateTime >= -1, "instance a has data.trackEvents.previousUpdateTime property" );
  ok( b.data.trackEvents.previousUpdateTime >= -1, "instance b has data.trackEvents.previousUpdateTime property" );

});

test( "Bogus Selector", 2, function() {
  try {
    Popcorn( "#[object HTMLDivElement]" );

    ok(false, "Should not fail silently" );
  } catch(e) {
    ok( true, "Exception raised on bogus selector: " + e.message );
  }

  try {
    Popcorn( document.getElementById( "video" ) );

    ok( true, "No error is raised for using the media element itself" );
  } catch( e ) {
    ok( false, "Exception thrown for using a valid media element" );
  }
});

module( "Popcorn Static" );

test( "Popcorn.[addTrackEvent | removeTrackEvent].ref()", function() {

  expect( 2 );

  var popped = Popcorn( "#video" );

  // Calling exec() will create tracks and added them to the
  // trackreference internally
  popped.cue( 1, function() { /* ... */ });
  popped.cue( 3, function() { /* ... */ });
  popped.cue( 5, function() { /* ... */ });

  equal( Popcorn.sizeOf( popped.data.trackRefs ), 3, "There are 3 trackRefs in popped.data.trackRefs" );

  Popcorn.forEach( popped.data.trackRefs, function( ref, key ) {
    popped.removeTrackEvent( key );
  });

  equal( Popcorn.sizeOf( popped.data.trackRefs ), 0, "There are 0 trackRefs in popped.data.trackRefs" );
});

module( "Popcorn Prototype Methods" );

test( "deprecated method warning", function() {
  // If there is no console, then this feature won't work anyway
  // so there is no point in testing it
  if ( typeof console !== "undefined" ) {
    var $pop = Popcorn( "#video" ),
        handler = function() {},
        oldwarn = console.warn,
        count = 0;

    console.warn = null;

    // Known IE9 issue
    if ( console.warn != null ) {
      return;
    }

    expect( 3 );

    // Intercept console.warn messages
    console.warn = function() {
      if ( ++count <= 3 ) {
        ok( true, "warning logged: " + arguments[0] );
        // return oldwarn.apply( console, [].slice.call(arguments) );
      } else {
        console.warn = oldwarn;
      }
    };

    $pop.listen( "foo", handler).trigger( "foo" ).unlisten( "foo", handler );
  }
});

test( "roundTime", function() {

  QUnit.reset();

  stop();

  var popped = Popcorn( "#video" );

  popped.on( "canplayall", function() {
    popped.off( "canplayall" );
    popped.play().pause().currentTime( 0.98 );

    equal( 1, popped.roundTime(), ".roundTime() returns 1 when currentTime is 0.98s" );
    start();
  });
});


test( "exec", function() {

  QUnit.reset();

  var popped = Popcorn( "#video" ),
      expects = 2,
      count = 0,
      hasLooped = false,
      loop = 0;

  expect( expects + 1 );

  function plus(){
    if ( ++count == expects ) {

      setTimeout(function() {

        equal( loop, expects, "cue callback repeat check, only called twice" );
        Popcorn.removePlugin( popped, "cue" );
        start();

      }, 1000 );
    }
  }

  stop();

  popped.cue( 4, function() {
    ok( loop < 2, "cue callback fired " + ++loop );
    plus();

    if ( !hasLooped ) {

      popped.currentTime( 3 ).play();

      hasLooped = true;
    }
  }).currentTime( 3 ).play();
});

test( "cue (alias of exec)", function() {
  expect( 2 );
  ok( Popcorn.p.cue, "Popcorn.p.cue exists" );
  equal( typeof Popcorn.p.cue, "function", "Popcorn.p.cue is a function" );

  // Sing exec is being overwritten with a function that inlines
  // a deprecated warning message, this test is no longer valid
  // deepEqual( Popcorn.p.cue, Popcorn.p.exec, "Popcorn.p.cue equal Popcorn.p.exec" );
});

test( "mute", function() {

  var video = Popcorn( "#video" ),
      audio = Popcorn( "#audio" ),
      expects = 4,
      count = 0;

  expect( expects );

  function plus(){
    if ( ++count == expects ) {
      start();
    }
  }

  stop();

  video.on( "muted", function() {

    equal( this.media.muted, true, "Video `muted` attribute is true when muted" );
    plus();

    this.unmute();

  }).on( "unmuted", function() {

    equal( this.media.muted, false, "Video `muted` attribute is false when unmuted" );
    plus();
  });

  audio.on( "muted", function() {

    equal( this.media.muted, true, "Audio `muted` attribute is true when muted" );
    plus();

    this.unmute();

  }).on( "unmuted", function() {

    equal( this.media.muted, false, "Audio `muted` attribute is false when unmuted" );
    plus();
  });

  video.mute();
  audio.mute();
});

test( "play(n)/pause(n) as shorthand to currentTime(n).play()/pause()", function() {

  var $pop = Popcorn( "#video" ),
      expects = 2,
      count = 0,
      fired = 0;

  expect( expects );

  function plus() {
    if ( ++count == expects ) {
      start();
    }
  }

  stop();

  function poll() {

    if ( $pop.media.readyState >= 2 ) {
      // this should trigger immediately
      var firstSeekedEvent = function() {

        $pop.off( "seeked", firstSeekedEvent );
        equal( Math.round( $pop.currentTime() ), 10, "play(n) sets currentTime to 10" );
        plus();

        $pop.on( "seeked", secondSeekedEvent );
        $pop.pause( 5 );
      },
      secondSeekedEvent = function() {

        $pop.off( "seeked", secondSeekedEvent );
        equal( Math.round( $pop.currentTime() ), 5, "pause(n) sets currentTime to 5" );
        plus();
      };

      $pop.on( "seeked", firstSeekedEvent );
      $pop.play( 10 ).pause();
    } else {
      setTimeout( poll, 10 );
    }
  }

  poll();
});

// Originally written for #705 by chris de cairos
test( "play(n)/pause(n) custom stop()", function() {

  // Implement custom stop() method
  Popcorn.p.stop = function() {
    return this.pause( 0 );
  };

  var outerHTML = [
      "<video id='video-fixture' preload='auto' controls='' style='display:;width:300px' tabindex='0'>",
      document.getElementById( "video" ).innerHTML,
      "</video>"
      ].join( "\n" ),
      count = 0,
      expects = 2,
      $pop;

  document.getElementById( "qunit-fixture" ).innerHTML = outerHTML;

  $pop = Popcorn( "#video-fixture" );

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      // Remove custom stop() method
      delete Popcorn.p.stop;
      $pop.off( "canplayall" );
      $pop.destroy();
      start();
    }
  }

  stop();

  $pop.on( "canplayall", function() {

    this.cue( 4, function() {

      this.cue( 0, function() {

        equal( this.currentTime(), 0, "currentTime is 0" );
        plus();

        equal( this.media.paused, true, "The media is paused" );
        plus();
      }).stop();
    }).play( 3 );
  });
});

module( "Popcorn Static Methods" );

test( "Popcorn.extend", function() {

  QUnit.reset();

  expect( 12 );

  var dest = {},
      obj1 = {
        "key11": "value",
        "key12": 9001,
        "key13": function() { return true; }
      },
      obj2 = {
        "key21": "String",
        "key22": 9002,
        "key23": function() { return false; }
      },
      prop;

  Popcorn.extend( dest, obj1 );

  for ( prop in obj1 ) {
    equal( dest.hasOwnProperty( prop ), true, "{dest} has property: " + prop );
  }

  equal( typeof dest[ "key13" ], "function", "dest[key13] is a function" );

  dest = {};

  Popcorn.extend( dest, obj1, obj2 );

  for ( prop in obj1 ) {
    equal( dest.hasOwnProperty( prop ), true, "{dest} has property: " + prop + ", when extending 2 objects" );
  }

  for ( prop in obj2 ) {
    equal( dest.hasOwnProperty( prop ), true, "{dest} has property: " + prop + ", when extending 2 objects" );
  }

  equal( typeof dest[ "key13" ], "function","dest[key13] is a function" );

  equal( typeof dest[ "key23" ], "function","dest[key23] is a function" );
});

test( "Popcorn.events", function() {

  QUnit.reset()
  expect( 43 );

  var eventTypes = [ "UIEvents", "MouseEvents", "Events" ],
      natives = "",
      events,
      eventsReturned,
      idx = 0,
      len,
      okay = true;

  eventTypes.forEach (function( e ) {
    ok( Popcorn.Events[ e ], e + " Exists" )
  });

  natives = Popcorn.Events[ eventTypes[ 0 ] ] + " " + Popcorn.Events[ eventTypes[ 1 ] ] + " " + Popcorn.Events[ eventTypes[ 2 ] ];
  events = natives.split( /\s+/g );
  eventsReturned = Popcorn.events.all;
  len = events.length;

  for ( ; idx++ < len && okay; ) {
    okay = events[ idx ] === eventsReturned[ idx ];
  }

  ok( okay, "Native events are correctly being handled" );

  equal( typeof Popcorn.Events.Natives, "string", "Popcorn.Events.Natives is a string" );
  equal( typeof Popcorn.events, "object", "Popcorn.events is an object" );

  Popcorn.forEach( eventsReturned, function( e ) {
    ok( Popcorn.events.isNative ( e ), e + " is a native event" );
  });
});

test( "Popcorn.events.hooks", function() {

  expect( 1 );

  ok( Popcorn.events.hooks, "Popcorn.events.hooks exists" );

});

test( "Popcorn.events.hooks: canplayall", function() {

  //qunit-fixture
  var expects = 1,
      count = 0,
      fired = 0,
      $pop;

  expect( expects );

  function plus(){
    if ( ++count == expects ) {
      $pop.off( "canplayall");
      $pop.off( "canplaythrough" );
      $pop.destroy();
      start();
    }
  }

  stop();

  var video = document.createElement( "video" ),
      sources = {
        mp4: document.createElement( "source" ),
        ogv: document.createElement( "source" ),
        webm: document.createElement( "source" )
      },
      url = "http://videos.mozilla.org/serv/webmademovies/popcornplug.";

  video.id = "event-fixture";
  video.controls = true;
  video.autoplay = true;
  video.preload = "auto";


  Popcorn.forEach( sources, function( source, type ) {
    source.src = url + type;
    video.appendChild( source );
  });

  document.getElementById( "qunit-fixture" ).appendChild( video );

  $pop = Popcorn( "#event-fixture" );

  $pop.on( "canplayall", function( event ) {
    equal( ++fired, 1, "canplayall is fired only once" );
    plus();
  });

  $pop.on( "canplaythrough", function( event ) {
    // this should trigger re-fires of the original event
    this.currentTime( 0 );
  });
});

test( "Popcorn.events.hooks: canplayall fires immediately if ready", function() {

  //qunit-fixture
  var $pop = Popcorn( "#video" ),
      expects = 1,
      count = 0,
      fired = 0;

  expect( expects );

  function plus(){
    if ( ++count == expects ) {
      $pop.destroy();
      start();
    }
  }

  stop();

  function poll() {
    if ( $pop.media.readyState >= 2 ) {
      // this should trigger immediately
      $pop.on( "canplayall", function( event ) {
        this.off( "canplayall" );
        equal( ++fired, 1, "canplayall is fired immediately if readyState permits" );
        plus();
      });
    } else {
      setTimeout( poll, 10 );
    }
  }

  poll();
});

/*
<video height="180" width="300" id="video" controls>
<source src="http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4"></source>
<source src="http://videos.mozilla.org/serv/webmademovies/popcornplug.ogv"></source>
<source src="http://videos.mozilla.org/serv/webmademovies/popcornplug.webm"></source>
</video>

*/

module( "Popcorn Position" );
test( "position", function() {

  expect( 25 );

  var $absolute = $( ".absolute" ),
      $relative = $( ".relative" ),
      $fixed = $( ".fixed" ),
      $static = $( ".static" ),
      tests;

  $( "#position-tests" ).show();

  tests = [
    {
      id: "absolute-1",
      top: 0,
      left: 0
    },
    {
      id: "absolute-1-1",
      top: 1,
      left: 1
    },
    {
      id: "absolute-1-1-1",
      top: 2,
      left: 2
    },
    {
      id: "absolute-2",
      top: 19,
      left: 19
    }
  ];

  Popcorn.forEach( tests, function( test ) {
    equal( Popcorn( "#vid-" + test.id ).position().top,  test.top,  "Popcorn( '#vid-" + test.id + "' ).position().top" );
    equal( Popcorn( "#vid-" + test.id ).position().left, test.left, "Popcorn( '#vid-" + test.id + "' ).position().left" );
  });

  tests = [
    {
      id: "relative-1",
      top: 0,
      left: 0
    },
    {
      id: "relative-2",
      top: 120,
      left: 20
    }
  ];

  Popcorn.forEach( tests, function( test ) {
    equal( Popcorn( "#vid-" + test.id ).position().top,  test.top,  "Popcorn( '#vid-" + test.id + "' ).position().top" );
    equal( Popcorn( "#vid-" + test.id ).position().left, test.left, "Popcorn( '#vid-" + test.id + "' ).position().left" );
  });

  tests = [
    {
      id: "fixed-1",
        top:  0,
        left:  0
    },
    {
      id: "fixed-2",
      top: 20,
      left: 20
    }
  ];

  Popcorn.forEach( tests, function( test ) {
    equal( Popcorn( "#vid-" + test.id ).position().top,  test.top,  "Popcorn('#vid-" + test.id + "').position().top" );
    equal( Popcorn( "#vid-" + test.id ).position().left, test.left, "Popcorn('#vid-" + test.id + "').position().left" );
  });

  tests = [
    {
      id: "static-1",
      top: 200,
      left:  0
    },
    {
      id: "static-1-1",
      top:  0,
      left:  0
    },
    {
      id: "static-1-1-1",
      top:  0,
      left:  0
    },
    {
      id: "static-2",
      top: 300,
      left: 0
    }
  ];

  Popcorn.forEach( tests, function( test ) {
    equal( Popcorn( "#vid-" + test.id ).position().top,  test.top,  "Popcorn( '#vid-" + test.id + "' ).position().top" );
    equal( Popcorn( "#vid-" + test.id ).position().left, test.left, "Popcorn( '#vid-" + test.id + "' ).position().left" );
  });

  try {
    ok( Popcorn( "#audio" ).position(), "position called from audio" );
  } catch( e ) {
    ok( false, e );
  }

  $( "#position-tests" ).hide();
});

test( "position called from plugin", function() {

  var $pop = Popcorn( "#video" ),
      expects = 3,
      count = 0;

  expect( expects );

  function plus(){
    if ( ++count == expects ) {
      Popcorn.removePlugin( "positionPlugin" );
      delete Popcorn.manifest.positionPlugin;
      $pop.destroy();
      start();
    }
  }

  stop();

  Popcorn.plugin( "positionPlugin" , function(){
    return {
      _setup: function( options ) {
        ok( "position" in this, "this.position() avaliable in _setup" );
        plus();
      },
      start: function( event, options ){

        ok( "position" in this, "this.position() avaliable in start" );
        plus();
      },
      end: function( event, options ){
        ok( "position" in this, "this.position() avaliable in end" );
        plus();
      }
    };
  });

  $pop.positionPlugin({
    start: 0,
    end: 1
  }).currentTime( 0 ).play();
});

module( "Popcorn Events" );

test( "Can Detect Native event types", function() {

  var tests = [ "play", "pause", "rough loade", "data seek" ],
      expects = [ true, true, false, false ];

  expect( tests.length );

  tests.forEach(function( type, idx ) {
    equal( Popcorn.events.isNative( type ), expects[ idx ], type + ( expects[ idx ] ? " is " : " is not " ) + "a valid native event" );
  });
});

test( "Determine event api interface", function() {

  var tests = [ "play", "pause", "click", "scroll", "rough loade", "data seek" ],
      expects = [ "Events", "Events", "MouseEvents", "UIEvents", false, false ];

  expect( tests.length );

  tests.forEach(function( type, idx ) {
    equal( Popcorn.events.getInterface( type ), expects[ idx ], type + ( expects[ idx ] ? " is " : " is not " ) + "a valid native event" );
  });
});

test( "Stored By Type", function() {

  QUnit.reset();

  expect( 6 )

  var p = Popcorn( "#video" ),
      count = 0,
      fired = 0,
      wants = 4;

  function plus(){

    if ( ++count === 4 ) {

      equal( fired, wants, "Number of callbacks fired from 1 handler" );

      p.off( "play" );

      ok( !p.data.events[ "play" ], "play handlers removed" );

      p.destroy();

      start();
    }
  }

  stop();

  p.on( "play", function() {
    fired++;

    ok( true, "Play fired " + fired );
    plus();
  });

  p.on( "play", function() {
    fired++;

    ok( true, "Play fired " + fired );
    plus();
  });

  p.on( "play", function() {
    fired++;

    ok( true, "Play fired " + fired );
    plus();
  });

  p.on( "play", function() {
    fired++;

    ok( true, "Play fired " + fired );
    plus();
  });

  p.emit( "play" );

  if ( fired < 4 ) {
    start();
  }

  p.off( "play" );
});


test( "Simulated", function() {

  QUnit.reset();

  var p = Popcorn( "#video" ),
      completed = [];

  var expects = Setup.events.length,
      count = 0;

  expect( expects );

  function plus(){
    if ( ++count == expects ) {
      p.destroy();
      start();
    }
  }

  stop();

  Setup.events.forEach(function( name ) {
    p.on( name, function( event ) {

      if ( completed.indexOf( name ) === -1 ) {
        ok( true, name + " fired" );
        plus();
        completed.push( name );
        this.off( name );
      }
    });
  });

  Setup.events.forEach( function( name ) {
    p.emit( name );
  });
});


test( "Real", function() {

  QUnit.reset();

  var p = Popcorn( "#video" ),
      completed = [],
      expects = 5,
      count = 0;

  function plus(){
    if ( ++count == expects ) {
      p.destroy();
      start();
    }
  }

  stop();

  [ "play", "pause", "volumechange", "seeking", "seeked" ].forEach(function( name ) {

    p.on( name, function( event ) {

      if ( completed.indexOf( name ) === -1 ) {
        ok( true, name + " fired" );
        plus();
        completed.push( name );
        p.off( name );
      }
    });
  });
  p.on( "canplayall", function() {
    this.off( "canplayall" );
    this.pause();
    this.play();
    this.volume( 0.9 );
    this.currentTime( 49 );
  });
});

test( "Custom", function() {

  var expects = 1,
      count = 0,
      p;

  expect( expects );

  function plus(){
    if ( ++count == expects ) {
      p.off( "eventz0rz" );
      p.destroy()
      start();
    }
  }

  stop();

  p = Popcorn( "#video" );


  p.on( "eventz0rz", function( event ) {

    ok( true, "Custom event fired" );
    plus();
  });

  p.emit( "eventz0rz" );
});

test( "on/off/emit", function() {
  expect( 4 );

  var $pop = Popcorn( "#video" );

  $pop.on( "foo", function() {
    deepEqual( this, $pop, "`this` is the popcorn instance" );
    equal( typeof this.data.events.foo, "object", "events hash registered at this.data.events.foo" );
    equal( Popcorn.sizeOf( this.data.events.foo ), 1, "Only one event is registered" );

    $pop.off( "foo" );

    equal( this.data.events.foo, null, "events hash is null at this.data.events.foo" );
  });

  $pop.emit( "foo" );
});


test( "UI/Mouse", function() {

  var expects = 1,
      count = 0,
      p;

  expect( expects );

  function plus(){
    if ( ++count == expects ) {
      p.off( "click" );
      p.destroy();
      start();
    }
  }

  stop();

  p = Popcorn( "#video" );

  p.on( "click", function( event ) {

    ok( true, "click event fired" );
    plus();
  });

  p.emit( "click" );
});

module( "Popcorn Plugin" );
test( "Manifest", function() {

  var p = Popcorn( "#video" ),
      expects = 5,
      run = 1,
      count = 0;

  function plus() {
    if ( ++count === expects ) {
      start();
      // clean up added events after tests
      Popcorn.removePlugin( "footnote" );
      p.destroy();
    }
  }

  stop();
  Popcorn.plugin( "footnote" , function() {
    return {
      _setup: function( options ) {
        ok( options.target, "`options.target exists`" );
        plus();

        if ( run === 2 ) {
          equal( options.target, "custom-target", "Uses custom target if one is specified" );
          plus();
        }

        if ( run === 1 ) {
          equal( options.target, "text-container", "Uses manifest target by default" );
          plus();
          run++;
        }
      },
      start: function( event, options ){
      },
      end: function( event, options ){
      }
    };
  },
  {
    about: {
      name: "Popcorn Manifest Plugin",
      version: "0.0",
      author: "Rick Waldron",
      website: ""
    },
    options: {
      start: {
        elem: "input",
        type: "text",
        label: "In"
      },
      end: {
        elem: "input",
        type: "text",
        label: "Out"
      },
      text: {
        elem: "input",
        type: "text",
        label: "Manifest Text"
      },
      target: "text-container"
    }
  });


  expect( expects );

  equal( Popcorn.sizeOf( Popcorn.manifest ), 1, "One manifest stored" );
  plus();

  // add more tests

  p.footnote({});

  p.footnote({
    target: "custom-target"
  });
});

test( "Manifest removal", function() {

  var popcorn = Popcorn( "#video" );

  equal( Popcorn.sizeOf( Popcorn.manifest ), 0, "Before creating new plugin" );

  Popcorn.plugin( "tester", {

    start: function() {},
    end: function() {}
  });

  equal( Popcorn.sizeOf( Popcorn.manifest ), 1, "After creating new plugin" );

  Popcorn.removePlugin( "tester" );

  equal( Popcorn.sizeOf( Popcorn.manifest ), 0, "After deleting plugin" );

  popcorn.destroy();
});

test( "Configurable Defaults", function() {

  var expects = 14,
      count = 0,
      p;

  function plus() {
    if ( ++count === expects ) {
      [ "configurable", "multiconfig", "overridden", "funtionInitDefaults" ].forEach(function( val ) {
        Popcorn.removePlugin( val );
        delete Popcorn.manifest[ val ];
      });
      p.destroy();
      start();
    }
  }

  stop();

  Popcorn.plugin( "configurable", function() {
    return {
      _setup: function( options ) {

        options.persistant = true;

        equal( options.target, "foo", "options.target, 'foo' in configurable _setup" );
        plus();
      },
      start: function( event, options ) {

        ok( options.persistant, "options.persistant proves same object passed from _setup" );
        plus();
        // target: "foo"
        // text: "bar"
        // type: "thinger"
        equal( options.target, "foo", "options.target, 'foo' in configurable start" );
        plus();
        equal( options.text, "bar", "options.text, 'bar' in configurable start" );
        plus();
        equal( options.type, "thinger", "options.type, 'thinger' in configurable start" );
        plus();
      },
      end: function( event, options ) {
        ok( true, "end fired" );
        plus();
      }
    };
  },
  {
    about:{
      name: "Popcorn Configurable Plugin",
      version: "0.0",
      author: "Rick Waldron",
      website: ""
    },
    options: {
      target: "manifest"
    }
  });

  Popcorn.plugin( "multiconfig", function() {
    return {
      start: function( event, options ) {
        equal( options.target, "quux", "options.target, 'quux' in multiconfig start" );
        plus();
      },
      end: function( event, options ) {
        ok( true, "end fired" );
        plus();
      }
    };
  });

  Popcorn.plugin( "overridden", function() {
    return {
      _setup: function( options ) {
        equal( options.text, "hello!", "options.text, overriden with 'hello!' in overridden _setup" );
        plus();

        equal( options.target, "custom", "options.target, overriden with 'custom' in overridden _setup" ); plus();
      },
      start: function( event, options ) {
        equal( options.text, "hello!", "options.text, overriden with 'hello!' in overridden start" );
        plus();

        equal( options.target, "custom", "options.target, overriden with 'custom' in overridden start" );
        plus();
      },
      end: function( event, options ) {
        ok( true, "end fired" );
        plus();
      }
    };
  });

  Popcorn.plugin( "funtionInitDefaults", function( options ) {

    equal( options.defaultItem, "foo bar", "defaults work inside auto setup function" );
    plus();

    return {
      start: Popcorn.nop,
      end: Popcorn.nop
    };
  });

  p = Popcorn( "#video", {
            defaults: {
              overridden: {
                target: "default"
              }
            }
          });

  p.defaults( "funtionInitDefaults", {
    defaultItem: "foo bar"
  });

  p.funtionInitDefaults({});

  p.defaults( "configurable", {

    // set a default element target id
    target: "foo"

  }).defaults([
    {
      multiconfig: {
        target: "quux"
      }
    },
    {
      configurable: {
        text: "bar",
        type: "thinger"
      }
    }
  ]).configurable({

    // all calls will have:
    // target: "foo"
    // text: "bar"
    // type: "thinger"
    start: 3,
    end: 4
  }).multiconfig({

    // all calls will have:
    // target: "quux"
    start: 4,
    end: 5
  }).overridden({

    // has a default set
    // we need limitless overriding
    start: 4,
    end: 5,
    target: "custom",
    text: "hello!"
  }).currentTime( 2 ).play();
});

test( "Plugin toString", function() {

  expect( 2 );

  var $pop = Popcorn( "#video" ),
      trackEvent, result;

  Popcorn.plugin( "stringify" , function() {
    return {
      _setup: function( options ) {
      },
      start: function( event, options ){
      },
      end: function( event, options ){
      },
      _teardown: function( options ) {
      }
    };
  });

  $pop.stringify({
    start: 0,
    end: 10,
  });

  trackEvent = $pop.getTrackEvent( $pop.getLastTrackEventId() );
  result = trackEvent.toString();

  ok( /^stringify \( start\: 0\, end\: 10\, id\: stringify/.test(result), "Default toString value" );

  $pop.stringify({
    start: 3,
    end: 4,
    toString: function() {
      return "BOO YA!";
    }
  });

  trackEvent = $pop.getTrackEvent( $pop.getLastTrackEventId() );
  result = trackEvent.toString();


  ok( result, "BOO YA!", "Custom toString value" );

  Popcorn.removePlugin( "stringify" );
});

test( "Exceptions", function() {

  var $pop = Popcorn( "#video" ),
      expects = 5,
      count = 0;

  Popcorn.plugin.debug = false;
  Popcorn.plugin.errors = [];

  function plus() {
    if ( ++count == expects ) {
      Popcorn.removePlugin( "exceptions" );
      Popcorn.plugin.debug = true;
      Popcorn.plugin.errors = [];
      start();
      $pop.destroy();
    }
  }

  expect( expects );
  stop();

  Popcorn.plugin( "exceptions", {
    start: function() {
      foo();
    },
    end: function() {
    }
  });

  $pop.on( "canplayall", function() {
    this.exceptions({
      start: 1,
      end: 2
    }).cue( 3, function() {
      equal( Popcorn.plugin.errors.length, 1, "Popcorn.plugin.errors has one item" );
      plus();
    }).currentTime( 0 ).play();

    this.on( "error", function( errors ) {
      ok( errors.length, "`errors` array has error objects" );
      plus();
      ok( errors[ 0 ].thrown, "`errors[ 0 ].thrown` property exists" );
      plus();
      ok( errors[ 0 ].plugin, "`errors[ 0 ].plugin` property exists" );
      plus();
      ok( errors[ 0 ].source, "`errors[ 0 ].source` property exists" );
      plus();
    });
  });
});

test( "Start Zero Immediately", function() {

  var $pop = Popcorn( "#video" ),
      expects = 1,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      // clean up added events after tests
      Popcorn.removePlugin( "zero" );
      $pop.destroy();
      start();
    }
  }

  stop();

  $pop.pause().currentTime( 0 );

  Popcorn.plugin( "zero", {
    start: function() {
      ok( true, "$pop.zero({ start:0, end: 2 }) ran without play()" );
      plus();
    },
    end: function() {}
  });

  $pop.zero({
    start: 0,
    end: 2
  });
});

test( "Special track event listeners: trackstart, trackend", function() {

  var $pop = Popcorn( "#video" ),
      expects = 4,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      // clean up added events after tests
      Popcorn.removePlugin( "emitter" );
      $pop.destroy();
      start();
    }
  }

  stop();

  $pop.pause().currentTime( 0 );

  Popcorn.plugin( "emitter", {
    start: function() {},
    end: function() {}
  });

  $pop.emitter({
    start: 1,
    end: 3
  }).on( "trackstart", function( event ) {

    equal( event.type, "trackstart", "Special trackstart event object includes correct type" );
    plus();


    equal( event.plugin, "emitter", "Special trackstart event object includes correct plugin name" );
    plus();

  }).on( "trackend", function( event ) {

    equal( event.type, "trackend", "Special trackend event object includes correct type" );
    plus();

    equal( event.plugin, "emitter", "Special trackend event object includes correct plugin name" );
    plus();

  }).play();
});

test( "frame function (frameAnimation)", function() {

  var $pop = Popcorn( "#video", {
        frameAnimation: true
      }),
      fired = 0,
      expects = 1,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      // clean up added events after tests
      Popcorn.removePlugin( "frameFn" );
      $pop.destroy();
      start();
    }
  }

  stop();

  $pop.pause().currentTime( 1 );

  Popcorn.plugin( "frameFn", {
    start: function() {
    },
    frame: function() {
      fired++;
    },
    end: function() {
      // if `frame` fired, then it will have value > 0
      ok( fired, "frame fired. (actual: " + fired + ")" );
      plus();
    }
  });

  $pop.frameFn({
    start: 1,
    end: 3
  }).play();
});

test( "Update Timer (timeupdate)", function() {

  QUnit.reset();

  var p2 = Popcorn( "#video" ),
      expects = 12,
      count = 0,
      execCount = 0,
      // These make sure events are only fired once
      // any second call will produce a failed test
      forwardStart = false,
      forwardEnd = false,
      backwardStart = false,
      backwardEnd = false,
      wrapperRunning = {
        one: false,
        two: false,
      };

  function plus() {
    if ( ++count === expects ) {
      // clean up added events after tests
      Popcorn.removePlugin( "forwards" );
      Popcorn.removePlugin( "backwards" );
      Popcorn.removePlugin( "wrapper" );
      p2.destroy();
      start();
    }
  }

  // These tests come close to 10 seconds on chrome, increasing to 15
  stop();

  Popcorn.plugin( "forwards", function() {
    return {
      start: function( event, options ) {

        if ( !options.startFired ) {

          options.startFired = true;
          forwardStart = !forwardStart;
          ok( forwardStart, "forward's start fired" );
          plus();
        }
      },
      end: function( event, options ) {

        if ( !options.endFired ) {

          options.endFired = true;
          forwardEnd = !forwardEnd;
          p2.currentTime( 1 ).play();
          ok( forwardEnd, "forward's end fired" );
          plus();
        }
      }
    };
  });

  p2.forwards({
    start: 3,
    end: 4
  });

  Popcorn.plugin( "backwards", function() {
    return {
      start: function( event, options ) {

        if ( !options.startFired ) {

          options.startFired = true;
          backwardStart = !backwardStart;
          p2.currentTime( 0 ).play();
          ok( true, "backward's start fired" );
          plus();
        }
      },
      end: function( event, options ) {

        if ( !options.endFired ) {

          options.endFired = true;
          backwardEnd = !backwardEnd;
          ok( backwardEnd, "backward's end fired" );
          plus();
          p2.currentTime( 5 ).play();
        }
      }
    };
  });

  p2.backwards({
    start: 1,
    end: 2
  });

  Popcorn.plugin( "wrapper", {
    start: function( event, options ) {

      wrapperRunning[ options.wrapper ] = true;
    },
    end: function( event, options ) {

      wrapperRunning[ options.wrapper ] = false;
    }
  });

  // second instance of wrapper is wrapping the first
  p2.wrapper({
    start: 6,
    end: 7,
    wrapper: "one"
  })
  .wrapper({
    start: 5,
    end: 8,
    wrapper: "two"
  })
  // checking wrapper 2's start
  .cue( 5, function() {

    if ( execCount === 0 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 5" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 5" );
      plus();
    }
  })
  // checking wrapper 1's start
  .cue( 6, function() {

    if ( execCount === 1 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 6" );
      plus();
      ok( wrapperRunning.one, "wrapper one is running at second 6" );
      plus();
    }
  })
  // checking wrapper 1's end
  .cue( 7, function() {

    if ( execCount === 2 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 7" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 7" );
      plus();
    }
  })
  // checking wrapper 2's end
  .cue( 8, function() {

    if ( execCount === 3 ) {

      execCount++;
      ok( !wrapperRunning.two, "wrapper two is stopped at second 9" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 9" );
      plus();
    }
  });

  p2.currentTime( 3 ).play();
});

test( "Update Timer (frameAnimation)", function() {

  QUnit.reset();

  if ( document.hasFocus && !document.hasFocus() ) {

    ok( false, "frame animation tests need focus" );
    return;
  }

  var p2 = Popcorn( "#video", {
        frameAnimation: true
      }),
      expects = 12,
      count = 0,
      execCount = 0,
      // These make sure events are only fired once
      // any second call will produce a failed test
      forwardStart = false,
      forwardEnd = false,
      backwardStart = false,
      backwardEnd = false,
      wrapperRunning = {
        one: false,
        two: false,
      };

  function plus() {
    if ( ++count === expects ) {
      // clean up added events after tests
      Popcorn.removePlugin( "forwards" );
      Popcorn.removePlugin( "backwards" );
      Popcorn.removePlugin( "wrapper" );
      p2.destroy();
      start();
    }
  }

  // These tests come close to 10 seconds on chrome, increasing to 15
  stop();

  Popcorn.plugin( "forwards", function() {
    return {
      start: function( event, options ) {

        if ( !options.startFired ) {

          options.startFired = true;
          forwardStart = !forwardStart;
          ok( forwardStart, "forward's start fired" );
          plus();
        }
      },
      end: function( event, options ) {

        if ( !options.endFired ) {

          options.endFired = true;
          forwardEnd = !forwardEnd;
          p2.currentTime( 1 ).play();
          ok( forwardEnd, "forward's end fired" );
          plus();
        }
      }
    };
  });

  p2.forwards({
    start: 3,
    end: 4
  });

  Popcorn.plugin( "backwards", function() {
    return {
      start: function( event, options ) {

        if ( !options.startFired ) {

          options.startFired = true;
          backwardStart = !backwardStart;
          p2.currentTime( 0 ).play();
          ok( true, "backward's start fired" );
          plus();
        }
      },
      end: function( event, options ) {

        if ( !options.endFired ) {

          options.endFired = true;
          backwardEnd = !backwardEnd;
          ok( backwardEnd, "backward's end fired" );
          plus();
          p2.currentTime( 5 ).play();
        }
      }
    };
  });

  p2.backwards({
    start: 1,
    end: 2
  });

  Popcorn.plugin( "wrapper", {
    start: function( event, options ) {

      wrapperRunning[ options.wrapper ] = true;
    },
    end: function( event, options ) {

      wrapperRunning[ options.wrapper ] = false;
    }
  });

  // second instance of wrapper is wrapping the first
  p2.wrapper({
    start: 6,
    end: 7,
    wrapper: "one"
  })
  .wrapper({
    start: 5,
    end: 8,
    wrapper: "two"
  })
  // checking wrapper 2's start
  .cue( 5, function() {

    if ( execCount === 0 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 5" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 5" );
      plus();
    }
  })
  // checking wrapper 1's start
  .cue( 6, function() {

    if ( execCount === 1 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 6" );
      plus();
      ok( wrapperRunning.one, "wrapper one is running at second 6" );
      plus();
    }
  })
  // checking wrapper 1's end
  .cue( 7, function() {

    if ( execCount === 2 ) {

      execCount++;
      ok( wrapperRunning.two, "wrapper two is running at second 7" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 7" );
      plus();
    }
  })
  // checking wrapper 2's end
  .cue( 8, function() {

    if ( execCount === 3 ) {

      execCount++;
      ok( !wrapperRunning.two, "wrapper two is stopped at second 9" );
      plus();
      ok( !wrapperRunning.one, "wrapper one is stopped at second 9" );
      plus();
    }
  });

  p2.currentTime( 3 ).play();
});

test( "timeUpdate add track event while paused", function() {

  var $pop = Popcorn( "#video" ),
      count = 0,
      expects = 1;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      Popcorn.removePlugin( "timeUpdateTester" );
      $pop.destroy();
      start();
    }
  }

  stop();

  Popcorn.plugin( "timeUpdateTester", function() {
    return {
      start: function () {
        ok( true, "timeupdater ran while paused" );
        plus();
      },
      end: function () {
      }
    };
  });

  $pop.currentTime( 2 ).pause();

  $pop.timeUpdateTester({
    start: 1,
    end: 3
  });
});

test( "Plugin Factory", function () {

  var popped = Popcorn( "#video" ),
      methods = "load play pause currentTime mute volume roundTime exec removePlugin",
      // 15*2+2+2. executor/complicator each do 15
      expects = 34,
      count = 0;

  function plus() {
    if ( ++count == expects ) {
      Popcorn.removePlugin( "executor" );
      Popcorn.removePlugin( "complicator" );
      popped.destroy();
      start();
    }
  }

  expect( expects );
  stop();

  Popcorn.plugin( "executor", function() {

    return {

      start: function() {
        var self = this;

        // These ensure that a popcorn instance is the value of `this` inside a plugin definition
        methods.split( /\s+/g ).forEach(function( k, v ) {
          ok( k in self, "executor instance has method: " + k );
          plus();
        });

        ok( "video" in this, "executor instance has `video` property" );
        plus();
        ok( Object.prototype.toString.call( popped.video ) === "[object HTMLVideoElement]", "video property is a HTMLVideoElement" );
        plus();

        ok( "data" in this, "executor instance has `data` property" );
        plus();
        ok( Object.prototype.toString.call( popped.data ) === "[object Object]", "data property is an object" );
        plus();

        ok( "trackEvents" in this.data, "executor instance has `trackEvents` property" );
        plus();
        ok( Object.prototype.toString.call( popped.data.trackEvents ) === "[object Object]", "executor trackEvents property is an object" )
        plus();
      },
      end: function() {
      }
    };
  });

  ok( "executor" in popped, "executor plugin is now available to instance" );
  plus();
  equal( Popcorn.registry.length, 1, "One item in the registry" );
  plus();

  popped.executor({
    start: 2,
    end: 3
  });

  Popcorn.plugin( "complicator", {

    start: function( event ) {

      var self = this;

      // These ensure that a popcorn instance is the value of `this` inside a plugin definition
      methods.split( /\s+/g ).forEach(function( k, v ) {
        ok( k in self, "complicator instance has method: " + k );
        plus();
      });

      ok( "video" in this, "complicator instance has `video` property" );
      plus();
      ok( Object.prototype.toString.call( popped.video ) === "[object HTMLVideoElement]", "video property is a HTMLVideoElement" );
      plus();

      ok( "data" in this, "complicator instance has `data` property" );
      plus();
      ok( Object.prototype.toString.call( popped.data ) === "[object Object]", "complicator data property is an object" );
      plus();

      ok( "trackEvents" in this.data, " complicatorinstance has `trackEvents` property" );
      plus();
      ok( Object.prototype.toString.call( popped.data.trackEvents ) === "[object Object]", "complicator trackEvents property is an object" )
      plus();
    },
    end: function() {
      //start();
    },
    timeupdate: function() {
    }
  });

  ok( "complicator" in popped, "complicator plugin is now available to instance" );
  plus();
  equal( Popcorn.registry.length, 2, "Two items in the registry" );
  plus();

  popped.complicator({
    start: 4,
    end: 5
  });

  popped.currentTime( 0 ).play();
});

asyncTest( "Popcorn Compose", function() {

  var popped = Popcorn( "#video" ),
      expects = 43,
      count = 0,
      effectTrackOne,
      effectTrackTwo,
      effectTrackThree,
      composeOptionsOne,
      composeOptionsTwo,
      test = {
        one: {
          setup: 0,
          running: 0
        },
        two: {
          setup: 0,
          running: 0
        }
      };

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      Popcorn.removePlugin( "testPlugin" );
      Popcorn.removePlugin( "pluginOptions1" );
      Popcorn.removePlugin( "pluginOptions2" );

      popped.destroy();
      start();
    }
  }

  ok( Popcorn.compose, "Popcorn.compose method exists" );
  plus();

  ok( Popcorn.effect, "Popcorn.effect method exists" );
  plus();

  ok( Popcorn.plugin.effect, "Popcorn.plugin.effect method exists" );
  plus();


  popped.on( "canplayall", function() {
    popped.pause( popped.duration() );

    Popcorn.plugin( "testPlugin", {});

    Popcorn.compose( "testCompose1", {
      start: function() {
        test.one.running++;
      },
      end: function() {
        test.one.running--;
      },
      _setup: function() {
        test.one.setup++;
      },
      _teardown: function() {
        test.one.setup--;
      }
    });

    Popcorn.effect( "testEffect2", {
      start: function() {
        test.two.running++;
      },
      end: function() {
        test.two.running--;
      },
      _setup: function() {
        test.two.setup++;
      },
      _teardown: function() {
        test.two.setup--;
      }
    });

    popped.on( "seeked", function() {
     this.off( "seeked" );
     this.play( 0 );
    });


    popped.testPlugin({
      start: 0,
      end: 1,
      compose: "testCompose1",
      effect: "testEffect2"
    });

    effectTrackOne = popped.getLastTrackEventId();

    popped.testPlugin({
      start: 1,
      end: 2
    })
    .testPlugin({
      start: 2,
      end: 4,
      compose: "testCompose1"
    })
    .testPlugin({
      start: 3,
      end: 4,
      compose: "testCompose1 testEffect2"
    });

    effectTrackTwo = popped.getLastTrackEventId();

    popped.testPlugin({
      start: 5,
      end: 6,
      effect: "testCompose1"
    })
    .testPlugin({
      start: 6,
      end: 7,
      effect: "testCompose1 testEffect2"
    });

    effectTrackThree = popped.getLastTrackEventId();

    equal( test.one.running, 0, "no compose one running" );
    plus();
    equal( test.one.setup, 5, "five compose one setup" );
    plus();
    equal( test.two.running, 0, "no compose two running" );
    plus();
    equal( test.two.setup, 3, "three compose two setup" );
    plus();

    popped.cue( 0, function() {
      equal( test.one.running, 1, "one compose running" );
      plus();
      equal( test.two.running, 1, "one effect running" );
      plus();
    })
    .cue( 1, function() {
      equal( test.one.running, 0, "no compose running" );
      plus();
      equal( test.two.running, 0, "no effect running" );
      plus();
    })
    .cue( 2, function() {
      equal( test.one.running, 1, "one compose running" );
      plus();
      equal( test.two.running, 0, "no effect running" );
      plus();
    })
    .cue( 3, function() {
      equal( test.one.running, 2, "two compose one running" );
      plus();
      equal( test.two.running, 1, "one compose two running" );
      plus();
    })
    .cue( 4, function() {
      equal( test.one.running, 0, "no compose one running" );
      plus();
      equal( test.two.running, 0, "no compose two running" );
      plus();
    })
    .cue( 5, function() {
      equal( test.one.running, 1, "one effect running" );
      plus();
      equal( test.two.running, 0, "no compose running" );
      plus();
    })
    .cue( 6, function() {
      equal( test.one.running, 1, "one effect one running" );
      plus();
      equal( test.two.running, 1, "one effect two running" );
      plus();
    })
    .cue( 7, function() {
      popped.removeTrackEvent( effectTrackOne );
      popped.removeTrackEvent( effectTrackTwo );
      popped.removeTrackEvent( effectTrackThree );
      popped.removeTrackEvent( composeOptionsOne );
      popped.removeTrackEvent( composeOptionsTwo );
      equal( test.one.setup, 2, "three compose one teardowns called. 5 - 3 = 2" );
      plus();
      equal( test.two.setup, 0, "three compose two teardowns called. 3 - 3 = 0" );
      plus();
    });

    // runs once, 2 tests
    Popcorn.plugin( "pluginOptions1", {
      _setup: function( options ) {
        ok( options.pluginoption, "plugin option one exists at setup" );
        plus();
        ok( !options.composeoption, "compose option one does not exist at setup" );
        plus();
        // check to test plugin to effect call order
        options.composeoption = true;
      }
    });

    // runs once, 2 tests
    Popcorn.plugin( "pluginOptions2", {
      _setup: function( options ) {
        ok( !options.pluginoption, "plugin option two does not exist at setup" );
        plus();
        ok( options.composeoption, "compose option two exists at setup" );
        plus();
        // check to test plugin to effect call order
        options.pluginoption = true;
      }
    });

    // runs twice, 8 tests * 2 runs = 16 tests
    Popcorn.plugin.effect( "composeOptions", {
      _setup: function( options ) {
        ok( options.pluginoption, "plugin option exists at setup" );
        plus();
        ok( options.composeoption, "compose option exists at setup" );
        plus();
      },
      _teardown: function( options ) {
        ok( options.pluginoption, "plugin option exists at teardown" );
        plus();
        ok( options.composeoption, "compose option exists at teardown" );
        plus();
      },
      start: function( event, options ) {
        ok( options.pluginoption, "plugin option exists at start" );
        plus();
        ok( options.composeoption, "compose option exists at start" );
        plus();
      },
      end: function( event, options ) {
        ok( options.pluginoption, "plugin option exists at end" );
        plus();
        ok( options.composeoption, "compose option exists at end" );
        plus();
      }
    });

    popped.pluginOptions1({
      start: 0,
      end: 1,
      compose: "composeOptions",
      pluginoption: true
    });

    composeOptionsOne = popped.getLastTrackEventId();

    popped.pluginOptions2({
      start: 0,
      end: 1,
      compose: "composeOptions",
      composeoption: true
    });

    composeOptionsTwo = popped.getLastTrackEventId();
  });
});

test( "Teardown end tester", function() {

  QUnit.reset();

  var popped = Popcorn( "#video" ),
      expects = 4,
      count = 0;

  function plus() {
    if ( ++count === expects ) {
      Popcorn.removePlugin( "teardownEndTester" );
      start();
    }
  }

  expect( expects );
  stop();

  Popcorn.plugin( "teardownEndTester", {
    _setup: function( options ) {
      options.endCalled = false;
      options.teardownCalled = false;
    },
    start: function( event, options ) {},
    end: function( event, options ) {
      // passes if end is called before teardown, and only called once
      equal( options.endCalled, false, "ensure only teardown can call this end" );
      plus();
      equal( options.teardownCalled, false, "ensure teardown is not yet called" );
      plus();
      options.endCalled = true;
    },
    _teardown: function( options ) {

      // passes if teardown is called after end, and only called once
      equal( options.endCalled, true, "ensure end was previously called" );
      plus();
      equal( options.teardownCalled, false, "ensure teardown is not yet called" );
      plus();
      options.teardownCalled = true;
    }
  });

  // start and end times to deault to entire video,
  // to ensure the end function will never be called outside of _teardown
  popped.teardownEndTester({});

  popped.currentTime( 0 ).play();
  popped.removePlugin( "teardownEndTester" );
});

test( "Teardown end noise", function() {

  QUnit.reset();

  var popped = Popcorn( "#video" ),
      expects = 5,
      count = 0;

  function plus() {
    if ( ++count === expects ) {
      Popcorn.removePlugin( "teardownEndTester" );
      Popcorn.removePlugin( "noise" );
      start();
    }
  }

  expect( expects );
  stop();

  Popcorn.plugin( "noise", {});

  Popcorn.plugin( "teardownEndTester", {
    _setup: function( options ) {
      options.endCalled = false;
      options.teardownCalled = false;
    },
    start: function( event, options ) {},
    end: function( event, options ) {
      // passes if end is called before teardown, and only called once
      equal( options.endCalled, false, "ensure only teardown can call this end" );
      plus();
      equal( options.teardownCalled, false, "ensure teardown is not yet called" );
      plus();
      options.endCalled = true;
    },
    _teardown: function( options ) {

      // passes if teardown is called after end, and only called once
      equal( options.endCalled, true, "ensure end was previously called" );
      plus();
      equal( options.teardownCalled, false, "ensure teardown is not yet called" );
      plus();
      options.teardownCalled = true;
    }
  });

  // if plugin to check's end time and start time
  // don't align when sorted with all other times
  // teardown will not be called
  popped.noise({end: 21});
  popped.teardownEndTester({end: 20});

  popped.currentTime( 0 ).play();
  popped.removePlugin( "teardownEndTester" );

  equal( popped.data.trackEvents.byEnd[ 1 ]._natives.type, "noise", "proper end was removed"  );
  plus();
});

test( "Plugin Breaker", function() {

  QUnit.reset();

  var popped = Popcorn( "#video" ),
      expects = 6,
      count = 0;

  function plus() {
    if ( ++count == expects ) {
      Popcorn.removePlugin( "breaker" );
      start();
    }
  }

  expect( expects );
  stop();

  var breaker = {
    start: 0,
    end: 0
  };

  Popcorn.plugin( "breaker", {

    start: function() {

      breaker.start++;

      ok( true, "breaker started" );
      plus();
    },
    end: function() {

      breaker.end++;

      ok( true, "breaker ended" );
      plus();

      equal( breaker.start, 1, "plugin start method fires only once" );
      plus();
      equal( breaker.end, 1, "plugin end method fires only once" );
      plus();
    }
  });

  ok( "breaker" in popped, "breaker plugin is now available to instance" );
  plus();
  equal( Popcorn.registry.length, 1, "Three items in the registry" );
  plus();

  popped.breaker({
    start: 1,
    end: 2
  });

  popped.currentTime( 0 ).play();
});

test( "Plugin Empty", function() {

  QUnit.reset();

  var popped = Popcorn( "#video" ),
      expects = 4,
      testObj = {},
      count = 0;

  function plus() {
    if ( ++count == expects ) {
      Popcorn.removePlugin( "empty" );
      start();
    }
  }

  expect( expects );
  stop();

  Popcorn.plugin( "empty", testObj );

  popped.empty({});

  ok( testObj.start, "default start function is generated" );
  plus();
  ok( testObj.end, "default end function is generated" );
  plus();
  ok( testObj._setup, "default _setup function is generated" );
  plus();
  ok( testObj._teardown, "default _teardown function is generated" );
  plus();

  popped.currentTime( 0 ).play();
});

test( "Plugin Closure", function() {

  QUnit.reset();

  var popped = Popcorn( "#video" ),
      methods = "load play pause currentTime mute volume roundTime exec removePlugin",
      expects = 8,
      count = 0;

  function plus() {
    if ( ++count == expects ) {
      Popcorn.removePlugin( "closure" );
      start();
    }
  }

  expect( expects );
  stop();

  Popcorn.plugin( "closure", function() {

    var startCount = 0;
    var endCount = 0;

    return {

      _setup: function( options ) {
        options.startCount = 0;
        options.endCount = 0;
      },
      start: function( event, options ) {
        // called once for each instance; the test will fail if startCount is not actually unique per instance
        equal( startCount++, options.startCount++, options.nick + " has correct start counts" );
        plus();
      },
      end: function( event, options ) {
        // likewise for endCount
        equal( endCount++, options.endCount++, options.nick + " has correct end counts" );
        plus();

        // running tracks again to make sure data increments uniquly
        popped.currentTime( 5 ).play();
      }
    };
  });

  popped.closure({
    start: 5,
    end: 6,
    nick: "first closure track"
  })
  .closure({
    start: 5,
    end: 6,
    nick: "second closure track"
  });

  popped.currentTime( 5 ).play();

});

test( "Remove Plugin", function() {

  var p = Popcorn( "#video" ),
      p2 = Popcorn( "#video" ),
      rlen = Popcorn.registry.length,
      count = 0,
      expects = 23,
      interval;

  function plus() {
    if ( ++count === expects ) {
      start();
      Popcorn.removePlugin( "cleanup" );
    }
  }

  expect( expects );
  stop();

  p.on( "seeked", function() {
    this.off( "seeked" );

    equal( rlen, 0, "Popcorn.registry.length is empty" );
    plus();

    equal( p.data.trackEvents.byStart.length, 2, "p.data.trackEvents.byStart is initialized and has 2 entries" );
    plus();
    equal( p.data.trackEvents.byEnd.length, 2, "p.data.trackEvents.byEnd is initialized and has 2 entries" );
    plus();

    Popcorn.plugin( "removeme", {

      start: function() {

      },
      end: function() {

      },
      _teardown: function( options ) {
        ok( true, "teardown called on " + options.order + " plugin via removePlugin()" );
        plus();
      }
    });

    p.removeme({
      start: 2,
      end: 3,
      order: "first"
    });

    p2.removeme({
      start: 2,
      end: 3,
      order: "second"
    });

    equal( Popcorn.registry.length, 1, "Popcorn.registry.length is 1" );
    plus();
    equal( p.data.trackEvents.byStart.length, 3, "p.data.trackEvents.byStart is updated and has 3 entries" );
    plus();
    equal( p.data.trackEvents.byEnd.length, 3, "p.data.trackEvents.byEnd is updated and has 3 entries" );
    plus();

    p.removePlugin( "removeme" );

    // p.removeme still exists on the prototype, even though we said to remove it
    // the tracks of that type though, are removed.
    // think of it as removing all tracks of plugin type attached to an instance
    ok( typeof p.removeme === "function", "removeme plugin is still defined to p instance" );
    plus();
    ok( ( "removeme" in Popcorn.prototype ), "removeme plugin is still available to Popcorn.prototype" );
    plus();
    equal( Popcorn.registry.length, 1, "Popcorn.registry.length has not changed" );
    plus();

    ok( ( typeof p2.removeme === "function" ), "removeme plugin is defined to p2 instance" );
    plus();

    equal( p2.data.trackEvents.byStart.length, 3, "p2.data.trackEvents.byStart is updated and has 3 entries" );
    plus();
    equal( p2.data.trackEvents.byEnd.length, 3, "p2.data.trackEvents.byEnd is updated and has 3 entries" );
    plus();

    equal( p.data.trackEvents.byStart.length, 2, "p.data.trackEvents.byStart is updated and has 2 entries" );
    plus();
    equal( p.data.trackEvents.byEnd.length, 2, "p.data.trackEvents.byEnd is updated and has 2 entries" );
    plus();
    Popcorn.removePlugin( "removeme" );

    ok( !( "removeme" in p2 ), "removeme plugin is no longer available to p2 instance" );
    plus();
    ok( !( "removeme" in Popcorn.prototype ), "removeme plugin is no longer available to Popcorn.prototype" );
    plus();
    equal( Popcorn.registry.length, 0, "Popcorn.registry.length is empty again" );
    plus();

    interval = setInterval(function() {
      if( p2.currentTime() > 3 ) {

        equal( p2.data.trackEvents.byStart.length, 2, "p2.data.trackEvents.byStart is updated and has 2 entries" );
        plus();
        equal( p2.data.trackEvents.byEnd.length, 2, "p2.data.trackEvents.byEnd is updated and has 2 entries" );
        plus();
        clearInterval( interval );
      }
    }, 1 );

    Popcorn.plugin( "cleanup", {

      _setup: function( options ) {

        options.exist = true;
      },
      _teardown: function( options ) {

        ok( true, "cleanup function is called during removal" );
        plus();

        ok( options.exist, "options object exists at time of cleanup" );
        plus();
      }
    });

    p2.cleanup({
      start: 2,
      end: 3
    });
    p2.removeTrackEvent( p2.getLastTrackEventId() );

    p2.currentTime( 2 ).play();
  });

  p.currentTime( 0 ).pause();

});

test( "Protected Names", function() {

  var keys = [],
      len,
      count = 0,
      popped = Popcorn( "#video" );

  for ( var item in Popcorn.p ) {
    if ( Popcorn.p.hasOwnProperty( item ) ) {
      keys.push( item );
    }
  }

  len = keys.length;

  expect( len );

  Popcorn.forEach( keys, function( name ) {
    try {
      Popcorn.plugin( name, {} );
      ok( false, "Attempting to overwrite '" + name + "' did not throw an exception " );
    } catch ( e ) {
      ok( true, "Attempting to overwrite '" + name + "' threw an exception " );
    };
  });
});

test( "Defaulting Empty End Values", function() {

  expect( 2 );

  Popcorn.plugin( "testdefault", {
    _setup: function( options ) {
      equal( options.end, Number.MAX_VALUE, "The end value defaulted to maximum number value");
    },
    start: function( event, options ) {
    },
    end: function( event, options ) {
    }
  });

  var popped = Popcorn( document.createElement( "audio" ) )
  .play()
  .testdefault({
    start: 0,
    apikey: "CHAyhB5IisvLqqzGYNYbmA",
    mediaid: "13607892"
  });

  var popped2 = Popcorn( document.createElement( "video" ) )
  .play()
  .testdefault({
    start: 0,
    apikey: "CHAyhB5IisvLqqzGYNYbmA",
    mediaid: "13607892"
  });
});

test( "In/Out aliases", function() {
  var popcorn = Popcorn( "#video" ),
      expects = 5,
      count = 0,
      counter = 0;

  expect( expects );
  stop();

  function plus() {
    if ( ++count === expects ) {
      Popcorn.removePlugin( "aliasTester" );
      Popcorn.destroy( popcorn );
      start();
    }
  }

  Popcorn.plugin( "aliasTester", function() {

    return {
      "in": function() {
        counter++;
      },
      out: function() {
        counter++;
      }
    };
  });

  popcorn.aliasTester({
    "in": 1,
    out: 3
  });

  popcorn.listen( "seeked", function() {
    this.off( "seeked" ).play( 0 );
  });

  popcorn.currentTime( 0 );

  ok( popcorn.data.events[ "in" ], "in is a valid alias for start" );
  plus();

  ok( popcorn.data.events[ "out" ], "out is a valid alias for end" );
  plus();

  equal( counter, 0, "Counter is at 0, neither in or out have been called" );
  plus();

  popcorn.cue( 2, function() {
    equal( counter, 1, "Counter is at 1, in has been called" );
    plus();
  });

  popcorn.cue( 4, function() {
    equal( counter, 2, "Counter is at 2, out has been called" );
    plus();
  });
});

module( "Popcorn TrackEvents" );
test( "Functions", function() {

  //  TODO: break this into sep. units per function
  expect( 19 );

  var popped = Popcorn( "#video" ), ffTrackId, rwTrackId, rw2TrackId, rw3TrackId, historyRef, trackEvents;


  Popcorn.plugin( "ff", function() {
    return {
      start: function() {},
      end: function() {}
    };
  });

  popped.ff({
    start: 3,
    end: 4
  });


  ffTrackId = popped.getLastTrackEventId();

  Popcorn.plugin( "rw", function() {
    return {
      start: function() {},
      end: function() {}
    };
  });

  popped.rw({
    start: 1,
    end: 2
  });

  rwTrackId = popped.getLastTrackEventId();

  historyRef = popped.data.history;

  equal( historyRef.length, 2, "2 TrackEvents in history index" );
  equal( popped.data.trackEvents.byStart.length, 4, "4 TrackEvents in popped.data.trackEvents.byStart " );
  equal( popped.data.trackEvents.byEnd.length, 4, "4 TrackEvents in popped.data.trackEvents.byEnd " );

  trackEvents = popped.getTrackEvents();

  equal( trackEvents.length, 2, "2 user created trackEvents returned by popped.getTrackEvents()" )

  ok( ffTrackId !== rwTrackId, "Track Events have different ids" );

  popped.removeTrackEvent( rwTrackId );

  equal( popped.data.history.length, 1, "1 TrackEvent in history index - after popped.removeTrackEvent( rwTrackId ); " );
  equal( popped.data.trackEvents.byStart.length, 3, "3 TrackEvents in popped.data.trackEvents.byStart " );
  equal( popped.data.trackEvents.byEnd.length, 3, "3 TrackEvents in popped.data.trackEvents.byEnd " );

  trackEvents = popped.getTrackEvents();

  equal( trackEvents.length, 1, "1 user created trackEvents returned by popped.getTrackEvents()" );

  popped.rw({
    start: 1,
    end: 2
  });

  rw2TrackId = popped.getLastTrackEventId();

  equal( popped.data.history.length, 2, "2 TrackEvents in history index - after new track added ");

  ok( rw2TrackId !== rwTrackId, "rw2TrackId !== rwTrackId" );

  equal( popped.data.trackEvents.byStart.length, 4, "4 TrackEvents in popped.data.trackEvents.byStart  - after new track added" );
  equal( popped.data.trackEvents.byEnd.length, 4, "4 TrackEvents in popped.data.trackEvents.byEnd  - after new track added" );

  trackEvents = popped.getTrackEvents();

  equal( trackEvents.length, 2, "2 user created trackEvents returned by popped.getTrackEvents()" )

  popped.rw({
    id: "my-track-id",
    start: 3,
    end: 10
  });

  rw3TrackId = popped.getLastTrackEventId();

  equal( popped.data.history.length, 3, "3 TrackEvents in history index - after new track added " );
  equal( popped.data.trackEvents.byStart.length, 5, "5 TrackEvents in popped.data.trackEvents.byStart  - after new track added" );
  equal( popped.data.trackEvents.byEnd.length, 5, "5 TrackEvents in popped.data.trackEvents.byEnd  - after new track added" );

  equal( rw3TrackId, "my-track-id", "TrackEvent has user defined id" );

  trackEvents = popped.getTrackEvents();

  equal( trackEvents.length, 3, "3 user created trackEvents returned by popped.getTrackEvents()" );
});

test( "getTrackEvent", function() {

  //  TODO: break this into sep. units per function
  expect( 5 );

  var popped = Popcorn( "#video" ),
    trackIds = [], obj, oldId;

  Popcorn.plugin( "ff", function() {
    return {
      start: function() {},
      end: function() {}
    };
  });

  popped.ff({
    start: 3,
    end: 4
  });

  trackIds.push( popped.getLastTrackEventId() );

  Popcorn.plugin( "rw", function() {
    return {
      start: function() {},
      end: function() {}
    };
  });

  popped.rw({
    start: 1,
    end: 2
  });

  trackIds.push( popped.getLastTrackEventId() );

  popped.rw({
    start: 5,
    end: 7
  });

  trackIds.push( popped.getLastTrackEventId() );

  obj = popped.getTrackEvent( trackIds[ 0 ] );

  equal( typeof obj  === "object", true, "getTrackEvent() returned an object" );

  trackIds.forEach ( function( id ) {
    var trackEvent = popped.getTrackEvent( id );
    equal( id, trackEvent._id, "returned the correct TrackEvent" );
  });

  oldId = trackIds[ trackIds.length - 1 ];

  popped.removeTrackEvent( oldId );

  equal( popped.getTrackEvent( oldId ), undefined,  "returned undefined when id is not found" );
});

test( "Index Integrity ( removing tracks )", function() {

  var $pop = Popcorn( "#video" ),
      count = 0,
      expects = 3,
      fired = {
        one: false,
        two: false,
        three: false
      },
      tId;

  expect( expects );

  stop();

  Popcorn.plugin( "test", {} );

  function plus() {
    if ( ++count === expects ) {
      start();
      Popcorn.removePlugin( "test" );
      $pop.destroy();
    }
  }

  $pop.test({});

  tId = $pop.getLastTrackEventId();

  $pop.cue( 1, function() {
    equal( fired.one === false && fired.two === false && fired.three === false, true, "nothing fired yet" );
    plus();
    fired.one = true;
    $pop.removeTrackEvent( tId );
  });

  $pop.cue( 2, function() {
    equal( fired.one === true && fired.two === false && fired.three === false, true, "One fired, Three has not fired" );
    plus();
    fired.two = true;
  });

  $pop.cue( 3, function() {
    equal( fired.one === true && fired.two === true && fired.three === false, true, "One and Two fired, three not fired");
    plus();
  });

  $pop.on( "canplayall", function() {
    this.volume( 0 ).play( 0 );
  });
});

asyncTest( "Index Integrity ( timeUpdate )", function() {

  var $pop = Popcorn( "#video" );
      count = 0,
      expects = 8;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      Popcorn.removePlugin( "ff" );
      $pop.destroy();
      start();
    }
  }

  var trackLen,
    hasrun = false,
    lastrun = false;

  Popcorn.plugin( "ff", function() {
    return {
      start: function() {
      },
      end: function() {
      }
    };
  });

  equal( $pop.data.trackEvents.endIndex, 1, "$pop.data.trackEvents.endIndex is 1" );
  plus();

  equal( $pop.data.trackEvents.startIndex, 1, "$pop.data.trackEvents.startIndex is 1" );
  plus();

  $pop.on( "canplayall", function() {

    $pop.ff({
      id: "removeable-track-event",
      start: 40,
      end: 41
    });

    $pop.cue( 42, function() {

      // 4 track events: startpad, endpad, ff and exec
      equal( $pop.data.trackEvents.byStart.length, 4, "$pop.data.trackEvents.byStart.length is 4 - after play, before removeTrackEvent" );
      plus();
      equal( $pop.data.trackEvents.startIndex, 2, "$pop.data.trackEvents.startIndex is 2 - after play, before removeTrackEvent" );
      plus();
      equal( $pop.data.trackEvents.endIndex, 2, "$pop.data.trackEvents.endIndex is 2 - after play, before removeTrackEvent" );
      plus();

      $pop.removeTrackEvent( "removeable-track-event" );

      equal( $pop.data.trackEvents.byStart.length, 3, "$pop.data.trackEvents.byStart.length is 3 - after removeTrackEvent" );
      plus();
      equal( $pop.data.trackEvents.startIndex, 1, "$pop.data.trackEvents.startIndex is 1 - after removeTrackEvent");
      plus();
      equal( $pop.data.trackEvents.endIndex, 1, "$pop.data.trackEvents.endIndex is 1 - after removeTrackEvent" );
      plus();

    }).play( 40 );
  });
});

asyncTest( "Index Integrity (frameAnimation)", function() {

  var $pop = Popcorn( "#video", {
         frameAnimation: true
       }),
      count = 0,
      expects = 8;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      Popcorn.removePlugin( "ff" );
      $pop.destroy();
      start();
    }
  }

  var trackLen,
    hasrun = false,
    lastrun = false;

  Popcorn.plugin( "ff", function() {
    return {
      start: function() {
      },
      end: function() {
      }
    };
  });

  equal( $pop.data.trackEvents.endIndex, 1, "$pop.data.trackEvents.endIndex is 1" );
  plus();

  equal( $pop.data.trackEvents.startIndex, 1, "$pop.data.trackEvents.startIndex is 1" );
  plus();

  $pop.on( "canplayall", function() {

    $pop.ff({
      id: "removeable-track-event",
      start: 40,
      end: 41
    });

    $pop.cue( 42, function() {
      // 4 track events: startpad, endpad, ff and exec
      equal( $pop.data.trackEvents.byStart.length, 4, "$pop.data.trackEvents.byStart.length is 4 - after play, before removeTrackEvent" );
      plus();
      equal( $pop.data.trackEvents.startIndex, 2, "$pop.data.trackEvents.startIndex is 2 - after play, before removeTrackEvent" );
      plus();
      equal( $pop.data.trackEvents.endIndex, 2, "$pop.data.trackEvents.endIndex is 2 - after play, before removeTrackEvent" );
      plus();

      $pop.removeTrackEvent( "removeable-track-event" );

      equal( $pop.data.trackEvents.byStart.length, 3, "$pop.data.trackEvents.byStart.length is 3 - after removeTrackEvent" );
      plus();
      equal( $pop.data.trackEvents.startIndex, 1, "$pop.data.trackEvents.startIndex is 1 - after removeTrackEvent" );
      plus();
      equal( $pop.data.trackEvents.endIndex, 1, "$pop.data.trackEvents.endIndex is 1 - after removeTrackEvent");
      plus();

    }).currentTime( 40 ).play();
  });
});

asyncTest( "Popcorn.disable/enable/toggle (timeupdate)", function() {

  var $pop = Popcorn( "#video" ),
      count = 0,
      startCalls = 0,
      endCalls = 0,
      expects = 17;

  Popcorn.plugin.debug = true;
      
  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
      Popcorn.removePlugin( "toggler" );
      $pop.destroy();
    }
  }

  Popcorn.plugin( "toggler", function() {
    return {
      _setup: function( options ) {

        options.startCalls = options.endCalls = 0;
      },
      start: function( event, options ) {

        startCalls = ++options.startCalls;
      },
      end: function( event, options ) {

        endCalls = ++options.endCalls;
      }
    };
  });

  $pop.cue( 41, function() {

    // pause to ensure end is never called outside of disable and toggle
    $pop.pause();
    
    equal( startCalls, 1, "start is called once, to initiate state" );
    plus();

    // Test per-instance function call
    $pop.disable( "toggler" );

    ok( $pop.data.disabled[ "toggler" ], "disable() plugin: toggler is disabled" );
    plus();

    equal( endCalls, 1, "end is called once during disable, for a running plugin" );
    plus();

    // Test per-instance function call
    $pop.enable( "toggler" );

    ok( !$pop.data.disabled[ "toggler" ], "enable() plugin: toggler is enabled" );
    plus();
    
    equal( startCalls, 2, "start is called once again, this time via enable" );
    plus();

    // Test per-instance toggle off
    $pop.toggle( "toggler" );

    ok( $pop.data.disabled[ "toggler" ], "toggle() plugin: toggler is disabled" );
    plus();

    equal( endCalls, 2, "end is called once again, this time via toggle" );
    plus();

    $pop.pause();

    $pop.listen( "seeked", function() {

      $pop.unlisten( "seeked" );

      $pop.enable( "toggler" );

      ok( !$pop.data.disabled[ "toggler" ], "toggle() plugin: toggler is enabled while paused" );
      plus();

      equal( startCalls, 3, "start is called once again, this time via enable while paused" );
      plus();

      $pop.disable( "toggler" );

      ok( $pop.data.disabled[ "toggler" ], "toggle() plugin: toggler is disabled while paused" );
      plus();

      equal( endCalls, 3, "end is called once again, this time via disable while paused" );
      plus();

      $pop.toggle( "toggler" );

      ok( !$pop.data.disabled[ "toggler" ], "toggle() plugin: toggler is enabled while paused" );
      plus();

      equal( startCalls, 4, "start is called once again, this time via toggle while paused" );
      plus();

      $pop.listen( "seeked", function() {

        $pop.unlisten( "seeked" );

        equal( endCalls, 4, "end is called once again, this time via seek while paused and enabled" );
        plus();

        $pop.disable( "toggler" );

        $pop.listen( "seeked", function() {

          $pop.unlisten( "seeked" );

          equal( startCalls, 4, "when seeking into events frame and disabled, start should not be called" );
          plus();

          $pop.listen( "seeked", function() {

            $pop.unlisten( "seeked" );

            $pop.enable( "toggler" );

            equal( startCalls, 4, "when seeking outside events frame and enabled, start should not be called" );
            plus();

            $pop.disable( "toggler" );

            equal( endCalls, 4, "when diable is called outside event time, end should not be called" );
            plus();
          });

          $pop.currentTime( 39 );
        });

        $pop.currentTime( 41 );
      });

      $pop.currentTime( 39 );
    });

    $pop.currentTime( 41 );
  });

  // ensure toggler does not fire until we are ready
  $pop.currentTime( 0 );

  $pop.toggler({
    start: 40,
    end: 50
  });

  $pop.play( 39 );
});

test( "end undefined or false should never be fired", function() {

  var $pop = Popcorn( "#video" ),
      count = 0,
      endFired = false,
      expects = 1;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      start();
      Popcorn.removePlugin( "neverEndingStory" );
      Popcorn.removePlugin( "endingStory" );
    }
  }

  Popcorn.plugin( "neverEndingStory", {
    end: function() {
      ok( false, "" );
      endFired = true;
	}
  });

  Popcorn.plugin( "endingStory", {
    end: function() {
      ok( !endFired, "end should not of been fired." );
      plus();
    }
  });

  stop();

  $pop.neverEndingStory({});
  $pop.neverEndingStory({ end: false });
  $pop.neverEndingStory({ end: undefined });
  $pop.endingStory({ end: $pop.duration() });
  $pop.currentTime( $pop.duration() );
});

module( "Popcorn XHR" );
test( "Basic", function() {

  expect( 2 );

  equal( typeof Popcorn.xhr, "function" , "Popcorn.xhr is a provided static function" );
  equal( typeof Popcorn.xhr.httpData, "function" , "Popcorn.xhr.httpData is a provided static function" );
});

test( "Text Response", function() {

  var expects = 2,
      count = 0;

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  expect( expects );

  stop()

  Popcorn.xhr({
    url: "data/test.txt",
    success: function( data ) {

      ok( data, "xhr returns data" );
      plus();

      equal( data.text, "This is a text test", "test.txt returns the string 'This is a text test'" );
      plus();
    }
  });
});

test( "dataType: Text Response", function() {

  var expects = 2,
      count = 0;

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  expect( expects );

  stop()

  Popcorn.xhr({
    url: "data/test.txt",
    dataType: "text",
    success: function( data ) {

      ok( data, "xhr returns data" );
      plus();

      equal( data, "This is a text test", "dataType: 'text', test.txt returns the string 'This is a text test'" );
      plus();
    }
  });
});

test( "XML Conversion", function() {

  var expects,
      count = 0,
      i,
      len,
      validXML = [ "data/test.xml", "data/test.ttml" ],
      invalidXML = [ "data/test.txt", "data/remoteA.js" ];

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  expects = validXML.length * 2 + invalidXML.length * 3;

  expect( expects );

  stop();

  function testValidXML( fileName ) {
    Popcorn.xhr({
      url: fileName,
      success: function( data ) {

        ok( data, "xhr returns data" );
        plus();

        var parser = new DOMParser(),
        xml = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><dashboard><locations class="foo"><location for="bar"><infowindowtab> <tab title="Location"><![CDATA[blabla]]></tab> <tab title="Users"><![CDATA[blublu]]></tab> </infowindowtab> </location> </locations> </dashboard>',"text/xml"),
        xml2 = parser.parseFromString( data.text, "text/xml" );

        equal( xml.toString(), xml2.toString(), "data.xml returns a document of xml for " + fileName );
        plus();
      }
    });
  }

  function testInvalidXML( fileName ) {
    Popcorn.xhr({
      url: fileName,
      success: function( data ) {

        ok( data, "xhr returns data" );
        plus();

        ok( !data.xml, "data.xml is null for non-xml file: " + fileName );
        plus();

        ok( data.text, "data.text is still not null" );
        plus();
      }
    });
  }

  for ( i = 0, len = validXML.length; i < len; i++ ) {
    testValidXML( validXML[ i ] );
  }

  for ( i = 0, len = invalidXML.length; i < len; i++ ) {
    testInvalidXML( invalidXML[ i ] );
  }
});


test( "JSON Response", function() {

  var expects = 2,
      count = 0;

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  expect( expects );

  stop()

  var testObj = {
        "data": {
          "lang": "en",
          "length": 25
        }
      };

  Popcorn.xhr({
    url: "data/test.js",
    success: function( data ) {

      ok( data, "xhr returns data" );
      plus();

      ok( QUnit.equiv(data.json, testObj) , "data.json returns an object of data" );
      plus();
    }
  });
});

test( "dataType: JSON Response", function() {

  var expects = 2,
      count = 0;

  function plus() {
    if ( ++count === expects ) {
      start();
    }
  }

  expect( expects );

  stop()

  var testObj = {
        "data": {
          "lang": "en",
          "length": 25
        }
      };

  Popcorn.xhr({
    url: "data/test.js",
    dataType: "json",
    success: function( data ) {

      ok( data, "xhr returns data" );
      plus();

      ok( QUnit.equiv( data, testObj ) , "dataType: 'json',  data returns an object of data" );
      plus();
    }
  });
});

if ( !/file/.test( location.protocol ) ) {

  test( "JSONP Response", function() {

    var expects = 8,
        count = 0;

    function plus() {
      if ( ++count === expects ) {
        start();
      }
    }

    expect( expects );

    stop();

    var testObj = {
          "data": {
             "lang": "en",
             "length": 25
          }
        };

    Popcorn.xhr({

      url: "data/jsonp.php?callback=jsonp",
      dataType: "jsonp",
      success: function( data ) {

        ok( data, "getJSONP returns data" );
        plus();

        ok( QUnit.equiv(data, testObj) , "Popcorn.xhr({}) data.json returns an object of data" );
        plus();
      }
    });

    Popcorn.xhr.getJSONP(

      "data/jsonp.php?callback=jsonp",
      function( data ) {

        ok( data, "getJSONP returns data" );
        plus();
        ok( QUnit.equiv(data, testObj) , "Popcorn.xhr.getJSONP data.json returns an object of data" );
        plus();
      }
    );

    Popcorn.xhr.getJSONP( "http://api.flickr.com/services/feeds/photos_public.gne?id=35034346917@N01&lang=en-us&format=json&jsoncallback=flickr",

      function( data ) {

        ok( data, "getJSONP returns flickr data" );
        plus();
        equal( typeof data, "object", "getJSONP returns flickr data" );
        plus();
      }
    );

    Popcorn.getJSONP(

      "data/jsonp.php?callback=jsonp",
      function( data ) {

        ok( data, "getJSONP returns data" );
        plus();
        ok( QUnit.equiv( data, testObj ) , "Popcorn.xhr.getJSONP data.json returns an object of data" );
        plus();
      }
    );
  });

} else {
  test( "JSONP Response", function() {

    expect( 1 );

    stop();
    ok( false, "jsonp requests require a webserver with php" );
    start();
  });
}

test( "Popcorn.getScript()", function() {

  var expects = 8,
      count = 0;

  function plus() {
    if ( ++count === expects ) {
      start();
      delete window[ "testFunction" ];
    }
  }

  expect( expects );

  stop();

  Popcorn.xhr({

    url: "data/remoteA.js",

    dataType: "script",

    success: function() {

      ok( true, "getScript A returned" );
      plus();
      ok( Popcorn.AlphaLib, "Popcorn.xhr.getScript remoteA.js loaded: `Popcorn.AlphaLib` is available" );
      plus();
    }
  });

  Popcorn.getScript(

    "data/remoteB.js",
    function() {

      ok( true, "getScript B returned" );
      plus();
      ok( Popcorn.BetaLib , "Popcorn.getScript remoteB.js loaded: `Popcorn.BetaLib` is available " );
      plus();
    }
  );

  Popcorn.getScript(

    "http://popcornjs.org/code/test/data/testfunction2.js",
    function() {

      ok( true, "getScript C returned" );
      plus();
      ok( ( "testFunction2" in window ), "Popcorn.getScript data/testfunction.js loaded: `testFunction2` is available" );
      plus();

      delete window[ "testFunction2" ];
    }
  );

  var cb = function( id ) {
    if ( window.testFunction ) {
      ok( true, "testFunction called by plugin id#: " + id );
      plus();
    } else {
      ok( false, "testFunction called by plugin id#: " + id );
      plus();
    }
  }

  Popcorn.getScript( "data/testfunction.js", function() { cb( 1 ); } );
  Popcorn.getScript( "data/testfunction.js", function() { cb( 2 ); } );
});

asyncTest( "XML Response", function() {

  var expects = 2;

  expect( expects );

  Popcorn.xhr({
    url: "data/test.xml",
    success: function( data ) {

      ok( data, "xhr returns data" );

      var parser = new DOMParser(),
      xml = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><dashboard><locations class="foo"><location for="bar"><infowindowtab> <tab title="Location"><![CDATA[blabla]]></tab> <tab title="Users"><![CDATA[blublu]]></tab> </infowindowtab> </location> </locations> </dashboard>',"text/xml"),
      xml2 = parser.parseFromString( data.text, "text/xml" );

      equal( xml.toString(), xml2.toString(), "data.xml returns a document of xml" );
      start();
    }
  });
});

asyncTest( "dataType: XML Response", function() {

  var expects = 2;

  expect( expects );


  Popcorn.xhr({
    url: "data/test.xml",
    dataType: "xml",
    success: function( data ) {

      ok( data, "xhr returns data" );

      var parser = new DOMParser(),
      xml = parser.parseFromString( '<?xml version="1.0" encoding="UTF-8"?><dashboard><locations class="foo"><location for="bar"><infowindowtab> <tab title="Location"><![CDATA[blabla]]></tab> <tab title="Users"><![CDATA[blublu]]></tab> </infowindowtab> </location> </locations> </dashboard>',"text/xml" );

      if ( data.toString ) {
        equal( data.toString(), xml.toString(), "data.xml returns a document of xml");
      } else {
        var xml2 = parser.parseFromString( data.xml, "text/xml" );
        equal( xml2.toString(), xml.toString(), "data.xml returns a document of xml");
      }

      start();
    }
  });
});

module( "Audio" );
test( "Basic Audio Support (timeupdate)", function() {

  var popped = Popcorn( "#audio" ),
      popObj = Popcorn( document.getElementById( "audio" ) ),
      methods = "load play pause currentTime mute volume roundTime exec removePlugin",
      count = 0,
      expects = 30;

  expect( expects );

  function plus() {

    if ( ++count === expects ) {

      start();
    }
  }

  stop();

  // testing element passed by id
  ok( "audio" in popped, "instance by id has `media` property" );
  plus();
  equal( Object.prototype.toString.call( popped.media ), "[object HTMLAudioElement]", "instance by id media property is a HTMLAudioElement" );
  plus();

  ok( "data" in popped, "instance by id has `data` property" );
  plus();
  equal( Object.prototype.toString.call( popped.data ), "[object Object]", "instance by id data property is an object" );
  plus();

  ok( "trackEvents" in popped.data, "instance by id has `trackEvents` property" );
  plus();
  equal( Object.prototype.toString.call( popped.data.trackEvents ), "[object Object]", "instance by id trackEvents property is an object" );
  plus();

  popped.play();

  methods.split( /\s+/g ).forEach(function( k, v ) {

    ok( k in popped, "instance by id has method: " + k );
    plus();
  });

  // testing element passed by reference
  ok( "media" in popObj, "instance by reference has `media` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.media ), "[object HTMLAudioElement]", "instance by reference media property is a HTMLAudioElement" );
  plus();

  ok( "data" in popObj, "instance by reference has `data` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.data ), "[object Object]", "instance by reference data property is an object" );
  plus();

  ok( "trackEvents" in popObj.data, "instance by reference has `trackEvents` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.data.trackEvents ), "[object Object]", "instance by reference trackEvents property is an object" );
  plus();

  popObj.play();

  methods.split( /\s+/g ).forEach(function( k, v ) {

    ok( k in popObj, "instance by reference has method: " + k );
    plus();
  });
});

test( "Basic Audio Support (frameAnimation)", function() {

  var popped = Popcorn( "#audio", {
        frameAnimation: true
      }),
      popObj = Popcorn( document.getElementById( "audio" ), {
        frameAnimation: true
      }),
      methods = "load play pause currentTime mute volume roundTime exec removePlugin",
      count = 0,
      expects = 30;

  expect( expects );

  function plus() {

    if ( ++count === expects ) {
      popped.destroy();
      popObj.destroy();
      start();
    }
  }

  stop();

  // testing element passed by id
  ok( "audio" in popped, "instance by id has `media` property" );
  plus();
  equal( Object.prototype.toString.call( popped.media ), "[object HTMLAudioElement]", "instance by id media property is a HTMLAudioElement" );
  plus();

  ok( "data" in popped, "instance by id has `data` property" );
  plus();
  equal( Object.prototype.toString.call( popped.data ), "[object Object]", "instance by id data property is an object" );
  plus();

  ok( "trackEvents" in popped.data, "instance by id has `trackEvents` property" );
  plus();
  equal( Object.prototype.toString.call( popped.data.trackEvents ), "[object Object]", "instance by id trackEvents property is an object" );
  plus();

  popped.play();

  methods.split( /\s+/g ).forEach(function( k, v ) {

    ok( k in popped, "instance by id has method: " + k );
    plus();
  });

  // testing element passed by reference
  ok( "media" in popObj, "instance by reference has `media` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.media ), "[object HTMLAudioElement]", "instance by reference media property is a HTMLAudioElement" );
  plus();

  ok( "data" in popObj, "instance by reference has `data` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.data ), "[object Object]", "instance by reference data property is an object" );
  plus();

  ok( "trackEvents" in popObj.data, "instance by reference has `trackEvents` property" );
  plus();
  equal( Object.prototype.toString.call( popObj.data.trackEvents ), "[object Object]", "instance by reference trackEvents property is an object" );
  plus();

  popObj.play();

  methods.split( /\s+/g ).forEach(function( k, v ) {

    ok( k in popObj, "instance by reference has method: " + k );
    plus();
  });
});

module( "Popcorn Test Runner End" );
test( "Last Check", function() {
  //  Trigger follow-up tests to run in iframes
  (function( $ ) {
    $( "iframe[data-src]" ).attr( "src", function() {
      return $( this ).data( "src" );
    });
    ok( true, "iframe tests run" );
  })( jQuery );
});
