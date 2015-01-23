var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelpers = require('./http-helpers');
var url = require('url');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  if( req.method === 'GET' ) {
    if( req.url === '/' ) {
      // serve static index.html
      httpHelpers.serveAssets('index.html')
        .then(function(asset) {
          sendResponse(res, 200, 'text/html', asset);
        })
        .catch(function(error) {
          console.error("Error serving index.html: ", error);
          serverError(res, error);
        });
    } else if( req.url === '/styles.css' ) {
      httpHelpers.serveAssets('styles.css') 
        .then(function(stylesheet) {
          sendResponse(res, 200, 'text/css', stylesheet);
        })
        .catch(function(error) {
          console.error("Error serving css: ", error);
          serverError(res, error);
        });
    } else if( req.url === '/loading' ) {
      serveLoadingPage(res);
    } else {
      // check if GET request is looking for archived site
      // parse the request path, then remove the leading forward-slash
      // http://localhost:8080/www.google.com -> www.google.com
      var parsedUrl = url.parse(req.url).path.substr(1);

      archive.isUrlInList(parsedUrl)
        .then(function(urlInList) {
          // if it is listed in sites.txt
          if( urlInList === true ) {
            console.log('Listed in sites.txt...');
            // check if it's archived yet
            archive.isUrlArchived(parsedUrl)
              .then(function(archived) {
                if( archived === true ) {
                  console.log('and is archived.');

                  // Serve the archived site
                  archive.readArchivedUrl(parsedUrl)
                    .then(function(archivedSite) {
                      console.log('Responding with archived site!');
                      sendResponse(res, 200, 'text/html', archivedSite);
                    }) 
                    .catch(function(error) {
                      console.error('Error getting archived site: ', error);
                      serverError(res, error);
                    });

                } else if( archived === false ) {
                  console.log('but is not yet archived.');
                  serveLoadingPage(res);
                }
              })
              .catch(function(error) {
                console.error('Error checking if URL is archived: ', error);
              })

          } else if( urlInList === false ) {
            sendResponse(res, 404, null, null);
          } 
        })
        .catch(function(error) {
          console.error('Error checking sites.txt for URL: ', error);
          serverError(res, error);
        });
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
        .then(function(urlInList) {
          // if it has been added to sites.txt
          if( urlInList === true ) {
            // check to see if it's been archived yet
            archive.isUrlArchived( requestedUrl )
              .then(function(hasBeenArchived) {
                // if it has been archived
                if( hasBeenArchived === true ) {
                  console.log("Redirecting to archived site.");
                  // redirect to the archived site
                  res.statusCode = 302;
                  res.setHeader("Location",  '/' + requestedUrl );
                  res.end();
                  // site hasn't been archived, but is added to sites.txt
                } else if( hasBeenArchived === false ) {
                  // serve the loading page
                  res.statusCode = 302;
                  res.setHeader("Location", "/loading")
                  res.end();
                }      
              })
              .catch(function(error) {
                console.error('Error checking if URL is archived', error);
                serverError(res, error);
              });
          // otherwise, not in sites.txt yet
          } else if( urlInList === false ) {
            // add it to sites.txt to be archived by the next cronjob
            archive.addUrlToList(requestedUrl)
              .then(function(success) {
                console.log(success);
                res.statusCode = 302;
                res.setHeader("Location", "/loading")
                res.end();
              })
              .catch(function(error) {
                console.error('Error adding URL to sites.txt for URL: ', error);
                serverError(res, error);
              });
          }
            // redirect to loading page
        })
        .catch(function(error) {
          console.error('Error checking sites.txt for URL: ', error);
          serverError(res, error);
        });
    })
  }
};

var sendResponse = function(res, code, contentType, data) {
  res.writeHead(code, contentType);
  res.end(data);
};

var serverError = function(res, error) {
  res.writeHead(500, 'text/plain');
  res.end(error);
};

var serveLoadingPage = function(res) {
  httpHelpers.serveAssets('loading.html')
    .then(function(asset) {
      sendResponse(res, 200, 'text/html', asset);
    })
    .catch(function(error) {
      console.error("Error serving loading.html: ", error);
      serverError(res, error);
    });
};