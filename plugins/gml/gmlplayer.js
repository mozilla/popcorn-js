var _stroke = 0; // current stroke
var onPt = 0; // current point on stroke
var onStroke = 0; // current point on stroke
var start = +(new Date());
var x, y, rotation = false;
var strokes=0;
var data = {};
var toggle = 0;
var ready = false;
var play = function(){};
var dur = 0;
var options = {};
var video = document.getElementById("video");

// empty on purpose
void setup() {}
void draw() {

  play();
}

void construct( data, options ) {

  size(640,640);
  frameRate(60);
  smooth();
  reset();
  noLoop();

  dur = (options.end - options.start);
  drawingDur = (options.endDrawing - options.start);

  this.options = options;

  var si = setInterval(function() {

    if (!data) return;
    clearInterval(si);

    this.data = data;
    strokes = this.data.gml.tag.drawing.stroke;
    var tag = this.data.gml.tag;
    var app_name = tag.header && tag.header.client && tag.header.client.name;
    rotation = app_name == 'Graffiti Analysis 2.0: DustTag' ||
               app_name == 'DustTag: Graffiti Analysis 2.0' ||
               app_name == 'Fat Tag - Katsu Edition';


    play = function() {

      if ( video.currentTime < options.endDrawing ) {
        seek( ( video.currentTime - options.start ) / dur * strokes.pt.length );
      }

    };
  }, 50);
}


void reset() {
  background( 0 );
  onPt = onStroke = 0;
  x = y = null;
}

function drawLine(x,y,x2,y2) {
    _x = rotation ? y*height : x*width;
    _y = rotation ? width-(x*width) : y*height;
    _x2 = rotation ? y2 * height : x2*width;
    _y2 = rotation ? width - (x2 * width) : y2*height;
    stroke(0);
    strokeWeight(13);
    strokeCap(SQUARE);
    line(_x,_y,_x2,_y2);
    stroke(255);
    strokeWeight(12);
    strokeCap(ROUND);
    line(_x,_y,_x2,_y2);
    //ol = { x: _x, y: _y, x2: _x2, y2: _y2 };
}

function seek( point ) {
    if ( point < onPt ) reset();

    var start; var hyp;
    while (onPt <= point) {
        if (!strokes) return;
        _stroke = strokes.length ? strokes[onStroke] : strokes;
        pt = _stroke.pt[onPt];
        var p = onPt;
        if (x !== null ) drawLine(x,y,pt.x,pt.y);
        /*if (onPt) {
if (++onPt >= _stroke.pt.length) {
//if (!strokes.length || ++onStroke >= strokes.length) return reset();
//onPt = 0;
}
}*/
        x = pt.x;
        y = pt.y;
        if (onPt==p) onPt++; //went back to 0
    }
}

