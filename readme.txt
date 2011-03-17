## What is Popcorn.js? ##
An open source JavaScript library which connects and synchronizes the <video> tag to other resources, such as these maps.

* Project page: https://wiki.mozilla.org/PopcornOpenVideoAPI

* Source code on Github: https://github.com/annasob/popcorn-js/

## What does the OpenMap plugin add? ##
You can add clickable markers with custom icons

As an alternative to Google Maps, the OpenMap plugin offers:

* An interactive map using OpenLayers.js - free, open source, and compatible with many mapping formats - http://openlayers.org

* ROADMAP using OpenStreetMap - a free, open data source which is editable by anyone.  Due to its free license, it has received data from many governmental, commercial, and academic sources.  Editors can use Yahoo and Bing Maps to trace information onto the map.  In many parts of the world, OpenStreetMap has better coverage and more up-to-date data than major providers such as Google Maps.  - http://opensteetmap.org

* SATELLITE using NASA Landsat / World Wind - satellite images in the public domain

* TERRAIN using USGS Topographic Maps in the public domain

## Sample code for Popcorn.js ##
popped.openmap({
  start: 0,
  end: 15,
  type: 'ROADMAP', // OpenStreetMap
  target: 'map',
  lat: 43.665429,
  lng: -79.403323,
  zoom: 10
})
.openmap( {
  start: 0,
  end: 30,
  type: 'SATELLITE', // NASA World Wind / LANDSAT
  target: 'map2',
  location: 'Boston, MA',
  zoom: 9,
  markers: [
    {
      lat: 42.358544,
      lng: -71.05957,
      icon: 'http://google-maps-icons.googlecode.com/files/vegetarian.png',
      text: 'Clickable markers',
      size: 10
    }
  ]
});