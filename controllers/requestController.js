var latlon = require('./latlon')
var DataSource = require('loopback-datasource-juggler').DataSource;
var ds = new DataSource({
    connector: require('loopback-connector-mongodb'),
    host: 'localhost',
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
        lat: Number,
        long: Number
    });
    
    DeviceLocation.all(function (err, deviceLocations) {
        var response = new Array();

        for (var i = 0; i < deviceLocations.length; i++) {
            var device = deviceLocations[i];
            
            if (device.active) {
                var customer = new latlon.LatLon(device.lat, device.long);                                                  
                var distance = myDevice.distanceTo(customer); // in km                                         
                var bearing = myDevice.bearingTo(customer);
                response[i] = {"distance": distance, "bearing":bearing, "device":device.id};            
            }
        }

        res.end(JSON.stringify(response));
    });
}