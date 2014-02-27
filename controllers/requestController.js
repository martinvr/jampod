var latlon = require('./latlon')
var DataSource = require('loopback-datasource-juggler').DataSource;
var ds = new DataSource({
    connector: require('loopback-connector-mongodb'),
    host: '95.85.49.119',
    port: 27017,
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
            if (device.valid) {
                var customer = new latlon.LatLon(device.lat, device.lon);                                                  
                var distance = myDevice.distanceTo(customer); // in km                                         
                var bearing = myDevice.bearingTo(customer);
                response[i] = {"distance": distance, "bearing":bearing, "device":device.id};
            }
        }
        for (var i = 0; i < deviceLocations.length; i++) {
            var device = deviceLocations[i];
            
            if (device.valid) {
                var customer = new latlon.LatLon(device.lat, device.lon);                                                  
                var distance = myDevice.distanceTo(customer); // in km                                         
                var bearing = myDevice.bearingTo(customer);
                response[i] = {"distance": distance, "bearing":bearing, "device":device.id, "myGlass":device.myGlass};            
            }
        }

        var help = new Object();
        help.requests = response;
        res.end(JSON.stringify(help));
    });
}
