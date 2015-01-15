// eventually, you'll have some code here that uses the code in `archive-helpers.js`
// to actually download the urls you want to download.
var archiveHelpers = require('../helpers/archive-helpers');
var fs = require('fs');
var Q = require('q');

exports.fetch = function() {
  var deferred = Q.defer();

  console.log('message');
  archiveHelpers.downloadUrls()
    .then(function(numberOfDownloads) {
      var date = new Date();
      var logMessage = date + ": " + numberOfDownloads + " downloads" + "\n";
      // log that download occurred
      fs.appendFile('cronlog.txt', logMessage, function(writeError) {
        if(writeError) {
          console.error('Error writing to cronlog: ', writeError);
        } else {
          console.log('Successfully downloaded URLs. Check cronlog.txt for a summary.');
        }
      });
    
      deferred.resolve(logMessage);
    })
    .catch(function(error) {
      var date = new Date();
      var logMessage = date + ": " + error + "\n";
      fs.appendFile('cronlog.txt', logMessage, function(writeError) {
        if(writeError) {
          console.error('Error writing to cronlog: ', writeError);
        }
      });

      deferred.reject(error);
    });
  
  return deferred.promise;
}

