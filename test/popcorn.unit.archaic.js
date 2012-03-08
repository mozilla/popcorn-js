var methodsString = "removeInstance addInstance getInstanceById removeInstanceById " +
          "forEach extend effects error guid sizeOf isArray nop position disable enable destroy" +
          "addTrackEvent removeTrackEvent getTrackEvents getTrackEvent getLastTrackEventId " +
          "timeUpdate plugin removePlugin compose effect xhr getJSONP getScript";
		  
module("Core");
test("Dummy", function () {

  expect( 1 );

  ok( Popcorn, "Popcorn dummy exists");
});

test("isSupported", function () {

  expect( 2 );

  ok( "isSupported" in Popcorn, "Popcorn.isSupported boolean flag exists");
  ok( !Popcorn.isSupported, "Popcorn.isSupported boolean flag is false");
});


module("Static Methods");
(function() {

  var method,
      methods = methodsString.split( /\s+/ );

  while( methods.length ) {

    method = methods.shift();

    test( method, function () {

      expect( 1 );

      ok( Popcorn[ method ], "Popcorn." + method + " exists");
    });
  }

})( Popcorn );


module("Attempt");
(function() {

  var method,
      methods = methodsString.split( /\s+/ );

  while( methods.length ) {

    method = methods.shift();

    test( method, function () {

      expect( 1 );

      equal( Popcorn[ method ](), undefined, "Popcorn." + method + "() dummy returns undefined without throwing exception");

    });
  }

})( Popcorn );

