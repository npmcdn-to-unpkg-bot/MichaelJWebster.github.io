define(function(require)
       {
	   var d3 = require('d3');
	   var _ = require('underscore');
	   var $ = require('jquery');

	   pkg = {};
	   pkg.svgElId = "pkBar";

	   pkg.createInteractiveBarChart = function
	   (
	       gdata,
	       chart_id,
	       xlabel
	   )
	   {
	       var d = gdata.data;
	       var ylabel = gdata.yLabel;
	       var gdLegend = gdata.legend;
	       ikg = {};
	       ikg.xData = _.keys(d);
	       ikg.yData = _.values(d);
	       ikg.cId = chart_id;
	       
	       ikg.divWidth = $("#" + ikg.cId).width();
	       ikg.divHeight = 0.5 * ikg.divWidth;
	       $("#" + ikg.cId).height(ikg.divHeight);

	       ikg.svgEl = d3.select("#" + ikg.cId)
		   .append("svg")
		   .attr("id", pkg.svgElId);
	       ikg.svgEl.attr("width", ikg.divWidth)
		   .attr("height", ikg.divHeight);

	       // Calculate the left and right padding - about 10% of the svg area.
	       ikg.xPadding = 0.1 * ikg.divWidth;
	       // Similar for top and bottom padding.
	       ikg.yPadding = 0.1 * ikg.divHeight;

	       
	       ikg.xScale = d3.scaleBand();
	       ikg.xScale.domain(ikg.xData);
	       ikg.xScale.rangeRound([ikg.xPadding, $("#" + ikg.cId).width() - ikg.xPadding]);
	       // Space reserved for between bars.
	       ikg.xScale.paddingInner(0.1);
	       // Space to the left of the first bar and to the right of the rightmost
	       // bar.
	       ikg.xScale.paddingOuter(0.2);

	       ikg.xAxis = d3.axisBottom(ikg.xScale);

	       // Append the x axis
	       ikg.svgEl.append("g")
		   .attr("class", "xaxis")
		   .attr("transform", "translate(0, " + (ikg.divHeight - ikg.yPadding) + ")")
		   .call(ikg.xAxis);

	       var xmiddle =
		       ikg.xScale.range()[0] +
		       (ikg.xScale.range()[1] - ikg.xScale.range()[0])/2;
	       d3.select(".xaxis")
		   .append("text")
		   .attr("x", xmiddle - 40)
		   .attr("y", 0)
		   .attr("font-size", 22)
		   .attr("dy", "2em")
		   .attr("fill", "black")
		   .text(xlabel);

	       var max_val = Math.max.apply(null, ikg.yData);
	       ikg.yScale = d3.scaleLinear()
		   .domain([0, 1.2 * max_val])
		   .range([(ikg.divHeight - ikg.yPadding), ikg.yPadding]);
	       ikg.yAxis = d3.axisLeft(ikg.yScale);

	       // Append the y axis
	       ikg.svgEl.append("g")
		   .attr("class", "yaxis")
		   .attr("transform", "translate(" + ikg.xPadding + ", 0)")
		   .call(ikg.yAxis);

	       var ymiddle = ikg.yScale.range()[0] +
		       (ikg.yScale.range()[1] - ikg.yScale.range()[0])/2;

	       d3.select(".yaxis")
	       	   .append("text")
		   .attr("x", -20)
		   .attr("y", 0)
		   .attr("font-size", 22)
		   .attr("fill", "black")
		   .text(ylabel)
		   .attr("id", "ylabel")
		   .attr("transform", function() {
		       var xlate = " translate(-40, " + (ymiddle - 150) + ")";
		       var rot = " rotate(-90)";
		       return xlate + rot;
		   });

	       // Add the title/legend.
	       var wlist = gdLegend.split(" ");
	       ikg.svgEl.append("g")
		   .attr("id", "gLegend");

	       var fs = _.first(wlist, 8);
	       var rs = _.rest(wlist, 8);
	       var text = d3.select("#gLegend").append("text")
		       .attr("x", xmiddle)
		       .attr("y", 80)
	       	       .attr("font-size", 20)
	       	       .attr("fill", "black")
		       .text(fs.join(" "));
	       var lnum = 1;
	       while (rs.length > 0) {
		   fs = _.first(rs, 8);
		   rs = _.rest(rs, 8);
		   text.append("tspan")
		       .attr("x", xmiddle - 40)
		       .attr("y", 80)
		       .attr("dy", lnum + "em")
		       .attr("fill", "black")
		       .text(fs.join(" "));
		   lnum += 1;
	       }

	       // Colours
	       ikg.colours = _.first(d3.schemeCategory10, ikg.xData.length);
	       
	       // add in some bars.
	       var zpd = _.zip(ikg.xData, ikg.yData, ikg.colours);

	       ikg.bars = ikg.svgEl.append("g")
		       .attr("class", "barContainer");
	       
	       ikg.gs = ikg.bars.selectAll("g")
		       .data(zpd)
		       .enter()
		       .append("g");
	       
	       ikg.rects = ikg.gs.append("rect")
		       .attr("x", function(v) {
			   return ikg.xScale(v[0]);
		       })
		       .attr("y", function(v) {
			   return ikg.yScale(v[1]);
		       })
		       .attr("width", ikg.xScale.bandwidth())
		       .attr("height", function(v) {
			   return ikg.divHeight - ikg.yPadding - ikg.yScale(v[1]);
		       })
		       .attr("style", function(v) {
			   var s2 = ";stroke:grey;stroke-width:1;fill-opacity:0.9;"
			   s2 +=  "stroke-opacity:0.9";
			   return "fill:" + v[2] + s2;
		       });

	       ikg.texts = ikg.gs.append("text")
		   .attr("x", function(v) { return ikg.xScale(v[0]) + ikg.xScale.bandwidth()/3.0; })
		   .attr("y", function(v) { return ikg.yScale(v[1]); })
		   .attr("dy", "-0.75em")
		   .attr("fill", "black")
		   .text(function(v) {
		       return (Math.round(100 * v[1]) / 100).toString();
		   });
	       
	       ikg.updateChart = function(gdata) {
		   var d = gdata.data;
		   var ylabel = gdata.yLabel;
		   var gdLegend = gdata.legend;

		   // Update the chart with the new data d.
		   ikg.yData = _.values(d);

		   // Zip the new data
		   var zpd = _.zip(ikg.xData, ikg.yData, ikg.colours);

		   var max_val = Math.max.apply(null, ikg.yData);
		   ikg.yScale = d3.scaleLinear()
		       .domain([0, 1.2 * max_val])
		       .range([(ikg.divHeight - ikg.yPadding), ikg.yPadding]);
		   ikg.yAxis = d3.axisLeft(ikg.yScale);

		   // Update the yAxis
		   d3.select(".yaxis")
		       .transition()
		       .duration(750)
		       .call(ikg.yAxis);

		   //ikg.gs.data(zpd);
		   ikg.gs = d3.select(".barContainer")
		       .selectAll("g")
		       .data(zpd);

		   ikg.rects =
		       ikg.gs.select("rect")
		       .transition()
		       .duration(750)
		       .attr("y", function(v) {
			   return ikg.yScale(v[1]);
		       })
		       .attr("height", function(v) {
			   return ikg.divHeight - ikg.yPadding - ikg.yScale(v[1]);
		       });
		   ikg.texts = //ikg.texts.transition()
		       ikg.gs.select("text")
		       .transition()
		       .duration(750)
		       .attr("y", function(v) { return ikg.yScale(v[1]); })
		       .attr("dy", "-0.75em")
		       .attr("fill", "black")
		       .text(function(v)
			     {
				 return (Math.round(100 * v[1]) / 100).toString();
			     });

		   d3.select("#ylabel")
		       .transition()
		       .duration(750)
		       .text(ylabel);

		   // Update the title/legend.
		   // Remove the existing text.
		   $("#gLegend").empty();

		   // Do the stuff.
		   var wlist = gdLegend.split(" ");

		   var fs = _.first(wlist, 8);
		   var rs = _.rest(wlist, 8);
		   var text = d3.select("#gLegend").append("text")
			   .attr("x", xmiddle)
			   .attr("y", 80)
	       		   .attr("font-size", 20)
	       		   .attr("fill", "black")
			   .text(fs.join(" "));
		   var lnum = 1;
		   while (rs.length > 0) {
		       fs = _.first(rs, 8);
		       rs = _.rest(rs, 8);
		       text.append("tspan")
			   .attr("x", xmiddle - 40)
			   .attr("y", 80)
			   .attr("dy", lnum + "em")
			   .attr("fill", "black")
			   .text(fs.join(" "));
		       lnum += 1;
		   }
		   
	       }
	       return ikg;
	   };

	   
	   return pkg;
       });	   
