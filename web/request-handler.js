var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelpers = require('./http-helpers');
var url = require('url');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  if( req.method === 'GET' ) {
    if ( req.url === '/' ) {
      // serve static index.html
      httpHelpers.serveAssets('index.html')
        .then(function(asset) {
          sendResponse(res, 200, 'text/html', asset);
        })
        .catch(function(error) {
          console.log("Error serving index.html:", error);
        });
    } else if ( req.url === '/styles.css' ) {
      httpHelpers.serveAssets( 'styles.css' ) 
        .then(function(stylesheet) {
          sendResponse(res, 200, 'text/css', stylesheet);
          archive.readListOfUrls();
        })
        .catch(function(error) {
          console.log("Error serving css", error);
        });
    }
  } else if( req.method === 'POST' ) {
    var requestedUrl;
    var data = '';
    // determine what the URL entered was
    req.on('data', function(chunk) {
      data += chunk;

      // safeguard against giant or infinite files
      if( data.length > 16 ) {
        req.connection.destroy();
      }
    });

    // when the form is done being received
    req.on('end', function() {
      // get the url from url=www.somewebsite.com
      requestedUrl = data.substr(4);
      console.log(requestedUrl);
      req.connection.destroy();
    })
    // check if website entered has been saved
    // archive.isUrlInList()
      // if it has
        // serve the archived website
      // otherwise
        // serve the loading page
        // see if it has been added to site.txt
          // if it hasn't
            // add it to sites.txt to be archived by the next cronjob
  }
};

var sendResponse = function(res, code, contentType, data) {
  res.writeHead(code, contentType);
  res.end(data);
};