var http = require('http');

exports.show = show;

function show(req, res) {
    var gm = require('googlemaps');
    var util = require('util');

     var options = {
      hostname: 'jampod-c9-martinvr.c9.io',
      path: '/api/beacons',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    
    var req = http.request(options, function(resp) {
      resp.setEncoding('utf8');
        var str = ''
      resp.on('data', function (chunk) {
          str += chunk;
      });
      
      resp.on('end', function () {
            var beacons = str ? JSON.parse(str) : [];
            var markers = '[';
            
            for(var i = 0; i < beacons.length; i++) {
                var beacon = beacons[i];
                markers += '{ "location": "'+beacon.lat+', '+beacon.long+'", "label":"'+beacon.id+'", "color":"blue" }';
                
                //if (beacons.length != i + 1 || devicesAvailable) {
                   markers += ',';
            }
            //TODO get devices from api
            markers +='{"location": "52.307377, 4.842271", "label": "M"}]';
            
            var staticMap = gm.staticMap('52.307270, 4.842359', 20, '1024x786', false, false, 'roadmap', JSON.parse(markers), null, null);
            util.puts(staticMap);
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<img src="'+staticMap+'" />');
      });
    });
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    req.end();
    
}