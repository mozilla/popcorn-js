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

var forEach = Array.prototype.forEach,
    hasOwn = Object.prototype.hasOwnProperty;
    
Array.prototype.forEach = forEach || function( fn, context ) {

  var obj = this;

    if ( !obj || !fn ) {
    return {};
  }

  context = context || this;

  var key, len;

  // Use native whenever possible
  if ( forEach && obj.forEach === forEach ) {
    return obj.forEach( fn, context );
  }

  for ( key in obj ) {
    if ( hasOwn.call( obj, key ) ) {
      fn.call( context, obj[ key ], key, obj );
    }
  }
  return obj;
}

Object.prototype.map = Object.prototype.map || function( obj, fn, context ) {

  if ( !obj || !fn ) {
    return {};
  }

  context = context || this;
  var key, len, result = [];

  Popcorn.forEach( obj, function ( val, key ) {

      result.push( fn.call( context, val, key, obj ) );
  });

  return result;
};

Object.prototype.indexOf = Object.prototype.indexOf || function ( searchElement, fromIndex ) {

  var arr = this;
 
  for ( var i = fromIndex || 0; i < arr.length; i++ ) {

    if ( arr[ i ] === searchElement ) {

      return i;
    }
  }

  return -1;
};
