// eventually, you'll have some code here that uses the code in `archive-helpers.js`
// to actually download the urls you want to download.
var http = require('http');

exports.archiveUrl = function(url) {
  var options = {
    host: url,
    path: '/index.html'
  };

  var data = '';

  http.get(options, function(res) {
    console.log("Got response: " + res.statusCode);
  })
  .on('data', function(chunk) {
    data += chunk;
  })
  .on('end', function() {
    fs.writeFile(url, data, function(error) {
      if(error) {
        console.error('Error archiving url', error);
      } else {
        console.log('Successfully archived ' + url + '!');
      }
    });
  })
  .on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};