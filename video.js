$(function() {
        $("video").each(function() {
                if (lang=window.location.search.substring(1)) {
                        var ret=true;
                        $("select option").each(function() {
                                if ($(this).attr("val") == lang) { $(this).attr("selected",true); ret=false; }
                        });
                        if (!ret) {
                                $("subtitle").each(function() {
                                        var sub = $(this);
                                        google.language.translate($(this).html(),"en",lang, function(r) { 
                                               sub.html(r.translation);
                                        });
                                });
                        }
                }

                $("#language").change(function() { window.location="?" + $("#language option:selected").attr("val"); });
        });	
});

var lt = 0;
function update(vid) {
        var has_sub=false,
        t = vid.currentTime; 
        if (lt>t) $("#sub span").fadeTo(1,.3);
        $("subtitle").each(function() {
                var from = to_secs($(this).attr("from")),
                to = to_secs($(this).attr("to"));
                $(this).removeClass("good");
                if (from<t&&to>t) { 
                        has_sub=true; 
                        $(this).addClass("good");
                }
        });
        if (!has_sub) { 
               if (!$("#sub").hasClass("fading"))
                    $("#sub").addClass("fading").stop().animate({ opacity:0, top:"-=30px" }, "medium", "swing");
        } else {
               if ($("#sub").hasClass("fading"))
                    $("#sub").removeClass("fading").stop().animate({opacity:1,top:"410px"},1).html('');       
        }
        $("subtitle.good:last").each(function() { 
                if (!$(this).hasClass("on")) {
                       $("subtitle.on").removeClass("on");
                       $(this).addClass("on");
                       $("#sub").html('').hide();
                       var letters = $(this).text().split('');
                       $.each(letters,function(i, val) {
                                $("#sub").append('<span>' + val + '</span>');
                       });
                       $("#sub span").stop().fadeTo(1,.3, function() { $(this).show(); });
                }
                var from = to_secs($(this).attr("from")),
                to = to_secs($(this).attr("to")),
                perc = ((t-from)/(to-from)),
                num_letters = $(this).text().length*perc,
                i = 0;
                $("#sub span").each(function() { 
                        if (i++>num_letters) return;
                        $(this).stop().fadeTo("fast",1);
                }).parent().show();
        });
        lt = t;
}

function to_secs(time) {
	var t = time.split(":");
	return parseInt(t[0]*60,10) + parseInt(t[1],10);
}

