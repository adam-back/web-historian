// eventually, you'll have some code here that uses the code in `archive-helpers.js`
// to actually download the urls you want to download.
var archiveHelpers = require('../helpers/archive-helpers');
var fs = require('fs');
var Q = require('q');

exports.fetch = function() {
  var deferred = Q.defer();

  archiveHelpers.downloadUrls()
    .then(function() {
      writeToCronlog('ran cronjob.')
        .then(function(message) {
          deferred.resolve(message);
        })
        .catch(function(error) {
          deferred.resolve('Successfully ran cronjob, but error writing to cronlog.txt: ', error);
        });
    })
    .catch(function(error) {
      writeToCronlog(error)
        .then(function(message) {
          deferred.reject(message);
        })
        .catch(function(error) {
          deferred.reject('Unsuccessfully ran cronjob AND error writing to cronlog.txt: ', error);
        })
    });
  
  return deferred.promise;
}

var writeToCronlog = function(message) {
  var deferred = Q.defer();

  var date = new Date();
  message = date.toString() + ': ' + message + '\n';

  fs.appendFile('cronlog.txt', message, function(writeError) {
    if( writeError ) {
      deferred.reject(writeError);
    } else {
      deferred.resolve(message);
    }
  });

  return deferred.promise;
};
