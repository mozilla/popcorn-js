// PLUGIN: Mustache

(function (Popcorn) {

  // TODO: swap to getScript()
  (function() {
    var mustacheUrl = 'https://github.com/janl/mustache.js/raw/master/mustache.js';

    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = mustacheUrl;
    head.insertBefore( script, head.firstChild );
  })();

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

  Popcorn.plugin( 'mustache' , function() {

      function get( name, options ) {
        return options._instance[name];
      }

      function set( name, options, value ) {
        options._instance[name] = value;
      }

      return {
        manifest: {
          about: {
            name: 'Popcorn Mustache Plugin',
            version: '0.1',
            author: 'David Humphrey (@humphd)',
            website: 'http://vocamus.net/dave'
          },
          options: {
            start: {elem:'input', type:'text', label:'In'},
            end: {elem:'input', type:'text', label:'Out'},
            target: 'mustache-container',
            template: {elem:'input', type:'text', label:'Template'},
            data: {elem:'input', type:'text', label:'Data'},
            /* TODO: how to show a checkbox/boolean? */
            dynamic: {elem:'input', type:'text', label:'Dynamic'}
          }
        },

        _setup : function( options ) {
          options._instance = { getData: null,
                                data: null,
                                getTemplate: null,
                                template: null };

          var shouldReload = !!options.dynamic,
              typeOfTemplate = typeof options.template,
              typeOfData = typeof options.data;

          if ( typeOfTemplate === 'function' ) {
            if ( !shouldReload ) {
              set( 'template', options, options.template( options ) );
            } else {
              set( 'getTemplate', options, options.template );
            }
          } else if ( typeOfTemplate === 'string' ) {
            set( 'template', options, options.template );
          } else {
            throw 'Mustache Plugin Error: options.template must be a String or a Function.';
          }

          if ( typeOfData === 'function' ) {
            if ( !shouldReload ) {
              set( 'data', options, options.data(options) );
            } else {
              set( 'getData', options, options.data );
            }
          } else if ( typeOfData === 'string' ) {
            set( 'data', options, JSON.parse( options.data ) );
          } else if ( typeOfData === 'object' ) {
            set( 'data', options, options.data );
          } else {
            throw 'Mustache Plugin Error: options.data must be a String, Object, or Function.';
          }
        },

        start: function( event, options ) {
          // if dynamic, freshen json data on every call to start, just in case.
          if ( get('getData', options) ) {
            set( 'data', options, get( 'getData', options )( options ) );
          }

          if ( get( 'getTemplate', options ) ) {
            set( 'template', options, get( 'getTemplate', options )( options ) );
          }

          var html = Mustache.to_html( get( 'template', options ),
                                       get( 'data', options )
                                     ).replace( /^\s*/mg, '' );
          document.getElementById( options.target ).innerHTML = html;
        },

        end: function( event, options ) {
          document.getElementById( options.target ).innerHTML = '';
        }

      };

    });

})( Popcorn );
