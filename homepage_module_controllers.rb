module Homepage::Controllers
  class Date < R '/date'
    def get
      @result = {:now=>Time.now.utc.to_s}
	    @headers['Content-Type'] = "application/json"
			@result.to_json
    end

    def post
      @result = {:now=>Time.now.utc.to_s}
	    @headers['Content-Type'] = "application/json"
			@result.to_json
    end
  end
end
