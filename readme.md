PopcornJS
=============
The HTML5 <video> framework

Demos
------------
* Original Mozilla Summit Demo: <http://popcornjs.org/demos/semantic_video>
* Brendan Eich Demo: <http://popcornjs.org/demos/brendan_eich> (made with butter)

Overview
-------------
Popcorn.js is an event system for < video >, with strong syntactic sugar for chaining < video > methods and adding events to the timeline.

Popcorn is a JavaScript Function that wraps the native < video > element and returns a Popcorn object which;

1. maintains a reference to the original HTMLVideoElement
2. provides a normalized interface to the < video > elements native methods and properties.
3. adds a special data property which contains meta data about the <video> (this is where the magic happens)

By normalizing the native methods, the framework allows developers to write chainable function executions off the returned Popcorn object.

API
-------------
We have begun API documentation here: https://gist.github.com/729213#file_popcorn_api.js

Plugin Factory
-------------
Popcorn also offers a plugin factory. Popcorn plugins are a way for developers to wrap functionality that responds to a point in a video.

Roadmap
-------------
We are working on the 0.3 & 1.0 Roadmaps at http://etherpad.mozilla.com:9000/popcornjs

Changelog
-------------
A changelog can be found here: https://webmademovies.lighthouseapp.com/projects/63272/changelog