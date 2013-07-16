var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

var fname = "index.html";
var fi = fs.readFileSync(fname);
var htmlstr = fi.toString('utf-8');

var fnametest = "test.html";
var fitest = fs.readFileSync(fnametest);
var teststr = fitest.toString('utf-8');

var fnametesthero = "test-hero.html";
var fitest = fs.readFileSync(fnametesthero);
var testherostr = fitest.toString('utf-8');


app.get('/', function(request, response) {
  response.send(htmlstr);
});

app.get('/test.html', function(request, response) {
  response.send(teststr);
});

app.get('/test-hero.html', function(request, response) {
  response.send(testherostr);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
