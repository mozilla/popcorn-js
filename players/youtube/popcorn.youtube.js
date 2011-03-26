// Popcorn Youtube Player Wrapper

var onYouTubePlayerReady;

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
  }(); //end of SWFObject
 
  /**
   * Youtube wrapper for popcorn.
   * This plug-in adds capability for Popcorn.js to deal with Youtube
   * videos. This plug-in also doesn't use Popcorn's plugin() API and
   * instead hacks directly into Popcorn's core.
   *
   * To use this plug-in, onYouTubePlayerReady() event handler needs to be
   * called by the Youtube video player, before videos can be registered.
   * Once videos are registered, calls to them can be made the same way as
   * regular Popcorn objects. Also note that enablejsapi=1 needs to be added
   * to the embed code, in order for Youtube's JavaScript API to work.
   *
   * Note that there are a few methods, properties and events that are not
   * supported. See the bottom of this plug-in for a complete list.
   */

  // Intended
  var undef;

  // Config parameters
  // 33 ms per update is suitable for 30 fps
  // 0.05 sec tolerance between old and new times to determine if currentTime has been set programatically
  // 250 ms progress interval as specified by WHATWG
  var timeupdateInterval = 33,
      timeCheckInterval = 0.5
      progressInterval = 250;

  // Ready State Constants
  var READY_STATE_HAVE_NOTHING = 0,
      READY_STATE_HAVE_METADATA = 1,
      READY_STATE_HAVE_CURRENT_DATA = 2,
      READY_STATE_HAVE_FUTURE_DATA = 3,
      READY_STATE_HAVE_ENOUGH_DATA = 4;

  // Youtube State Constants
  var YOUTUBE_STATE_UNSTARTED = -1,
      YOUTUBE_STATE_ENDED = 0,
      YOUTUBE_STATE_PLAYING = 1,
      YOUTUBE_STATE_PAUSED = 2,
      YOUTUBE_STATE_BUFFERING = 3,
      YOUTUBE_STATE_CUED = 5;
  
  // Collection of all Youtube players
  var registry = {},
      loadedPlayers = {};
      
  var abs = Math.abs;
  
  // Extract the id from a web url
  function extractIdFromUrl( url ) {
    if ( !url ) {
      return;
    }
    
    var matches = url.match( /((http:\/\/)?www\.)?youtube\.[a-z]+\/watch\?v\=[a-z0-9]+/i );    
    // Return id, which comes after first equals sign
    return matches ? matches[0].split( "=" )[1] : "";
  };
  
  // Extract the id from a player url
  function extractIdFromUri( url ) {
    if ( !url ) {
      return;
    }
    
    var matches = url.match( /^http:\/\/?www\.youtube\.[a-z]+\/e\/[a-z0-9]+/i );
    
    // Return id, which comes after first equals sign
    return matches ? matches[0].split( "/e/" )[1] : ""
  };
  
  function getPlayerAddress( vidId, playerId ) {
    if( !vidId ) {
      return;
    }
    
    return "http://www.youtube.com/e/" + id;
  }
  
  function makeSWF( url, container ) {
    var params,
        flashvars,
        attributes;
        
    // The video id for youtube (web or player formats)
    // First check manually given url, if that doesn't work resort to "src"
    this.vidId = this.vidId || extractIdFromUrl( container.getAttribute( "src" ) ) || extractIdFromUri( container.getAttribute( "src" ) );
    
    if ( !this.vidId ) {
      throw "Could not find video id";
    }
    
    // Determine width/height/etc based on container
    this.width = container.getAttribute("width") || 460;
    this.height = container.getAttribute("height") || 350;
    
    // Just in case we got the attributes as strings. We'll need to do math with these later
    this.width = parseFloat(this.width);
    this.height = parseFloat(this.height);
    
    this.offsetWidth = this.width;
    this.offsetHeight = this.height;
    this.offsetParent = container.offsetParent;
    this.offsetLeft = container.offsetLeft;
    this.offsetTop = container.offsetTop;
    
    flashvars = {
      playerapiid: this.playerId
    };
    params = {
      allowscriptaccess: 'always',
      allowfullscreen: 'true',
      // This is so we can overlay html on top of Flash
      wmode: 'transparent'
    };
    
    attributes = {
      id: this.playerId
    };
    
    swfobject.embedSWF( "http://www.youtube.com/e/" + this.vidId +"?enablejsapi=1&playerapiid=" + this.playerId + "&verion=3", 
                      this.playerId, this.width, this.height, "8", null, flashvars, params, attributes );
  }
  
  // Called when a player is loaded
  // Playerid must match the element id
  onYouTubePlayerReady = function ( playerId ) {
    var vid = registry[playerId];
    
    loadedPlayers[playerId] = 1;
    
    // Video hadn't loaded yet when ctor was called
    vid.video = document.getElementById( playerId );
    vid.duration = vid.video.getDuration();
    
    // Issue load event
    vid.dispatchEvent( 'load' );
    vid.dispatchEvent( "durationchange" );
  }

  Popcorn.youtube = function( elementId, url ) {
    return new Popcorn.youtube.init( elementId, url );
  };

  Popcorn.youtube.init = function( elementId, url ) {
    if ( !elementId ) {
      throw "Element id is invalid.";
    } else if ( /file/.test( location.protocol ) ) {
      throw "This must be run from a web server.";
    }
    
    var self = this,
        container = document.getElementById( elementId );;
    
    this.playerId = elementId;
    this.readyState = READY_STATE_HAVE_NOTHING;
    this.eventListeners = {};
    this.loadStarted = false;
    this.loadedData = false;
    this.fullyLoaded = false;
    this.timeUpdater = null;
    this.progressUpdater = null;
    
    this.currentTime = this.previousCurrentTime = 0;
    this.volume = this.previousVolume = this.preMuteVol = 1;
    this.duration = 0;
    
    this.vidId = extractIdFromUrl( url ) || extractIdFromUri( url );
    
    this.addEventListener( "load", function() {
      // For calculating position relative to video (like subtitles)
      this.offsetWidth = this.video.offsetWidth;
      this.offsetHeight = this.video.offsetHeight;
      this.offsetParent = this.video.offsetParent;
      this.offsetLeft = this.video.offsetLeft;
      this.offsetTop = this.video.offsetTop;
      
      // Set up stuff that requires the API to be loaded
      this.registerYoutubeEventHandlers();
      this.registerInternalEventHandlers();
    });
    
    (function() {
      var hasBeenCalled = 0;
      
      self.addEventListener( "playing", function() {
        if (hasBeenCalled) {
          return;
        }
        
        hasBeenCalled = 1;
        self.duration = self.video.getDuration();
        self.dispatchEvent( "durationchange" );
        
      });
    })();
    
    if ( loadedPlayers[this.playerId] ) {
      this.video = registry[this.playerId].video;
      
      this.vidId = this.vidId || extractIdFromUrl( container.getAttribute( "src" ) ) || extractIdFromUri( container.getAttribute( "src" ) );
      
      if (this.vidId !== registry[this.playerId].vidId ) {
        this.video.cueVideoById( this.vidId );
      } else {
        // Same video, new ctor. Force a seek to the beginning
        this.previousCurrentTime = 1;
      }
      
      this.dispatchEvent( 'load' );
    } else if ( container ) {
      makeSWF.call( this, url, container );
    } else {
      // Container not yet loaded, get it on DOMDontentLoad
      document.addEventListener( "DOMContentLoaded", function() {
        container = document.getElementById( elementId );
        
        if ( !container ) {
          throw "Could not find container!";
        }
        
        makeSWF.call( self, url, container );
      }, false);
    }
    
    registry[this.playerId] = this;
  };
  // end Popcorn.youtube.init

  Popcorn.extend( Popcorn.youtube.init.prototype, {

    // For internal use only.
    // Register handlers to YouTube events.
    registerYoutubeEventHandlers: function() {
      var youcorn = this,
          stateChangeHandler = 'Popcorn.youtube.stateChangeEventHandler',
          errorHandler = 'Popcorn.youtube.errorEventHandler';
          
      this.video.addEventListener( 'onStateChange', stateChangeHandler );
      this.video.addEventListener( 'onError', errorHandler );

      /**
       * Since Flash can only call named functions, they are declared
       * separately here.
       */
      Popcorn.youtube.stateChangeEventHandler = function( state ) {
        // In case ctor has been called many times for many ctors
        // Only use latest ctor call for each player id        
        var self = registry[youcorn.playerId];
        
        if ( state === YOUTUBE_STATE_UNSTARTED ) {
          self.readyState = READY_STATE_HAVE_METADATA;
          self.dispatchEvent( 'loadedmetadata' );
        } else if ( state === YOUTUBE_STATE_ENDED ) {
          self.dispatchEvent( 'ended' );
        } else if ( state === YOUTUBE_STATE_PLAYING ) {
          // Being able to play means current data is loaded.
          if ( !this.loadedData ) {
            this.loadedData = true;
            self.dispatchEvent( 'loadeddata' );
          }

          self.readyState = READY_STATE_HAVE_CURRENT_DATA;
          self.dispatchEvent( 'playing' );
        } else if ( state === YOUTUBE_STATE_PAUSED ) {
          self.dispatchEvent( 'pause' );
        } else if ( state === YOUTUBE_STATE_BUFFERING ) {
          self.dispatchEvent( 'waiting' );
        } else if ( state === YOUTUBE_STATE_CUED ) {
          // not handled
        }
      };

      Popcorn.youtube.errorEventHandler = function( state ) {
        youcorn.dispatchEvent( 'error' );
      };
    },

    // For internal use only.
    // Start current time and loading progress syncing intervals.
    registerInternalEventHandlers: function() {
      this.addEventListener( 'playing', function() {
        this.startTimeUpdater();
      });
      this.addEventListener( 'loadedmetadata', function() {
        this.startProgressUpdater();
      });
    },

    play: function() {
      // In case called before video is loaded, defer acting
      if ( !loadedPlayers[this.playerId] ) {
        this.addEventListener( "load", function() {
          this.play();
        });
        return;
      }
      
      this.dispatchEvent( 'play' );
      this.video.playVideo();
    },

    pause: function() {
      // In case called before video is loaded, defer acting
      if ( !loadedPlayers[this.playerId] ) {
        this.addEventListener( "load", this.pause );
        return;
      }
      
      this.video.pauseVideo();
      // pause event is raised by Youtube.
    },

    load: function() {
      // In case called before video is loaded, defer acting
      if ( !loadedPlayers[this.playerId] ) {
        this.addEventListener( "load", function() {
          this.load();
}          );
        return;
      }
      
      this.video.playVideo();
      this.video.pauseVideo();
    },

    seekTo: function( time ) {      
      var playing = this.video.getPlayerState() == YOUTUBE_STATE_PLAYING;
      this.video.seekTo( time, true );

      // Prevent Youtube's behaviour to start playing video after seeking.
      if ( !playing ) {
        this.video.pauseVideo();
      }

      // Data need to be loaded again.
      if ( !this.fullyLoaded ) {
        this.loadedData = false;
      }

      // Raise event.
      this.dispatchEvent( 'seeked' );
    },

    // Mute is toggleable
    mute: function() {
      // In case called before video is loaded, defer acting
      if ( !loadedPlayers[this.playerId] ) {
        this.addEventListener( "load", this.mute );
        return;
      }
      
      if ( this.volume !== 0 ) {
        this.preMuteVol = this.volume;        
        this.setVolume( 0 );
      } else {
        this.setVolume( this.preMuteVol );
      }
    },

    // Expects beteween 0 and 1
    setVolume: function( vol ) {
      this.volume = this.previousVolume = vol;
      this.video.setVolume( vol * 100 );
      this.dispatchEvent( 'volumechange' );
    },

    addEventListener: function( evt, func ) {
      var evtName = evt.type || evt;
      
      if ( !this.eventListeners[evtName] ) {
        this.eventListeners[evtName] = [];
      }
      
      this.eventListeners[evtName].push( func );
    },

    /**
     * Notify event listeners about an event.
     */
    dispatchEvent: function( name ) {
      var evtName = name.type || name;
      if ( !this.eventListeners[evtName] ) {
        return;
      }
      
      var self = this;
      
      Popcorn.forEach( this.eventListeners[evtName], function( evt ) {
        evt.call( self, null );
      });
    },

    /* Unsupported methods. */

    defaultPlaybackRate: function( arg ) {
    },

    playbackRate: function( arg ) {
    },
    
    startTimeUpdater: function() {
      var state = this.video.getPlayerState(),
          self = this,
          seeked = 0;
      
      if ( abs( this.currentTime - this.previousCurrentTime ) > timeCheckInterval ) {
        // Has programatically set the currentTime
        this.previousCurrentTime = this.currentTime - timeCheckInterval;
        this.seekTo( this.currentTime );
        seeked = 1;
      } else {
        this.previousCurrentTime = this.currentTime;
        this.currentTime = this.video.getCurrentTime();
      }
      
      if ( this.volume !== this.previousVolume ) {
        this.setVolume( this.volume );
      }
      
      if ( state !== YOUTUBE_STATE_ENDED && state !== YOUTUBE_STATE_PAUSED || seeked ) {
        this.dispatchEvent( 'timeupdate' );
      }
      
      if( state !== YOUTUBE_STATE_ENDED ) {
        setTimeout( function() {
          self.startTimeUpdater.call(self);
        }, timeupdateInterval);
      }
    },
    
    startProgressUpdater: function() {
      var bytesLoaded = this.video.getVideoBytesLoaded(),
          bytesToLoad = this.video.getVideoBytesTotal(),
          self = this;

      // do nothing if size is not yet determined
      if ( bytesToLoad == 0 ) {
        return;
      }

      // raise an event if load has just started
      if ( !this.loadStarted ) {
        this.loadStarted = true;
        this.dispatchEvent( 'loadstart' );
      }

      // fully loaded
      if ( bytesLoaded >= bytesToLoad ) {
        this.fullyLoaded = true;
        this.readyState = READY_STATE_HAVE_ENOUGH_DATA;
        this.dispatchEvent( 'canplaythrough' );
        return;
      }

      this.dispatchEvent( 'progress' );
        
      setTimeout( function() {
        self.startProgressUpdater.call( self );
      }, progressInterval);
    }
  }); // end Popcorn.extend

  /* Unsupported properties and events. */

  /**
   * Unsupported events are:
   * * suspend
   * * abort
   * * emptied
   * * stalled
   * * canplay
   * * seeking
   * * ratechange
   */

})( Popcorn );

