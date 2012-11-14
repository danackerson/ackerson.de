module Homepage::Controllers
  class Weather
    def post 
      # to retrieve the JSON POST request params, read the rack.input stream!
      input = @env["rack.input"].read
      browser_post_json = JSON.parse decode(input, env['HTTP_CONTENT_ENCODING'])

      # Lat / Lng wunderground.com solution - I signed up for an API key
      # http://api.wunderground.com/api//conditions/q/48.1366069,11.577085099999977.json
      # http://api.wunderground.com/api//forecast/q/48.1366069,11.577085099999977.json
=begin ** Sample wunderground response **
"\n{\n\t\
  "response\": {\n\t\t\"version\": \"0.1\"\n\t\t,\"termsofService\": \"http://www.wunderground.com/weather/api/d/terms.html\"\n\t\t,\"features\": {\n\t\t\"conditions\": 1\n\t\t}\n\t}\n\t\t,\t\
  "current_observation\": 
    {\n\t\t\
    "image\": {\n\t\t\"url\":\"http://icons-ak.wxug.com/graphics/wu2/logo_130x80.png\",\n\t\t\"title\":\"Weather Underground\",\n\t\t\"link\":\"http://www.wunderground.com\"\n\t\t},\n\t\t\
    "display_location\": {\n\t\t\
      "full\":\"Muenchen Stadt, Germany\",\n\t\t\"city\":\"Muenchen Stadt\",\n\t\t\"state\":\"\",\n\t\t\"state_name\":\"Germany\",\n\t\t\"country\":\"DL\",\n\t\t\"country_iso3166\":\"DE\",\n\t\t\"zip\":\"00000\",\n\t\t\
      "latitude\":\"48.136607\",\n\t\t\"longitude\":\"11.577085\",\n\t\t\"elevation\":\"535.00000000\"\n\t\t
    },\n\t\t\
**    "observation_location\": {\n\t\t\"full\":\"M\303\274nchen, BAYERN\",\n\t\t\"city\":\"M\303\274nchen\",\n\t\t\"state\":\"BAYERN\",\n\t\t\"country\":\"GERMANY\",\n\t\t\"country_iso3166\":\"DE\",\n\t\t\"latitude\":\"48.158653\",\n\t\t\"longitude\":\"11.584496\",\n\t\t\"elevation\":\"1693 ft\"\n\t\t},\n\t\t\
    "estimated\": {\n\t\t},\n\t\t\
    "station_id\":\"IBAYERNM12\",\n\t\t\
**    "observation_time\":\"Last Updated on November 14, 6:58 AM CET\",\n\t\t\
    "observation_time_rfc822\":\"Wed, 14 Nov 2012 06:58:36 +0100\",\n\t\t\
    "observation_epoch\":\"1352872716\",\n\t\t\
    "local_time_rfc822\":\"Wed, 14 Nov 2012 06:59:15 +0100\",\n\t\t\
    "local_epoch\":\"1352872755\",\n\t\t\
    "local_tz_short\":\"CET\",\n\t\t\
    "local_tz_long\":\"Europe/Berlin\",\n\t\t\
    "local_tz_offset\":\"+0100\",\n\t\t\
**    "weather\":\"Overcast\",\n\t\t\
**    "temperature_string\":\"43.0 F (6.1 C)\",\n\t\t\
    "temp_f\":43.0,\n\t\t\
    "temp_c\":6.1,\n\t\t\
**    "relative_humidity\":\"91%\",\n\t\t\
    "wind_string\":\"From the East at 2.0 MPH Gusting to 2.0 MPH\",\n\t\t\
    "wind_dir\":\"East\",\n\t\t\
    "wind_degrees\":86,\n\t\t\
    "wind_mph\":2.0,\n\t\t\
    "wind_gust_mph\":\"2.0\",\n\t\t\
    "wind_kph\":3.2,\n\t\t\
    "wind_gust_kph\":\"3.2\",\n\t\t\
    "pressure_mb\":\"1029\",\n\t\t\
    "pressure_in\":\"30.39\",\n\t\t\
    "pressure_trend\":\"0\",\n\t\t\
    "dewpoint_string\":\"41 F (5 C)\",\n\t\t\
    "dewpoint_f\":41,\n\t\t\
    "dewpoint_c\":5,\n\t\t\
    "heat_index_string\":\"NA\",\n\t\t\
    "heat_index_f\":\"NA\",\n\t\t\
    "heat_index_c\":\"NA\",\n\t\t\
    "windchill_string\":\"43 F (6 C)\",\n\t\t\
    "windchill_f\":\"43\",\n\t\t\
    "windchill_c\":\"6\",\n\t\t\
**    "feelslike_string\":\"43 F (6 C)\",\n\t\t\
    "feelslike_f\":\"43\",\n\t\t\
    "feelslike_c\":\"6\",\n\t\t\
    "visibility_mi\":\"4.3\",\n\t\t\
    "visibility_km\":\"7.0\",\n\t\t\
    "solarradiation\":\"\",\n\t\t\
    "UV\":\"0\",\n\t\t\
    "precip_1hr_string\":\"0.00 in ( 0 mm)\",\n\t\t\
    "precip_1hr_in\":\"0.00\",\n\t\t\
    "precip_1hr_metric\":\" 0\",\n\t\t\
    "precip_today_string\":\"0.00 in (0 mm)\",\n\t\t\
    "precip_today_in\":\"0.00\",\n\t\t\
    "precip_today_metric\":\"0\",\n\t\t\
    "icon\":\"cloudy\",\n\t\t\
 **   "icon_url\":\"http://icons-ak.wxug.com/i/c/k/nt_cloudy.gif\",\n\t\t\
 **   "forecast_url\":\"http://www.wunderground.com/global/stations/10865.html\",\n\t\t\
    "history_url\":\"http://www.wunderground.com/weatherstation/WXDailyHistory.asp?ID=IBAYERNM12\",\n\t\t\
    "ob_url\":\"http://www.wunderground.com/cgi-bin/findweather/getForecast?query=48.158653,11.584496\"
  \n\t}
\n}\n"
=end

      url = 'http://api.wunderground.com/api//conditions/q/48.1366069,11.577085099999977.json'
      resp = Net::HTTP.get_response(URI.parse(url)) # get_response takes an URI object

      data = JSON.parse resp.body
      code = data['current_observation']

      code = {:weather => { 
        :observation_time => code['observation_time'], "observation_location" => code['observation_location']['full'],
        "weather" => code['weather'], "temperature_string" => code['temperature_string'], :relative_humidity => code['relative_humidity'],
        :feelslike_string => code['feelslike_string'], :icon_url => code['icon_url'], :forecast_url => code['forecast_url'],
        :ob_url => code['ob_url']
        }}

=begin ** Weather Location Code solution - confuses Schwabhausen bei Dachau with Schwabhausen bei Landsberg!! **
      code = 'UKXX0086' # default weather location code (in case we can't find a match)
      path = "http://xoap.weather.com/search/search?where=#{browser_post_json['params']}"
      doc = XML::Document.file(path)
      doc.find('//search/loc').each do |s|
        code = s.attributes['id']
      end
=end

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
