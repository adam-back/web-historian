var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelpers = require('./http-helpers');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  if( req.method === 'GET' ) {
    if ( req.url === '/' ) {
      // serve static index.html
      httpHelpers.serveAssets('index.html')
        .then(function(asset) {
          res.writeHead(200, 'text/html');
          res.end(asset);
        })
        .catch(function(error) {
          console.log("Error serving index.html:", error);
        });
    } else if ( req.url === '/styles.css' ) {
      httpHelpers.serveAssets( 'styles.css' ) 
        .then(function(stylesheet) {
          res.writeHead(200, 'text/css');
          res.end(stylesheet);
        })
        .catch(function(error) {
          console.log("Error serving css", error);
        });
    }
  } else if( req.method === 'POST' ) {

  }
};
