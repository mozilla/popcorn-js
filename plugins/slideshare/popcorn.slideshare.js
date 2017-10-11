// PLUGIN: SlideShare
(function (Popcorn) {

	  /**
	   * SlideShare popcorn plug-in
	   * Appends a SlideShare slides to an element on the page.
	   * Required parameters: start, end, target.
	   * Optional parameters: slideshowurl, startslide, height, width and border
	   * Start: the time that you want this plug-in to execute (in seconds)
	   * End: the time that you want this plug-in to stop executing (in seconds)
	   * Slideshowurl: the url of slides in SlideShare you wish to show
	   * Startslide: the slide number to start the slide show
	   * Target: the id of the document element that the slides are appended to, this target element must exist on the DOM	  
	   * Height: the height of the slide, defaults to '362px'
	   * Width: the width of the image, defaults to '433px' 
	   * Border: border size in pixels around slide, defaults to '0px'
	   *
	   * @param {Object} options
	   *
	   * Example:
	     var p = Popcorn('#video')
	        .slideshare({
	           start:         1,               // seconds, mandatory
	           end:           5,               // seconds, mandatory
	           startslide     1,               // optional
	           slideshowurl   '8',             // optional
	           height:        '362px',         // optional
	           width:         '433px',         // optional	          
	           border:        '0px',           // optional
	           target:        'slidesharediv'  // mandatory
	        } )
	   *
	   */
  var i = 0;
  Popcorn.plugin("slideshare", function (options) {
    
    var
    slide_container,
    _target,
    _startslide = options.startslide || 1,
      _height = options.height || "362px",
      _width = options.width || "433px",     
      _border = options.border || "0px",
      _slideshowurl = options.slideshowurl || "http://www.slideshare.net/storycode/storycode-immersion-5-popcornjs-deep-dive";

    slide_container = document.createElement("div");
    slide_container.id = "slideshare" + i;
    slide_container.style.width = "100%";
    slide_container.style.height = "100%";
    slide_container.style.display = "none";
    i++;
    var getSlideshow = function () {
      slideshare_api_url = "http://www.slideshare.net/api/oembed/2";
      _url = slideshare_api_url + "?url=" + _slideshowurl + "&format=jsonp";
      Popcorn.xhr({
        url: _url,
        type: "GET",
        dataType: 'jsonp',
        success: function (data) {
          href = data.html;
          src_pos_start = href.indexOf("src");
          src_pos_end = href.indexOf("width");
          str_to_replace = href.substring(src_pos_start, src_pos_end - 2);
          new_href = href.replace(str_to_replace, str_to_replace + '?startSlide=' + _startslide + '"');
          slide_container.innerHTML = new_href;
          _target.appendChild(slide_container);
        }
      });
    };

    if (options.target) {
      _target = document.getElementById(options.target);
      getSlideshow();
    } else {
      //create a div to hold slideshow
      options.container = document.createElement("div");
      options.container.setAttribute("id", "slideshare-container");
      options.container.style.width = _width;
      options.container.style.height = _height;
      options.container.style.display = "none";
      _target = options.container;
      getSlideshow();
    }

    return {
      start: function (event, options) {
        slide_container.style.display = "inline";
      },

      end: function (event, options) {
        slide_container.style.display = "none";
      },
      _teardown: function (options) {
        document.getElementById(options.target) && document.getElementById(options.target).removeChild(slide_container);
      }
    };
  },

  {
    about: {
      name: "Popcorn SlideShare Plugin",
      version: "0.1",
      author: "dosu",
      website: "http://jsdemo101.wordpress.com/"
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
      target: "slideshare-container",
      height: {
        elem: "input",
        type: "text",
        label: "Height",
        "default": "362px",
        optional: true
      },
      width: {
        elem: "input",
        type: "text",
        label: "Width",
        "default": "433px",
        optional: true
      },
      border: {
        elem: "input",
        type: "text",
        label: "Border",
        "default": "5px",
        optional: true
      },
      slideshowurl: {
        elem: "input",
        type: "text",
        "default": "http://www.slideshare.net/storycode/storycode-immersion-5-popcornjs-deep-dive",
        label: "Slides url on slideshare site",
        optional: true
      },
      startslide: {
        elem: "input",
        type: "number",
        "default": 1,
        label: "Start Number of Slides",
        optional: true        	
      }
    }
  });
})(Popcorn);