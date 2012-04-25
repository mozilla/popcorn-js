// PLUGIN: documentcloud

(function( Popcorn, document ) {

  /**
   * Document Cloud popcorn plug-in
   *
   * @param {Object} options
   *
   * Example:
   *  var p = Popcorn("#video")
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

api - https://github.com/documentcloud/document-viewer/blob/master/public/javascripts/DV/controllers/api.js

   */

   // track registered plugins by document
   var documentRegistry = {};

  Popcorn.plugin( "documentcloud", {

    manifest: {
      about: {
        name: "Popcorn Document Cloud Plugin",
        version: "0.1",
        author: "@humphd, @ChrisDeCairos",
        website: "http://vocamus.net/dave"
      },
      options: {
        start: {
          elem: "input",
          type: "text",
          label: "In"
        },
        end: {
          elem: "input",
          type: "text",
          label: "Out"
        },
        target: "documentcloud-container",
        width: {
          elem: "input",
          type: "text",
          label: "Width",
          optional: true
        },
        height: {
          elem: "input",
          type: "text",
          label: "Height",
          optional: true
        },
        src: {
          elem: "input",
          type: "text",
          label: "PDF URL"
        },
        preload: {
          elem: "input",
          type: "boolean",
          label: "Preload",
          optional: true
        },
        page: {
          elem: "input",
          type: "number",
          label: "Page Number",
          optional: true
        },
        aid: {
          elem: "input",
          type: "number",
          label: "Annotation Id",
          optional: true
        }
      }
    },

    _setup: function( options ) {
      var DV = window.DV = window.DV || {},
          that = this;

      //setup elem...
      function load() {
        DV.loaded = false;
        // swap .html URL to .js for API call
        var url = options.url.replace( /\.html$/, ".js" ),
          target = options.target,
          targetDiv = document.getElementById( target ),
          containerDiv = document.createElement( "div" ),
          containerDivSize = Popcorn.position( targetDiv ),
          // need to use size of div if not given
          width = options.width || containerDivSize.width,
          height = options.height || containerDivSize.height,
          sidebar = options.sidebar || true,
          text = options.text || true,
          pdf = options.pdf || true,
          showAnnotations = options.showAnnotations || true,
          zoom = options.zoom || 700,
          search = options.search || true,
          page = options.page,
          container;

        function setOptions( viewer ) {
          options._key = viewer.api.getId();

          options._changeView = function ( viewer ) {
            if ( options.aid ) {
              viewer.pageSet.showAnnotation( viewer.api.getAnnotation( options.aid ) );
            } else {
              viewer.api.setCurrentPage( options.page );
            }
          };
        }

        function documentIsLoaded( url ) {
          var found = false;
          Popcorn.forEach( DV.viewers, function( viewer, idx ) {
            if( viewer.api.getSchema().canonicalURL === url ) {
              var targetDoc;
              setOptions( viewer );
              targetDoc = documentRegistry[ options._key ];
              options._containerId = targetDoc.id;
              targetDoc.num += 1;
              found = true;
              DV.loaded = true;
            }
          });
          return found;
        }

        function createRegistryEntry() {
          var entry = {
            num: 1,
            id: options._containerId
          };
          documentRegistry[ options._key ] = entry;
          DV.loaded = true;
        }

        if ( !documentIsLoaded( options.url ) ) {

          containerDiv.id = options._containerId = Popcorn.guid( target );
          container = "#" + containerDiv.id;
          targetDiv.appendChild( containerDiv );
          that.trigger( "documentready" );

          // Figure out if we need a callback to change the page #
          var afterLoad = options.page || options.aid ?
            function( viewer ) {
              setOptions( viewer );
              options._changeView( viewer );
              containerDiv.style.visibility = "hidden";
              viewer.elements.pages.hide();
              createRegistryEntry();
            } :
            function( viewer ) {
              setOptions( viewer );
              createRegistryEntry();
              containerDiv.style.visibility = "hidden";
              viewer.elements.pages.hide();
            };
          DV.load( url, {
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
        }
      }
      function readyCheck() {
        if( window.DV.loaded ) {
          load();
        } else {
          setTimeout( readyCheck, 25 );
        }
      }

      // If the viewer is already loaded, don't repeat the process.
      if ( !DV.loading ) {
        DV.loading = true;
        DV.recordHit = "//www.documentcloud.org/pixel.gif";

        var link = document.createElement( "link" ),
            head = document.getElementsByTagName( "head" )[ 0 ];

        link.rel = "stylesheet";
        link.type = "text/css";
        link.media = "screen";
        link.href = "//s3.documentcloud.org/viewer/viewer-datauri.css";

        head.appendChild( link );

        // Record the fact that the viewer is loaded.
        DV.loaded = false;

        // Request the viewer JavaScript.
        Popcorn.getScript( "http://s3.documentcloud.org/viewer/viewer.js", function() {
          DV.loading = false;
          load();
        });
      } else {

        readyCheck();
      }

    },

    start: function( event, options ) {
      var elem = document.getElementById( options._containerId ),
          viewer = DV.viewers[ options._key ];
      ( options.page || options.aid ) && viewer &&
        options._changeView( viewer );

      if ( elem && viewer) {
        elem.style.visibility = "visible";
        viewer.elements.pages.show();
      }
    },

    end: function( event, options ) {
      var elem = document.getElementById( options._containerId );

      if ( elem && DV.viewers[ options._key ] ) {
        elem.style.visibility = "hidden";
        DV.viewers[ options._key ].elements.pages.hide();
      }
    },

    _teardown: function( options ) {
      var elem = document.getElementById( options._containerId ),
          key = options._key;
      if ( key && DV.viewers[ key ] && --documentRegistry[ key ].num === 0 ) {
        DV.viewers[ key ].api.unload();

        while ( elem.hasChildNodes() ) {
          elem.removeChild( elem.lastChild );
        }
        elem.parentNode.removeChild( elem );
      }
    }
  });
})( Popcorn, window.document );
