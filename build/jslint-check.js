load("build/jslint.js");

// All of the following are known issues that we think are 'ok'
// (in contradiction with JSLint) more information here:
// http://docs.jquery.com/JQuery_Core_Style_Guidelines
var ok = {
  "Expected an identifier and instead saw 'undefined' (a reserved word).": true,
  "Use '===' to compare with 'null'.": true,
  "Use '!==' to compare with 'null'.": true,
  "Expected an assignment or function call and instead saw an expression.": true,
  "Expected a 'break' statement before 'case'.": true,
  "'e' is already defined.": true,
  "Don't make functions within a loop.": true,
  "['out'] is better written in dot notation.": true
};

function check(src)
{
  JSLINT(src, { evil: true, forin: true, maxerr: 100 });

  var e = JSLINT.errors, found = 0, w;
  for ( var i = 0; e && i < e.length; i++ ) {
    w = e[i];

    if ( w && !ok[ w.reason ] ) {
      found++;
      print( "\n" + w.evidence + "\n" );
      print( "    Problem at line " + w.line + " character " + w.character + ": " + w.reason );
    }
  }

  if ( found > 0 ) {
    print( "\n" + found + " Error(s) found." );
  } else {
    print( "JSLint check passed." );
  }
}

for each (var f in arguments)
{
  print( "Linting "+ f );
  check(readFile(f));
}
