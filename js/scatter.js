define(["jquery", "d3", "underscore"], function($, d3, _) {
    console.log("D3 version is: " + d3.version);
    sp = { greeting : "ScatterPlot v1.0"};

    /**
     * Populate the table tableId with the data supplied in csvFile.
     *
     * @param csvFile    The name of the csv file containing the data.
     * @param tableId    The id of the <table> element to populate.
     */
    sp.createTableFromCsv = function(csvFile, tableId)
    {
	sp.origData = {};

	/**
	 * Use the data in origData sorted by the key "sortBy" to create the table.
	 *
	 * @param error     If this function is performing as a callback for
	 *                  d3.csv, then error is the error returned if any.
	 * @param origData  The data as initially read from the csv file.
	 * @param sortBy    The name of a field to sort the data by.
	 */
	function handleData(error, origData, sortBy) {
	    sp.sortBy = typeof sortBy === 'undefined' ? "Gini Coefficient" : sortBy;

	    // Retain the data
	    sp.origData = origData;

	    // Empty the table
	    $("#" + tableId).empty();
	    // transpose data in d - ie. turn columns into rows.
	    sp.origData = origData;
	    sp.sorted = _.sortBy(sp.origData, function(el) {
		if (isNaN(el[sp.sortBy]))
		{
		    return el[sp.sortBy];
		}
		else
		{
		    return Number(el[sp.sortBy]);
		}
	    });
	    sp.tableObject = transpose(sp.sorted);
	    
	    $("#" + tableId).append("<table><thead><tr></tr></thead></table>");
	    var th = d3.select("#" + tableId + " tr")
		    .selectAll("th")
		    .data(d3.keys(sp.tableObject))
		    .enter()
		    .append("th")
		    .append("a")
		    .attr("href", "#")
		    .text(function(d) { return d;});

	    $("#" + tableId + " th a").on("click", resort);

	    $("#" + tableId + " table").append("<tbody></tbody>");
	    var tr = d3.select("#" + tableId + " tbody")
		    .selectAll("tr")
		    .data(sp.sorted)
		    .enter()
		    .append("tr");

	    var td = tr.selectAll("td")
		    .data(function(d) {
			return _.values(d);
		    })
		    .enter()
		    .append("td")
		    .text(function(d) { return d;});
	}

	/**
	 * Event handler that recreates the table sorted by the value of the
	 * element clicked on that invoked the event handler.
	 *
	 * @param event   The dom event.
	 */
	var resort = function(event) {
	    event.preventDefault();
	    var fieldName = event.target.textContent;
	    handleData(null, sp.origData, fieldName);
	};

	/**
	 * Return the transpose of d.
	 *
	 * @param d   An array of objects.
	 *
	 * @return An object with the fields from the objects in d mapped to
	 *         arrays of their values.
	 */
	function transpose(d)
	{
	    var table = {};
	    _.each(d[0], function(el, k) {
		table[k] = [];
	    });
	    _.each(d, function(data) {
		_.each(data, function(el, k) {
		    table[k].push(el);
		});
	    });
	    return table;
	}

	d3.csv(csvFile, handleData);
    };

    /**
     * Create an interactive scatter plot with the supplied data.
     *
     * @param csvFile    The name of the csv file containing the data.
     * @param tableId    The id of the <table> element to populate.
     */
    sp.createInteractiveScatterPlot = function(csvFile, menuId, chartId, xName, yName, labelField)
    {
	isp = {};
	isp.origData = {};
	isp.csvFile = csvFile;
	isp.menuId = menuId;
	isp.chartId = chartId;

	// Data field to be used for the X axis of the scatter plot.
	isp.currentX = xName;

	// Data field y value to be used for the Y-axis of the scatter plot.
	isp.currentY = yName;

	// Field with which we label the points in the scatter plot.
	isp.currentL = labelField;

	/**
	 * Use the data in origData sorted by the key "sortBy" to create the table.
	 *
	 * @param origData  The data as initially read from the csv file.
	 * @param sortBy    The name of a field to sort the data by.
	 */
	isp.createChart = function(origData, xName, yName, lName) {
	    isp.currentX = typeof xName === 'undefined' ? isp.currentX : xName;
	    isp.currentY = typeof yName === 'undefined' ? isp.currentY : yName;
	    isp.currentL = typeof lName === 'undefined' ? isp.currentL : lName;	    	    

	    // Set the original data field so we don't have to keep reading the
	    // csv file.
	    isp.origData = typeof origData === 'undefined' ? isp.origData : origData;

	    if (typeof isp.sorted === 'undefined')
	    {
		isp.sorted = _.sortBy(isp.origData, function(el) {
		    if (isNaN(el[isp.currentX]))
		    {
			return el[isp.currentX];
		    }
		    else
		    {
			return Number(el[isp.currentX]);
		    }
		});
	    }
	    
	    // get the values of the data for currentX, currnetY and currentL
	    // into an appropriate structure.
	    if (typeof isp.transposed === 'undefined')
	    {
		isp.transposed = transpose(isp.origData);
	    }

	    // Get data for the x, y and L fields.
	    var xData = isp.transposed[isp.currentX].map(Number);
	    var yData = isp.transposed[isp.currentY].map(Number);
	    var lData = isp.transposed[isp.currentL];

	    var fData = _.zip(xData, yData, lData);

	    var xBounds = getBounds(xData);
	    var yBounds = getBounds(yData);


	    var svgElId = "scatterPlot";
	    var svgEl = d3.select("#" + isp.chartId)
		    .append("svg")
		    .attr("id", svgElId);
	    
	    // Find the height of the parent element, and scale it according to the
	    // ratio 4:3
	    var parent = $("#" + isp.chartId);
	    var parWidth = parent.width();
	    var parHeight = parent.height();

	    parHeight = parWidth * (3.0/4.0);
	    parent.height(parHeight);
	    svgEl.attr("width", parWidth)
		.attr("height", parHeight);
	    svgEl.append("text")
		.attr("id", "countryLabel")
		.attr("x", "150")
		.attr("y", "60")
		.attr("style", "font-size: 80px; font-weight: bold; fill: rgb(221, 221, 221); opacity: 0;");

	    var leftMost = digitPrecisionOnBoundary(1.0 * xBounds.min, 2, 10, false);
	    var rightMost = digitPrecisionOnBoundary(1.0 * xBounds.max, 2, 10, true);
	    var bottomMost = digitPrecisionOnBoundary(0.8 * yBounds.min, 1, 10, false);
	    var topMost = digitPrecisionOnBoundary(1.0 * yBounds.max, 2, 10, true);
	    // Get x and y scales
	    var xScale = d3.scale.linear()
		    .domain([leftMost, rightMost])
		    .range([parWidth/10, 0.9 * parWidth])
		    .nice();
	    var yScale = d3.scale.linear()
		    .domain([bottomMost, topMost])
		    .range([0.9 * parHeight, parHeight/10])
		    .nice();
	    var ySizeScale = d3.scale.linear()
		    .domain([0, topMost])
		    .range([0, parHeight]);


	    // Add the axes:
	    var xAxis = d3.svg.axis();
	    
	    /*var xAxisScale = d3.scale.linear()
		    .domain([xBounds.min, xBounds.max])
	     .range([xScale(xBounds.min), xScale(xBounds.max)]);*/
	    var xAxisScale = d3.scale.linear()
		    .domain([leftMost, rightMost])
		    .range([xScale(leftMost), xScale(rightMost)]);
	    xAxis.scale(xAxisScale);
	    // Specifiy where xAxis labels appear
	    xAxis.orient("bottom");
	    
	    var yAxis = d3.svg.axis();
	    var yAxisScale = d3.scale.linear()
		    .domain([bottomMost, topMost])
	     .range([yScale(bottomMost), yScale(topMost)]);
	    
	    yAxis.scale(yAxisScale);
	    // Specify where the yAxis labels appear
	    yAxis.orient("left");

	    // Append the axes
	    svgEl.append("g")
		.attr("id", "scatterPlotXAxis")
		.attr("class", "axis")
		.attr("transform", "translate(0 " + yScale(bottomMost) + ")")
		.call(xAxis);
	    svgEl.append("text")
		.attr("x", (xScale(xBounds.min + (xBounds.max - xBounds.min)/2)))
		.attr("y", (yScale(bottomMost)) + 40)
		.attr("fill", "black")
		.text(isp.currentX);

	    svgEl.append("g")
	    	.attr("id", "scatterPlotYAxis")
		.attr("class", "axis")
		.attr("transform", "translate(" + (xScale(leftMost)) + " 0)")
		.call(yAxis);

	    svgEl.append("text")
		.attr("x", -20)
		.attr("y", 0)
		.attr("fill", "black")
		.text(isp.currentY)
		.attr("id", "yAxisLabel")	    
		.attr("transform", function() {
		    var xlate = " translate(" + (xScale(leftMost) - 30) + " " +
			    (1.2 * (parHeight / 2)) + ")";
		    var rot = " rotate(-90)";
		    return xlate + rot;
		});

	    var dataContainer = svgEl.append("g");

	    dataContainer.selectAll("circle")
		.data(fData)
		.enter()
		.append("circle")
		.attr("cx", function(d) { return xScale(d[0]); })
		.attr("cy", function(d) { return yScale(d[1]); })
		.attr("r", function(d) {
		    return ySizeScale(d[1]/20);
		})
		.attr("fill", function(d) { return getColour(d[2]); })
		.on("mouseover", function(d) {
		    console.log("Mouse Over");
		    d3.select("svg #countryLabel")
			.text(d[2])
			.transition()
			.style('opacity', 1);
		})
		.on('mouseout', function(d) {
		    console.log("Mouse Out");		    
		    d3.select("svg #countryLabel")
			.transition(15000)
			.style("opacity", 0);
		});

	    var xd = {};
	    xd[isp.currentX] = _.map(xData, xScale);
	    var yd = {};
	    yd[isp.currentY] = _.map(yData, yScale);	    
	    var bf = calcBestFit(xd, yd);

	    var lineX1 = xScale(xBounds.min);
	    var lineX2 = xScale(xBounds.max);
	    var lineY1 = bf.m * lineX1 + bf.b;
	    var lineY2 = bf.m * lineX2 + bf.b;
	    svgEl.append("line")
		.attr("id", "bestFit")
		.attr("x1", lineX1)
		.attr("x2", lineX2)
		.attr("y1", lineY1)
		.attr("y2", lineY2)
		.attr("style", "stroke:black; stroke-width:4; opacity:0.5");
	    
	    
	    var existingGraph = {};
	    existingGraph.svgElId = svgElId;
	    existingGraph.svgEl = svgEl;
	    existingGraph.leftMost = leftMost;
	    existingGraph.rightMost = rightMost;
	    existingGraph.xScale = xScale;
	    existingGraph.xAxis = xAxis;
	    existingGraph.xAxisScale = xAxisScale;
	    existingGraph.xAxisEl = d3.select("scatterPlotXAxis");
	    isp.existingGraph = existingGraph;
	};

	isp.updateChart = function() {
	    var eG = isp.existingGraph;
	    var xData = isp.transposed[isp.currentX].map(Number);
	    var yData = isp.transposed[isp.currentY].map(Number);
	    var lData = isp.transposed[isp.currentL];
	    var fData = _.zip(xData, yData, lData);
	    var xBounds = getBounds(xData);
	    var yBounds = getBounds(yData);
	    var leftMost = eG.leftMost;
	    var rightMost = eG.rightMost;
	    var bottomMost = digitPrecisionOnBoundary(0.8 * yBounds.min, 1, 10, false);
	    var topMost = digitPrecisionOnBoundary(1.0 * yBounds.max, 2, 10, true);
	    var xScale = eG.xScale;
	    var parent = $("#" + isp.chartId);
	    var parWidth = parent.width();
	    var parHeight = parent.height();	    
	    var yScale = d3.scale.linear()
		    .domain([bottomMost, topMost])
		    .range([0.9 * parHeight, parHeight/10])
		    .nice();
	    var ySizeScale = d3.scale.linear()
		    .domain([0, topMost])
		    .range([0, parHeight]);
	    var xAxis = eG.xAxis;
	    var yAxis = d3.svg.axis();
	    var yAxisScale = d3.scale.linear()
		    .domain([bottomMost, topMost])
		    .range([yScale(bottomMost), yScale(topMost)]);
	    yAxis.scale(yAxisScale);
	    yAxis.orient("left");
	    $("#yAxisLabel").remove();

	    eG.svgEl.append("text")
		.attr("x", -20)
		.attr("y", 0)
		.attr("fill", "black")
		.text(isp.currentY)
		.attr("id", "yAxisLabel")	    
		.attr("transform", function() {
		    var xlate = " translate(" + (xScale(leftMost) - 40) + " " +
			    (1.2 * (parHeight / 2)) + ")";
		    var rot = " rotate(-90)";
		    return xlate + rot;
		});

	    $("#scatterPlotYAxis").empty();
	    d3.select("#scatterPlotYAxis").call(yAxis);

	    eG.svgEl.selectAll('circle')
		.transition()
		.duration(500)
		.ease('quad-out')
		.attr("cx", function(d) {
		    return xScale(d[0]);
		})
		.attr("cy", function(d) {
		    var yVal = findValInData(d[2], isp.currentY);
		    return yScale(yVal);
		})
		.attr("r", function(d) {
		    var yVal = findValInData(d[2], isp.currentY);
		    return ySizeScale(yVal/30);
		});

	    var xd = {};
	    xd[isp.currentX] = _.map(xData, xScale);
	    var yd = {};
	    yd[isp.currentY] = _.map(yData, yScale);	    
	    var bf = calcBestFit(xd, yd);

	    var lineX1 = xScale(xBounds.min);
	    var lineX2 = xScale(xBounds.max);
	    var lineY1 = bf.m * lineX1 + bf.b;
	    var lineY2 = bf.m * lineX2 + bf.b;
	    console.log("(" + lineX1 + ", " + lineY1 + ") => (" + lineX2 + ", " + lineY2 + ")");
	    d3.select("#bestFit")
		.transition()
		.duration(500)
		.ease('qaud-out')
	    	.attr("x1", lineX1)
		.attr("x2", lineX2)
		.attr("y1", lineY1)
		.attr("y2", lineY2);
	};


	function findValInData(countryName, fieldName)
	{
	    var idx = _.indexOf(isp.transposed.Country, countryName);
	    return isp.transposed[fieldName][idx];
	}
	function digitPrecisionOnBoundary(n, places, toNearest, up)
	{
	    var ns = n.toString();
	    var dPoint = ns.indexOf(".");
	    
	    if (places >= ns.length)
	    {
		return n;
	    }    
	    if (dPoint < 0)
	    {
		// No decimal point.
		var nsStart = ns.slice(0, places);
		var nEnd = Array(ns.length - places + 1).join('0');
		var newN = Number(nsStart.concat(nEnd));

		if (up)
		{
		    if (toNearest > Number(ns.slice(places)))
		    {
			newN += toNearest;
		    }
		    else
		    {
			newN += 2 * toNearest;
		    }
		}
		else // !up
		{
		    if (Number(ns.slice(places)) >= toNearest)
		    {
			newN += toNearest;
		    }
		}
		return newN;
	    }

	    // There is a decimal point at dPoint.
	    //var nsStart = Number(ns.slice(0, places + 1));
	    var nsStart = "";
	    var nEnd = "";
	    var newN = "";
	    if (places < dPoint)
	    {
		nsStart = ns.slice(0, places);
		nEnd = Array(ns.length - places + 1).join('0');
		nEnd = nEnd.slice(0, dPoint - places) + "." + nEnd.slice(dPoint - places + 1);
		newN = Number(nsStart.concat(nEnd));	
		if (up)
		{
		    if (toNearest > Number(ns.slice(places)))
		    {
			newN += toNearest;
		    }
		    else
		    {
			newN += 2 * toNearest;
		    }
		}
		else // !up
		{
		    if (Number(ns.slice(places)) >= toNearest)
		    {
			newN += toNearest;
		    }
		}
	    }
	    else
	    {
		if ((dPoint == 1) && ns[0] == "0")
		{
		    places += 1;
		}
		nsStart = ns.slice(0, places + 1);
		nEnd = Array(ns.length - (places)).join('0');
		newN = Number(nsStart.concat(nEnd));	
		if (up)
		{
		    if (toNearest > Number(ns.slice(places + 1, places + 2)))
		    {
			newN += (toNearest / Math.pow(10, places - dPoint + 1));
		    }
		    else
		    {
			newN += 2 * (toNearest / Math.pow(10, places - dPoint + 1));
		    }
		}
		else // !up
		{
		    if (Number(ns.slice(places + 1, places + 2)) >= toNearest)
		    {
			newN += (toNearest / Math.pow(10, places - dPoint + 1));
		    }
		}	
	    }

	    return newN;
	}


	/**
	 * Return the max and min of d.
	 */
	function getBounds(d) {
	    var max = Math.max.apply(null, d);
	    var min = Math.min.apply(null, d);
	    return {"max" : max, "min": min};
	}

	/**
	 * Event handler that recreates the table sorted by the value of the
	 * element clicked on that invoked the event handler.
	 *
	 * @param event   The dom event.
	 */
	var resort = function(event) {
	    event.preventDefault();
	    var fieldName = event.target.textContent;
	    handleData(null, isp.origData, fieldName);
	};

	/**
	 * Return the transpose of d.
	 *
	 * @param d   An array of objects.
	 *
	 * @return An object with the fields from the objects in d mapped to
	 *         arrays of their values.
	 */	
	function transpose(d)
	{
	    var table = {};
	    _.each(d[0], function(el, k) {
		table[k] = [];
	    });
	    _.each(d, function(data) {
		_.each(data, function(el, k) {
		    table[k].push(el);
		});
	    });
	    return table;
	}

	isp.initialize = function(data) {
	    // Save the original data:
	    isp.origData = data;
	    isp.sorted = _.sortBy(isp.origData, function(el) {
		if (isNaN(el[isp.currentX]))
		{
		    return el[isp.currentX];
		}
		else
		{
		    return Number(el[isp.currentX]);
		}
	    });
	    
	    // Transpose the data.
	    isp.transposed = transpose(isp.origData);

	    // Create and add the list element.
	    $("#" + isp.menuId)
		.append("<div class='btn-group-vertical' role='group' id='chartSelect'><div>");
	    
	    // For each key in isp.transposed, create a button on the page.
	    var keys = _.keys(isp.transposed);
	    _.each(keys, function(k) {
		if (!isNaN(isp.transposed[k][0]))
		{
		    var b = "<button type='button', class='btn btn-default'>" + k +
			    "</button>";
		    $("#chartSelect").append(b);
		}
	    });

	    $("button:contains(" + isp.currentY + ")").addClass("active");

	    $("#chartSelect button").each(function (index, el) {
		$(el).on("click", isp.handleButtonPush);
	    });
	    isp.createChart();
	};

	isp.handleButtonPush = function(event)
	{
	    //console.log("Button clicked was: " + event.target.textContent);
	    if ($(event.target).hasClass("active"))
	    {
		// Do nothing.
		return;
	    }
	    $("#chartSelect button").each(function (index, el) {
		$(el).removeClass("active");
	    });
	    $(event.target).addClass("active");
	    isp.currentY = event.target.textContent;
	    isp.updateChart();
	};

	function getColour(label)
	{
	    var k = _.findKey(isp.colours.assigned, function(k) {
		return k === label;
	    });
	    if (typeof k === 'undefined')
	    {
		if (isp.colours.avail.length === 0)
		{
		    alert("We've run out of colours.");
		}
		c = isp.colours.avail.shift();
		isp.colours.assigned[k] = c;
		return c;
	    }
	    return isp.colours.assigned[k];
	}
	
	function calcBestFit(X, Y) {
	    var xKey = _.keys(X)[0];
	    var xVals = _.map(X[xKey], function(d) {
		return isNaN(d) ? d : Number(d);
	    });
	    var yKey = _.keys(Y)[0];
	    var yVals = _.map(Y[yKey], function(d) {
		return isNaN(d) ? d : Number(d);
	    });

	    console.log("Calculating Best Fit for: " + xKey + " against " + yKey);

	    var xSum = _.reduce(xVals, function(memo, num) {
		return memo + num;
	    }, 0);
	    var xBar = xSum/xVals.length;
	    console.log("xSum is: " + xSum + " xBar is: " + xBar);
	    var ySum = _.reduce(yVals, function(memo, num) {
		return memo + num;
	    }, 0);
	    var yBar = ySum/yVals.length;
	    console.log("ySum is: " + ySum + " yBar is: " + yBar);

	    var xy = _.zip(xVals, yVals);
	    var topSum = _.reduce(xy, function(memo, vals) {
		return memo + (vals[0] - xBar) * (vals[1] - yBar);
	    }, 0);
	    console.log("topSum is: " + topSum);

	    var sumX2 = _.reduce(xVals, function(memo, x) {
		return memo + Math.pow((x - xBar), 2);
	    }, 0);

	    var slope = topSum/sumX2;
	    console.log("slope is: " + slope);

	    var b = yBar - slope * xBar;
	    var result = { "m" : slope, "b" : b };
	    return result;
	}
	

	function initColours()
	{
	    var colours =
		    ['rgb(142,1,82)','rgb(197,27,125)','rgb(222,119,174)',
		     'rgb(241,182,218)','rgb(253,224,239)','rgb(247,247,247)',
		     'rgb(230,245,208)','rgb(184,225,134)','rgb(127,188,65)',
		     'rgb(77,146,33)','rgb(39,100,25)', 'rgb(165,0,38)',
		     'rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)',
		     'rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)',
		     'rgb(171,217,233)','rgb(116,173,209)','rgb(69,117,180)',
		     'rgb(49,54,149)', 'rgb(84,48,5)','rgb(140,81,10)',
		     'rgb(191,129,45)','rgb(223,194,125)','rgb(246,232,195)',
		     'rgb(245,245,245)','rgb(199,234,229)','rgb(128,205,193)',
		     'rgb(53,151,143)','rgb(1,102,94)','rgb(0,60,48)'
		    ];

	    isp.colours = { avail: colours, assigned : {} };
	};
	initColours();
	d3.csv(csvFile, isp.initialize);
	return isp;
    };
    return sp;
});

