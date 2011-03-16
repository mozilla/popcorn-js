// Popcorn Vimeo Player Wrapper
( function( Popcorn ) {
  /*!	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/

var swfobject = function() {
	
	var UNDEF = "undefined",
      OBJECT = "object",
      SHOCKWAVE_FLASH = "Shockwave Flash",
      SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
      FLASH_MIME_TYPE = "application/x-shockwave-flash",
      EXPRESS_INSTALL_ID = "SWFObjectExprInst",
      ON_READY_STATE_CHANGE = "onreadystatechange",
      
      win = window,
      doc = document,
      nav = navigator,
      
      plugin = false,
      domLoadFnArr = [main],
      regObjArr = [],
      objIdArr = [],
      listenersArr = [],
      storedAltContent,
      storedAltContentId,
      storedCallbackFn,
      storedCallbackObj,
      isDomLoaded = false,
      isExpressInstallActive = false,
      dynamicStylesheet,
      dynamicStylesheetMedia,
      autoHideShow = true,
    
    /* Centralized function for browser feature detection
      - User agent string detection is only used when no good alternative is possible
      - Is executed directly for optimal performance
    */	
    ua = function() {
      var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
        u = nav.userAgent.toLowerCase(),
        p = nav.platform.toLowerCase(),
        windows = p ? /win/.test(p) : /win/.test(u),
        mac = p ? /mac/.test(p) : /mac/.test(u),
        webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
        ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
        playerVersion = [0,0,0],
        d = null;
      if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
        d = nav.plugins[SHOCKWAVE_FLASH].description;
        if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
          plugin = true;
          ie = false; // cascaded feature detection for Internet Explorer
          d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
          playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
          playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
          playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
        }
      }
      else if (typeof win.ActiveXObject != UNDEF) {
        try {
          var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
          if (a) { // a will return null when ActiveX is disabled
            d = a.GetVariable("$version");
            if (d) {
              ie = true; // cascaded feature detection for Internet Explorer
              d = d.split(" ")[1].split(",");
              playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
            }
          }
        }
        catch(e) {}
      }
      return { w3:w3cdom, pv:playerVersion, wk:webkit, ie:ie, win:windows, mac:mac };
    }(),
    
    /* Cross-browser onDomLoad
      - Will fire an event as soon as the DOM of a web page is loaded
      - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
      - Regular onload serves as fallback
    */ 
    onDomLoad = function() {
      if (!ua.w3) { return; }
      if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically 
        callDomLoadFunctions();
      }
      if (!isDomLoaded) {
        if (typeof doc.addEventListener != UNDEF) {
          doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
        }		
        if (ua.ie && ua.win) {
          doc.attachEvent(ON_READY_STATE_CHANGE, function() {
            if (doc.readyState == "complete") {
              doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
              callDomLoadFunctions();
            }
          });
          if (win == top) { // if not inside an iframe
            (function(){
              if (isDomLoaded) { return; }
              try {
                doc.documentElement.doScroll("left");
              }
              catch(e) {
                setTimeout(arguments.callee, 0);
                return;
              }
              callDomLoadFunctions();
            })();
          }
        }
        if (ua.wk) {
          (function(){
            if (isDomLoaded) { return; }
            if (!/loaded|complete/.test(doc.readyState)) {
              setTimeout(arguments.callee, 0);
              return;
            }
            callDomLoadFunctions();
          })();
        }
        addLoadEvent(callDomLoadFunctions);
      }
    }();
    
    function callDomLoadFunctions() {
      if (isDomLoaded) { return; }
      try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
        var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
        t.parentNode.removeChild(t);
      }
      catch (e) { return; }
      isDomLoaded = true;
      var dl = domLoadFnArr.length;
      for (var i = 0; i < dl; i++) {
        domLoadFnArr[i]();
      }
    }
    
    function addDomLoadEvent(fn) {
      if (isDomLoaded) {
        fn();
      }
      else { 
        domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
      }
    }
    
    /* Cross-browser onload
      - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
      - Will fire an event as soon as a web page including all of its assets are loaded 
     */
    function addLoadEvent(fn) {
      if (typeof win.addEventListener != UNDEF) {
        win.addEventListener("load", fn, false);
      }
      else if (typeof doc.addEventListener != UNDEF) {
        doc.addEventListener("load", fn, false);
      }
      else if (typeof win.attachEvent != UNDEF) {
        addListener(win, "onload", fn);
      }
      else if (typeof win.onload == "function") {
        var fnOld = win.onload;
        win.onload = function() {
          fnOld();
          fn();
        };
      }
      else {
        win.onload = fn;
      }
    }
    
    /* Main function
      - Will preferably execute onDomLoad, otherwise onload (as a fallback)
    */
    function main() { 
      if (plugin) {
        testPlayerVersion();
      }
      else {
        matchVersions();
      }
    }
    
    /* Detect the Flash Player version for non-Internet Explorer browsers
      - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
        a. Both release and build numbers can be detected
        b. Avoid wrong descriptions by corrupt installers provided by Adobe
        c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
      - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
    */
    function testPlayerVersion() {
      var b = doc.getElementsByTagName("body")[0];
      var o = createElement(OBJECT);
      o.setAttribute("type", FLASH_MIME_TYPE);
      var t = b.appendChild(o);
      if (t) {
        var counter = 0;
        (function(){
          if (typeof t.GetVariable != UNDEF) {
            var d = t.GetVariable("$version");
            if (d) {
              d = d.split(" ")[1].split(",");
              ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
            }
          }
          else if (counter < 10) {
            counter++;
            setTimeout(arguments.callee, 10);
            return;
          }
          b.removeChild(o);
          t = null;
          matchVersions();
        })();
      }
      else {
        matchVersions();
      }
    }
    
    /* Perform Flash Player and SWF version matching; static publishing only
    */
    function matchVersions() {
      var rl = regObjArr.length;
      if (rl > 0) {
        for (var i = 0; i < rl; i++) { // for each registered object element
          var id = regObjArr[i].id;
          var cb = regObjArr[i].callbackFn;
          var cbObj = {success:false, id:id};
          if (ua.pv[0] > 0) {
            var obj = getElementById(id);
            if (obj) {
              if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                setVisibility(id, true);
                if (cb) {
                  cbObj.success = true;
                  cbObj.ref = getObjectById(id);
                  cb(cbObj);
                }
              }
              else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                var att = {};
                att.data = regObjArr[i].expressInstall;
                att.width = obj.getAttribute("width") || "0";
                att.height = obj.getAttribute("height") || "0";
                if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
                if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
                // parse HTML object param element's name-value pairs
                var par = {};
                var p = obj.getElementsByTagName("param");
                var pl = p.length;
                for (var j = 0; j < pl; j++) {
                  if (p[j].getAttribute("name").toLowerCase() != "movie") {
                    par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                  }
                }
                showExpressInstall(att, par, id, cb);
              }
              else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
                displayAltContent(obj);
                if (cb) { cb(cbObj); }
              }
            }
          }
          else {	// if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
            setVisibility(id, true);
            if (cb) {
              var o = getObjectById(id); // test whether there is an HTML object element or not
              if (o && typeof o.SetVariable != UNDEF) { 
                cbObj.success = true;
                cbObj.ref = o;
              }
              cb(cbObj);
            }
          }
        }
      }
    }
    
    function getObjectById(objectIdStr) {
      var r = null;
      var o = getElementById(objectIdStr);
      if (o && o.nodeName == "OBJECT") {
        if (typeof o.SetVariable != UNDEF) {
          r = o;
        }
        else {
          var n = o.getElementsByTagName(OBJECT)[0];
          if (n) {
            r = n;
          }
        }
      }
      return r;
    }
    
    /* Requirements for Adobe Express Install
      - only one instance can be active at a time
      - fp 6.0.65 or higher
      - Win/Mac OS only
      - no Webkit engines older than version 312
    */
    function canExpressInstall() {
      return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
    }
    
    /* Show the Adobe Express Install dialog
      - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
    */
    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
      isExpressInstallActive = true;
      storedCallbackFn = callbackFn || null;
      storedCallbackObj = {success:false, id:replaceElemIdStr};
      var obj = getElementById(replaceElemIdStr);
      if (obj) {
        if (obj.nodeName == "OBJECT") { // static publishing
          storedAltContent = abstractAltContent(obj);
          storedAltContentId = null;
        }
        else { // dynamic publishing
          storedAltContent = obj;
          storedAltContentId = replaceElemIdStr;
        }
        att.id = EXPRESS_INSTALL_ID;
        if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) { att.width = "310"; }
        if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) { att.height = "137"; }
        doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
        var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
          fv = "MMredirectURL=" + win.location.toString().replace(/&/g,"%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
        if (typeof par.flashvars != UNDEF) {
          par.flashvars += "&" + fv;
        }
        else {
          par.flashvars = fv;
        }
        // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
        // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
        if (ua.ie && ua.win && obj.readyState != 4) {
          var newObj = createElement("div");
          replaceElemIdStr += "SWFObjectNew";
          newObj.setAttribute("id", replaceElemIdStr);
          obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
          obj.style.display = "none";
          (function(){
            if (obj.readyState == 4) {
              obj.parentNode.removeChild(obj);
            }
            else {
              setTimeout(arguments.callee, 10);
            }
          })();
        }
        createSWF(att, par, replaceElemIdStr);
      }
    }
    
    /* Functions to abstract and display alternative content
    */
    function displayAltContent(obj) {
      if (ua.ie && ua.win && obj.readyState != 4) {
        // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
        // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
        var el = createElement("div");
        obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
        el.parentNode.replaceChild(abstractAltContent(obj), el);
        obj.style.display = "none";
        (function(){
          if (obj.readyState == 4) {
            obj.parentNode.removeChild(obj);
          }
          else {
            setTimeout(arguments.callee, 10);
          }
        })();
      }
      else {
        obj.parentNode.replaceChild(abstractAltContent(obj), obj);
      }
    } 

    function abstractAltContent(obj) {
      var ac = createElement("div");
      if (ua.win && ua.ie) {
        ac.innerHTML = obj.innerHTML;
      }
      else {
        var nestedObj = obj.getElementsByTagName(OBJECT)[0];
        if (nestedObj) {
          var c = nestedObj.childNodes;
          if (c) {
            var cl = c.length;
            for (var i = 0; i < cl; i++) {
              if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
                ac.appendChild(c[i].cloneNode(true));
              }
            }
          }
        }
      }
      return ac;
    }
    
    /* Cross-browser dynamic SWF creation
    */
    function createSWF(attObj, parObj, id) {
      var r, el = getElementById(id);
      if (ua.wk && ua.wk < 312) { return r; }
      if (el) {
        if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
          attObj.id = id;
        }
        if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
          var att = "";
          for (var i in attObj) {
            if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
              if (i.toLowerCase() == "data") {
                parObj.movie = attObj[i];
              }
              else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                att += ' class="' + attObj[i] + '"';
              }
              else if (i.toLowerCase() != "classid") {
                att += ' ' + i + '="' + attObj[i] + '"';
              }
            }
          }
          var par = "";
          for (var j in parObj) {
            if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
              par += '<param name="' + j + '" value="' + parObj[j] + '" />';
            }
          }
          el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
          objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
          r = getElementById(attObj.id);	
        }
        else { // well-behaving browsers
          var o = createElement(OBJECT);
          o.setAttribute("type", FLASH_MIME_TYPE);
          for (var m in attObj) {
            if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
              if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                o.setAttribute("class", attObj[m]);
              }
              else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
                o.setAttribute(m, attObj[m]);
              }
            }
          }
          for (var n in parObj) {
            if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
              createObjParam(o, n, parObj[n]);
            }
          }
          el.parentNode.replaceChild(o, el);
          r = o;
        }
      }
      return r;
    }
    
    function createObjParam(el, pName, pValue) {
      var p = createElement("param");
      p.setAttribute("name", pName);	
      p.setAttribute("value", pValue);
      el.appendChild(p);
    }
    
    /* Cross-browser SWF removal
      - Especially needed to safely and completely remove a SWF in Internet Explorer
    */
    function removeSWF(id) {
      var obj = getElementById(id);
      if (obj && obj.nodeName == "OBJECT") {
        if (ua.ie && ua.win) {
          obj.style.display = "none";
          (function(){
            if (obj.readyState == 4) {
              removeObjectInIE(id);
            }
            else {
              setTimeout(arguments.callee, 10);
            }
          })();
        }
        else {
          obj.parentNode.removeChild(obj);
        }
      }
    }
    
    function removeObjectInIE(id) {
      var obj = getElementById(id);
      if (obj) {
        for (var i in obj) {
          if (typeof obj[i] == "function") {
            obj[i] = null;
          }
        }
        obj.parentNode.removeChild(obj);
      }
    }
    
    /* Functions to optimize JavaScript compression
    */
    function getElementById(id) {
      var el = null;
      try {
        el = doc.getElementById(id);
      }
      catch (e) {}
      return el;
    }
    
    function createElement(el) {
      return doc.createElement(el);
    }
    
    /* Updated attachEvent function for Internet Explorer
      - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
    */	
    function addListener(target, eventType, fn) {
      target.attachEvent(eventType, fn);
      listenersArr[listenersArr.length] = [target, eventType, fn];
    }
    
    /* Flash Player and SWF content version matching
    */
    function hasPlayerVersion(rv) {
      var pv = ua.pv, v = rv.split(".");
      v[0] = parseInt(v[0], 10);
      v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
      v[2] = parseInt(v[2], 10) || 0;
      return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    }
    
    /* Cross-browser dynamic CSS creation
      - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
    */	
    function createCSS(sel, decl, media, newStyle) {
      if (ua.ie && ua.mac) { return; }
      var h = doc.getElementsByTagName("head")[0];
      if (!h) { return; } // to also support badly authored HTML pages that lack a head element
      var m = (media && typeof media == "string") ? media : "screen";
      if (newStyle) {
        dynamicStylesheet = null;
        dynamicStylesheetMedia = null;
      }
      if (!dynamicStylesheet || dynamicStylesheetMedia != m) { 
        // create dynamic stylesheet + get a global reference to it
        var s = createElement("style");
        s.setAttribute("type", "text/css");
        s.setAttribute("media", m);
        dynamicStylesheet = h.appendChild(s);
        if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
          dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
        }
        dynamicStylesheetMedia = m;
      }
      // add style rule
      if (ua.ie && ua.win) {
        if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
          dynamicStylesheet.addRule(sel, decl);
        }
      }
      else {
        if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
          dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
        }
      }
    }
    
    function setVisibility(id, isVisible) {
      if (!autoHideShow) { return; }
      var v = isVisible ? "visible" : "hidden";
      if (isDomLoaded && getElementById(id)) {
        getElementById(id).style.visibility = v;
      }
      else {
        createCSS("#" + id, "visibility:" + v);
      }
    }

    /* Filter to avoid XSS attacks
    */
    function urlEncodeIfNecessary(s) {
      var regex = /[\\\"<>\.;]/;
      var hasBadChars = regex.exec(s) != null;
      return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
    }
    
    /* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
    */
    var cleanup = function() {
      if (ua.ie && ua.win) {
        window.attachEvent("onunload", function() {
          // remove listeners to avoid memory leaks
          var ll = listenersArr.length;
          for (var i = 0; i < ll; i++) {
            listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
          }
          // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
          var il = objIdArr.length;
          for (var j = 0; j < il; j++) {
            removeSWF(objIdArr[j]);
          }
          // cleanup library's main closures to avoid memory leaks
          for (var k in ua) {
            ua[k] = null;
          }
          ua = null;
          for (var l in swfobject) {
            swfobject[l] = null;
          }
          swfobject = null;
        });
      }
    }();
    
    return {
      /* Public API
        - Reference: http://code.google.com/p/swfobject/wiki/documentation
      */ 
      registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
        if (ua.w3 && objectIdStr && swfVersionStr) {
          var regObj = {};
          regObj.id = objectIdStr;
          regObj.swfVersion = swfVersionStr;
          regObj.expressInstall = xiSwfUrlStr;
          regObj.callbackFn = callbackFn;
          regObjArr[regObjArr.length] = regObj;
          setVisibility(objectIdStr, false);
        }
        else if (callbackFn) {
          callbackFn({success:false, id:objectIdStr});
        }
      },
      
      getObjectById: function(objectIdStr) {
        if (ua.w3) {
          return getObjectById(objectIdStr);
        }
      },
      
      embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
        var callbackObj = {success:false, id:replaceElemIdStr};
        if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
          setVisibility(replaceElemIdStr, false);
          addDomLoadEvent(function() {
            widthStr += ""; // auto-convert to string
            heightStr += "";
            var att = {};
            if (attObj && typeof attObj === OBJECT) {
              for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                att[i] = attObj[i];
              }
            }
            att.data = swfUrlStr;
            att.width = widthStr;
            att.height = heightStr;
            var par = {}; 
            if (parObj && typeof parObj === OBJECT) {
              for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                par[j] = parObj[j];
              }
            }
            if (flashvarsObj && typeof flashvarsObj === OBJECT) {
              for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                if (typeof par.flashvars != UNDEF) {
                  par.flashvars += "&" + k + "=" + flashvarsObj[k];
                }
                else {
                  par.flashvars = k + "=" + flashvarsObj[k];
                }
              }
            }
            if (hasPlayerVersion(swfVersionStr)) { // create SWF
              var obj = createSWF(att, par, replaceElemIdStr);
              if (att.id == replaceElemIdStr) {
                setVisibility(replaceElemIdStr, true);
              }
              callbackObj.success = true;
              callbackObj.ref = obj;
            }
            else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
              att.data = xiSwfUrlStr;
              showExpressInstall(att, par, replaceElemIdStr, callbackFn);
              return;
            }
            else { // show alternative content
              setVisibility(replaceElemIdStr, true);
            }
            if (callbackFn) { callbackFn(callbackObj); }
          });
        }
        else if (callbackFn) { callbackFn(callbackObj);	}
      },
      
      switchOffAutoHideShow: function() {
        autoHideShow = false;
      },
      
      ua: ua,
      
      getFlashPlayerVersion: function() {
        return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
      },
      
      hasFlashPlayerVersion: hasPlayerVersion,
      
      createSWF: function(attObj, parObj, replaceElemIdStr) {
        if (ua.w3) {
          return createSWF(attObj, parObj, replaceElemIdStr);
        }
        else {
          return undefined;
        }
      },
      
      showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
        if (ua.w3 && canExpressInstall()) {
          showExpressInstall(att, par, replaceElemIdStr, callbackFn);
        }
      },
      
      removeSWF: function(objElemIdStr) {
        if (ua.w3) {
          removeSWF(objElemIdStr);
        }
      },
      
      createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
        if (ua.w3) {
          createCSS(selStr, declStr, mediaStr, newStyleBoolean);
        }
      },
      
      addDomLoadEvent: addDomLoadEvent,
      
      addLoadEvent: addLoadEvent,
      
      getQueryParamValue: function(param) {
        var q = doc.location.search || doc.location.hash;
        if (q) {
          if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
          if (param == null) {
            return urlEncodeIfNecessary(q);
          }
          var pairs = q.split("&");
          for (var i = 0; i < pairs.length; i++) {
            if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
              return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
            }
          }
        }
        return "";
      },
      
      // For internal usage only
      expressInstallCallback: function() {
        if (isExpressInstallActive) {
          var obj = getElementById(EXPRESS_INSTALL_ID);
          if (obj && storedAltContent) {
            obj.parentNode.replaceChild(storedAltContent, obj);
            if (storedAltContentId) {
              setVisibility(storedAltContentId, true);
              if (ua.ie && ua.win) { storedAltContent.style.display = "block"; }
            }
            if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
          }
          isExpressInstallActive = false;
        } 
      }
    };
  }();

  /**
  * Vimeo wrapper for Popcorn.
  * This player adds enables Popcorn.js to handle Vimeo videos. It does so by masking an embedded Vimeo video Flash object
  * as a video and implementing the HTML5 Media Element interface.
  *
  * You can specify the video in four ways:
  *  1. Use the embed code path supplied by Vimeo as a div's src, and pass the div id into a new Popcorn.vimeo object
  *
  *    <div id="player_1" width="500" height="281" src="http://player.vimeo.com/video/11127501" ></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.vimeo( "player_1" ) );
  *      }, false);
  *    </script>
  &
  *  2. Pass the div id and the embed code path supplied by Vimeo into a new Popcorn.vimeo object
  *
  *    <div id="player_1" width="500" height="281" ></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.vimeo( "player_1", "http://player.vimeo.com/video/11127501" ) );
  *      }, false);
  *    </script>
  *
  *  3. Use a web url as a div's src, and pass the div id into a new Popcorn.vimeo object
  *
  *    <div id="player_1" width="500" height="281" src="http://vimeo.com/11127501" ></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.vimeo( "player_1" ) );
  *      }, false);
  *    </script>
  *
  *  4. Pass the div id and the web url into a new Popcorn.vimeo object
  *
  *    <div id="player_1" width="500" height="281" ></div>
  *    <script type="text/javascript">
  *      document.addEventListener("DOMContentLoaded", function() {
  *        var popcorn = Popcorn( Popcorn.vimeo( "player_1", "http://vimeo.com/11127501" ) );
  *      }, false);
  *    </script>
  *
  * Due to Vimeo's API, certain events must be subscribed to at different times, and some not at all.
  * These events are completely custom-implemented and may be subscribed to at any time:
  *   canplaythrough
  *   durationchange
  *   load
  *   loadedmetadata
  *   loadstart
  *   play
  *   readystatechange
  *   volumechange
  *
  * These events are related to player functionality and must be subscribed to during or after the load event:
  *   abort
  *   emptied
  *   ended
  *   pause
  *   playing
  *   progress
  *   seeked
  *   timeupdate
  *
  * These events are not supported:
  *   canplay
  *   error
  *   loadeddata
  *   ratechange
  *   seeking
  *   stalled
  *   suspend
  *   waiting
  *
  * Due to Vimeo's API, some attributes are be supported while others are not.
  * Supported media attributes:
  *   autoplay ( via Popcorn )
  *   currentTime
  *   duration ( get only )
  *   ended ( get only )
  *   initialTime ( get only, always 0 )
  *   loop ( get only, set by calling setLoop() )
  *   muted ( get only )
  *   paused ( get only )
  *   readyState ( get only )
  *   volume
  *
  *   load() function
  *   mute() function ( toggles on/off )
  *
  * Unsupported media attributes:
  *   buffered
  *   defaultPlaybackRate
  *   networkState
  *   playbackRate
  *   played
  *   preload
  *   seekable
  *   seeking
  *   src
  *   startOffsetTime
  */
  
  // Trackers
  var timeupdateInterval = 33,
      timeCheckInterval = 0.75,
      abs = Math.abs,
      registry = {};
  
  // base object for DOM-related behaviour like events
  var EventManager = function ( owner ) {
    var evts = {};
    
    function makeHandler( evtName ) {
      if ( !evts[evtName] ) {
        evts[evtName] = [];
        
        // Create a wrapper function to all registered listeners
        this["on"+evtName] = function( args ) {
          Popcorn.forEach( evts[evtName], function( fn ) {
            if ( fn ) {
              fn.call( owner, args );
            }
          });
        }
      }
    };
    
    return {
      addEventListener: function( evtName, fn, doFire ) {
        evtName = evtName.toLowerCase();
        
        makeHandler.call( this, evtName );
        evts[evtName].push( fn );
        
        if ( doFire ) {
          dispatchEvent( evtName );
        }
        
        return fn;
      },
      // Add many listeners for a single event
      // Takes an event name and array of functions
      addEventListeners: function( evtName, events ) {
        evtName = evtName.toLowerCase();
        
        makeHandler.call( this, evtName );
        evts[evtName] = evts[evtName].concat( events );
      },
      removeEventListener: function( evtName, fn ) {
        var evtArray = this.getEventListeners( evtName ),
            i,
            l;
        
        // Find and remove from events array
        for ( i = 0, l = evtArray.length; i < l; i++) {
          if ( evtArray[i] === fn ) {
            var removed = evtArray[i];
            evtArray[i] = 0;
            return removed;
          }
        }
      },
      getEventListeners: function( evtName ) {
        if( evtName ) {
          return evts[ evtName.toLowerCase() ] || [];
        } else {
          return evts;
        }
      },
      dispatchEvent: function( evt, args ) {        
        // If event object was passed in, toString will yield event type as string (timeupdate)
        // If a string, toString() will return the string itself (timeupdate)
        var evt = "on"+evt.toString().toLowerCase();
        this[evt] && this[evt]( args );
      }
    };
  };
      
  Popcorn.vimeo = function( mediaId, list ) {
    return new Popcorn.vimeo.init( mediaId, list );
  };
  
  Popcorn.vimeo.onLoad = function( playerId ) {
    var player = registry[ playerId ];
    
    player.swfObj = document.getElementById( playerId );
    
    // For calculating position relative to video (like subtitles)
    player.offsetWidth = player.swfObj.offsetWidth;
    player.offsetHeight = player.swfObj.offsetHeight;
    player.offsetParent = player.swfObj.offsetParent;
    player.offsetLeft = player.swfObj.offsetLeft;
    player.offsetTop = player.swfObj.offsetTop;
    
    player.dispatchEvent( "load" );
  }
  
  // A constructor, but we need to wrap it to allow for "static" functions
  Popcorn.vimeo.init = (function() {
    var rPlayerUri = /^http:\/\/player\.vimeo\.com\/video\/[\d]+/i,
        rWebUrl = /vimeo\.com\/[\d]+/,
        hasAPILoaded = false;
    
    // Extract the numeric video id from container uri: 'http://player.vimeo.com/video/11127501' or 'http://player.vimeo.com/video/4282282'
    // Expect id to be a valid 32/64-bit unsigned integer
    // Returns string, empty string if could not match
    function extractIdFromUri( uri ) {
      if ( !uri ) {
        return;
      }
      
      var matches = uri.match( rPlayerUri );
      return matches ? matches[0].substr(30) : "";
    };
    
    // Extract the numeric video id from url: 'http://vimeo.com/11127501' or simply 'vimeo.com/4282282'
    // Ignores protocol and subdomain, but one would expecct it to be http://www.vimeo.com/#######
    // Expect id to be a valid 32/64-bit unsigned integer
    // Returns string, empty string if could not match
    function extractIdFromUrl( url ) {
      if ( !url ) {
        return;
      }
      
      var matches = url.match( rWebUrl );
      return matches ? matches[0].substr(10) : "";
    };
    
    // If container id is not supplied, assumed to be same as player id
    var ctor = function ( containerId, videoUrl ) {
      if ( !containerId ) {
        throw "Must supply an id!";
      } else if ( /file/.test( location.protocol ) ) {
        throw "Must run from a web server!";
      }
      
      var vidId,
          that = this,
          container = document.getElementById( containerId ),
          // For flash embedding
          params,
          flashvars,
          attributes = {};
      
      this.addEventFn;
      this.evtHolder;
      this.paused = true;
      this.duration = Number.MAX_VALUE;
      this.ended = 0;
      this.currentTime = 0;
      this.volume = 1;
      this.loop = 0;
      this.initialTime = 0;
      this.played = 0;
      this.readyState = 0;
      
      this.previousCurrentTime = this.currentTime;
      this.previousVolume = this.volume;
      this.evtHolder = new EventManager( this );
      
      // For calculating position relative to video (like subtitles)
      this.offsetWidth = this.width = container.getAttribute( "width" ) || "504";
      this.offsetHeight = this.height = container.getAttribute( "height" ) || "340";
      this.offsetLeft = 0;
      this.offsetTop = 0;
      
      // Try and get a video id from a vimeo site url
      // Try either from ctor param or from iframe itself
      if( videoUrl ) {
        vidId = extractIdFromUrl( videoUrl ) || extractIdFromUri( videoUrl );
      } 

      if ( !vidId ){
        vidId = extractIdFromUrl( container.getAttribute("src") ) || extractIdFromUri( container.getAttribute("src") );
      }
      
      if ( !vidId ) {
        throw "No video id";
      }
      
      registry[ containerId ] = this;
      
      flashvars = {
        clip_id: vidId,
        show_portrait: 1,
        show_byline: 1,
        show_title: 1,
        js_api: 1, // required in order to use the Javascript API
        js_onLoad: 'Popcorn.vimeo.onLoad', // moogaloop will call this JS function when it's done loading (optional)
        js_swf_id: containerId // this will be passed into all event methods so you can keep track of multiple moogaloops (optional)
      };
      params = {
        allowscriptaccess: 'always',
        allowfullscreen: 'true',
        // This is so we can overlay html ontop o fFlash
        wmode: 'transparent'
      };
      
      swfobject.embedSWF( "http://vimeo.com/moogaloop.swf", containerId, this.width, this.height, "9.0.0", "expressInstall.swf", flashvars, params, attributes );
      
      // Set up listeners to internally track state as needed
      this.addEventListener( "load", function() {
        var hasLoaded = false;
        
        that.duration = that.swfObj.api_getDuration();
        that.evtHolder.dispatchEvent( "durationchange" );
        that.evtHolder.dispatchEvent( "loadedmetadata" );
        
        // Chain events and calls together so that this.currentTime reflects the current time of the video
        // Done by Getting the Current Time while the video plays
        that.addEventListener( "timeupdate", function() {
          that.currentTime = that.swfObj.api_getCurrentTime();
        });
        
        // Add pause listener to keep track of playing state
        
        that.addEventListener( "pause", function() {
          that.paused = true;
        });
        
        // Add play listener to keep track of playing state
        that.addEventListener( "playing", function() {
          that.paused = false;
          that.ended = 0;
        });
        
        // Add ended listener to keep track of playing state
        that.addEventListener( "ended", function() {
          if ( that.loop !== "loop" ) {
            that.paused = true;
            that.ended = 1;
          }
        });
        
        // Add progress listener to keep track of ready state
        that.addEventListener( "progress", function( data ) {
          if ( !hasLoaded ) {
            hasLoaded = 1;
            that.readyState = 3;
            that.evtHolder.dispatchEvent( "readystatechange" );
          }
          
          // Check if fully loaded
          if ( data.percent === 100 ) {
            that.readyState = 4;
            that.evtHolder.dispatchEvent( "readystatechange" );
            that.evtHolder.dispatchEvent( "canplaythrough" );
          }
        });
      });
    }
    return ctor;
  })();
  
  Popcorn.vimeo.init.prototype = Popcorn.vimeo.prototype;
  
  // Sequence object prototype
  Popcorn.extend( Popcorn.vimeo.prototype, {
    // Do everything as functions instead of get/set
    setLoop: function( val ) {
      if ( !val ) {
        return;
      }
      
      this.loop = val;
      var isLoop = val === "loop" ? 1 : 0;
      // HTML convention says to loop if value is 'loop'
      this.swfObj.api_setLoop( isLoop );
    },
    // Set the volume as a value between 0 and 1
    setVolume: function( val ) {
      if ( !val && val !== 0 ) {
        return;
      }
      
      // Normalize in case outside range of expected values
      if ( val < 0 ) {
        val = -val;
      }
      
      if ( val > 1 ) {
        val %= 1;
      }
      
      // HTML video expects to be 0.0 -> 1.0, Vimeo expects 0-100
      this.volume = this.previousVolume = val;
      this.swfObj.api_setVolume( val*100 );
      this.evtHolder.dispatchEvent( "volumechange" );
    },
    // Seeks the video
    setCurrentTime: function ( time ) {
      if ( !time && time !== 0 ) {
        return;
      }
      
      this.currentTime = this.previousCurrentTime = time;
      this.ended = time >= this.duration;
      this.swfObj.api_seekTo( time );
      
      // Fire events for seeking and time change
      this.evtHolder.dispatchEvent( "seeked" );
      this.evtHolder.dispatchEvent( "timeupdate" );
    },
    // Play the video
    play: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.play );
        return;
      }
      
      if ( !this.played ) {
        this.played = 1;
        this.startTimeUpdater();
        this.evtHolder.dispatchEvent( "loadstart" );
      }
      
      this.evtHolder.dispatchEvent( "play" );
      this.swfObj.api_play();
    },
    // Pause the video
    pause: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.pause );
        return;
      }
      
      this.swfObj.api_pause();
    },
    // Toggle video muting
    // Unmuting will leave it at the old value
    mute: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.mute );
        return;
      }
      
      if ( !this.muted() ) {
        this.oldVol = this.volume;
        
        if ( this.paused ) {
          this.setVolume( 0 );
        } else {
          this.volume = 0;
        }
      } else {
        if ( this.paused ) {
          this.setVolume( this.oldVol );
        } else {
          this.volume = this.oldVol;
        }
      }
    },
    muted: function() {
      return this.volume === 0;
    },
    // Force loading by playing the player. Pause afterwards
    load: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.load );
        return;
      }
      
      this.play();
      this.pause();
    },
    unload: function() {
      // In case someone is cheeky enough to try this before loaded
      if ( !this.swfObj ) {
        this.addEventListener( "load", this.unload );
        return;
      }
      
      this.pause();
      
      this.swfObj.api_unload();
      this.evtHolder.dispatchEvent( "abort" );
      this.evtHolder.dispatchEvent( "emptied" );
    },
    // Hook an event listener for the player event into internal event system
    // Stick to HTML conventions of add event listener and keep lowercase, without prependinng "on"
    addEventListener: function( evt, fn ) {
      var playerEvt,
          that = this;
      
      // In case event object is passed in
      evt = evt.type || evt.toLowerCase();
      
      // If it's an HTML media event supported by player, map
      if ( evt === "seeked" ) {
        playerEvt = "onSeek";
      } else if ( evt === "timeupdate" ) {
        playerEvt = "onProgress";
      } else if ( evt === "progress" ) {
        playerEvt = "onLoading";
      } else if ( evt === "ended" ) {
        playerEvt = "onFinish";
      } else if ( evt === "playing" ) {
        playerEvt = "onPlay";
      } else if ( evt === "pause" ) {
        // Direct mapping, CamelCase the event name as vimeo API expects
        playerEvt = "on"+evt[0].toUpperCase() + evt.substr(1);
      }
      
      // Vimeo only stores 1 callback per event
      // Have vimeo call internal collection of callbacks
      this.evtHolder.addEventListener( evt, fn, false );
      
      // Link manual event structure with Vimeo's if not already
      if( playerEvt && this.evtHolder.getEventListeners( evt ).length === 1 ) {
        // Setup global functions on Popcorn.vimeo to sync player events to an internal collection
        // Some events expect 2 args, some only one (the player id)
        if ( playerEvt === "onSeek" || playerEvt === "onProgress" || playerEvt === "onLoading" ) {
          Popcorn.vimeo[playerEvt] = function( arg1, arg2 ) {
            var player = registry[arg2];
            
            player.evtHolder.dispatchEvent( evt, arg1 );
          };
        } else {
          Popcorn.vimeo[playerEvt] = function( arg1 ) {
            var player = registry[arg1];
            player.evtHolder.dispatchEvent( evt );
          };
        }
        
        this.swfObj.api_addEventListener( playerEvt, "Popcorn.vimeo."+playerEvt );
      }
    },
    removeEventListener: function( evtName, fn ) {
      return this.evtHolder.removeEventListener( evtName, fn );
    },
    dispatchEvent: function( evtName ) {
      return this.evtHolder.dispatchEvent( evtName );
    },
    startTimeUpdater: function() {
      var self = this,
          seeked = 0;
      
      if ( abs( this.currentTime - this.previousCurrentTime ) > timeCheckInterval ) {
        // Has programatically set the currentTime
        this.setCurrentTime( this.currentTime );
        seeked = 1;
      } else {
        this.previousCurrentTime = this.currentTime;
      }
      
      if ( this.volume !== this.previousVolume ) {
        this.setVolume( this.volume );
      }
      
      if ( !self.paused || seeked ) {
        this.dispatchEvent( 'timeupdate' );
      }
      
      if( !self.ended ) {
        setTimeout( function() {
          self.startTimeUpdater.call(self);
        }, timeupdateInterval);
      }
    },
  });
})( Popcorn );