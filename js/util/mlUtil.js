define(["jquery", "d3", "underscore"], function($, d3, _) {
    var mu = {};

    /**
     * Shuffle the data d into a new copy of d randomly shuffled.
     *
     * @param d      An arra or other type of collection to be shuffled.
     *
     * @returns A version of d that has been shuffled using underscore's
     *          implementation.
     */
    mu.shuffleData = function(d) {
	return _.shuffle(d);
    };

    mu.divideData = function(d, proportions) {
	var divided = [];
	var numPortions = _.reduce(proportions, function(memo, val) {
	    return memo + Number(val);
	}, 0);
	var currentStart = 0;
	for (var i = 0; i < proportions.length; i++) {
	    var portionSize = Math.ceil(d.length * proportions[i]/ numPortions);	    
	    var nextPortion = d.slice(currentStart, currentStart + portionSize);
	    divided.push(nextPortion);
	    currentStart += portionSize;
	}
	return divided;
    };

    mu.createScatterPlots = function(mId, gId, dset1, dset2, xlabel, ylabel) {
	var cl = {};
	cl.mId = mId;
	cl.gId = gId;
	//cl.dset1 = dset1;
	//cl.dset2 = dset2;
	// We want to get maximum values of parent height for scaling the x
	// axis, and maximum value of height to scale the y-axis.
	var bounds = getBounds(dset1, dset2);

	cl.parent = $(cl.gId);

	// Try and find a reasonable height for the chart from the parent dimensions.
	cl.pWidth = cl.parent.width();
	// Try a slightly better ratio.
	cl.pHeight = cl.pWidth * (5.0 / 8.0);
	cl.parent.height(cl.pHeight);

	// Add the svg element.
	cl.svg = d3.select(cl.gId)
	    .append("svg");
	cl.svg.attr("width", cl.pWidth)
	    .attr("height", cl.pHeight);

	cl.createControls = function() {
	    cl.menuParent = $(mId);
	    var ds1ButtonLabel = dset1.dataNameShort;
	    var ds1CheckLabels =
		    _.flatten(_.pluck([dset1.main].concat(dset1.secondary), 'shortLabel'));
	    var ds2ButtonLabel = dset1.dataNameShort;
	    var ds2CheckLabels =
		    _.flatten(_.pluck([dset2.main].concat(dset2.secondary), 'shortLabel'));

	    function addControls(bLabel, cbLabels) {
		var currentEl = d3.select(cl.mId)
			.append("span")
			.append("button")
			.attr("type", "button")
			.attr("class", "btn btn-default btn-sm")
			.text(bLabel);
		// need to add a handler here.
		var button1 = d3.select(cl.mId + " button");
		var spans = d3.selectAll(cl.mId + " span")[0];
		var currentSpan = _.last(spans);
		var labels = d3.select(currentSpan)
			.append("div")
			.attr("class", "btn-group")
			.attr("data-toggle", "buttons")
			.selectAll("label")
			.data(cbLabels)
			.enter()
			.append("label")
			.attr("class", "checkbox-inline")
			.text(function(d) { return d;})
			.insert("input")
			.attr("type", "checkbox")
			.attr("class", "clear-checkbox")		    
			.attr("value", "");

		/*labels.append("input")
		    .attr("type", "checkbox")
		    .attr("class", "clear-checkbox")		    
		    .attr("value", "");*/

		//.attr("class", "btn btn-primary btn-sm")
		$(button1).click();
	    }
	    addControls(ds1ButtonLabel, ds1CheckLabels);
	    addControls(ds2ButtonLabel, ds2CheckLabels);
	};

	cl.createAxes = function() {
	    cl.xScale = d3.scale.linear()
		.domain([bounds.minP, bounds.maxP])
		.range([cl.pWidth/10, 0.9 * cl.pWidth])
		.nice();

	    cl.yScale = d3.scale.linear()
		.domain([bounds.minH, bounds.maxH])
		.range([0.9 * cl.pHeight, cl.pHeight/10])
		.nice();

	    cl.xAxis = d3.svg.axis();
	    cl.xAxisScale = d3.scale.linear()
		.domain([bounds.minP, bounds.maxP])
		.range([cl.xScale(bounds.minP), cl.xScale(bounds.maxP)])
		.nice();
	    cl.xAxis.scale(cl.xAxisScale);
	    cl.xAxis.orient("bottom");

	    cl.yAxis = d3.svg.axis();
	    cl.yAxisScale = d3.scale.linear()
		.domain([bounds.minH, bounds.maxH])
		.range([cl.yScale(bounds.maxH), cl.yScale(bounds.minH)])
		.nice();
	    cl.yAxis.scale(cl.yAxisScale);
	    cl.yAxis.orient("left");

	    cl.svg.append("g")
		.attr("id", "scatterXAxis")
		.attr("class", "axis")
		.attr("transform", "translate(0 " + cl.yScale(bounds.minH) + ")")
		.call(cl.xAxis);

	    cl.svg.append("text")
	    	.attr("x", (cl.xScale(bounds.minP + (bounds.maxP - bounds.minP)/3)))
		.attr("y", (cl.yScale(bounds.minH)) + 40)
		.attr("fill", "black")
		.text(xLabel);

	    cl.svg.append("g")
		.attr("id", "scatterYAxis")
		.attr("class", "axis")
		.attr("transform", "translate(" + cl.xScale(bounds.minP) + " 0)")
		.call(cl.yAxis);

	    cl.svg.append("text")
		.attr("x", -20)
		.attr("y", 0)
		.attr("fill", "black")
		.text(yLabel)
		.attr("id", "yAxisLabel")	    
		.attr("transform", function() {
		    var xlate = " translate(" + (cl.xScale(bounds.minP) - 30) + " " +
			    (1.2 * (cl.pHeight / 2)) + ")";
		    var rot = " rotate(-90)";
		    return xlate + rot;
		});
	    
	};
	cl.createAxes();
	cl.createControls();
    };

    function getBounds(d1, d2) {
	var d1_data_array = [d1.main].concat(d1.secondary);
	var d1_data = _.flatten(_.pluck(d1_data_array, 'd'));
	var d2_data_array = [d2.main].concat(d2.secondary);
	var d2_data = _.flatten(_.pluck(d2_data_array, 'd'));
	var maxParent = Number.MIN_VALUE;
	var minParent = Number.MAX_VALUE;
	var maxHeight = Number.MIN_VALUE;
	var minHeight = Number.MAX_VALUE;	
	_.each(d1_data.concat(d2_data), function(val) {
	    var maxp = val.Father > val.Mother ? val.Father : val.Mother;
	    var minp = val.Father < val.Mother ? val.Father : val.Mother;
	    maxParent = maxp > maxParent ? maxp : maxParent;
	    minParent = minp < minParent ? minp : minParent;
	    maxHeight = val.Height > maxHeight ? val.Height : maxHeight;
	    minHeight = val.Height < minHeight ? val.Height : minHeight;
	});
	return { maxP: maxParent, minP: minParent, maxH : maxHeight, minH : minHeight};
    };
    
    return mu;
});
