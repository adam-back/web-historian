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
          console.error("Error serving index.html:", error);
        });
    } else if ( req.url === '/styles.css' ) {
      httpHelpers.serveAssets( 'styles.css' ) 
        .then(function(stylesheet) {
          sendResponse(res, 200, 'text/css', stylesheet);
          archive.readListOfUrls();
        })
        .catch(function(error) {
          console.error("Error serving css", error);
        });
    } else {
      // check if GET request is looking for archived site
      // parse the request path, then remove the leading forward-slash
      // http://localhost:8080/www.google.com -> www.google.com
      var parsedUrl = url.parse(req.url).path.substr(1);
        // if it is listed in sites.txt
        if( archive.isUrlInList(parsedUrl) === true) {
          // return archived site
          if( archive.isUrlArchived(parsedUrl) === true) {
            archivedSite.readArchivedUrl(parsedUrl)
              .then(function(archivedSite) {
                sendResponse(302, archivedSite);
              }) 
              .catch(function(error) {
                console.log('Error serving archived site', error);
              });
          } else {
            serveLoadingPage(res);
          }
        } else {
          sendResponse(res, 404, null, null);
        }
    }
  } else if( req.method === 'POST' ) {
    var requestedUrl;
    var data = '';
    // determine what the URL entered was
    req.on('data', function(chunk) {
      data += chunk;
    });

    // when the form is done being received
    req.on('end', function() {
      // get the url from url=www.somewebsite.com
      requestedUrl = data.substr(4);
      // check if website entered has been saved
      archive.isUrlInList(requestedUrl)
        .then(function( urlInList ) {
          console.log('boolean?', urlInList );
          // if it has been added to sites.txt
          if( urlInList === true ) {
            // check to see if it's been archived yet
            archive.isUrlArchived(url)
              .then(function(bool) {
                // if it has been archived
                if(bool === true) {
                  // serve the archived website
                  archive.readArchivedUrl(requestedUrl)
                    .then(function(archivedSite) {
                      sendResponse(res, 200, 'text/html', archivedSite);
                    })
                    .catch(function(error) {
                      console.log('Error server archived site', error);
                    });
                  // site hasn't been archived, but is added to sites.txt
                } else {
                  // serve the loading page
                  serveLoadingPage(res);
                }      
              })
              .catch(function(error) {
                console.error('Error checking if URL is archived', error);
              });
          // otherwise, not in sites.txt yet
          } else {
            // serve the loading page
            serveLoadingPage(res);
            // add it to sites.txt to be archived by the next cronjob
            archive.addUrlToList(requestedUrl)
              .then(function(success) {
                console.log('The URL has been successfully added to sites.txt', success);
              })
              .catch(function(error) {
                console.error('Error adding URL to sites.txt for URL:', error);
              });
          }
        })
        .catch(function(error) {
          console.error('Error checking sites.txt for URL:', error);
        });
    })
  }
};

var sendResponse = function(res, code, contentType, data) {
  res.writeHead(code, contentType);
  res.end(data);
};

var serveLoadingPage = function(res) {
  httpHelpers.serveAssets('loading.html')
    .then(function(asset) {
      sendResponse(res, 302, 'text/html', asset);
    })
    .catch(function(error) {
      console.error("Error serving loading.html:", error);
    });
};