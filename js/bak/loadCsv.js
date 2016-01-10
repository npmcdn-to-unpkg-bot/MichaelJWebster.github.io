/**
 * Test the use of d3.csv.
 */
var exports = module.exports = {};
'use strict';
var _us = require("underscore");
var d3 = require('d3');


var fName = 'http://www.grendel.com/MergedOECDData.csv';

exports.data = {};

var handleCsv = function(d) {
    if (d == null) {
	console.log("Error in handleCsv - got null in callback.");
    }
    else {
	exports.data = d;
    }
};

exports.getCsv = function() {
    d3.csv(fName, handleCsv);
};


