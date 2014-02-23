var loopback = require('loopback');
var path = require('path');
var started = new Date();
var express = require("express");
var app = express();

// operational dependencies
try {
  require('strong-agent').profile();
  var control = require('strong-cluster-control');
  var clusterOptions = control.loadOptions();
} catch(e) {
  console.log('Could not load operational dependencies:');
  console.log(e);
}

// if configured as a cluster master, just start controller
if(clusterOptions.clustered && clusterOptions.isMaster) {
  return control.start(clusterOptions);
}

/*
 * 1. Configure LoopBack models and datasources
 *
 * Read more at http://apidocs.strongloop.com/loopback#appbootoptions
 */

//app.boot(__dirname);

/*
 * 2. Configure request preprocessing
 *
 *  LoopBack support all express-compatible middleware.
 */

app.use(loopback.favicon());
app.use(loopback.logger(app.get('env') === 'development' ? 'dev' : 'default'));
app.use(loopback.bodyParser());
app.use(loopback.methodOverride());

/*
 * EXTENSION POINT
 * Add your custom request-preprocessing middleware here.
 * Example:
 *   app.use(loopback.limit('5.5mb'))
 */

/*
 * 3. Setup request handlers.
 */

// LoopBack REST interface
var apiPath = '/api';
app.use(apiPath, loopback.rest());

// API explorer (if present)
var explorerPath = '/explorer';
try {
  var explorer = require('loopback-explorer');
  app.use(explorerPath, explorer(app, { basePath: apiPath }));
} catch(e){
  // ignore errors, explorer stays disabled
}

/*
 * EXTENSION POINT
 * Add your custom request-handling middleware here.
 * Example:
 *   app.use(function(req, resp, next) {
 *     if (req.url == '/status') {
 *       // send status response
 *     } else {
 *       next();
 *     }
 *   });
 */

// Let express routes handle requests that were not handled
// by any of the middleware registered above.
// This way LoopBack REST and API Explorer take precedence over
// express routes.
app.use(app.router);

// The static file server should come after all other routes
// Every request that goes through the static middleware hits
// the file system to check if a file exists.
app.use(loopback.static(path.join(__dirname, 'public')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

/*
 * 4. Setup error handling strategy
 */

/*
 * EXTENSION POINT
 * Add your custom error reporting middleware here
 * Example:
 *   app.use(function(err, req, resp, next) {
 *     console.log(req.url, ' failed: ', err.stack);
 *     next(err);
 *   });
 */

// The ultimate error handler.
app.use(loopback.errorHandler());


/*
 * 5. Add a basic application status route at the root `/`.
 *
 * (remove this to handle `/` on your own)
 */

app.get('/', loopback.status());
app.get('/map', function(req, res) {
    var gm = require('googlemaps');
    var util = require('util');
    
   var markers = [
        { 'location': '52.307300, 4.842240', 'label':'1', 'color':'blue' },
        { 'location': '52.307394, 4.842181',  'label': '2', 'color':'blue'},
        { 'location': '52.307406, 4.842349',  'label': '3', 'color':'blue'},
        { 'location': '52.307377, 4.842271',  'label': 'M'}
    ]

    var staticMap = gm.staticMap('52.307270, 4.842359', 20, '1024x786', false, false, 'roadmap', markers, null, null);
    util.puts(staticMap);
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<img src="'+staticMap+'" />');
});

/*
 * 6. Optionally start the server
 *
 * (only if this module is the main module)
 */
if(require.main === module) {
  app.listen(process.env.PORT, process.env.IP,
    function(){
      var baseUrl = 'http://' + process.env.IP + ':' + process.env.PORT;
      if (explorerPath) {
        console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      } else {
        console.log(
          'Run `npm install loopback-explorer` to enable the LoopBack explorer'
        );
      }
      console.log('LoopBack server listening @ %s%s', baseUrl, '/');
    }
  );
}
