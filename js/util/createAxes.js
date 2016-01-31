if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}


define(function(require, exports, module) {

    var d3 = require("d3");
    var _ = require("underscore");
    const svgns = "http://www.w3.org/2000/svg";

    /**
     * If we have a rectanglular svg element of width and height, and we want to
     * place the origin at origin.x from the left, and origin.y from the bottom,
     * then the leftmost x in the viewbox is -origin.x, and the bottomMost is
     * at -origin.y;
     * Note: origin has fields as follows:
     * origin = {
     *               x: lefthandside of the entire svg element.
     *               y: bottom of the entier svg element.
     *               xStart: Starting point for drawing X.
     *               yStart: Starting point for darwing Y.
     * };
     */
    var svgEl = function(origin, width, height, svgId) {
	this.originX = origin.x;
	this.originY = origin.y;
	this.originStartX = origin.startX;
	this.originStartY = origin.startY;
	this.width = width;
	this.height = height;
	this.id = svgId;
	var sel = this.sEl = document.createElementNS(svgns, "svg");
	sel.setAttribute("id", svgId);
	sel.setAttribute("width", width);
	sel.setAttribute("height", height);
	//sel.setAttribute("viewbox", "" + -origin.x + " " + -origin.y + " " + width + " " + height);
	sel.setAttribute("viewbox", "0 0 " + width + " " + height);
	
	var mainGroup = this.mainGroup = document.createElementNS(svgns, "g");
	sel.appendChild(mainGroup);
	//mainGroup.setAttribute("transform", "scale(1.0, -1.0)");
	this.createAxes();
	return this;
    };

    svgEl.prototype = {
	constructor: svgEl,

	createAxes: function() {
	    this.xAxis = d3.svg.axis();
	    var startX = this.originX - this.originStartX; 
	    this.xAxisScale = d3.scale.linear()
		.domain([-this.originStartX, this.originStartX])
		.range([startX, startX + 2 * this.originStartX])
		.nice();
	    this.xAxis.scale(this.xAxisScale);
	    this.xAxis.orient("bottom");

	    var startY = this.originY - this.originStartY;
	    this.yAxis = d3.svg.axis();
	    this.yAxisScale = d3.scale.linear()
		.domain([-this.originStartY, this.originStartY])
		.range([startY + 2 * this.originStartY, startY])
		.nice();
	    this.yAxis.scale(this.yAxisScale);
	    this.yAxis.orient("left");

	    d3.select(this.mainGroup)
		.append("g")
		.attr("id", this.id + "_xAxis")
		.attr("class", "axis")
		.attr("transform", "translate(0 " + this.yAxisScale(0) + ")")
		.call(this.xAxis);

	    d3.select(this.mainGroup)
		.append("g")
		.attr("id", this.id + "_yAxis")
		.attr("class", "axis")
		.attr("transform", "translate(" + this.xAxisScale(0) + " 0)")
		.call(this.yAxis);
	    
	}
    };

    
    module.exports = svgEl;

});
