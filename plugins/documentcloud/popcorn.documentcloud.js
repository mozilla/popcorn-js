// PLUGIN: documentcloud

(function (Popcorn, document) {

  /**
   * Document Cloud popcorn plug-in
   *
   * @param {Object} options
   *
   * Example:
   *  var p = Popcorn('#video')
   *     // Let the pdf plugin load your PDF file for you using pdfUrl.
   *     .documentcloud({
   *       start: 45
   *       url: "http://www.documentcloud.org/documents/70050-urbina-day-1-in-progress.html", // or .js
   *       width: ...,
   *       height: ...,
   *       zoom: ...,
   *       page: ...,
   *       container: ...
   *     });

sidebar: true
text: true, // don't display text tab
pdf: true, // no pdf link
showAnnotations: true, //
zoom: 700, // int (500, 700, 800, 900, 100))
search: true // search bar on/off

afterLoad: function() {} // callback...

<div id="DV-viewer-70050-urbina-day-1-in-progress" class="DV-container"></div>
<script src="http://s3.documentcloud.org/viewer/loader.js"></script>


  DV.onload = function(){  }
  DV.load('http://www.documentcloud.org/documents/70050-urbina-day-1-in-progress.js', {
    width: 970,
    height: 800,
    container: "#DV-viewer-70050-urbina-day-1-in-progress"
  });


api - https://github.com/documentcloud/document-viewer/blob/master/public/javascripts/DV/controllers/api.js

   */

  Popcorn.plugin( "documentcloud" , {

    manifest: {
      about:{
        name: "Popcorn Document Cloud Plugin",
        version: "0.1",
        author: "@humphd",
        website: "http://vocamus.net/dave"
      },
      options:{
        start      : {elem:'input', type:'text', label:'In'},
        end        : {elem:'input', type:'text', label:'Out'},
        target     : 'pdf-container',
        width      : {elem:'input', type:'text', label:'Width'},
        height     : {elem:'input', type:'text', label:'Height'},
        src        : {elem:'input', type:'text', label:'PDF URL'},
        // TODO: Not sure how to deal with pdfDoc, which can only be done with script
        // pdfDoc     : ???
        preload    : {elem:'input', type:'boolean', label:'Preload'},
        page       : {elem:'input', type:'number', label:'Page Number'}
      }
    },


    _setup: function(options) {
      // If the viewer is already loaded, don't repeat the process.
      if (window.DV && window.DV.loaded) {
        return;
      }

      var DV = window.DV = window.DV || {};
      DV.recordHit = "http://www.documentcloud.org/pixel.gif";

      var link   = document.createElement('link');
      link.rel   = 'stylesheet';
      link.type  = 'text/css';
      link.media = 'screen';
      link.href  = 'http://s3.documentcloud.org/viewer/viewer-datauri.css';
      var head   = document.getElementsByTagName('head')[0];
      head.appendChild(link);

      // Record the fact that the viewer is loaded.
      DV.loaded = true;

      // Request the viewer JavaScript.
      Popcorn.getScript('http://s3.documentcloud.org/viewer/viewer.js');
    },


    start: function(event, options) {
      var url = options.url.replace(/\.html$/, '.js'), // swap .html URL to .js for API call
        target = options.target,
        container = '#' + target, // need #id for document cloud call
        containerDiv = document.getElementById(target),
        containerDivSize = Popcorn.position(containerDiv),
        width = options.width || containerDivSize.width, //970, // need to use size of div if not given
        height = options.height || containerDivSize.height, //800, //
        sidebar = options.sidebar || true,
        text = options.text || true,
        pdf = options.pdf || true,
        showAnnotations = options.showAnnotations || true,
        zoom = options.zoom || 700,
        search = options.search || true,
        page = options.page;

      // TODO: cache viewers we have so we don't reload viewer in order to change pages...

      // Figure out if we need a callback to change the page #
      var afterLoad = options.page ?
        function() {
          var api = new DV.Api(DV.viewers[_.keys(DV.viewers)[0]]);
          api.setCurrentPage(3);
        } :
        function() {};

      DV.load(url, {
        width: width,
        height: height,
        sidebar: sidebar,
        text: text,
        pdf: pdf,
        showAnnotations: showAnnotations,
        zoom: zoom,
        search: search,
        container: container,
        afterLoad: afterLoad
      });
    },

    end: function(event, options) {
      // TODO: this causes viewer listeners to throw when it vanishes.  Need a clean way to remove viewer...
      var elem = document.getElementById(options.target);

      while (elem.hasChildNodes()) {
        elem.removeChild(elem.lastChild);
      }
    },

    _teardown: function( options ) {
    }

  });

})( Popcorn, window.document );
