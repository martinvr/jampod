var http = require('http');
var gm = require('googlemaps');
var util = require('util');
var io = require('socket.io');

var url = 'jampod-c9-martinvr.c9.io';
var beacons_path = '/api/beacons';
var devices_path = '/api/deviceLocations';
var headers = {"Content-Type:":"application/json"};

exports.show = show;

function show(req, res) {
    var beaconOptions = getOptions(beacons_path);
    var markers = new Array();

    var request = http.request(beaconOptions, function(resp) {
        resp.setEncoding('utf8');
        var str = ''
        
        resp.on('data', function (chunk) {
            str += chunk;
        });
      
        resp.on('end', function () {
            markers = markers.concat(markers(str, "blue"));
            
            var deviceOptions = getOptions(devices_path);
            var request = http.request(deviceOptions, function(resp) {
                resp.setEncoding('utf8');
                var str = ''
                
                resp.on('data', function (chunk) {
                    str += chunk;
                });
              
                resp.on('end', function () {
                    markers = markers.concat(markers(str, "red"));
                    writeResponse(res, markers);
                });
            });
            request.on('error', error);
            request.end();
        });
    });
            
    request.on('error', error);
    request.end();
}

function writeResponse(res, markers) {
    if (markers.length <= 0) {
        markers = [];
    }

    var staticMap = gm.staticMap('52.307270, 4.842359', 20, '1024x786', false, false, 'roadmap', markers, null, null);
    util.puts(staticMap);
  
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<img src="'+staticMap+'&key=AIzaSyDP2B5EholQ63uaLQRRiAe7s2OCKo36n_A" />');
}

var markers = function(str, color) {
    var json = str ? JSON.parse(str) : [];
    var markers = new Array();
    
    for(var i = 0; i < json.length; i++) {
        var marker = json[i];
        var location = marker.lat + ', ' + marker.long;
        markers[i] = {"location":location, "label":marker.deviceId, "color":color};
    }

    return markers;
}

var error = function(e) {
    console.log('problem with request: ' + e.message);
}

function getOptions(path) {
    return {
      hostname: url,
      path: path,
      method: 'GET',
      headers: headers
    };
}