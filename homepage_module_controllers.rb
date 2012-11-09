module Homepage::Controllers
  class Weather
    def post 
      # to retrieve the JSON POST request params, read the rack.input stream!
      input = @env["rack.input"].read
      browser_post_json = JSON.parse decode(input, env['HTTP_CONTENT_ENCODING'])

      code = 'UKXX0086' # default weather location code (in case we can't find a match)
      path = "http://xoap.weather.com/search/search?where=#{browser_post_json['params']}"
      doc = XML::Document.file(path)
      doc.find('//search/loc').each do |s|
        code = s.attributes['id']
      end

      @result = {:weather=>code}
      @headers['Content-Type'] = "application/json"
      @result.to_json
    end
  end

  class Date < R '/date'
    def post
      @result = {:date=>Time.now.to_s}
	    @headers['Content-Type'] = "application/json"
			@result.to_json
    end
  end

  class Whoami < R '/whoami'
  	def post
  		user_ip = @env['REMOTE_ADDR']
  		user_agent = @env['HTTP_USER_AGENT']

      @result = {:whoami=>"#{user_ip} (#{user_agent})"}

	    @headers['Content-Type'] = "application/json"
			@result.to_json
    end
  end
end
