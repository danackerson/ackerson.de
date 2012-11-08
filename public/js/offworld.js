function popupClose(id) {
  $('#' + id).hide();
}

(function($) {
  var id = 1;
  var greeting = "Welcome Offworld (type `help` for commands)";
  var drive_msg = "[[g;#FFFF00;]drive] <DESTINATION>: google directions from your location\r\n\r\n";
  var weather_msg = "[[g;#FFFF00;]weather]: show local weather forecast (coming soon)\r\n\r\n";
  var mvv_msg = "[[g;#FFFF00;]mvv]: access Munich's public transportation\r\n\r\n";
  var whoami_msg = "[[g;#FFFF00;]whoami]: your browser info and IP address\r\n\r\n";
  var date_msg = "[[g;#FFFF00;]date]: my server date/time\r\n\r\n";
  var clear_msg = "[[g;#FFFF00;]clear]: clear this terminal screen\r\n\r\n";
  var help = drive_msg + weather_msg + mvv_msg + whoami_msg + date_msg + clear_msg;

  $( "#mvvPopup" ).draggable({ handle: "p.border" });
  $( "#drivePopup" ).draggable({ handle: "p.border" });
  
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
            var result = window.eval(command);
            if (result !== undefined) {
                term.echo(new String(result));
            }
            break;
        }
      } catch(e) {
        term.echo("[[guib;#FFFF00;]" + new String(e) + "] (try `help`)");
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
      typedPrompt(term, 'help', 250);
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
    if (currentPosition == undefined) {
      navigator.geolocation.getCurrentPosition(function(position) {
        simpleAjaxCall('weather', position.coords);
        }, showGeoLocationError);
    } else {
      simpleAjaxCall('weather', currentPosition.coords);
    }
  }
  function showPopup(id) {
    $('#' + id + 'Popup').fadeIn('slow');
  }

  /* simple ajax call where typed cmd string is SAME as remote URI AND data set */
  function simpleAjaxCall(command, query_param) {
    term.pause();

    //$.jrpc is helper function which creates json-rpc request
    $.jrpc(command,                         // uri
      id++,
      'post', 
      [query_param],                          // command
      function(data) {
        term.resume();
        if (data.error) {
          term.error(data.error.message);
        } else {
          term.echo(data[command]);       // data set
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