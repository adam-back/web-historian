var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var Q = require('q');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

exports.serveAssets = function(asset) {
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...), css, or anything that doesn't change often.)
  var deferred = Q.defer();

  fs.readFile(archive.paths.siteAssets + '/' + asset, 'utf-8', function(error, assetFile) {
    if( error ) {
      deferred.reject(error);
    } else {
      deferred.resolve(assetFile);
    }
  });

  return deferred.promise;
};



// As you progress, keep thinking about what helper functions you can put here!
