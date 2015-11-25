require 'json'
require 'google_dfp/size'
require 'google_dfp/tag'

module GoogleDFP

  class Engine < ::Rails::Engine
  end

  module ViewHelper
    def dfp_tag(name, targeting=nil)
      tag  = GoogleDFP::Tag.get(name)
      data = tag.data
      data = data.merge(targeting: targeting) if targeting.present?
      id = "dfp-#{name}"

      capture do
        concat dfp_define_slot_script(tag.unit, tag.size, id)
        concat dfp_div_tag(id, tag.style, data)
      end
    end

    def dfp_define_slot_script(unit, size, id)
      size = size.split(" ").map{|a|a.split("x").map(&:to_i)}.to_s
      cmd_push %Q(
        googletag.defineSlot("#{unit}", #{size}, "#{id}")
                 .addService(googletag.pubads())
                 .setCollapseEmptyDiv(true,true);
      )
    end

    def dfp_div_tag(id, style, data)
      content_tag :div,
        "",
        id:    id,
        class: 'google-dfp',
        style: style,
        data:  data
    end

    def cmd_push(content)
      javascript_tag %Q(
        googletag.cmd.push(function() {
          #{content}
        });
      ).squish
    end

  end

end

ActionView::Base.send :include, GoogleDFP::ViewHelper
