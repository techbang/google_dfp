$(function(){

  var tags = $("div.google-dfp:visible");

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
        $("div[data-gold-enable='true']").each(function(){
          var unit = $(this).data('unit');
          var gold_color = $(this).data('gold-color');
          var iframe_tag = document.getElementById("google_ads_iframe_" + unit + "_0");
          iframe_tag.contentDocument.getElementsByTagName("body")[0].style.cssText = "text-align: center; line-height: 30px;";
          iframe_tag.contentDocument.getElementsByTagName("a")[0].style.cssText = "text-decoration: none;";
          iframe_tag.contentDocument.getElementsByTagName("span")[0].style.cssText = "color: #" + gold_color + ";";
        });
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
