// Setup requirejs to find modules, both ours, and external ones.
requirejs.config({
    baseUrl : 'js',
    paths: {
	jquery: '../bower_components/jquery/dist/jquery.min',
	d3: '../bower_components/d3/d3.min',
	underscore: '../bower_components/underscore/underscore-min'
    }
});

// Start loading the main app from
requirejs(['app', 'jquery', 'd3', 'underscore'], function(app, $, d3, _) {
    console.log("D3 is at version: " + d3.version);
});
