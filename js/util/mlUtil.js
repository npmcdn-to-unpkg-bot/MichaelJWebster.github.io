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

    mu.createGDGraph = function(divId, lr) {
	var gdg = {};
	gdg.divId = divId;
	gdg.lr = lr;

	gdg.parent = $(gdg.divId);

	// Try and find a reasonable height for the chart from the parent dimensions.
	gdg.pWidth = gdg.parent.width();
	// Use ratio 1:1
	gdg.pHeight = gdg.pWidth;
	gdg.parent.height(gdg.pHeight);

	// Add the svg element.
	gdg.svg = d3.select(gdg.divId)
	    .append("svg");
	gdg.svg.attr("width", gdg.pWidth)
	    .attr("height", gdg.pHeight);

	gdg.createAxes = function() {
	    gdg.minCost = _.reduce(gdg.costVals, function(memo, x) {
		if (x < memo) {
		    return x;
		}
		else {
		    return memo;
		}
	    }, Number.MAX_SAFE_INTEGER);

	    gdg.maxCost = _.reduce(gdg.costVals, function(memo, x) {
		if (x > memo) {
		    return x;
		}
		else {
		    return memo;
		}
	    }, Number.MIN_SAFE_INTEGER);
	    gdg.xScale = d3.scaleLinear()
		.domain([0, gdg.costVals.length])
		.range([gdg.pWidth/10, 0.9 * gdg.pWidth])
		.nice();

	    gdg.yScale = d3.scaleLinear()
		.domain([gdg.minCost, gdg.maxCost])
		.range([0.9 * gdg.pHeight, gdg.pHeight/10])
		.nice();
	    
	    gdg.xAxis = d3.axisBottom();
	    gdg.xAxisScale = d3.scaleLinear()
		.domain([0, gdg.costVals.length])
		.range([gdg.pWidth/10, 0.9 * gdg.pWidth])
		.nice();
	    gdg.xAxis.scale(gdg.xAxisScale);
	    
	    gdg.yAxis = d3.axisLeft();
	    gdg.yAxisScale = d3.scaleLinear()
		.domain([gdg.minCost, gdg.maxCost])
		.range([gdg.yScale(gdg.minCost), gdg.yScale(gdg.maxCost)])
		.nice();
	    gdg.yAxis.scale(gdg.yAxisScale);

	    gdg.svg.append("g")
		.attr("id", "gdXAxis")
		.attr("class", "axis")
		.attr("transform", "translate(0 " + gdg.yScale(gdg.minCost) + ")")
		.call(gdg.xAxis);

	    gdg.svg.append("text")
	    	.attr("x", (gdg.xScale((gdg.costVals.length)/3)))
		.attr("y", (gdg.yScale(gdg.minCost)) + 40)
		.attr("fill", "black")
		.text("Number of iterations");

	    gdg.svg.append("g")
		.attr("id", "gdYAxis")
		.attr("class", "axis")
		.attr("transform", "translate(" + gdg.xScale(0) + " 0)")
		.call(gdg.yAxis);

	    gdg.svg.append("text")
		.attr("x", -20)
		.attr("y", 0)
		.attr("fill", "black")
		.text("Cost with respect to theta.")
		.attr("transform", function() {
		    var xlate = " translate(" + (gdg.xScale(0) - 45) + " " +
			    (1.2 * (gdg.pHeight / 2)) + ")";
		    var rot = " rotate(-90)";
		    return xlate + rot;
		});
	    
	};

	var lineFunction = d3.line()
		.x(function(d, idx) {
		    return gdg.xScale(idx);
		})
		.y(function(d) { return gdg.yScale(d); });
	    //.interpolate('basis');
	
	gdg.createGradDescentGraph = function(cVals) {
	    var path = gdg.svg.append('path')
		    .attr('d', lineFunction(cVals))
		    .attr('stroke-weight', '2px')
		    .attr("stroke", "blue")
		    .attr('fill', 'none');

	};

	gdg.runGradDescent = function(numIterations) {
	    var costs = gdg.lr.runRegression(numIterations, true);
	    return costs;
	};

	gdg.addInfo = function() {
	    gdg.svg.append("text")
		.attr("x", gdg.pWidth/3)
		.attr("y", gdg.pHeight/10)
		.attr("fill", "black")
		.text("Max Cost = " + gdg.maxCost.toFixed(2) + "   Min Cost = " + gdg.minCost.toFixed(2));

	    var t0 = gdg.lr.theta.get(0,0);
	    var t1 = gdg.lr.theta.get(1,0);
	    var t2 = gdg.lr.theta.get(2,0);
	    
	      gdg.svg.append("text")
		.attr("x", gdg.pWidth/3)
		.attr("y", 2 * gdg.pHeight/10)
		.attr("fill", "black")
		.text("Theta = [" + t0.toFixed(4) + ", " + t1.toFixed(4) + ", " + t2.toFixed(4) + "]");
	};
	
	gdg.costVals = gdg.runGradDescent(50);
	gdg.createAxes();
	gdg.createGradDescentGraph(gdg.costVals);
	gdg.addInfo();
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
	

	cl.createScatter = function(gId, dsets) {
	    // Create the top g element under which all the scatter plot data will
	    // go and be displayed, and under that a group for each dataset.
	    var top = d3.select(gId + " svg")
		    .append("g")
		    .attr("id", "ScatterElements")
	    	    .selectAll("g")
		    .data(dsets)
		    .enter()
		    .append("g")
		    .attr("id", function(d) {
			return d.dataNameShort.replace(/\s/g, "");
		    });


	    // Create a top level group for each dataset passed in dsets.
	    var dataGroups = top.selectAll("g")
		    .data(function(d) {
			return d.dataSet;
		    })
		    .enter()
		    .append("g")
		    .attr("id", function(d) {
			return d.shortLabel.replace(/\s/g, "");
		    });

	    var subGroups = dataGroups.selectAll("g")
		    .data(function(d) {
			return d.d;
		    })
		    .enter()
		    .append(function(d, i) {
			if (i == 0) {
			    cl.currentColourNum = cl.currentColourNum + 1;
			}
			var x = d.Father;
			var y = d.Height;
			return cl.colourShapeCombos[cl.currentShape](x, y, cl.xScale, cl.yScale);
		    });
	};

	cl.createControls = function() {
	    cl.menuParent = $(mId);
	    var ds1ButtonLabel = dset1.dataNameShort;
	    var ds1CheckLabels =
		    _.flatten(_.pluck(dset1.dataSet, 'shortLabel'));
	    var ds2ButtonLabel = dset2.dataNameShort;
	    var ds2CheckLabels =
		    _.flatten(_.pluck(dset2.dataSet, 'shortLabel'));

	    function addControls(bLabel, cbLabels) {
		var mainButton = d3.select(cl.mId)
			.append("button")
			.attr("type", "button")
			.attr("class", "btn btn-primary chart-selector-button active")
			.text(bLabel)
			.data([bLabel])
			.on("click", menuMainHandleClicks);

		var currentDiv = d3.select(cl.mId).append("div")
			.attr("class",  "btn-group-vertical spaced-vertical")
			.attr("role", "group");
		
		var labels = currentDiv.selectAll("label")
			.data(cbLabels)
			.enter()
			.append("label")
			.attr("class", "checkbox");

		labels.each(function(d, i) {
		    var text = document.createTextNode(d);
		    var ip = document.createElement("input");
		    ip.setAttribute("type", "checkbox");
		    ip.setAttribute("id", d);
		    ip.checked = true;
		    this.appendChild(ip);
		    this.appendChild(text);
		});

		labels.selectAll("input")
		    .data(function(d) { return [d]; })
		    .on("click", menuCheckboxHandleClicks);

		$(mainButton).click();
	    }
	    addControls(ds1ButtonLabel, ds1CheckLabels);
	    addControls(ds2ButtonLabel, ds2CheckLabels);
	};

	function menuMainHandleClicks(datum) {
	    var el = $("#" + datum.replace(/\s/g, ""));
	    if ($(this).hasClass("active")) {
		$(this).removeClass("active");
		$(this).removeClass("btn-primary");
		$(this).addClass("btn-default");
		$(el).attr("display", "none");
	    }
	    else {
		$(this).addClass("active");
		$(this).removeClass("btn-default");
		$(this).addClass("btn-primary");
		$(el).attr("display", "inline");		
	    }
	};

	function menuCheckboxHandleClicks(datum) {
	    var id = datum.replace(/\s/g, "");
	    if (this.checked) {
		$("#" + id).attr("display", "inline");
	    }
	    else {
		$("#" + id).attr("display", "none");
	    }	    
	};

	cl.createAxes = function() {
	    cl.xScale = d3.scaleLinear()
		.domain([bounds.minP, bounds.maxP])
		.range([cl.pWidth/10, 0.9 * cl.pWidth])
		.nice();

	    cl.yScale = d3.scaleLinear()
		.domain([bounds.minH, bounds.maxH])
		.range([0.9 * cl.pHeight, cl.pHeight/10])
		.nice();

	    cl.xAxis = d3.axisBottom();
	    cl.xAxisScale = d3.scaleLinear()
		.domain([bounds.minP, bounds.maxP])
		.range([cl.xScale(bounds.minP), cl.xScale(bounds.maxP)])
		.nice();
	    cl.xAxis.scale(cl.xAxisScale);

	    cl.yAxis = d3.axisLeft();
	    cl.yAxisScale = d3.scaleLinear()
		.domain([bounds.minH, bounds.maxH])
		.range([cl.yScale(bounds.minH), cl.yScale(bounds.maxH)])
		.nice();
	    cl.yAxis.scale(cl.yAxisScale);

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
	var svgns = "http://www.w3.org/2000/svg";
	cl.currentShape = 0;
	cl.colourShapeCombos = [
	    function(x, y, xScale, yScale) {
		var colour = cl.colours[cl.currentColourNum];
		var c = document.createElementNS(svgns, "circle");
		c.setAttribute("cx", xScale(x));
		c.setAttribute("cy", yScale(y));
		c.setAttribute("fill", colour);
		c.setAttribute("r", 2);
		return c;
	    },
	    function(x, y, xScale, yScale) {
		var colour = cl.colours[cl.currentColourNum];
		var c = document.createElementNS(svgns, "rect");
		c.setAttribute("x", xScale(x) - 1.5);
		c.setAttribute("y", yScale(y) - 1);
		c.setAttribute("width", 3);
		c.setAttribute("height", 2);
		c.setAttribute("fill", colour);
		return c;		
	    }
	];
	
	+function initColours()
	{
	    cl.colours =
		    ['rgb(142,1,82)','rgb(197,27,125)','rgb(50,119,174)',
		     'rgb(241,22,12)','rgb(153,124,239)','rgb(47,247,147)',
		     'rgb(115,45,103)','rgb(184,225,134)','rgb(127,188,65)',
		     'rgb(77,146,33)','rgb(39,100,25)', 'rgb(165,0,38)',
		     'rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)',
		     'rgb(154,224,144)','rgb(255,255,19)','rgb(224,24,248)',
		     'rgb(171,217,233)','rgb(116,173,209)','rgb(69,117,180)',
		     'rgb(49,54,149)', 'rgb(84,48,5)','rgb(140,81,10)',
		     'rgb(191,129,45)','rgb(223,194,125)','rgb(46,232,195)',
		     'rgb(90,10,49)','rgb(199,234,229)','rgb(128,205,193)',
		     'rgb(53,151,143)','rgb(1,102,94)','rgb(0,60,48)'
		    ];

	    cl.currentColourNum = -1;
	}();

	cl.createAxes();
	cl.createScatter(cl.gId, [dset1, dset2]);
	cl.createControls();
	
    };

    function getBounds(d1, d2) {
	var d1_data = _.flatten(_.pluck(d1.dataSet, 'd'));
	var d2_data = _.flatten(_.pluck(d2.dataSet, 'd'));
	var maxParent = Number.MIN_SAFE_INTEGER;
	var minParent = Number.MAX_SAFE_INTEGER;
	var maxHeight = Number.MIN_SAFE_INTEGER;
	var minHeight = Number.MAX_SAFE_INTEGER;	
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
