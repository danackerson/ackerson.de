function popupClose(id) {
    $('#' + id).hide();
}

(function($) {
    var id = 1;
    $( "#mvvPopup" ).draggable({ handle: "p.border" });
    $( "#drivePopup" ).draggable({ handle: "p.border" });
    $( "div, p.border" ).disableSelection();

    term = $('#term1').terminal(function(command, term) {
        var commands = command.split(' ');
        if (commands.length > 0) {
            try {
                switch (commands[0]) {
                    case 'help':
                        term.echo("[[gi;#00FF00;]`whoami`, `date`, `clear`, `drive [DESTINATION]`, `mvv`]");
                        break;

                    case 'date':
                    case 'whoami':
                        simpleAjaxCall(command, "query-param");
                        break;

                    case 'drive':
                        showPopup(commands[0]);
                        if (commands[1]) {
                            document.getElementById('address').value = commands[1];
                            getDrivingDirections();
                        } else {
                            document.getElementById('address').value = '';
                            emptyMap();
                        }
                        break;

                    case 'mvv':
                        showPopup(commands[0]);
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
        greetings: 'Welcome Offworld (type `help` for available cmds)',
        name: 'term1',
        enabled: false,
        prompt: 'dan@ackerson.de:~ $ '
    });

    function showPopup(id) {
        $('#' + id + 'Popup').show();
    }

    /* simple ajax call where typed cmd string is SAME as remote URI AND data set */
    function simpleAjaxCall(command, query_param) {
        term.pause();

        //$.jrpc is helper function which creates json-rpc request
        $.jrpc(command,                         // uri
            id++,
            query_param, 
            [command],                          // command
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