module GoogleDFP
  # Represents a single Tag
  class Tag

    def self.get(name)
      all[name.to_s] || (raise ArgumentError, "Unknown Google DFP tag: '#{name}'")
    end

    def self.all
      @tags ||= begin
        yaml = nil

        if File.exist?("#{Rails.root}/config/google_dfp.yml")
          yaml = YAML.load_file("#{Rails.root}/config/google_dfp.yml")
        else
          Dir.glob("#{Rails.root}/config/google_dfp/*").each do |file_path|
            if yaml.nil?
              yaml = YAML.load_file(file_path)
            else
              yaml.merge!(YAML.load_file(file_path))
            end
          end
        end

        Hash[yaml.map{|name, options| [name, Tag.new(options)] }]
      end
    end

    attr_reader :unit, :collapse, :gold_enable, :gold_color

    def initialize(options)
      options.each do |key,val|
        case key
        when 'size'
          @sizes = val.split.map{|size| Size.new size }
        when 'unit'
          @unit = val
        when 'collapse'
          @collapse = val
        when 'gold_enable'
          @gold_enable = val
        when 'gold_color'
          @gold_color = val
        else
          raise ArgumentError, "unknown option: #{key}"
        end
      end
    end

    def data
      @data ||= {
        size: size,
        unit: unit,
        collapse: collapse,
        gold_enable: gold_enable,
        gold_color: gold_color
      }.freeze
    end

    def size
      return unless @sizes

      @size ||= @sizes.map{|size| [size.width, size.height].join("x") }.join(" ")
    end

    def style
      return unless @sizes

      @style ||= begin
        %w( width height ).inject "" do |style, attr|
          style << ";"    if style.length > 0
          style << "min-" if @sizes.count > 1
          style << "#{attr}:"
          style << @sizes.map{|s| s.send(attr) }.min.to_s
          style << "px"
        end.freeze
      end
    end
  end
end
