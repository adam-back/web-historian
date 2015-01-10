var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Q = require('q');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  'siteAssets' : path.join(__dirname, '../web/public'),
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for jasmine tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

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
      if( list.search(target) !== null ) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    })
    .catch(function(error) {
      console.log('Error reading list of URLS', error);
    });

  return deferred.promise;
};

exports.addUrlToList = function(){
};

exports.isUrlArchived = function(target){
  // search /sites for url 
    // if successful
      // readArchivedUrl
    // if not
      // return false
};

exports.readArchivedUrl = function(target){

}

exports.downloadUrls = function(){
};
