module Homepage::Controllers
  class Weather
    def post 
      # to retrieve the JSON POST request params, read the rack.input stream!
      input = @env["rack.input"].read
      browser_post_json = JSON.parse decode(input, env['HTTP_CONTENT_ENCODING'])
      
      lat_lng_object = browser_post_json['params'][0]
      lat_lng = "LAT: #{lat_lng_object['latitude']}, LNG: #{lat_lng_object['longitude']}"
      
      @result = {:weather=>lat_lng}
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
