define(function(require)
   {
       var bc = require('barCharts');
       var sp = require('scatter');
       var d3 = require('d3');
       var _ = require('underscore');
       var $ = require('jquery');
       var d3p = {};
       d3p.doPage = function()
       {
	   console.log("In d3Page.js");
	   var data = [4, 8, 15, 16, 23, 42];
	   var newChart = bc.createNewBarChart();
	   newChart.createChart(".chart1", data);
	   newChart.createChartSvg(".svg-chart1", data);
	   newChart.createChartSvgFromFile(".svg-chart2", "../js/GiniCoeffs.csv");
	   newChart.createChartSvgOrderedFromFile(".svg-chart3", "../js/GiniCoeffs.csv");
	   var csvDataFile = "../js/MergedOECDData.csv";
	   var dTableId = "dataTable";
	   sp.createTableFromCsv(csvDataFile, dTableId);
	   var cm = "chartMenu";
	   var cs = "chartSvg";
	   var xName = "Gini Coefficient";
	   var yName = "Deaths per 1000 Births";
	   var lName = "Country";
	   var isp = sp.createInteractiveScatterPlot(csvDataFile, cm, cs, xName, yName, lName);
       };
       $(document).on("load", d3p.doPage());
       return d3p;
    }
);
    











