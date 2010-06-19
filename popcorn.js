(function() {

  // The video manager manages a single video element, and all it's commands.
  var VideoManager = this.VideoManager = function(videoElement) {
    this.commandObjects = {};
    this.videoElement = videoElement;
    videoElement.videoManager = this;
    VideoManager.addInstance(this);
    videoElement.setAttribute("ontimeupdate", "VideoManager.update(this, this.videoManager);"); 
  };
  VideoManager.prototype.addCommand = function(command) {
    this.commandObjects[command.id] = command;
  };
  VideoManager.prototype.removeCommand = function(command) {
    delete this.commandObjects[command.id];
  };
  // Update is called on the video every time it's time changes.
  VideoManager.update = function(vid, manager) {
    var t = vid.currentTime;
    // Loops through all commands in the manager, preloading data, and calling in() or out().
    var commandObject = {};
    for (var i in manager.commandObjects) {
      commandObject = manager.commandObjects[i];
      if (commandObject.running && (commandObject.params.in > t || commandObject.params.out < t)) {
        commandObject.running = false;
        commandObject.out();
      }
    }
    for (var i in manager.commandObjects) {
      commandObject = manager.commandObjects[i];
      if (!commandObject.loaded && (commandObject.params.in-5) < t && commandObject.params.out > t) {
        commandObject.loaded = true;
        commandObject.preload();
      }
      if (!commandObject.running && commandObject.params.in < t && commandObject.params.out > t) {
        commandObject.running = true;
        commandObject.in();
      }
    }
  };

  // Store VideoManager instances
  VideoManager.instances = [];
  VideoManager.instanceIds = {};
  VideoManager.addInstance = function(manager) {
    if (typeof manager.videoElement.id === 'undefined' || !manager.videoElement.id.length) {
      manager.videoElement.id = "__video" + VideoManager.instances.length;
    }
    VideoManager.instanceIds[manager.videoElement.id] = VideoManager.instances.length;
    VideoManager.instances.push(manager);
  };
  VideoManager.getInstanceById = function(name) {
    return VideoManager.instances[VideoManager.instanceIds[name]];
  };
  VideoManager.getInstance = function(index) {
    return VideoManager.instances[index];
  };

  // Simple function to convert 0:05 to 0.5 in seconds
  var to_secs = function(time) {
    var t = time.split(":");
    return parseInt(t[0] * 60, 10) + parseInt(t[1], 10);
  };

  ////////////////////////////////////////////////////////////////////////////
  // Command objects
  ///////////////////////////////////////////////////////////////////////////

  // Base class for all commands, SubtitleCommand, MapCommand, etc.
  var VideoCommand = function(name, params, text) {
    this.params = {};
    this.text = text;
    this.running = false;
    this.loaded = false;
    this.in = function() {};
    this.out = function() {};
    this.preload = function() {};
    this.id = name + VideoCommand.count++;
    for (var i = 0, pl = params.length; i < pl; i++) {
      for (var j = 0, nl = params[i].length; j < nl; j++) {
        var key = params[i].item(j).nodeName,
            data = params[i].item(j).nodeValue;
        if (key === "in" || key === "out") {
          this.params[key] = to_secs(data);
        } else {
          this.params[key] = data;
        }
      }
    }
  };
  VideoCommand.count = 0;

  // Child commands. Uses in() and out() to do time based operations
  var SubtitleCommand = function(name, params, text) {
    VideoCommand.call(this, name, params, text);
    this.in = function() {
      document.getElementById("sub").innerHTML  = this.text;
    };
    this.out = function() {
      document.getElementById("sub").innerHTML  = "";
    };
  };

  var TagCommand = function(name, params, text) {
    VideoCommand.call(this, name, params, text);
    this.in = function() {
      TagCommand.people.contains[this.text] = this.text;
      document.getElementById("inthisvideo").innerHTML  = TagCommand.people.toString();
    };
    this.out = function() {
      delete TagCommand.people.contains[this.text];
      document.getElementById("inthisvideo").innerHTML  = TagCommand.people.toString();
    };
  };
  TagCommand.people = {
    contains: {},
    toString: function() {
      var r = [];
      for (var i in this.contains) {
        r.push(" " + this.contains[i]);
      }
      return r.toString();
    }
  };

  var MapCommand = function(name, params, text) {
    VideoCommand.call(this, name, params, text);
    this.params.zoom = parseInt(this.params.zoom);
    // load the map
    // http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions  <-- Map API
    this.location = new google.maps.LatLng(this.params.lat, this.params.long);
    if (!MapCommand.map) {
      MapCommand.map = new google.maps.Map(document.getElementById(this.params.target), {mapTypeId: google.maps.MapTypeId.HYBRID});
      MapCommand.map.setCenter(new google.maps.LatLng(0, 0))
      MapCommand.map.setZoom(0);
    }
    this.in = function() {
      MapCommand.map.setCenter(this.location);
      MapCommand.map.setZoom(this.params.zoom);
    };
    this.out = function() {
      MapCommand.map.setCenter(new google.maps.LatLng(0, 0))
      MapCommand.map.setZoom(0);
    };
  };

  var TwitterCommand = function(name, params, text) {
    VideoCommand.call(this, name, params, text);
    // Uses JQuery
    var tweets = [];
    $.getJSON("http://search.twitter.com/search.json?rpp=" + this.params.mostrecenttweets + "&callback=?&q=" + this.params.user, function(json) {
      $.each(json.results, function(i, tweet){
        tweets.push(tweet.text);
      });
    });
    this.tweets = tweets;
    this.in = function() {
      document.getElementById(this.params.target).innerHTML = this.tweets[(Math.round((Math.random()*(this.tweets.length-1))))];
    };
    this.out = function() {
      document.getElementById(this.params.target).innerHTML = "";
    };
  }; 
  // http://twitter.com/celinecelines

  // Wrapper for accessing commands by name
  // commands[name].create() returns a new command of type name
  // Not sure if this is the best way; maybe it's too fancy?
  // I liked it more than a switch, though
  var commands = {
    subtitle: {
      create: function(name, params, text) {
        return new SubtitleCommand(name, params, text);
      }
    },
    tagThisVideo: {
      create: function(name, params, text) {
        return new TagCommand(name, params, text);
      }
    },
    location: {
      create: function(name, params, text) {
        return new MapCommand(name, params, text);
      }
    },
    tweet: {
      create: function(name, params, text) {
        return new TwitterCommand(name, params, text);
      }
    }
  };

  // Parses xml into command objects and adds them to the video manager
  var parse = function(xmlDoc, videoManager) {
    var parseNode = function(node, attributes) {
      var allAttributes = attributes.slice(0);
      allAttributes.push(node.attributes);
      var childNodes = node.childNodes;
      if (childNodes.length < 1 || (childNodes.length === 1 && childNodes[0].nodeType === 3)) {
        videoManager.addCommand(commands[node.nodeName].create(node.nodeName, allAttributes, node.textContent));
      } else {
        for (var i = 0; i < childNodes.length; i++) {
          childNodes[i].nodeType === 1 && parseNode(childNodes[i], allAttributes);
        }
      }
    };

    for (var j = 0, dl = xmlDoc.length; j < dl; j++) {
      var x = xmlDoc[j].documentElement.childNodes;
      for (var i = 0, xl = x.length; i < xl; i++) {
        x[i].nodeType === 1 && parseNode(x[i], []);
      }
    }
  };

  // Loads an external xml file, and returns the xml object
  var loadXMLDoc = function(name) {
    var xhttp = new XMLHttpRequest();
    if (xhttp) {
      xhttp.open("GET", name, false);
      xhttp.send();
      return xhttp.responseXML;
    } else {
      return false;
    }
  };

  // Automatic Initialization Method
  var init = function() {
    var video = document.getElementsByTagName('video');
    for (var i = 0, l = video.length; i < l; i++) {
      var videoSources = video[i].getAttribute('data-timeline-sources');
      if (videoSources) {
        var filenames = videoSources.split(' ');
        var xml = [];
        for (var j=0, fl=filenames.length; j<fl; j++) {
          if (filenames[j]) {
            xml.push(loadXMLDoc(filenames[j]));
          }
        }
        var manager = new VideoManager(video[i]);
        parse(xml, manager);
      }
    }
  };
  document.addEventListener('DOMContentLoaded', function() {
    init();
  }, false);
  
}());

