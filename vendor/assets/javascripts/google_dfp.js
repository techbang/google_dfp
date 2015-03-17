$(function(){

  var tags = $("div.google-dfp");
  var mobile_visit = false;

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

    var key = ""
    if (ads_resource == null){
      key = window.location.hostname.replace(".", "_") + "_" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
    } else {
      key = ads_resource + "_" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
    }

    if (read_cookie(key) == null || read_cookie(key) == 1) {
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

      googletag.pubads().addEventListener("slotRenderEnded", function(event) {
        if ($(".google-dfp[data-gold-enable='true']") != []){
          $("div[data-gold-enable='true']").each(function(){
            var unit = $(this).data('unit');
            var gold_color = $(this).data('gold-color');
            var iframe_tag = document.getElementById("google_ads_iframe_" + unit + "_0");
            iframe_tag.contentDocument.getElementsByTagName("body")[0].style.cssText = "text-align: center; line-height: 30px;";
            iframe_tag.contentDocument.getElementsByTagName("a")[0].style.cssText = "text-decoration: none;";
            iframe_tag.contentDocument.getElementsByTagName("span")[0].style.cssText = "color: #" + gold_color + ";";
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
              $(".mobile_full_ads_close").css("margin-left", ads_leftpx + "px");
            }
          }
        }
      });
    })

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
