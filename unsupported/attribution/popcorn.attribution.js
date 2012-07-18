// PLUGIN: Attribution

(function( Popcorn ) {

  /**
   * Attribution popcorn plug-in
   * Adds text to an element on the page.
   * Options parameter will need a mandatory start, end, target.
   * Optional parameters include nameofwork, NameOfWorkUrl, CopyrightHolder, CopyrightHolderUrl, license & licenseUrl.
   * Start is the time that you want this plug-in to execute
   * End is the time that you want this plug-in to stop executing
   * Target is the id of the document element that the text needs to be attached to, this target element must exist on the DOM
   * nameofwork is the title of the attribution
   * NameOfWorkUrl is a url that provides more details about the attribution
   * CopyrightHolder is the name of the person/institution that holds the rights to the attribution
   * CopyrightHolderUrl is the url that provides more details about the copyrightholder
   * license is the type of license that the work is copyrighted under
   * LicenseUrl is the url that provides more details about the ticense type
   * @param {Object} options
   *
   * Example:
     var p = Popcorn('#video')
        .attribution({
          start: 5, // seconds
          end: 15, // seconds
          target: 'attributiondiv'
        } )
   *
   */
  Popcorn.plugin( "attribution" , (function() {

    var
    common = "data:image/png;base64,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",
    licenses = {
      "cc-by": common + "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",
      "cc-by-sa": common + "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",
      "cc-by-nd": common + "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",
      "cc-by-nc": common + "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",
      "cc-by-nc-sa": common + "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",
      "cc-by-nc-nd": common + "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"
    },
    target;

    return {

      _setup: function( options ) {

        var attrib = "",
        license = options.license && licenses[ options.license.toLowerCase() ],
        tar = "target=_blank";

        // make a div to put the information into
        options._container = document.createElement( "div" );
        options._container.style.display = "none";

        // Cache declared target
        target = document.getElementById( options.target );

        if ( options.nameofworkurl ) {
          attrib += "<a href='" + options.nameofworkurl + "' " + tar + ">";
        }
        if ( options.nameofwork ) {
          attrib += options.nameofwork;
        }
        if ( options.nameofworkurl ) {
          attrib += "</a>";
        }
        if ( options.copyrightholderurl ) {
          attrib += "<a href='" + options.copyrightholderurl + "' " + tar + ">";
        }
        if ( options.copyrightholder ) {
          attrib += ", " + options.copyrightholder;
        }
        if ( options.copyrightholderurl ) {
          attrib += "</a>";
        }

        //if the user did not specify any parameters just pull the text from the tag
        if ( attrib === "" ) {
          attrib = options.text;
        }

        if ( options.license ) {
          if ( license ) {
            if ( options.licenseurl ) {
              attrib = "<a href='" + options.licenseurl + "' " + tar + "><img src='"+ license +"' border='0'/></a> " + attrib;
            } else {
              attrib = "<img src='"+ license +"' />" + attrib;
            }
          } else {
            attrib += ", license: ";

            if ( options.licenseurl ) {
              attrib += "<a href='" + options.licenseurl + "' " + tar + ">" + options.license + "</a> ";
            } else {
              attrib += options.license;
            }
          }
        } else if ( options.licenseurl ) {
          attrib += ", <a href='" + options.licenseurl + "' " + tar + ">license</a> ";
        }

        options._container.innerHTML  = attrib;
        target && target.appendChild( options._container );

        options.toString = function() {
          return options.nameofwork || options.license || options.copyrightholder || "Attribution";
        }
      },
      /**
       * @member attribution
       * The start function will be executed when the currentTime
       * of the video  reaches the start time provided by the
       * options variable
       */
      start: function( event, options ) {
        options._container.style.display = "inline";
      },
      /**
       * @member attribution
       * The end function will be executed when the currentTime
       * of the video  reaches the end time provided by the
       * options variable
       */
      end: function( event, options ) {
        options._container.style.display = "none";
      },
      _teardown: function( options ) {

        // Cache declared target
        target = document.getElementById( options.target );

        target && target.removeChild( options._container );
      }
    };
  })(),
  {
    about:{
      name: "Popcorn Attribution Plugin",
      version: "0.2",
      author: "@rwaldron",
      website: "github.com/rwldrn"
    },
    options:{
      start: {
       elem: "input",
       type: "number",
       label: "Start"
      },
      end: {
        elem: "input",
        type: "number",
        label: "End"
      },
      nameofwork: {
        elem: "input",
        type: "text",
        label: "Name of Work"
      },
      nameofworkurl: {
        elem: "input",
        type: "url",
        label: "URL of Work",
        optional: true
      },
      copyrightholder: {
        elem: "input",
        type: "text",
        label: "Copyright Holder"
      },
      copyrightholderurl: {
        elem: "input",
        type: "url",
        label: "Copyright Holder URL",
        optional: true
      },
      license: {
        elem: "input",
        type: "text",
        label: "License Type"
       },
      licenseurl: {
        elem: "input",
        type: "text",
        label: "License URL",
        optional: true
      },
      target: "attribution-container"
    }
  });
})( Popcorn );
