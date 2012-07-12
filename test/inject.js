/**
 * JavaScript file to included by the test suite page that it loaded
 * inside the iframe on the "run" pages. This injection must be done
 * by the guest page, it can't be loaded by TestSwarm.
 * Example:
 * - https://github.com/jquery/jquery/blob/master/test/data/testrunner.js
 * - https://github.com/jquery/jquery/blob/master/test/index.html
 *
 * @author John Resig, 2008-2011
 * @author Timo Tijhof, 2012
 * @since 0.1.0
 * @package TestSwarm
 */
/*global jQuery, $, QUnit, Test, JSSpec, JsUnitTestManager, SeleniumTestResult, LOG, doh, Screw*/
/*jshint forin:false, strict:false, loopfunc:true, browser:true, jquery:true*/
(function (undefined) {
	var	DEBUG, doPost, search, url, index, submitTimeout, curHeartbeat,
		beatRate, testFrameworks, onErrorFnPrev;

	DEBUG = false;

	doPost = false;
	search = window.location.search;
	index = search.indexOf( 'swarmURL=' );
	submitTimeout = 5;
	beatRate = 20;

	try {
		doPost = !!window.parent.postMessage;
	} catch ( e ) {}

	if ( index !== -1 ) {
		url = decodeURIComponent( search.slice( index + 9 ) );
	}

	if ( !DEBUG && ( !url || url.indexOf( 'http' ) !== 0 ) ) {
		return;
	}

	// Prevent blocking things from executing
	if ( !DEBUG ) {
		window.print = window.confirm = window.alert = window.open = function () {};
	}

	/** Utility functions **/

	function debugObj( obj ) {
		var i, str = '';
		for ( i in obj ) {
			str += ( str ? '\n' : '' ) + i + ':\n\t ' + obj[i];
		}
		return str;
	}

	function remove( elem ) {
		if ( typeof elem === 'string' ) {
			elem = document.getElementById( elem );
		}

		if ( elem ) {
			elem.parentNode.removeChild( elem );
		}
	}

	function trimSerialize( doc ) {
		var scripts, root, cur, links, i, href;
		doc = doc || document;

		scripts = doc.getElementsByTagName( 'script' );
		while ( scripts.length ) {
			remove( scripts[0] );
		}

		root = window.location.href.replace( /(https?:\/\/.*?)\/.*/, '$1' );
		cur = window.location.href.replace( /[^\/]*$/, '' );

		links = doc.getElementsByTagName( 'link' );
		for ( i = 0; i < links.length; i += 1 ) {
			href = links[i].href;
			if ( href.indexOf( '/' ) === 0 ) {
				href = root + href;
			} else if ( !/^https?:\/\//.test( href ) ) {
				href = cur + href;
			}
			links[i].href = href;
		}

		return ( '<html>' + doc.documentElement.innerHTML + '</html>' )
			.replace( /\s+/g, ' ' );
	}

	function submit( params ) {
		var form, i, input, key, paramItems, parts, query;

		if ( curHeartbeat ) {
			clearTimeout( curHeartbeat );
		}

		paramItems = (url.split( '?' )[1] || '' ).split( '&' );

		for ( i = 0; i < paramItems.length; i += 1 ) {
			if ( paramItems[i] ) {
				parts = paramItems[i].split( '=' );
				if ( !params[ parts[0] ] ) {
					params[ parts[0] ] = parts[1];
				}
			}
		}

		if ( !params.action ) {
			params.action = 'saverun';
		}

		if ( !params.report_html ) {
			params.report_html = window.TestSwarm.serialize();
		}

		if ( DEBUG ) {
			alert( debugObj( params ) ) ;
		}

		if ( doPost ) {
			// Build Query String
			query = '';

			for ( key in params ) {
				query += ( query ? '&' : '' ) + key + '=' + encodeURIComponent( params[key] );
			}

			if ( !DEBUG ) {
				window.parent.postMessage( query, '*' );
			}

		} else {
			form = document.createElement( 'form' );
			form.action = url;
			form.method = 'POST';

			for ( i in params ) {
				input = document.createElement( 'input' );
				input.type = 'hidden';
				input.name = i;
				input.value = params[i];
				form.appendChild( input );
			}

			if ( DEBUG ) {
				alert( url );

			} else {
				// Watch for the result submission timing out
				setTimeout(function () {
					submit( params );
				}, submitTimeout * 1000);

				document.body.appendChild( form );
				form.submit();
			}
		}
	}

	function detectAndInstall() {
		var key;
		for ( key in testFrameworks ) {
			if ( testFrameworks[key].detect() ) {
				testFrameworks[key].install();
				return key;
			}
		}
		return false;
	}

	// Preserve other handlers
	onErrorFnPrev = window.onerror;

	// Cover uncaught exceptions
	// Returning true will surpress the default browser handler,
	// returning false will let it run.
	window.onerror = function ( error, filePath, linerNr ) {
		var ret = false;
		if ( onErrorFnPrev ) {
			ret = onErrorFnPrev( error, filePath, linerNr );
		}

		// Treat return value as window.onerror itself does,
		// Only do our handling if not surpressed.
		if ( ret !== true ) {
			document.body.appendChild( document.createTextNode( '[TestSwarm] window.onerror: ' + error ) );
			submit({ fail: 0, error: 1, total: 1 });

			return false;
		}

		return ret;
	};

	// Expose the TestSwarm API
	window.TestSwarm = {
		submit: submit,
		heartbeat: function () {
			if ( curHeartbeat ) {
				clearTimeout( curHeartbeat );
			}

			curHeartbeat = setTimeout(function () {
				submit({ fail: -1, total: -1 });
			}, beatRate * 1000);
		},
		serialize: function () {
			return trimSerialize();
		}
	};

	testFrameworks = {
		// QUnit (by jQuery)
		// http://docs.jquery.com/QUnit
		'QUnit': {
			detect: function () {
				return typeof QUnit !== 'undefined';
			},
			install: function () {
				QUnit.done = function ( results ) {
					submit({
						fail: results.failed,
						error: 0,
						total: results.total
					});
				};

				QUnit.log = window.TestSwarm.heartbeat;
				window.TestSwarm.heartbeat();

				window.TestSwarm.serialize = function () {
					var ol, i;

					// Clean up the HTML (remove any un-needed test markup)
					remove( 'nothiddendiv' );
					remove( 'loadediframe' );
					remove( 'dl' );
					remove( 'main' );

					// Show any collapsed results
					ol = document.getElementsByTagName( 'ol' );
					for ( i = 0; i < ol.length; i += 1 ) {
						ol[i].style.display = 'block';
					}

					return trimSerialize();
				};
			}
		},

		// UnitTestJS (Prototype, Scriptaculous)
		// https://github.com/tobie/unittest_js
		'UnitTestJS': {
			detect: function () {
				return typeof Test !== 'undefined' && Test && Test.Unit && Test.Unit.runners;
			},
			install: function () {
				var	total_runners = Test.Unit.runners.length,
					cur_runners = 0,
					total = 0,
					fail = 0,
					error = 0,
					i;

				for ( i = 0; i < Test.Unit.runners.length; i += 1 ) {
					// Need to proxy the i variable into a local scope,
					// otherwise all the finish-functions created in this loop
					// will refer to the same i variable..
					(function ( i ) {
						var finish, results;

						finish = Test.Unit.runners[i].finish;
						Test.Unit.runners[i].finish = function () {
							finish.call( this );

							results = this.getResult();
							total += results.assertions;
							fail += results.failures;
							error += results.errors;

							cur_runners += 1;
							if ( cur_runners === total_runners ) {
								submit({
									fail: fail,
									error: error,
									total: total
								});
							}
						};
					}( i ) );
				}
			}
		},

		// JSSpec (MooTools)
		// http://jania.pe.kr/aw/moin.cgi/JSSpec
		// https://code.google.com/p/jsspec/
		'JSSpec': {
			detect: function () {
				return typeof JSSpec !== 'undefined' && JSSpec && JSSpec.Logger;
			},
			install: function () {
				var onRunnerEnd = JSSpec.Logger.prototype.onRunnerEnd;
				JSSpec.Logger.prototype.onRunnerEnd = function () {
					var ul, i;
					onRunnerEnd.call( this );

					// Show any collapsed results
					ul = document.getElementsByTagName( 'ul' );
					for ( i = 0; i < ul.length; i += 1 ) {
						ul[i].style.display = 'block';
					}

					submit({
						fail: JSSpec.runner.getTotalFailures(),
						error: JSSpec.runner.getTotalErrors(),
						total: JSSpec.runner.totalExamples
					});
				};

				window.TestSwarm.serialize = function () {
					var ul, i;
					// Show any collapsed results
					ul = document.getElementsByTagName( 'ul' );
					for ( i = 0; i < ul.length; i += 1 ) {
						ul[i].style.display = 'block';
					}

					return trimSerialize();
				};
			}
		},

		// JSUnit
		// http://www.jsunit.net/
		// Note: Injection file must be included before the frames
		// are document.write()d into the page.
		'JSUnit': {
			detect: function () {
				return typeof JsUnitTestManager !== 'undefined';
			},
			install: function () {
				var _done = JsUnitTestManager.prototype._done;
				JsUnitTestManager.prototype._done = function () {
					_done.call( this );

					submit({
						fail: this.failureCount,
						error: this.errorCount,
						total: this.totalCount
					});
				};

				window.TestSwarm.serialize = function () {
					return '<pre>' + this.log.join( '\n' ) + '</pre>';
				};
			}
		},

		// Selenium Core
		// http://seleniumhq.org/projects/core/
		'Selenium': {
			detect: function () {
				return typeof SeleniumTestResult !== 'undefined' && typeof LOG !== 'undefined';
			},
			install: function () {
				// Completely overwrite the postback
				SeleniumTestResult.prototype.post = function () {
					submit({
						fail: this.metrics.numCommandFailures,
						error: this.metrics.numCommandErrors,
						total: this.metrics.numCommandPasses + this.metrics.numCommandFailures + this.metrics.numCommandErrors
					});
				};

				window.TestSwarm.serialize = function () {
					var results = [], msg;
					while ( LOG.pendingMessages.length ) {
						msg = LOG.pendingMessages.shift();
						results.push( msg.type + ': ' + msg.msg );
					}

					return '<pre>' + results.join( '\n' ) + '</pre>';
				};
			}
		},

		// Dojo Objective Harness
		// http://docs.dojocampus.org/quickstart/doh
		'DOH': {
			detect: function () {
				return typeof doh !== 'undefined' && doh._report;
			},
			install: function () {
				var _report = doh._report;
				doh._report = function () {
					_report.apply( this, arguments );

					submit({
						fail: doh._failureCount,
						error: doh._errorCount,
						total: doh._testCount
					});
				};

				window.TestSwarm.serialize = function () {
					return '<pre>' + document.getElementById( 'logBody' ).innerHTML + '</pre>';
				};
			}
		},

		// Screw.Unit
		// https://github.com/nathansobo/screw-unit
		'Screw.Unit': {
			detect: function () {
				return typeof Screw !== 'undefined' && typeof jQuery !== 'undefined' && Screw && Screw.Unit;
			},
			install: function () {
				$(Screw).bind( 'after', function () {
					var	passed = $( '.passed' ).length,
						failed = $( '.failed' ).length;
					submit({
						fail: failed,
						error: 0,
						total: failed + passed
					});
				});

				$( Screw ).bind( 'loaded', function () {
					$( '.it' )
						.bind( 'passed', window.TestSwarm.heartbeat )
						.bind( 'failed', window.TestSwarm.heartbeat );
					window.TestSwarm.heartbeat();
				});

				window.TestSwarm.serialize = function () {
					return trimSerialize();
				};
			}
		}
	};

	detectAndInstall();

}() );
