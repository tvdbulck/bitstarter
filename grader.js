#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('./lib/restler.js');

var HTMLFILE_DEFAULT = "index.html";
var URL_DEFAULT = "";
var CHECKSFILE_DEFAULT = "checks.json";
var tmpResultFile = "result.tmp.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(url) {
    return url;
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};


var checkUrl = function(url, checksfile) {
    var r = restlerUrl(url);
    //console.log(r);
    if(flgUrlFileWritten) {
	return checkHtmlFile(tmpResultFile, checksfile);
    }
    else {
	while(!flgUrlFileWritten) {
	    console.log("waiting for file to be written ...");
	    sleep(500);
	}
	return checkHtmlFile(tmpResultFile, checksfile);
    }
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

// crappy code, cannot handle multiple function calls properly
var flgUrlFileWritten = false;
var restlerUrl = function(url) {
    flgUrlFileWritten = false;
    console.log("calling restler for url "+url);
    var r = restler.get(url).on('complete', function(data) {
	console.log("succes, start writing file now...");
        fs.writeFileSync(tmpResultFile, data);
	console.log("file is written...");
	flgUrlFileWritten = true;
    });
    return r;
}

var sleep = function(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Url path to html file', clone(assertUrlExists), URL_DEFAULT)
        .parse(process.argv);
    var checkJson = [];
    if(program.url) {
	console.log("URL: "+program.url);
	checkJson = checkUrl(program.url, program.checks);
    }
    else {
	checkJson = checkHtmlFile(program.file, program.checks);
    }
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
