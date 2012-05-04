$(function() {

  var index = 0,
      id = function( name ) {
          return document.getElementById( name );
      },
      create = function( type ) {
        return document.createElement( type );
      },
      testFrame = id( "test-frame" )
      results = id( "qunit-tests" ),
      totalPass = 0,
      totalFail = 0,
      totalRun = 0;

  window.addEventListener( "message", function( e ) {
    var testResults = JSON.parse( e.data )[0],
        li = create( "li" ),
        b = create( "strong" ),
        title = tests[index].split( '/' )[2],
        fail = testResults.failed,
        pass = testResults.passed,
        total = testResults.total;

    totalRun += total;
    totalFail += fail;
    totalPass += pass;

    title = title || "Core";

    li.className = fail ? "fail" : "pass";

    b.innerHTML = title + " <b class='counts'>(<b class='failed'>" + fail + "</b>, <b class='passed'>" + pass + "</b>, " + total + ")</b>";

    li.appendChild( b );
    results.appendChild( li );


    if ( ++index < tests.length ) {
      testFrame.src = tests[ index ];
      testFrame.contentWindow.focus();
    } else {
      $( testFrame ).remove();

      li = create( "li" );
      b = create( "strong" );

      li.className = totalFail ? "fail" : "pass";

      b.innerHTML = "Final Result: " + " <b class='counts'>(<b class='failed'>" + totalFail + "</b>, <b class='passed'>" + totalPass + "</b>, " + totalRun + ")</b>";

      li.appendChild( b );
      results.appendChild( li );
    }
  });

  testFrame.src = tests[ index ];
});