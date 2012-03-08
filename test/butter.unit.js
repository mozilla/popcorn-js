$(document).ready(function(){
var video = document.getElementById('video');
var popcorn = new Popcorn('#video');

var pluginResults;
var pluginOptions;
var manifest = {
  about: {name: 'test', version: '0.1', author: 'Bobby Richter', website: 'http://robothaus.org'},
  options: {
    start : {elem:'input', type:'text', label:'In'},
    end : {elem:'input', type:'text', label:'Out'},
    target : 'test-target',
  }
};
var plugin = (Popcorn.plugin('test',{
  manifest: manifest,
  _setup:function(options){pluginOptions = options; pluginResults='_setup';},
  start:function(options){pluginResults='start'},
  end:function(options){pluginResults='end'}
}));
var pluginInstance = popcorn['test']({start: 1, end: 2});

module("Popcorn");
var tests = [
  {
    title: 'Popcorn.registry',
    test: function() {
      ok(Popcorn.registry, 'exists');
    }
  },
  {
    title: 'Popcorn.getTrackEvents',
    test: function() {
      ok(Popcorn.getTrackEvents, 'exists');
    }
  },
  {
    title: 'Popcorn.getTrackEvents(popcorn) returns correct results',
    test: function() {
      expect(2);
      var results = Popcorn.getTrackEvents(popcorn);
      equal(results[0].start, 1, 'start is 1');
      equal(results[0].end, 2, 'end is 2');
    }
  },
  {
    title: 'Popcorn.getTrackEvents exists',
    test: function() {
      ok(Popcorn.getTrackEvents, 'exists');
    }
  },
  {
    title: 'Valid plugins are addressable as p[pluginName]',
    test: function() {
      ok(popcorn['test'], 'popcorn[\'test\'] exists');
    }
  },
  {
    title: 'Invalid plugin names yield undefined using p[invalidName]',
    test: function() {
      ok(popcorn['notValid'] === undefined, 'is undefined');
    }
  },
  {
    title: 'p[validPluginName] is expected plugin',
    test: function() {
      equal(popcorn['test'],plugin['test'], 'popcorn[\'test\'] == plugin[\'test\']');
    }
  },
  {
    title: 'Popcorn.registry must be a list',
    test: function() {
      expect(2);
      ok(Popcorn.registry, 'registry exists');
      equal(typeof(Popcorn.registry), 'object', 'Popcorn.registry is an object');
    }
  },
  {
    title: 'Popcorn.registry must contain plugins',
    test: function() {
      equal(Popcorn.registry[0], plugin, 'Popcorn.registry contains test plugin');
    }
  },
  {
    title: 'plugin.type must exist',
    test: function() {
      ok(plugin.type, 'exists');
    }
  },
  {
    title: 'Plugin instance options._natives must exist',
    test: function() {
      ok(pluginOptions._natives, 'exists');
    }
  },
  {
    title: 'Plugin instance options.target should exist',
    test: function() {
      ok(pluginOptions.target, 'exists');
    }
  },
  {
    title: 'Popcorn.manifest be a list',
    test: function() {
      expect(2);
      ok(Popcorn.manifest, 'Popcorn.manifest exists');
      equal(typeof(Popcorn.manifest), 'object', 'Popcorn.manifest is an object');
    }
  },
  {
    title: 'Popcorn.manifest must contain plugin manifests',
    test: function() {
      equal(Popcorn.manifest['test'], manifest);
    }
  },
  {
    title: 'Plugin manifest must contain options property',
    test: function() {
      ok(Popcorn.manifest['test'].options, 'exists');
    }
  },
  {
    title: 'popcorn.video exists',
    test: function() {
      ok(popcorn.video, 'exists');
    }
  },
  {
    title: 'popcorn.video.currentTime exists',
    test: function() {
      ok(popcorn.video.currentTime !== undefined, 'exists');
    }
  },
  {
    title: 'popcorn.video.play exists',
    test: function() {
      ok(popcorn.video.play, 'exists');
    }
  },
  {
    title: 'popcorn.video.pause exists',
    test: function() {
      ok(popcorn.video.pause, 'exists');
    }
  },
  {
    title: 'popcorn.video.volume exists',
    test: function() {
      ok(popcorn.video.volume, 'exists');
    }
  },
  {
    title: 'popcorn.video.duration exists',
    test: function() {
      ok(popcorn.video.duration !== undefined, 'exists');
    }
  },
  {
    title: 'popcorn.video.readyState exists',
    test: function() {
      ok(popcorn.video.readyState !== undefined, 'exists');
    }
  },
  {
    title: 'popcorn.data exists',
    test: function() {
      ok(popcorn.data, 'exists');
    }
  },
  {
    title: 'popcorn.data.trackEvents exists',
    test: function() {
      ok(popcorn.data.trackEvents, 'exists');
    }
  },
  {
    title: 'popcorn.data.trackEvents.byStart exists',
    test: function() {
      ok(popcorn.data.trackEvents.byStart, 'exists');
    }
  },
  {
    title: 'popcorn.data.history must be a list',
    test: function() {
      expect(2);
      ok(popcorn.data.history, 'history exists');
      equal(typeof(popcorn.data.history), 'object', 'history in an object');
    }
  },
  {
    title: 'popcorn.getLastTrackEventId exists and works',
    test: function() {
      expect(2);
      ok(popcorn.getLastTrackEventId, 'exists');
      ok(popcorn.getLastTrackEventId(), 'works');
    }
  },
  {
    title: 'popcorn.getTrackEvents exists and works',
    test: function() {
      expect(2);
      ok(popcorn.getTrackEvents, 'exists');
      ok(popcorn.getTrackEvents(), 'works');
    }
  },
  {
    title: 'popcorn.getTrackEvents === Popcorn.getTrackEvents(popcorn)',
    test: function() {
      expect(2);
      var tracks1 = popcorn.getTrackEvents();
      var tracks2 = Popcorn.getTrackEvents(popcorn);
      equal(tracks1.length, tracks2.length, 'lengths are equal');
      equal(tracks1[0], tracks2[0], 'objects are equal');
    }
  },
  {
    title: 'popcorn.listen exists && works',
    test: function() {
      expect(2);
      ok(popcorn.listen, 'exists');
      popcorn.listen('ended', function(){});
      for (var i in popcorn.data.events['ended']) {
        ok(popcorn.data.events['ended'][i], 'works');
        break;
      } //for
    }
  },
  {
    title: 'popcorn.removeTrackEvent exists and works',
    test: function() {
      expect(2);
      ok(popcorn.removeTrackEvent, 'exists');
      popcorn.removeTrackEvent(popcorn.getLastTrackEventId());
      equal(popcorn.getTrackEvents().length, 0, 'works');
    }
  },
];

for (var i=0; i<tests.length; ++i) {
  test(tests[i].title, tests[i].test);
} //for
});
