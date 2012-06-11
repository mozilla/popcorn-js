// PLUGIN: Mustache

(function ( Popcorn ) {

  /**
   * Mustache Popcorn Plug-in
   *
   * Adds the ability to render JSON using templates via the Mustache templating library.
   *
   * @param {Object} options
   *
   * Required parameters: start, end, template, data, and target.
   * Optional parameter: static.
   *
   *   start: the time in seconds when the mustache template should be rendered
   *          in the target div.
   *
   *   end: the time in seconds when the rendered mustache template should be
   *        removed from the target div.
   *
   *   target: a String -- the target div's id.
   *
   *   template: the mustache template for the plugin to use when rendering.  This can be
   *             a String containing the template, or a Function that returns the template's
   *             String.
   *
   *   data: the data to be rendered using the mustache template.  This can be a JSON String,
   *         a JavaScript Object literal, or a Function returning a String or Literal.
   *
   *   dynamic: an optional argument indicating that the template and json data are dynamic
   *            and need to be loaded dynamically on every use.  Defaults to True.
   *
   * Example:
     var p = Popcorn('#video')

        // Example using template and JSON strings.
        .mustache({
          start: 5, // seconds
          end:  15,  // seconds
          target: 'mustache',
          template: '<h1>{{header}}</h1>'                         +
                    '{{#bug}}'                                    +
                    '{{/bug}}'                                    +
                    ''                                            +
                    '{{#items}}'                                  +
                    '  {{#first}}'                                +
                    '    <li><strong>{{name}}</strong></li>'      +
                    '  {{/first}}'                                +
                    '  {{#link}}'                                 +
                    '    <li><a href="{{url}}">{{name}}</a></li>' +
                    '  {{/link}}'                                 +
                    '{{/items}}'                                  +
                    ''                                            +
                    '{{#empty}}'                                  +
                    '  <p>The list is empty.</p>'                 +
                    '{{/empty}}'                                  ,

          data:     '{'                                                        +
                    '  "header": "Colors", '                                   +
                    '  "items": [ '                                            +
                    '      {"name": "red", "first": true, "url": "#Red"}, '    +
                    '      {"name": "green", "link": true, "url": "#Green"}, ' +
                    '      {"name": "blue", "link": true, "url": "#Blue"} '    +
                    '  ],'                                                     +
                    '  'empty': false'                                         +
                    '}',
          dynamic: false // The json is not going to change, load it early.
        } )

        // Example showing Functions instead of Strings.
        .mustache({
          start: 20,  // seconds
          end:   25,  // seconds
          target: 'mustache',
          template: function(instance, options) {
                      var template = // load your template file here...
                      return template;
                    },
          data:     function(instance, options) {
                      var json = // load your json here...
                      return json;
                    }
        } );
  *
  */

  Popcorn.plugin( "mustache" , function( options ){

    var getData, data, getTemplate, template;

    Popcorn.getScript( "http://mustache.github.com/extras/mustache.js" );

    var shouldReload = !!options.dynamic,
        typeOfTemplate = typeof options.template,
        typeOfData = typeof options.data,
        target = document.getElementById( options.target );

    options.container = target || document.createElement( "div" );

    if ( typeOfTemplate === "function" ) {
      if ( !shouldReload ) {
        template = options.template( options );
      } else {
        getTemplate = options.template;
      }
    } else if ( typeOfTemplate === "string" ) {
      template = options.template;
    } else {
      template = "";
    }

    if ( typeOfData === "function" ) {
      if ( !shouldReload ) {
        data = options.data( options );
      } else {
        getData = options.data;
      }
    } else if ( typeOfData === "string" ) {
      data = JSON.parse( options.data );
    } else if ( typeOfData === "object" ) {
      data = options.data;
    } else {
      data = "";
    }

    return {
      start: function( event, options ) {

        var interval = function() {

          if( !window.Mustache ) {
            setTimeout( function() {
              interval();
            }, 10 );
          } else {

            // if dynamic, freshen json data on every call to start, just in case.
            if ( getData ) {
              data = getData( options );
            }

            if ( getTemplate ) {
              template = getTemplate( options );
            }

            var html = Mustache.to_html( template,
                                         data
                                       ).replace( /^\s*/mg, "" );
            options.container.innerHTML = html;
          }
        };

        interval();

      },

      end: function( event, options ) {
        options.container.innerHTML = "";
      },
      _teardown: function( options ) {
        getData = data = getTemplate = template = null;
      }
    };
  },
  {
    about: {
      name: "Popcorn Mustache Plugin",
      version: "0.1",
      author: "David Humphrey (@humphd)",
      website: "http://vocamus.net/dave"
    },
    options: {
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
      target: "mustache-container",
      template: {
        elem: "input",
        type: "text",
        label: "Template"
      },
      data: {
        elem: "input",
        type: "text",
        label: "Data"
      },
      dynamic: {
        elem: "input",
        type: "checkbox",
        label: "Dynamic",
        "default": true
      }
    }
  });
})( Popcorn );
