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
    var markers = '[';

    var request = http.request(beaconOptions, function(resp) {
        resp.setEncoding('utf8');
        var str = ''
        
        resp.on('data', function (chunk) {
            str += chunk;
        });
      
        resp.on('end', function () {
            markers += beacons(str);
            
            var deviceOptions = getOptions(devices_path);
            var request = http.request(deviceOptions, function(resp) {
                resp.setEncoding('utf8');
                var str = ''
                
                resp.on('data', function (chunk) {
                    str += chunk;
                });
              
                resp.on('end', function () {
                    markers += devices(str);
                    markers += ']';
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
    var staticMap = gm.staticMap('52.307270, 4.842359', 20, '1024x786', false, false, 'roadmap', JSON.parse(markers), null, null);
    util.puts(staticMap);
            
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<img src="'+staticMap+'" />');
}

var beacons = function(str) {
    var beacons = str ? JSON.parse(str) : [];
    var markers = '';
    
    for(var i = 0; i < beacons.length; i++) {
        var beacon = beacons[i];
        markers += '{ "location": "'+beacon.lat+', '+beacon.long+'", "label":"'+beacon.id+'", "color":"blue" }';
        
        //if (beacons.length != i + 1 || devicesAvailable) {
        markers += ',';
    }

    return markers;
}

var devices = function(str) {
    var devices = str ? JSON.parse(str) : [];
    var markers = '';
    
    for(var i = 0; i < devices.length; i++) {
        var device = devices[i];
        markers += '{ "location": "'+device.lat+', '+device.long+'", "label":"'+device.deviceId+'", "color":"blue" }';
        
        if ((i + 1) < devices.length) {
            markers += ',';
        }
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