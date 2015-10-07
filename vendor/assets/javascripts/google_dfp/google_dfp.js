$(function(){

  var tags = $("div.google-dfp");
  var mobile_visit = false;

  var timeoutid;
  var crazy_visit = false;
  var render_crazy_count = 0;

  if(tags.length == 0)
    return; // nothing to do

  // initialize googletag-variable
  window.googletag = window.googletag || {};
  var googletag = window.googletag;
  googletag.cmd = [];

  // Load script
  $.ajax({
    dataType: "script",
    cache: true,
    url: '//www.googletagservices.com/tag/js/gpt.js'
  });


  $(".mobile_full_ads_close").click(function(e) {
    $(".mobile_full_ads").hide();
  });

  var create_crazyad_close_button = function() {
    $("<a id='crazyad_close_button'>關閉廣告</a>").insertBefore("#crazy_ad_big > div");
    var crazyad = $("#crazyad_close_button");
    if (crazyad.length > 0) {
      crazyad.css("position", "absolute");
      crazyad.css("z-index", "3");
      crazyad.css("right", "5px");
      crazyad.css("margin-top", "5px");
      crazyad.css("color", "#fff");
      crazyad.css("font-size", "14px");
      crazyad.css("cursor", "pointer");
      crazyad.css("background-color", "rgba(0,0,0,0.7)");
      crazyad.css("padding", "5px");

      crazyad.click(function (event) {
        $("#crazy_ad_big").hide();
        $("#crazyad_close_button").hide();
        $("#crazyad_open_button").show();

        $(this).attr("data-settimeout", "Y");
        if (timeoutid != null) {
          clearInterval(timeoutid);
        }
      });
    }
  };

  var create_crazyad_open_button = function() {
    $("<a id='crazyad_open_button'>展開廣告</a>").insertBefore("#crazy_ad_small > div");
    var crazyad = $("#crazyad_open_button");
    if (crazyad.length > 0) {
      crazyad.css("position", "absolute");
      crazyad.css("z-index", "3");
      crazyad.css("right", "315px");
      crazyad.css("margin-top", "5px");
      crazyad.css("color", "#fff");
      crazyad.css("font-size", "14px");
      crazyad.css("cursor", "pointer");
      crazyad.css("background-color", "rgba(0,0,0,0.7)");
      crazyad.css("padding", "5px");

      crazyad.click(function (event) {
        $("#crazy_ad_big").show();
        $("#crazyad_close_button").show();
        $("#crazyad_open_button").hide();
      });
    }
  };

  var create_cookie = function(name, value, days) {
    var expires;

    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    } else {
      expires = "";
    }
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
  }

  var read_cookie = function(name) {
    var name = escape(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(name) === 0) return unescape(c.substring(name.length, c.length));
    }
    return null;
  }

  if ($(".google-dfp[data-mobile-full-ads='true']") != []){
    var date = new Date();
    var ads_resource = $(".google-dfp[data-mobile-full-ads='true']").data("ads-resource");
    var ads_type = "mobile-full-ads"
    var visit_count = $(".google-dfp[data-mobile-full-ads='true']").data("visit-count");

    var key = ""
    if (ads_resource == null){
      key = window.location.hostname.replace(".", "_") + "_" + ads_type + "_" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
    } else {
      key = ads_resource + "_" + ads_type + "_" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
    }

    if (read_cookie(key) == null || read_cookie(key) < visit_count) {
      var visit_number = read_cookie(key) == null ? 0 : parseInt(read_cookie(key));
      create_cookie(key, visit_number + 1);
      mobile_visit = true;
    } else {
      $(".mobile_full_ads").hide();
    }
  }

  // async commands
  googletag.cmd.push(function() {

    tags.each(function(){
      var $this = $(this);
      var unit  = $this.data('unit');
      var size  = $this.data('size');
      var collapse = $this.data('collapse');
      var googleAdSlot = null;

      // define Slot
      if(size){
        size = size.split(" ").map(function(v){ return v.split("x").map(function(w){ return parseInt(w) }) });
        googleAdSlot = googletag.defineSlot(unit, size, this.id);
      }
      else{
        googleAdSlot = googletag.defineOutOfPageSlot(unit, this.id);
      }

      // add Service
      if (collapse) {
        googleAdSlot.addService(googletag.pubads()).setCollapseEmptyDiv(true,true);
      }
      else {
        googleAdSlot.addService(googletag.pubads());
      }

      // set Targeting
      var targeting = $this.data('targeting');
      if(targeting){
        $.each(targeting, function(k, v) {
          googleAdSlot.setTargeting(k, v);
        });
      }

      if(typeof googletag.renderEndedCallback === "function") {
        googleAdSlot.oldRenderEnded = googleAdSlot.renderEnded;
        googleAdSlot.renderEnded = function() {
          googleAdSlot.oldRenderEnded();
          googletag.renderEndedCallback();
        }
      }

    })

    // Add slotRenderEnded listener
    googletag.pubads().addEventListener("slotRenderEnded", function(event) {
      if ($(".google-dfp[data-gold-enable='true']") != []){
        $("div[data-gold-enable='true']").each(function(){
          var unit = $(this).data('unit');
          var gold_color = $(this).data('gold-color');
          var iframe_tag = document.getElementById("google_ads_iframe_" + unit + "_0");
          iframe_tag.contentDocument.getElementsByTagName("body")[0].style.cssText = "text-align: center; line-height: 30px;";

          if (iframe_tag.contentDocument.getElementsByTagName("a").length != 0) {
            iframe_tag.contentDocument.getElementsByTagName("a")[0].style.cssText = "text-decoration: none;";
          };
          if (iframe_tag.contentDocument.getElementsByTagName("span").length != 0) {
            iframe_tag.contentDocument.getElementsByTagName("span")[0].style.cssText = "color: #" + gold_color + ";";
          };
        });
      }

      if ($(".google-dfp[data-mobile-full-ads='true']") != []){
        var mobile_full_ads_unit = $(".google-dfp[data-mobile-full-ads='true']").attr("data-unit");


        if (event.slot.i == mobile_full_ads_unit && event.isEmpty == true) {
          $(".mobile_full_ads").hide();
        } else if (event.slot.i == mobile_full_ads_unit && event.isEmpty == false) {
          if (mobile_visit == true) {
            $(".mobile_full_ads").show();
            var ads_leftpx = ($(window).width() - event.size[0]) / 2;
            $(".mobile_full_ads_close").css("right", ads_leftpx + "px");
            $(".mobile_full_ads_close").css("background-position-x", "right");
          }
        }
      }

      if ($(".google-dfp[data-crazy-ads='true']") != []){
        var crazy_ads_unit = $(".google-dfp[data-crazy-ads='true']").attr("data-unit");
        var slot_unit = event.slot.i || event.slot.w;

        if (slot_unit == crazy_ads_unit && event.isEmpty == false) {
          if (render_crazy_count == 0){
            render_crazy_count = 1;

            create_crazyad_close_button();
            create_crazyad_open_button();

            var date = new Date();
            var ads_resource = $(".google-dfp[data-crazy-ads='true']").data("ads-resource");
            var ads_type = "crazy-ads"
            var visit_count = $(".google-dfp[data-crazy-ads='true']").data("visit-count");

            var key = ""
            if (ads_resource == null){
              key = window.location.hostname.replace(".", "_") + "_" + ads_type + "_" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
            } else {
              key = ads_resource + "_" + ads_type + "_" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
            }

            if (read_cookie(key) == null || read_cookie(key) < visit_count) {
              var visit_number = read_cookie(key) == null ? 0 : parseInt(read_cookie(key));
              create_cookie(key, visit_number + 1);
              crazy_visit = true;
            }

            if (crazy_visit == true){
              $("#razy_ad_big").show();
              $("#crazyad_close_button").show();
              $("#crazyad_open_button").hide();

              if ($("#crazyad_close_button").attr("data-settimeout") != "Y") {
                var times_run = 0;
                timeoutid = setInterval(function() {
                  times_run += 1;
                  $("#crazy_ad_big").hide();
                  $("#crazyad_close_button").hide();
                  $("#crazyad_open_button").show();

                  if(times_run == 1){
                    clearInterval(timeoutid);
                  }
                }, 12000)
              }
            } else {
              $("#crazy_ad_big").hide();
              $("#crazyad_close_button").hide();
            }
          }
        }
      }
    });

    // enable services
    googletag.pubads().enableSingleRequest();
    googletag.pubads().enableAsyncRendering();
    googletag.enableServices();

    // display ads
    tags.each(function(){
      googletag.display(this.id);
    })

    if(typeof googletag.callback === "function") {
      googletag.callback();
    }

    $("#sidebar .google-dfp[data-collapse='true']").css("margin-bottom", "10px");

    // mf only
    $(".mf-ad-banner .google-dfp[data-collapse='true']").css("margin", "10px 0");
    $(".mf-super-hero-ad .google-dfp[data-collapse='true']").css("margin-bottom", "35px");
  });

})
