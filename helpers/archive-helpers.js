var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Q = require('q');
var http = require('http-request');


/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  'siteAssets' : path.join(__dirname, '../web/public'),
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, './../archives/sites.txt')
};

// Used for stubbing paths for jasmine tests, do not modify
// Modified to my own suiting :-)
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

exports.readListOfUrls = function(){
  var deferred = Q.defer();

  fs.readFile(this.paths.list, 'utf-8', function(error, data) {
    if( error ) {
      deferred.reject(error);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};

exports.isUrlInList = function(target){
  var deferred = Q.defer();
  
  this.readListOfUrls()
    .then(function(list) {
      // if the target Url can be found
      if( list.search(target) !== -1 ) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    })
    .catch(function(error) {
        deferred.reject(error);
    });

  return deferred.promise;
};

exports.addUrlToList = function(url){
  var deferred = Q.defer();

  // Append URL and newline to sites.txt
  fs.appendFile(this.paths.list, url + '\n', function(error) {
    if( error ) {
      deferred.reject(error);
    } else {
      deferred.resolve('Successfully added URL to list.');
    }
  })

  return deferred.promise;
};

exports.isUrlArchived = function(target){
  var deferred = Q.defer();

  // search /sites for URL
  fs.readdir(this.paths.archivedSites, function(error, files) {
    // files is an array of files in the directory
    if( error ) {
      deferred.reject(error);
    } else {
      // look to see if url is already a file, meaning it is archived
      for (var i = 0; i < files.length; i++) {

        if( files[i] === target ) {
          deferred.resolve(true);
          break;
        }
      };
      deferred.resolve(false);
    }
  }); 

  return deferred.promise;
};

exports.readArchivedUrl = function(target){
  // Read the archived Url then give the data for serving
  var deferred = Q.defer();

  fs.readFile(this.paths.archivedSites + '/' + target, 'utf-8', function(error, data) {
    if( error ) {
      deferred.reject(error);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};

exports.downloadUrls = function(){
  var deferred = Q.defer();

  var numberOfDownloads = 0;
  // read list of urls
  this.readListOfUrls()
    .then(function(data) {
      // create an array of the urls
      var urls = data.split('\n');
      // get rid of empty newline character
      urls.pop();
      // loop through list
      urls.forEach(function(url) {
        // check if url is archived
        exports.isUrlArchived(url)
          .then(function(urlHasBeenArchived) {
            // if it isn't yet
            if( urlHasBeenArchived === false ) {
              // archive it
              exports.archiveUrl(url)
                .then(function(success) {
                  console.log('Successfully archived ' + url + '!');
                  numberOfDownloads++;
                })
                .catch(function(error) {
                  console.error('Error archiving ' + error + '.');
                });
            }
          })
          .catch(function(error) {
            console.error('Error checking if URL is archived: ' + error);
          });
      });
    })
    .then(function() {
      deferred.resolve(numberOfDownloads);
    })
    .catch(function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
};

exports.archiveUrl = function(url) {
  var deferred = Q.defer();
  var unmodifiedURL = url;

  // First try index.html
  http.get({
    url: unmodifiedURL + '/index.html',
    progress: function(current, total) {
      console.log('downloaded %d bytes from %d', current, total);
    }}, './archives/sites/' + unmodifiedURL, function(error, res) {

      // Found index.html
      if( res ) {
        deferred.resolve(res.file);
      // Secondly try just the root
      } else if( error ) {

        http.get({
          url: unmodifiedURL + '/',
          progress: function(current, total) {
            console.log('downloaded %d bytes from %d', current, total);
          }}, './archives/sites/' + unmodifiedURL, function(error, res) {

          // Also not found
          if( error ) {
            // All hope is lost
            deferred.reject(unmodifiedURL);
          } else {
            deferred.resolve(res.file);
          }
        });
      }
  });

  return deferred.promise;
};
