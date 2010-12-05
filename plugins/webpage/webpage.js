document.addEventListener('DOMContentLoaded', function () {
 var p = Popcorn('#video');
  
  p.play();  
  
 
  p.webpages({
    id: "webpages-a", 
    start: 2, // seconds
    end: 5, // seconds
    src: 'http://www.webmademovies.org',
    target: 'webpagediv'
  });

}, false);
