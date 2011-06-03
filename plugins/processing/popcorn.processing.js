// PLUGIN: Processing
/**
* Processing popcorn plug-in
*/
 
(function (Popcorn) {
/**
* ajax
* Author: Processing.js Community & Benjamin Chalovich (ben1amin)
* Date: 30/03/2011
* Parameters:
*            url <string>: the url you want to fetch string data from 
* returns: void
*/
var ajax = function ajax(url) {
  try{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");
    xhr.send(null);
    // failed request?
    if (xhr.status !== 200 && xhr.status !== 0) { return false; }    // Changed for the processing plug-in
    return xhr.responseText;
  }catch(err){
    return false;
  }
};
 /**
* checkIfProcessingExists
* Author: Benjamin Chalovich (ben1amin)
* Date: 30/03/2011
* Parameters:
*            id <string>: The id you wish to check to see if it is already initialized
* returns: true - A processing sketch is already running with that ID
*          false - That sketch is not already running
*/
var checkIfProcessingExists = function(id){
  //checks to see if the sketch has already been created
  return(typeof(Processing.instanceIds[id])!='undefined'); 
}
 /**
 * Authors note: This should be added to the Processing library
* addProcessingInstance: adds a processing instance to the DOM based on a given ID (starts it)
* Author: Processing.js Community & Benjamin Chalovich (ben1amin)
* Date: 30/03/2011
* Parameters:
*            canvasID <string>: the id of the canvas (that has a processing data source defined) that you wish to be initialized 
* returns: void
*/
 var addProcessingInstance = function(canvasID) {
   // Ensures that you do not instantiate more than one processing instance at a time by seeing if it already exists
  if(!checkIfProcessingExists(canvasID)){
    var canvas = document.getElementById(canvasID);
    // datasrc and data-src are deprecated.
    var processingSource = canvas.getAttribute('data-processing-sources');
    if (processingSource === null) {
      // Temporary fallback for datasrc and data-src
      processingSource = canvas.getAttribute('data-src');
      if (processingSource === null) {
        processingSource = canvas.getAttribute('datasrc');
      }
    }
    if (processingSource) {
      var filenames = processingSource.split(' ');
      var code = "";
      for (var j = 0, fl = filenames.length; j < fl; j++) {
        if (filenames[j]) {
          var block = ajax(filenames[j]);
          if (block !== false) {
            code += ";\n" + block;
          }
        }
      }
      if(code!=""){
        Processing.addInstance(new Processing(canvas, code));
      }else{
        Processing.addInstance(new Processing(canvas, processingSource));
      }
    }
  }else{
    // purposefully void - A processing instance with the given id already exists
  }
};
 /**
 * Authors note: This should be added to the Popcorn library
* loadScript: adds a script to the DOM via. adding a <script> tag and runs extra functionality upon load.
* Author: Benjamin Chalovich (ben1amin)
* Date: 30/03/2011
* Parameters:
*            url <string>: The location of the script you are loading
*            onLoadFunction <function>: the function you want to run after the script has been loaded
* returns: void
*/
function loadScript(url,onLoadFunction){
  // check to make sure the function variable is a proper function
  if(typeof(onLoadFunction) == 'function'){
    if(typeof(url) == 'string'){
      // if they have not started to load this particular library before
      if(!document.getElementById(url+'_Lib')){
        var head = document.head || document.getElementsByTagName( "head" )[0] || document.documentumentElement,
          script = document.createElement( "script" );

        script.src = url;    // specify the target of the scripts source
        script.async = true; // let it load asynchronously
        script.id = url+'_Lib'; // just so we can identify it
        //  Insert script into the <head> tag at first position
        head.insertBefore( script, head.firstChild );
        
        //add our listener
        script.addEventListener("load", onLoadFunction, false);
      //otherwise they are already trying to load it
      }else{
        // get the instance of the script that is being loaded
        var script = document.getElementById(url+'_Lib');
        // hook a new on load event to it
        script.addEventListener("load", onLoadFunction, false);
      }
    }else{
      // you did not pass in a string
      throw("loadScript ERROR: a string was not passed in to be the source of the script");
    }
  }else{
    // you did not pass in a function
    throw("loadScript ERROR: a function was not passed in to be triggered when the script was loaded");
  }
}

 /**
* pause: pauses/unpauses a processing sketch of the given ID
* Author: Benjamin Chalovich (ben1amin)
* Date: 30/03/2011
* Parameters:
*            instanceID <string>: The id of the processing instance you wish to control
*            on <boolean>: True:
* returns: void
*/
// Switches the processing drawings animation state
var pause =function(instanceID, on) {
  // Get the sketches instance
  processingInstance = Processing.getInstanceById(instanceID);
  // if you want to turn the sketch on
  // If the chose to not pause then it starts the sketch again
  if (!on) { // Bugfix - added '!' since pause(true) should pause the animation
    processingInstance.loop();   
  // Stops the sketch
  } else {
    processingInstance.noLoop();
  }
}

 /**
* callSketchFunction: calls a function that is defined within a processing sketch
* Author: Benjamin Chalovich (ben1amin)
* Date: 30/03/2011
* Parameters:
*            instanceID <string>: The id of the processing instance you wish to control
*            funcID <String>: Name of the function located within the sketch
*                             ie. if you have a function defined as 'something(){ // some functionality }' 
*                                 in your processing code you would pass in 'something'.
* returns: void
*/
var callSketchFunction =function(instanceID, funcID){
  processingInstance = Processing.getInstanceById(instanceID);
  
  if(typeof processingInstance[funcID] == 'function') { 
    processingInstance[funcID](); 
  }else{
    throw('popcorn.processing plug-in parameter error: Function \"' + funcID + '" in sketch \"' + instanceID + '\" does not exist');
  }
}

Popcorn.plugin( "processing" , {

manifest: {
  about:{
    name: "Popcorn processing Plugin",
    version: "1.0",
    author: "@ben1amin",
    website: "ben1amin.wordpress.org"
  },
  options:{
    // When you want the animation to pause / call the function given
    start : {elem:'input', type:'text', label:'In'},
    
    // When you want the animation to resume (only nessisary if you are pausing it
    end : {elem:'input', type:'text', label:'Out'},
    
    // Control type
    // ===========================================
    // pause        pauses and resumes the sketch
    // function     calls a function at a given time
    control : {elem:'input', type:'text', label:'Control'},
    
    // Target represents the canvas id that has the animation
    target : {elem:'input', type:'text', label:'Target'},
    
    // target represents the sketch source code (.pde .pjs) or raw sketch data in a string
    sketch : {elem:'input', type:'text', label:'Sketch'},
    
    //function to call if they wish
    func : {elem:'input', type:'text', label:'Function'}
  }
},
/**
* @member processing
* _setup will be called when the plugin is initialized
* This checks the inputs and 
* options variable.
* This startes the animation provided.
*/
_setup: function(options) {
  // Pause our video first in case we don't have processing loaded
  if ( !( "Processing" in window ) ) {
    this.pause();
  }
  // gets the id of the video tag which is used to play the video
  // this is used when we need to play it after the library has been loaded
  var videoID = this.video.localName;
  
  // Our Validations for input
  if(!(options.control == 'function' || options.control == 'pause')){
    throw("popcorn.processing plug-in ERROR: un-recognized control type \"" + options.control + "\" must be \"pause\" or \"function\"");
  }
  if(options.control == 'pause' && options.start >= options.end){
    throw("popcorn.processing plug-in ERROR: invalid start and end pause timings \"" + options.start + "\" must be less than \"" + options.end + "\"");
  }
  // if we are merely running a function we do not need to pass in end but in order to
  // run it using the plug-in framework we need to assign it a value so we will make 
  // it minimally valid
  if(options.control == 'function'){
    options.end = options.start+1;
  }
  //check to see if the canvas specified is there
  if(!document.getElementById(options.target)){
    throw("popcorn.processing plug-in ERROR: Target \"" + options.target + "\" does not exist.");
  // if it is there
  }else{
    //The Target
    var parentTarget = document.getElementById(options.target);
    // should look like this: <canvas id="processing-canvas2" datasrc="test2.pjs" width="100" height="100"></canvas>
    // Check to see if the target is a div or if it already is a canvas - just for flexability
    if(parentTarget.nodeType == 1){
      var idName = ""; // the id of our canvas
      //if it is a canvas
      if(parentTarget.tagName=="CANVAS"){
        // the id is the target
        idName = options.target;
      //if it is a div
      }else if(parentTarget.tagName=="DIV"){
        // if the instance is already initialized we do not neet to add another canvas
        // our canvas id will be the same as the sketch
        var idName = options.target+"Sketch"; 
        // Create the canvas tag
        // if it hasn't already been built
        if(!document.getElementById(idName)){
          var newCanvas = document.createElement('canvas'); // <canvas
          newCanvas.setAttribute('id',idName);              // id='options.target'
          newCanvas.setAttribute('datasrc',options.sketch); // datasrc='options.target'>
          parentTarget.appendChild(newCanvas);              // add it to the div supplied 
        }
      }else{
        throw("popcorn.processing plug-in ERROR: Target \"" + options.target + "\" is not of a compatible type. it is a " + parentTarget.tagName);
      }
      // Check for processing and add the instance if you need it
      if("Processing" in window){
        // Just initialize our sketch
        addProcessingInstance(idName);
        //otherwise
      }else{
        // When the processing library has been loaded
        var loadFunction = function(){ 
          addProcessingInstance(idName);           // add our instance to the window
          Popcorn.getInstanceById(videoID).play(); // resume playback of the video
        }
        // the location of the processing libarary externally
        var url = "http://processingjs.org/content/download/processing-js-1.0.0/processing-1.0.0.min.js";
        loadScript(url,loadFunction)
      } // end load instances
    }
  }
},
/**
* @member processing
* The start function will be executed when the currentTime
* of the video reaches the start time provided by the
* options variable.
* This startes the animation provided.
*/
start: function(event, options){
  //Pause the video
  var parentTarget = document.getElementById(options.target);
  if(parentTarget.nodeType == 1){
    if(parentTarget.tagName=="CANVAS"){
      if(options.control == 'pause'){
        pause(options.target, true);
      }else if(options.control == 'function'){
        callSketchFunction(options.target, options.func);
      }
    }else if(parentTarget.tagName=="DIV"){
      if(options.control == 'pause'){
        pause(options.target+"Sketch", true);
      }else if(options.control == 'function'){
        callSketchFunction(options.target+"Sketch", options.func);
      }
    }
  }
},
/**
* @member processing
* The end function will be executed when the currentTime
* of the video reaches the end time provided by the
* options variable.
* This freezes the animation provided.
*/
end: function(event, options){
  if(options.control == 'pause'){
    var parentTarget = document.getElementById(options.target);
    if(parentTarget.nodeType == 1){
      if(parentTarget.tagName=="CANVAS"){
        pause(options.target, false);
      }else if(parentTarget.tagName=="DIV"){
        pause(options.target+"Sketch", false); // must be same id as is built in _start if DIV
      }
    }
  }
}

});
})( Popcorn );