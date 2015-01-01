require 'rubygems'

require 'json'
require 'camping'
require 'net/http'

Camping.goes :Homepage

require './homepage_module_controllers.rb'
require './homepage_module_views.rb'
require './homepage_module_helpers.rb'

run Homepage
