var geocoder;
var map;
var green_marker;
var currentLatLng;
var currentMarker;
var homeMarker;
var homeLocation;
var directionsDisplay;
var directionsService;

function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
      map: map,
      position: new google.maps.LatLng(60, 105),
      content: content
    };

    //var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

// TODO DELETE ANY PREVIOUS DESTINATIONS FROM MAP! (in map_directions div?)
function emptyMap() {
    var mapOptions = {
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP  // ROADMAP, SATELLITE, HYBRID, TERRAIN
    };
    
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    green_marker = new google.maps.MarkerImage(
        'http://maps.gstatic.com/mapfiles/markers2/marker_greenA.png',
        new google.maps.Size(32, 32),   // size
        new google.maps.Point(0,0),     // origin
        new google.maps.Point(16, 32)   // anchor
    );

    homeMarker = new google.maps.Marker({
        map: map,
        icon: green_marker,
        position: currentLatLng
    });

    map.setCenter(currentLatLng);
    document.getElementById('home_location').innerHTML = 
      "<p style='font-size:14px;margin-left:10px;margin-bottom:0px;'><img style='height:24px;width:16px;vertical-align:middle;' src='https://maps.gstatic.com/mapfiles/markers2/marker_greenA.png'>&nbsp;&nbsp;&nbsp;<b>" + homeLocation + "</b></p><hr>";
    document.getElementById('directions').innerHTML = "";
}

function init_googlemaps() {
    geocoder = new google.maps.Geocoder();

    
    // Try HTML5 geolocation
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);

        // be careful to store TRUE coordinates! 
        // after adding markers and/or infoWindows the center of the map changes 
        // and subsequent calls to get the location from .getCenter() will be WRONG!
        currentLatLng = pos;
        geocoder.geocode({'latLng': currentLatLng}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                  homeLocation = results[1].formatted_address;
                  document.getElementById('home_location').innerHTML = 
                    "<p style='font-size:14px;margin-left:10px;margin-bottom:0px;'><img style='height:24px;width:16px;vertical-align:middle;' src='https://maps.gstatic.com/mapfiles/markers2/marker_greenA.png'>&nbsp;&nbsp;&nbsp;<b>" + homeLocation + "</b></p><hr>";
                }
              } 
            });

          green_marker = new google.maps.MarkerImage(
            'http://maps.gstatic.com/mapfiles/markers2/marker_greenA.png',
            new google.maps.Size(32, 32),   // size
            new google.maps.Point(0,0),     // origin
            new google.maps.Point(16, 32)   // anchor
          );
          homeMarker = new google.maps.Marker({
            map: map,
            icon: green_marker,
            position: currentLatLng
          });

      }, function() {
        handleNoGeolocation(true);
      });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
}

function getDrivingDirections() {
    var address = document.getElementById('address').value;
    if (!address) address = currentLatLng;

    var mapOptions = {
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP  // ROADMAP, SATELLITE, HYBRID, TERRAIN
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    geocoder.geocode( { 'address': address }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        destinationLatLng = results[0].geometry.location; 
        
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map); // clear any past results

        var directionsRequest = {
          origin: homeMarker.position,
          destination: destinationLatLng,
          travelMode: google.maps.TravelMode.DRIVING // DRIVING, WALKING, BICYCLING, TRANSIT
        }

        directionsService = new google.maps.DirectionsService();
        directionsService.route(directionsRequest, function(result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);

            var steps = result.routes[0].legs[0].steps
            var result = "";
            var totalTime = 0;
            var totalDist = 0;

            for ( var step in steps ) {
              result += "<p style='margin-left:10px;margin-top:0px;'><b>" + (parseInt(step) + 1) + ".</b> <span style='font-size:14px;'>" + steps[step].instructions + " (<span style='font-style:italic;font-size:12px;color:blue;'>" + steps[step].distance.text + " - " + steps[step].duration.text + "</span>)</span></p>";

              totalTime += steps[step].duration.value;
              totalDist += steps[step].distance.value;
            }

            hours = parseInt( totalTime / 3600 ) % 24;
            minutes = parseInt( totalTime / 60 ) % 60;
            totalTime = hours + "hr " + (minutes < 10 ? "0" + minutes : minutes) + "mins";

            document.getElementById('directions').innerHTML = result;
            document.getElementById('home_location').innerHTML = 
              "<p style='font-size:14px;margin-left:10px;margin-bottom:0px;'><img style='height:24px;width:16px;vertical-align:middle;' src='http://maps.gstatic.com/mapfiles/markers2/marker_greenA.png'>&nbsp;&nbsp;&nbsp;<b>" + homeLocation + "</b></p>" + 
              "<p style='font-size:14px;margin-left:10px;margin-bottom:0px;'><img style='height:24px;width:16px;vertical-align:middle;' src='http://maps.gstatic.com/mapfiles/markers2/marker_greenB.png'>&nbsp;&nbsp;&nbsp;<b>" + document.getElementById('address').value + "</b> (<span style='font-size:14px;font-style:italic;font-weight:bold;color:blue;'>" + totalDist/1000 + " km - " + totalTime + "</span>)</p><hr>";
          }
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}
