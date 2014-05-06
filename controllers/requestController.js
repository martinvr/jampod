var latlon = require('./latlon')
var DataSource = require('loopback-datasource-juggler').DataSource;
var ds = new DataSource({
    connector: require('loopback-connector-mongodb'),
    host: 'oceanic.mongohq.com',
    port: 10048,
    username: 'jampod',
    password: 'pswpsw123',
    database: 'jampod'
});

exports.activeHelpRequests = activeHelpRequests;

    
function activeHelpRequests(req, res) {
    var myDevice = new latlon.LatLon(52.3073, 4.84224);
        
    var DeviceLocation = ds.define('deviceLocation', {
        deviceId: String,
        id: String,
        myGlass: Boolean,
        valid: Boolean,
        lat: Number,
        lon: Number
    });
    
    DeviceLocation.all(function (err, deviceLocations) {
        var response = new Array();

	for (var i = 0; i < deviceLocations.length; i++) {
		var device = deviceLocations[i];
		if (device && device.myGlass) {
			myDevice = new latlon.LatLon(device.lat, device.lon);
		}
	}
	var loc = 0;
        for (var i = 0; i < deviceLocations.length; i++) {
            var device = deviceLocations[i];
            
            if (device && device.valid && !device.myGlass) {
                var customer = new latlon.LatLon(device.lat, device.lon);                                                  
                var distance = myDevice.distanceTo(customer); // in km                                         
                var bearing = myDevice.bearingTo(customer);
                response[loc] = {"distance": distance, "bearing":bearing, "device":device.id, "myGlass":device.myGlass};            
		loc++;
            }
        }

        var help = new Object();
        help.requests = response;
        res.end(JSON.stringify(help));
    });
}
