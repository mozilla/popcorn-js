test( "Popcorn LinkedIn Plugin", function() {

  if ( /localhost/.test( location.hostname ) ) {

    // run tests on localhost
    var popped = Popcorn( "#video" ),
        expects = 22,
        count = 0,
        setupId,
        sharediv = document.getElementById( "sharediv" ),
        recommenddiv = document.getElementById( "recommenddiv" ),
        memberprofilediv = document.getElementById( "memberprofilediv" ),
        companyinsiderdiv = document.getElementById( "companyinsiderdiv" ),
        companyprofilediv = document.getElementById( "companyprofilediv" );


    function plus() {
      if ( ++count === expects ) {
        start();
      }
    }

    expect( expects );

    stop();

    ok( "linkedin" in popped, "linkedin is a method of the popped instance" );
    plus();

    // Testing the share plugin
    equal( sharediv.innerHTML, "", "initially, there is nothing inside the sharediv" );
    plus();

    popped.linkedin({
      type: "share",
      counter: "right",
      url: "http://www.google.ca",
      target: "sharediv",
      apikey: "ZOLRI2rzQS_oaXELpPF0aksxwFFEvoxAFZRLfHjaAhcGPfOX0Ds4snkJpWwKs8gk",
      start: 1,
      end: 3
    });

    popped.exec( 2, function() {

      ok( /block/.test( sharediv.children[ 0 ].style.display ), "sharediv contents are displayed" );
      plus();
      ok( /script/.test( sharediv.children[ 0 ].innerHTML ), "share plugin exists" );
      plus();
    });

    popped.exec( 4, function() {

      ok( /none/.test( sharediv.children[ 0 ].style.display ), "sharediv contents are hidden again" );
      plus();
    });

    // Testing the recommendproduct plugin
    equal( recommenddiv.innerHTML, "", "initially, there is nothing inside the recommenddiv" );
    plus();

    popped.linkedin({
      type: "recommendproduct",
      counter: "top",
      target: "recommenddiv",
      companyid: "LinkedIn",
      productid: "201714",
      apikey: "ZOLRI2rzQS_oaXELpPF0aksxwFFEvoxAFZRLfHjaAhcGPfOX0Ds4snkJpWwKs8gk",
      start: 1,
      end: 3
    });

    popped.exec( 2, function() {

      ok( /block/.test( recommenddiv.children[ 0 ].style.display ), "recommenddiv contents are displayed" );
      plus();
      ok( /script/.test( recommenddiv.children[ 0 ].innerHTML ), "recommend plugin exists" );
      plus();
    });

    popped.exec( 4, function() {

      ok( /none/.test( recommenddiv.children[ 0 ].style.display ), "recommenddiv contents are hidden again" );
      plus();
    });

    // Testing memberprofile plugin
    equal( memberprofilediv.innerHTML, "", "initially, there is nothing inside the memberprofilediv" );
    plus();

    popped.linkedin({
      type: "memberprofile",
      memberid: "/in/jeffweiner08",
      format: "inline",
      target: "memberprofilediv",
      apikey: "ZOLRI2rzQS_oaXELpPF0aksxwFFEvoxAFZRLfHjaAhcGPfOX0Ds4snkJpWwKs8gk",
      start: 1,
      end: 3
    });

    popped.exec( 2, function() {

      ok( /block/.test( memberprofilediv.children[ 0 ].style.display ), "memberprofilediv contents are displayed" );
      plus();
      ok( /script/.test( memberprofilediv.children[ 0 ].innerHTML ), "member profile plugin exists" );
      plus();
    });

    popped.exec( 4, function() {

      ok( /none/.test( memberprofilediv.children[ 0 ].style.display ), "memberprofilediv contents are hidden again" );
      plus();
    });

    // Testing the company insider plugin
    equal( companyinsiderdiv.innerHTML, "", "initially, there is nothing inside the companyinsiderdiv" );
    plus();

    popped.linkedin({
      type: "companyinsider",
      companyid: "1441",
      target: "companyinsiderdiv",
      apikey: "ZOLRI2rzQS_oaXELpPF0aksxwFFEvoxAFZRLfHjaAhcGPfOX0Ds4snkJpWwKs8gk",
      start: 1,
      end: 3
    });

    popped.exec( 2, function() {

      ok( /block/.test( companyinsiderdiv.children[ 0 ].style.display ), "companyinsiderdiv contents are displayed" );
      plus();
      ok( /script/.test( companyinsiderdiv.children[ 0 ].innerHTML ), "company insider plugin exists" );
      plus();
    });

    popped.exec( 4, function() {

      ok( /none/.test( companyinsiderdiv.children[ 0 ].style.display ), "companyinsiderdiv contents are hidden again" );
      plus();
    });

    // Testing company profile plugin
    equal( companyprofilediv.innerHTML, "", "initially, there is nothing inside the companyprofilediv" );
    plus();

    popped.linkedin({
      type: "companyprofile",
      companyid: "1441",
      format: "inline",
      target: "companyprofilediv",
      apikey: "ZOLRI2rzQS_oaXELpPF0aksxwFFEvoxAFZRLfHjaAhcGPfOX0Ds4snkJpWwKs8gk",
      start: 1,
      end: 3
    });

    setupId = popped.getLastTrackEventId();

    popped.exec( 2, function() {

      ok( /block/.test( companyprofilediv.children[ 0 ].style.display ), "companyprofilediv contents are displayed" );
      plus();
      ok( /script/.test( companyprofilediv.children[ 0 ].innerHTML ), "company profile plugin exists" );
      plus();
    });

    popped.exec( 4, function() {

      ok( /none/.test( companyprofilediv.children[ 0 ].style.display ), "companyprofilediv contents are hidden again" );
      plus();

      // Make sure _teardown functionality works
      popped.pause().removeTrackEvent( setupId );
      ok( !companyprofilediv.children[ 1 ], "companyprofilediv plugin was properly destroyed" );
      plus();
    });

    // empty track events should be safe
    popped.linkedin({});

    popped.volume( 0 ).play();
  } else {

    // tests must be run on localhost
    ok( false, "LinkedIn apikey will only work under localhost" );
  }
});
