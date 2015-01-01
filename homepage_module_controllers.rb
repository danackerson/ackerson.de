module Homepage::Controllers
  class Weather
    def post 
      input = JSON.parse(request.body.read)
      params = input['params']

      i = 0
      lat = '0'
      lng = '0'
      params.each { |index,param|
        if i == 0
          lat = param
        else
          lng = param
        end
        i += 1
      }

      # Lat / Lng wunderground.com solution - I signed up for an API key
      url = "http://api.wunderground.com/api/c5060046bbda0736/conditions/q/#{lat},#{lng}.json"
      resp = Net::HTTP.get_response(URI.parse(url))
      data = JSON.parse resp.body
      current = data['current_observation']

      url = "http://api.wunderground.com/api/c5060046bbda0736/forecast/q/#{lat},#{lng}.json"
      resp = Net::HTTP.get_response(URI.parse(url))
      data = JSON.parse resp.body
      forecast = data['forecast']['simpleforecast']['forecastday']

      code = { 
        :current => { 
          :observation_time => current['observation_time'], :observation_location => current['observation_location']['full'],
          :weather => current['weather'], :temperature_string => current['temperature_string'], :relative_humidity => current['relative_humidity'],
          :feelslike_string => current['feelslike_string'], :icon_url => current['icon_url'], :forecast_url => current['forecast_url'],
          :ob_url => current['ob_url'] }, 
        :forecastday => forecast }

      @result = code
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
