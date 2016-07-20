define(function(require) {
    'use strict';
    var bc = {};
    var d3 = require('d3');
    //var barCharts = $("#bar-charts");
    //console.log("Bar charts id = :" + barCharts.attr("id"));
    console.log("D3 version is: " + d3.version);

    bc.createNewBarChart = function()
    {
	//var cs = classSelection;
	//var data = inArray;

	var bChart = {};

	bChart.createChart = function(classSelection, data)
	{
	    var dataMin = Math.min.apply(null, data);
	    var dataMax = Math.max.apply(null, data);
	    var x = d3.scaleLinear()
		    .domain([0, dataMax])
		    .range([dataMin, dataMax * 10]);
	    d3.select(classSelection)
		.selectAll("div")
		.data(data)
		.enter().append("div")
		.style("width", function(d) { return x(d) + "px"; })
	        .style("background-color", "green")
	        .style("border-style", "groove")
		.text(function(d) { return d; });
	};

	bChart.createChartSvg = function(classSelection, data)
	{
	    var width = 420;
	    var barHeight = 20;
	    var dataMin = Math.min.apply(null, data);
	    var dataMax = Math.max.apply(null, data);
	    var x = d3.scaleLinear()
		    .domain([0, dataMax])
		    .range([dataMin, dataMax * 10]);
	    
	    var chart = d3.select(classSelection)
		    .attr("width", width)
		    .attr("height", (barHeight + 2) * data.length + 5);

	    var bar = chart.selectAll("g")
		    .data(data)
		    .enter().append("g")
		    .attr("transform", function(d, i) {
			return "translate(0, " + i * (barHeight + 2) + ")"; });

	    bar.append("rect")
		.attr("width", x)
		.attr("height", barHeight - 1)
	        .style("fill", "green")
		.style("border-style", "groove");

	    bar.append("text")
		.attr("x", function(d) { return x(d) - 20; })
		.attr("y", barHeight / 2)
		.attr("dy", ".35em")
		.text(function(d) {return d;});
	};

	bChart.createChartSvgFromFile = function(classSelection, dFile)
	{
	    var width = 960;
	    var height = 500;

	    var y = d3.scaleLinear()
		    .range([height, 0]);
	    
	    var chart = d3.select(classSelection)
		    .attr("width", width)
		    .attr("height", height);

	    d3.csv(dFile, function(error, data) {

		y.domain([0, d3.max(data, function(d) {return d.Value;})]);

		var barWidth = width/data.length;

		var bar = chart.selectAll("g")
			.data(data)
			.enter().append("g")
			.attr("transform", function(d, i) {
			    return "translate(" + i * barWidth + ",0)";});

		bar.append("rect")
		    .attr("y", function(d) {return y(d.Value);})
		    .attr("height", function(d) { return height - y(d.Value); })
		    .attr("width", barWidth - 1)
	            .style("fill", "green")
		    .style("border-style", "groove");

		var text = bar.append("text")
		    .attr("x", barWidth/20)
		    .attr("y", function(d) {return y(d.Value); })
		    .attr("dy", ".75em")
		    .attr("fill", "white")
        		.text(function(d) {return d.Value;});


		// Note: Inside the function in transform, or when doing
		// a .each method, the this object is the original document
		// object for the selection.
		d3.selectAll(classSelection).selectAll("text")
		    .attr("transform", function(d)
			  {
			      //console.log("D is " + d);
			      //console.log("this is " + this);
			      var s = "scale("
				      +
				      (4 * barWidth/5)/this.getBoundingClientRect().width
				      +
				      " 1)";
			      //console.log("Scale is: " + s);
			      return s;
			  });


		bar.append("text")
		    .attr("x",  barWidth/2)
		    .attr("y", function(d) {return height;})
		    .text(function(d) {return d.Country;})
		    .attr("fill", "white")
		    .attr("transform", function ()
   			  {
			      var bbox = this.getBoundingClientRect();
			      var rot = " rotate(90 " + (barWidth/2).toString()
				      + " " + height.toString()+") ";
			      var xlate = " translate(-5, -" + (bbox.width+5) +") ";
			return xlate + rot;
		    });



	    });
	};

	bChart.createChartSvgOrderedFromFile = function(classSelection, dFile)
	{
	    var width = 960;
	    var height = 500;

	    var y = d3.scaleLinear()
		    .range([height, 0]);
	    
	    var chart = d3.select(classSelection)
		    .attr("width", width)
		    .attr("height", height);

	    d3.csv(dFile, function(error, data) {
		data.sort(function(a, b)
			  {
			      var aNum = Number(a.Value);
			      var bNum = Number(b.Value);
			      if (aNum > bNum)
			      {
				  return 1;
			      }
			      else if (aNum < bNum)
			      {
				  return -1;
			      }
			      else
			      {
				  return 0;
			      }
			  });
		
		y.domain([0, d3.max(data, function(d) {return d.Value;})]);

		var barWidth = width/data.length;

		var bar = chart.selectAll("g")
			.data(data)
			.enter().append("g")
			.attr("transform", function(d, i) {
			    return "translate(" + i * barWidth + ",0)";});

		bar.append("rect")
		    .attr("y", function(d) {return y(d.Value);})
		    .attr("height", function(d) { return height - y(d.Value); })
		    .attr("width", barWidth - 1)
	            .style("fill", "green")
		    .style("border-style", "groove");

		var text = bar.append("text")
		    .attr("x", barWidth/20)
		    .attr("y", function(d) {return y(d.Value); })
		    .attr("dy", ".75em")
		    .attr("fill", "white")
        		.text(function(d) {return d.Value;});


		// Note: Inside the function in transform, or when doing
		// a .each method, the this object is the original document
		// object for the selection.
		d3.selectAll(classSelection).selectAll("text")
		    .attr("transform", function(d)
			  {
			      var s = "scale("
				      +
				      (4 * barWidth/5)/this.getBoundingClientRect().width
				      +
				      " 1)";
			      //console.log("Scale is: " + s);
			      return s;
			  });


		bar.append("text")
		    .attr("x",  barWidth/2)
		    .attr("y", function(d) {return height;})
		    .text(function(d) {return d.Country;})
		    .attr("fill", "white")
		    .attr("transform", function ()
   			  {
			      var bbox = this.getBoundingClientRect();
			      var rot = " rotate(90 " + (barWidth/2).toString()
				      + " " + height.toString()+") ";
			      var xlate = " translate(-5, -" + (bbox.width+5) +") ";
			return xlate + rot;
		    });



	    });
	};
	
	return bChart;
    };
    
    return bc;
});
