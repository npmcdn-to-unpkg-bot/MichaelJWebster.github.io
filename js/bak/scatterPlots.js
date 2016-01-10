define(["require"], function(require) {
    'use strict';
    var sp = {};
    //var d3 = require(d3);
    //var _us = require("underscore.min");

    sp.csvData = {};

    sp.loadCsv = function(csv_file)
    {
	d3.csv(csv_file, function(d)
	       {
		   if (d == null)
		   {
		       console.log("d3.csv returned null.");
		   }
		   else
		   {
		       sp.processData(d);
		   }
	       });
    };

    sp.processData = function(d)
    {
	sp.csvData = d;
    };
    
    return sp;
});
