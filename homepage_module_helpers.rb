module Homepage::Helpers
  def decode(input, content_encoding)
    if content_encoding == 'gzip'
      z = Zlib::GzipReader.new(StringIO.new(input)).read
    elsif content_encoding == 'deflate'
      Zlib::Inflate.new.inflate new input
    else
      input
    end
  end
end
