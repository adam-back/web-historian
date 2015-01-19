var http = require("http");
var handler = require("./request-handler");
var initialize = require("./initialize.js");
var CronJob = require("cron").CronJob;
var htmlfetcher = require('../workers/htmlfetcher').fetch;
// Why do you think we have this here?
// HINT:It has to do with what's in .gitignore
initialize();

var port = 8080;
var ip = "127.0.0.1";
var server = http.createServer(handler.handleRequest);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);


var archiveJob = new CronJob('* * * * *', function() {
  // every minute
  // archive URLs
  htmlfetcher()
    .then(function(success) {
      console.log(success);
    })
    .catch(function(error) {
      console.error(error);
    });

})
  .start();