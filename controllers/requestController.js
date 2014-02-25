var latlon = require('./latlon')
var DataSource = require('loopback-datasource-juggler').DataSource;

exports.activeHelpRequests = activeHelpRequests;

function activeHelpRequests(req, res) {
    var p1 = new latlon.LatLon(52.3073, 4.84224);                                                  
    var p2 = new latlon.LatLon(52.307394, 4.842181);                                                  
    var dist = p1.distanceTo(p2);          // in km                                         
    var brng = p1.bearingTo(p2);
    
    var ds = new DataSource('memory');
        
    var DeviceLocation = ds.define('deviceLocation', {
        deviceId: String,
        lat: Number,
        long: Number
    });
        
    DeviceLocation.all(function (err, deviceLocations) {
        console.log(deviceLocations);
    });
    
    var response = new Array();
    response[0] = {"distance":dist, "bearing":brng};
    response[1] = {"distance":dist, "bearing":brng};


    res.end(JSON.stringify(response));
}