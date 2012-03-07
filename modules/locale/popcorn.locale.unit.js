(function( Popcorn ) {

  module( "Popcorn Locale" );

  asyncTest( "Popcorn.locale object", function() {

    var api = {
          get: "function",
          set: "function",
          broadcast: "function"
        },
        locale = navigator.userLanguage || navigator.language,
        parts = locale.split( "-" ),

        stub = {
         iso6391: locale,
         language: parts[ 0 ],
         region: parts[ 1 ]
        },
        $pop = Popcorn( "#video" ),
        expects = 18,
        count = 0;

    expect( expects );

    function plus() {
      if ( ++count == expects ) {
        start();
      }
    }

    ok( Popcorn.locale, "Popcorn.locale exists");
    plus();

    equal( typeof Popcorn.locale, "object", "Popcorn.locale is an object" );
    plus();

    Popcorn.forEach( api, function( type, method ) {
      ok( Popcorn.locale[ method ], "Popcorn.locale." + method + "() exists" );
      plus();
      equal( typeof Popcorn.locale[ method ], type, "Popcorn.locale." + method + "() is a " + type );
      plus();
    });

    deepEqual( Popcorn.locale.get(), stub, "Popcorn.locale.get() === navigator.language (" +  JSON.stringify( stub ) +  ") whenever possible" );
    plus();

    Popcorn.forEach( Popcorn.locale.get(), function( val, prop ) {
      equal( val, stub[ prop ], "Popcorn.locale.get() locale matches stub" );
      plus();
    });

    locale = "fr-CA";

    // Setup "locale:changed" event listener
    $pop.listen( "locale:changed", function() {

      var parts = locale.split( "-" ),
          stub = {
            iso6391: locale,
            language: parts[ 0 ],
            region: parts[ 1 ]
          };


      Popcorn.forEach( Popcorn.locale.get(), function( val, prop ) {
        equal( val, stub[ prop ], "Popcorn.locale.set() -> get() locale matches updated stub" );
        plus();
      });

      if ( locale === "fr-CA" ) {
        locale = "en-CA";

        // Change locale, trigger "locale:changed" event
        Popcorn.locale.set( "en-CA" );
      }
    });

    // Change locale, trigger "locale:changed" event
    Popcorn.locale.set( "fr-CA" );
  });

})( Popcorn );