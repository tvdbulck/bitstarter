var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

var fname = "index.html";

var fi = fs.readFileSync(fname);
var htmlstr = fi.toString('utf-8');


app.get('/', function(request, response) {
  response.send(htmlstr);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
