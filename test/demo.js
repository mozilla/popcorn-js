
// EXAMPLE PLUGIN: SUBTITLER

(function (Popcorn) {
  
  
  
  
  Popcorn.plugin( "subtitler" , function ( options ) {
    
    var subtitles = [], 
        context = this.video, 
        div = document.getElementById("subtitle-container");
        
    
    //  Check for existing frame
    if ( !div ) {
      // if no existing frame, create it.
      div = document.createElement("div");
      div.id  = "subtitle-container";
      
      Popcorn.extend(div.style, {
        //border: "1px solid red",
        width: context.clientWidth + "px", 
        height: context.clientHeight + "px", 
        top: context.offsetTop + "px", 
        left: context.offsetLeft + "px",         
        position: "absolute",
        color:  "white",
        textShadow: "black 2px 2px 6px",
        fontSize: "18px",
        fontWeight: "bold",
        textAlign: "center"
      });
      
      context.parentNode.appendChild(div);
    }
    
    if ( typeof options === "object" && "join" in options ) {
      subtitles = options;
    } else {
      subtitles.push(options);
    }
    
    this.listen("timeupdate", function (event) {
      
      
      Popcorn.forEach(subtitles, function ( subtitle ) {
        
        var temp  = div.querySelectorAll( subtitle.id );
        
        if ( this.currentTime() >= subtitle.start && !temp.length ) {
          div.innerHTML = div.innerHTML + subtitle.html;
        }

        if ( this.currentTime() >= subtitle.end ) {
          
          if ( temp.length ) {
            Popcorn.forEach(temp, function ( title ) {
              title.style.display = "none";
            });
          }
        }
        
      }, this);
    });
  });

})(Popcorn);


// END EXAMPLE


$(function () {

  
  
  var p = Popcorn('#video');
  
  
  p.play();  
  
  
  p.subtitler({
    id: "#subtitle-a", 
    start: 2, // seconds
    end: 5, // seconds
    html: '<p id="subtitle-a">Appear at 2 second mark, dissappear at 5 second mark</p>'
  });
  
  
  
  // Butter would generate the data to populate this api function call's argument
  
  p.subtitler([
    {
      id: "#stays-forever", 
      start: 5,
      html: '<p id="stays-forever">Stays forever!</p>'
    },
    {
      id: "#comes-and-goes-1", 
      start: 10,
      end: 12,
      html: '<p id="comes-and-goes-1">Comes and goes</p>'
    },
    {
      id: "#comes-and-goes-2", 
      start: 12,
      end: 14,
      html: '<p id="comes-and-goes-2">BACK! For the second time...</p>'
    },
    {
      id: "#comes-and-goes-3", 
      start: 14,
      end: 16,
      html: '<p id="comes-and-goes-3">This is the last time. I promise.</p>'
    }
    
  ]);

  


});