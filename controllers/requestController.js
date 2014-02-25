var http = require('http');
var latlon = require('./latlon')

exports.activeHelpRequests = activeHelpRequests;

function activeHelpRequests(req, res) {
    var p1 = new latlon.LatLon(52.3073, 4.84224);                                                  
    var p2 = new latlon.LatLon(52.307394, 4.842181);                                                  
    var dist = p1.distanceTo(p2);          // in km                                         
    var brng = p1.bearingTo(p2);
    
    var response = new Array();
    response[0] = {"distance":dist, "bearing":brng};
    response[1] = {"distance":dist, "bearing":brng};
    
    res.end(JSON.stringify(response));
}