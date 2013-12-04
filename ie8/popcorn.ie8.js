(function() {

  document.addEventListener = document.addEventListener || function( event, callBack ) {

    event = ( event === "DOMContentLoaded" ) ? "onreadystatechange" : "on" + event;

    document.attachEvent( event, callBack );
  };

  document.removeEventListener = document.removeEventListener || function( event, callBack ) {

    event = ( event === "DOMContentLoaded" ) ? "onreadystatechange" : "on" + event;

    document.detachEvent( event, callBack );
  };

  HTMLScriptElement.prototype.addEventListener = HTMLScriptElement.prototype.addEventListener || function( event, callBack ) {

    event = ( event === "load" ) ? "onreadystatechange" : "on" + event;

    this.attachEvent( event, callBack );
  };

  HTMLScriptElement.prototype.removeEventListener = HTMLScriptElement.prototype.removeEventListener || function( event, callBack ) {

    event = ( event === "load" ) ? "onreadystatechange" : "on" + event;

    this.detachEvent( event, callBack );
  };

  document.createEvent = document.createEvent || function ( type ) {

    return {
      type : null,
      target : null,
      currentTarget : null,
      cancelable : false,
      bubbles : false,
      initEvent : function (type, bubbles, cancelable)  {
          this.type = type;
      },
      stopPropagation : function () {},
      stopImmediatePropagation : function () {}
    }
  };

  Array.prototype.forEach = Array.prototype.forEach || function( fn, context ) {

    var obj = this,
        hasOwn = Object.prototype.hasOwnProperty;

    if ( !obj || !fn ) {
      return {};
    }

    context = context || this;

    var key, len;

    for ( key in obj ) {
      if ( hasOwn.call( obj, key ) ) {
        fn.call( context, obj[ key ], key, obj );
      }
    }
    return obj;
  };

  // Production steps of ECMA-262, Edition 5, 15.4.4.19
  // Reference: http://es5.github.com/#x15.4.4.19
  if ( !Array.prototype.map ) {

    Array.prototype.map = function( callback, thisArg ) {

      var T, A, k;

      if ( this == null ) {
        throw new TypeError( "this is null or not defined" );
      }

      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      var O = Object( this );

      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if ( {}.toString.call( callback ) != "[object Function]" ) {
        throw new TypeError( callback + " is not a function" );
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if ( thisArg ) {
        T = thisArg;
      }

      // 6. Let A be a new array created as if by the expression new Array(len) where Array is
      // the standard built-in constructor with that name and len is the value of len.
      A = new Array( len );

      // 7. Let k be 0
      k = 0;

      // 8. Repeat, while k < len
      while( k < len ) {

        var kValue, mappedValue;

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if ( k in O ) {

          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[ k ];

          // ii. Let mappedValue be the result of calling the Call internal method of callback
          // with T as the this value and argument list containing kValue, k, and O.
          mappedValue = callback.call( T, kValue, k, O );

          // iii. Call the DefineOwnProperty internal method of A with arguments
          // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
          // and false.

          // In browsers that support Object.defineProperty, use the following:
          // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

          // For best browser support, use the following:
          A[ k ] = mappedValue;
        }
        // d. Increase k by 1.
        k++;
      }

      // 9. return A
      return A;
    };
  }

  if ( !Array.prototype.indexOf ) {

    Array.prototype.indexOf = function ( searchElement /*, fromIndex */ ) {

      if ( this == null) {

        throw new TypeError();
      }

      var t = Object( this ),
          len = t.length >>> 0;

      if ( len === 0 ) {

        return -1;
      }

      var n = 0;

      if ( arguments.length > 0 ) {

        n = Number( arguments[ 1 ] );

        if ( n != n ) { // shortcut for verifying if it's NaN

          n = 0;
        } else if ( n != 0 && n != Infinity && n != -Infinity ) {

          n = ( n > 0 || -1 ) * Math.floor( Math.abs( n ) );
        }
      }

      if ( n >= len ) {
        return -1;
      }

      var k = n >= 0 ? n : Math.max( len - Math.abs( n ), 0 );

      for (; k < len; k++ ) {

        if ( k in t && t[ k ] === searchElement ) {

          return k;
        }
      }

      return -1;
    }
  }

  if ( typeof String.prototype.trim !== "function" ) {

    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }
  
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  if (!Object.keys) {
    Object.keys = (function () {
      'use strict';
      var hasOwnProperty = Object.prototype.hasOwnProperty,
          hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
          dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
          ],
          dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [], prop, i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }
  
  if ( !Object.defineProperties ) {
    Object.defineProperties = function(obj, properties) {
      function convertToDescriptor(desc) {
        function hasProperty(obj, prop) {
          return Object.prototype.hasOwnProperty.call(obj, prop);
        }

        function isCallable(v) {
          // NB: modify as necessary if other values than functions are callable.
          return typeof v === "function";
        }

        if (typeof desc !== "object" || desc === null)
          throw new TypeError("bad desc");

        var d = {};

        if (hasProperty(desc, "enumerable"))
          d.enumerable = !!obj.enumerable;
        if (hasProperty(desc, "configurable"))
          d.configurable = !!obj.configurable;
        if (hasProperty(desc, "value"))
          d.value = obj.value;
        if (hasProperty(desc, "writable"))
          d.writable = !!desc.writable;
        if ( hasProperty(desc, "get") ) {
          var g = desc.get;

          if (!isCallable(g) && g !== "undefined")
            throw new TypeError("bad get");
          d.get = g;
        }
        if ( hasProperty(desc, "set") ) {
          var s = desc.set;
          if (!isCallable(s) && s !== "undefined")
            throw new TypeError("bad set");
          d.set = s;
        }

        if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
          throw new TypeError("identity-confused descriptor");

        return d;
      }

      if (typeof obj !== "object" || obj === null)
        throw new TypeError("bad obj");

      properties = Object(properties);

      var keys = Object.keys(properties);
      var descs = [];

      for (var i = 0; i < keys.length; i++)
        descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);

      for (var i = 0; i < descs.length; i++)
        Object.defineProperty(obj, descs[i][0], descs[i][1]);

      return obj;
    };
  }

})();
