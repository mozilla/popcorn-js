(function() {

  var TestRunner = window.TestRunner = function() {

    var index = 0,
        testFrame = id( "test-frame" ),
        results = id( "qunit-tests" ),
        totalPass = 0,
        totalFail = 0,
        totalRun = 0,
        totalTime = 0,
        main_li = create( "li" ),
        main_b = create( "b" ),
        allTests,
        currentTest,
        testList = [],
        results_arr = [],
        userAgent = id( "qunit-userAgent" ),
        checkboxes = [],
        testTypes = [ "core-tests", "plugin-tests", "player-tests", "parser-tests", "module-tests", "wrapper-tests" ],
        queryString = "",
        runSelected = document.getElementById( "run-selected" );

    function id( name ) {
      return document.getElementById( name );
    }

    function create( type ){
      return document.createElement( type );
    }

    function sendGetFocus( event ) {
      event.target &&
        event.target.contentWindow &&
          event.target.contentWindow.postMessage( "getFocus", "*" );
    }

    function parseQueryString() {
      var queryVars = {},
          pairs = window.location.search.substring( 1 ).split( "&" ),
          onePair;
      for ( var i = 0, len = pairs.length; i < len; i++ ) {
        onePair = pairs[ i ].split( "=" );
        queryVars[ onePair[0] ] = onePair[ 1 ];
      }
      // run all tests if there's no query string
      if( pairs.length === 1 ) {
        queryVars = {
          "core-tests": "1",
          "plugin-tests": "1",
          "player-tests": "1",
          "parser-tests": "1",
          "module-tests": "1",
          "wrapper-tests": "1"
        };
      }
      return queryVars;
    }

    function buildQueryString() {
      queryString = "?";
      checkboxes.forEach(function( cb ) {
        if ( cb.checked ) {
          queryString += cb.id + "=1&";
        }
      });
    }

    function receiveResults( data ) {
      var message = JSON.parse( data ),
          li,
          b,
          ol,
          a,
          oneTest,
          time,
          title,
          type,
          fail = 0,
          pass = 0,
          total = 0;

      // If name is present, we know this is a testDone post, so push results into array.
      if ( message.name ) {
        results_arr.push( message )
      } else {

        // this message is a Done post, so tally up everything and build the list item
        ol = create( "ol" );
        ol.style.display = "none";

        // build inner list of results
        while( oneTest = results_arr.pop() ) {
          li = create( "li" );
          li.className = oneTest.failed ? "fail" : "pass";
          li.innerHTML = oneTest.name + " <b class='counts'>(<b class='failed'>" +
            oneTest.failed + "</b>, <b class='passed'>" +
            oneTest.passed + "</b>, " +
            oneTest.total + ")</b>";
          ol.appendChild( li );
          // set to displayed if tests failed
          if ( oneTest.failed ) {
            ol.style.display = "block";
          }
        }

        var a = create( "a" );
        a.innerHTML = "Run test in new window";
        a.href = currentTest.path;
        a.target = "_blank";

        fail = message.failed;
        pass = message.passed;
        total = message.total;
        time = message.runtime;

        title = currentTest.name;
        type = currentTest.type;

        main_b = create( "b" );
        main_b.innerHTML = '<span class="module-name">' + type +
          ':&nbsp;</span><span class="test-name">' +
          title + ":</span> Tests completed in " +
          time + " milliseconds " + " <b class='counts'>(<b class='failed'>" +
          fail + "</b>, <b class='passed'>" +
          pass + "</b>, " + total + ")</b>";

        // set up click listener for expanding inner test list
        main_b.addEventListener( "click", function( e ) {
          var next = e.target.nextSibling.nextSibling,
              display = next.style.display;
          next.style.display = display === "none" ? "block" : "none";
        }, false );

        // build main_li, append all children and then append to result list
        main_li.className = fail ? "fail" : "pass";
        main_li.removeChild( main_li.firstChild );
        main_li.appendChild( main_b );
        main_li.appendChild( a );
        main_li.appendChild( ol );

        // update running totals
        totalRun += total;
        totalFail += fail;
        totalPass += pass;
        totalTime += time;

        advance();
      }
    }

    function advance() {
      if ( ++index < testList.length ) {
        currentTest = testList[ index ];
        main_li = create( "li" );
        main_b = create ( "b" );
        main_b.innerHTML = "Running " + currentTest.name;
        main_li.appendChild( main_b );
        main_li.className = "running";
        results.appendChild( main_li );
        testFrame.src = currentTest.path;
        testFrame.contentWindow.focus();
      } else {
        // Finish test suite; display totals
        $( testFrame ).remove();

        id( "qunit-banner" ).className = totalFail ? "qunit-fail" : "qunit-pass";

        var banner = create( "p" ),
            html = [
              'Tests completed in ',
              totalTime,
              ' milliseconds.<br/>',
              '<span class="passed">',
              totalPass,
              '</span> tests of <span class="total">',
              totalRun,
              '</span> passed, <span class="failed">',
              totalFail,
              '</span> failed.'
            ].join('');

        banner.id = "qunit-testresult";
        banner.className = "result";
        banner.innerHTML = html;
        results.parentNode.insertBefore( banner, results );
      }
    }

    function addTests ( type ) {
      var testTypeList = allTests[ type ];
      for ( var test in testTypeList ) {
        if ( testTypeList.hasOwnProperty( test ) ) {
          testList.unshift({
            "name": test,
            "path": "../" + testTypeList[ test ],
            "type": type
          });
        }
      }
    }

    function parseTests() {
      var qVars = parseQueryString(),
          cb;
      for ( var i = 0, len = testTypes.length; i < len; i++ ) {
        cb = checkboxes[ i ];
        cb.checked = !!( qVars[ cb.id ] === "1" );
        if ( cb.checked ) {
          addTests( cb.value );
        }
      }
    }

    this.getTests = function( loadedCallback ) {
      $.getJSON( "../tests.conf", function( data ) {
        if ( data ) {
          allTests = data;
          parseTests();
          loadedCallback && typeof loadedCallback === "function" && loadedCallback();
        }
      });
    };

    this.runTests = function() {
      if ( testList.length ) {
        currentTest = testList[ index ];
        main_b.innerHTML = "Running " + currentTest.name;
        main_li.appendChild( main_b );
        main_li.className = "running";
        results.appendChild( main_li );

        testFrame.src = currentTest.path;
      }
    };

    // Get references to the checkboxes
    testTypes.forEach(function( checkBoxId ) {
      checkboxes.unshift( id( checkBoxId ) );
    });

    // Tells the tests within the iframe to take focus
    testFrame.addEventListener( "load", sendGetFocus, false );

    // Populate the userAgent h2 with information, if available
    if ( userAgent ) {
      userAgent.innerHTML = navigator.userAgent;
    };

    // Triggers tallying of results, and advances the tests.
    window.addEventListener( "message", function( e ) {
      receiveResults( e.data );
    });

    runSelected.addEventListener( "click", function() {
      var location = window.location;
      buildQueryString();
      if ( queryString.length > 1 ) {
        window.location = location.href.split( "?" )[ 0 ] + queryString;
      }
    });
  };

  document.addEventListener( "DOMContentLoaded", function() {
    var runner = new TestRunner();
    runner.getTests(function() {
      runner.runTests();
    });
  });
}());