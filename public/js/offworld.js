function popupClose(id) {
  $('#' + id).hide();
}
function showPopup(id) {
  $('#' + id + 'Popup').fadeIn('slow');
}
$( "#mvvRoutePopup").draggable({ handle: "p.border" });

function mvvRoute(origin, destination) {
  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var hour = d.getHours();
  var minute = d.getMinutes();

  var url = "http://efa.mvv-muenchen.de/mvv/XSLT_TRIP_REQUEST2?&language=de"+
    "&anyObjFilter_origin=0&sessionID=0&itdTripDateTimeDepArr=dep&type_destination=any"+
    "&itdDateMonth="+month+"&itdTimeHour="+hour+"&anySigWhenPerfectNoOtherMatches=1"+
    "&locationServerActive=1&name_origin="+origin+"&itdDateDay="+day+"&type_origin=any"+
    "&name_destination="+destination+"&itdTimeMinute="+minute+"&Session=0&stateless=1"+
    "&SpEncId=0&itdDateYear="+year;
  $('#iframeMVVRoute').attr('src', url);

  showPopup('mvvRoute');
}

(function($) {
  var id = 1;
  var greeting = "Welcome Offworld (type help)";
  var drive_msg = "[[g;#FFFF00;]drive] <DESTINATION>: google directions from your location\r\n\r\n";
  var weather_msg = "[[g;#FFFF00;]weather]: show local weather forecast (popup window!)\r\n\r\n";
  var mvv_msg = "[[g;#FFFF00;]mvv]: access Munich's public transportation\r\n\r\n";
  var whoami_msg = "[[g;#FFFF00;]whoami]: your browser info and IP address\r\n\r\n";
  var date_msg = "[[g;#FFFF00;]date]: my server date/time\r\n\r\n";
  var clear_msg = "[[g;#FFFF00;]clear]: clear this terminal screen\r\n\r\n";
  var help = drive_msg + weather_msg + mvv_msg + whoami_msg + date_msg + clear_msg;

  $( "#mvvPopup" ).draggable({ handle: "p.border" });
  $( "#drivePopup" ).draggable({ handle: "p.border" });
  $( "#weatherPopup" ).draggable({ handle: "p.border" });

  var anim = false;
  function typedPrompt(term, message, delay) {
    anim = true;
    var c = 0;
    var interval = setInterval(function() {
      term.insert(message[c++]);
      if (c == message.length) {
        clearInterval(interval);
        setTimeout(function() {
          anim = false;
        }, delay);
      }
    }, delay);
  }

  term = $('#term1').terminal(function(command, term) {
    var commands = command.split(' ');
    if (commands.length > 0) {
      try {
        switch (commands[0]) {
          case 'help':
            term.echo(help);
            break;

          case 'date':
          case 'whoami':
            simpleAjaxCall(command, "query-param");
            break;

          case 'drive':
            showPopup(commands[0]);

            if (commands[1]) {
              document.getElementById('address').value = commands[1];
            } else {
              document.getElementById('address').value = 'Munich';
            }

            getDrivingDirections();
            break;

          case 'mvv':
            showPopup(commands[0]);
            break;

          case 'weather':
            getPosition();
            break;

          default:
            /*jslint es5: true */
            var result = window.eval(command);
            if (result !== undefined) {
                term.echo(result);
            }
            break;
        }
      } catch(e) {
        term.echo("[[guib;#FFFF00;]" + e + "] (try `help`)");
      }
    } else {
      term.echo('');
    }
  }, {
    greetings: greeting,
    name: 'term1',
    enabled: false,
    prompt: 'dan@ackerson.de:~ $ ',
    onInit: function(term) {
      //typedPrompt(term, 'help', 250);
    },
    onClear: function(term) {
      term.echo(greeting);
    },
    keydown: function(e) {
      //disable keyboard when animating
      if (anim) {
        return false;
      }
    }
  });

  function getPosition() {
    if (currentLatLng === undefined) {
      navigator.geolocation.getCurrentPosition(function(position) {
        currentPosition = position;
        currentLatLng = new google.maps.LatLng(parseFloat(position.coords.latitude), parseFloat(position.coords.longitude));
        simpleAjaxCall('weather', currentLatLng);
        homeLocation = geocoder.geocode({'latLng': currentLatLng}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              // here we have to carefully scan through results and find city, country ('locality', 'political' in google geocode speak)
              for (i = 0; i < results.length; i++) {
                if (results[i].types[0] == 'locality' && results[i].types[1] == 'political') {
                  homeLocation = results[i].formatted_address;
                  break;
                }
              }
            }
          }
        });
      }, showGeoLocationError);
    } else {
      simpleAjaxCall('weather', currentLatLng);
    }
  }

  /* simple ajax call where typed cmd string is SAME as remote URI AND data set */
  function simpleAjaxCall(command, query_param) {
    term.pause();

    //$.jrpc is helper function which creates json-rpc request
    $.jrpc(command,                         // uri
      id++,
      'post',
      query_param,                          // command
      function(data) {
        term.resume();
        if (data.error) {
          term.error(data.error.message);
        } else {
          if (command == 'weather') {
            showPopup(command);
            var forecast = data['forecastday'];
            var weatherForecast = document.getElementById("forecastweather");
            weatherForecast.innerHTML = "";
            for(var i=0;i<forecast.length;i++){
                /*jshint multistr: true */
                weatherForecast.innerHTML += "\
                <div style='float:left;margin:10px;'>\
                    <span style='float:left;'>"+forecast[i]['date']['weekday_short']+",&nbsp;"+forecast[i]['date']['monthname']+" "+forecast[i]['date']['day']+"</span>\
                    <div style='float:left;clear:left;margin-right:5px;'>\
                        <span style='font-weight:bold;'>"+forecast[i]['low']['celsius']+"&nbsp;&#8451;</span>\
                        <img src="+forecast[i]['icon_url']+" width='44' height='44' alt="+forecast[i]['conditions']+">\
                        <span style='font-weight:bold;'>"+forecast[i]['high']['celsius']+"&nbsp;&#8451;</span>\
                    </div>";
                    if (i+1 < forecast.length) {
                        weatherForecast.innerHTML += "<div style='border-right:1px solid lightgray;float:left;height:90px;'>&nbsp;</div>";
                    }
                weatherForecast.innerHTML += "</div>";
            }

            var weatherReport = document.getElementById("currentweather");
            weatherReport.innerHTML = "<span style='font-weight:bold;color:darkblue;'>Weather for "+homeLocation+"</span>\
                <div id='weatherreport'>\
                    <div style='float:left;margin-left:10px;'>\
                        <div>\
                            <a target='_blank' href="+data['current']['ob_url']+">\
                            <img src="+data['current']['icon_url']+" width='44' height='44' alt="+data['current']['weather']+">\
                            </a>\
                        </div>\
                        <div style='margin-left:-10px;'>"+data['current']['weather']+"</div>\
                    </div>\
                    <div style='float:left;margin-top:10px;margin-left:25px;text-align:left;'>\
                        <div style=''>Current \
                            <span style='font-weight:bold;'>"+data['current']['temperature_string']+"</span>\
                        </div>\
                        <div>Feels Like\
                            <span style='font-weight:bold;'>"+data['current']['feelslike_string']+"</span>\
                        </div>\
                    </div>\
                </div>\
                ";
          } else term.echo(data[command]);       // data set
        }
      },
      function(xhr, status, error) {
        term.error('[AJAX] ' + status + ' - Server reponse is: \n' +
                    xhr.responseText);
        term.resume();
      }
    ); // rpc call
  }

  term.mouseout(function() {
    term.focus(false);
  });
  term.mouseover(function() {
    term.focus(true);
  });
})(jQuery);