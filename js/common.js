// Setup requirejs to find modules, both ours, and external ones.
requirejs.config({
    baseUrl : '../js',
    paths: {
	jquery: '../bower_components/jquery/dist/jquery.min',
	d3: '../bower_components/d3/d3.min',
	underscore: '../bower_components/underscore/underscore-min',
	linReg: 'linReg/linReg'
    }
});

requirejs(['jquery', 'd3', 'underscore'], function($, d3, _) {
});
