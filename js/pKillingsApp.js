define(function(require)
       {
	   //var bc = require('barCharts');
	   var d3 = require('d3');
	   var _ = require('underscore');
	   var $ = require('jquery');
	   var csv2015 = "../js/the-counted-2015.csv";
	   var csv2016 = "../js/the-counted-2016.csv";
	   var currentYear = 2015;
	   // These pop stats from https://www.census.gov/quickfacts/table/PST045215/00
	   totalPop = 321.418820;    // July 1st 2015 in millions
	   whiteProp = 0.616;        // July 1st 2015 <-- excludes hispanic latino
	   blackProp = 0.133;        // July 1st 2015
	   nativeProp = 0.012;       // July 1st 2015
	   asianPacProp = 0.056 + 0.002; // July 1st 2015
	   hispanicProp =  0.176;    // July 1st 2015	   	   
	   var dataByYear = {
	       2015 :
	       {
		   csvFile: csv2015,
	       },
	       2016 :
	       {
		   csvFile : csv2016
	       }
	   };

	   var graphControls =
		   {
		       selectYear: "y2015",
		       selectArmed: "armedEither",
		       selectGender: "genderE",
		       selectRaw: "rawData"		       
		   };

	   function doPage()
	   {
	       console.log("In pKillingsApp.js");
	       var yrs = [2015, 2016];
	       /*for (var y in yrs) {
		   console.log("In processCurrentData and currentYear = " + yrs[y]);
		   d3.csv(dataByYear[yrs[y]].csvFile, 
			  function(data) {
			      var year = y;
			      console.log("Year is: " + year);
			      return procRaceStats(data, dataByYear, yrs[year]);
			  });
		}*/
	       _.each(yrs, function(y) {
		   console.log("In processCurrentData and currentYear = " + y);
		   d3.csv(dataByYear[y].csvFile, 
			  function(data) {
			      var year = y;
			      console.log("Year is: " + year);
			      return procRaceStats(data, dataByYear, year);
			  });
	       });
	       setupButtons();
	       setButtonDivsHeight();
	   };

	   function setButtonDivsHeight() {
	       var divs = $(".pk-div");
	       var maxDiv = _.max(divs, function(d) { return $(d).height(); });
	       var maxHeight = $(maxDiv).height();
	       _.each(divs, function(d) { $(d).height(maxHeight); });
	   }

	   function procRaceStats(d, dby, yr) {
	       dby[yr].rawData = d;

	       // Drop extraneous data.
	       dby[yr].raceSubset =
		   _.map(d, function(val)
			 {
			     return _.pick(val, 'state', 'armed', 'gender',
					   'classification', 'raceethnicity',
					   'age');
			 }
			);

	       dataByYear = dby;

	   };

	   function getCurrentDataSet() {
	       var cdata = null;
	       // Get year data.
	       switch (graphControls.selectYear) {
	       case "y2015":
		   cdata = dataByYear[2015].raceSubset;
		   break;
	       case "y2016":
		   cdata = dataByYear[2016].raceSubset;
		   break;
	       default:
		   alert("Invalid value: " +  grahpControls.selectYear +
			 "in grahpControls.selectYear field.");
		   cdata = dataByYear[2015].raceSubset;
		   break;
	       }

	       // Get data based on whether victim is armed.
	       switch (graphControls.selectArmed) {
 	       case "armedNo":
		 cdata = _.filter
		   (
		       cdata, 
		       function(val) {
			   return val.armed == "No";
		       }
		   );
		   break;
	       case "armedYes":
		 cdata = _.filter
		   (
		       cdata, 
		       function(val) {
			   return val.armed != "No";
		       }
		   );
		   break;		   
	       case "armedEither": // cdata already contains this data.
		   break;
	       }

	       switch (graphControls.selectGender) {
	       case "genderM": // Male
		   cdata = _.filter
		   (
		       cdata,
		       function(val) {
			   return val.gender == "Male";
		       }
		   );
		   break;
	       case "genderF": // Female
		   cdata = _.filter
		   (
		       cdata,
		       function(val) {
			   return val.gender == "Female";
		       }
		   );		   
		   break;
	       case "genderE": // Either gender.
		   break;
	       }

	       var dummy = {};
	       dummy["White"] = 0;
	       dummy["Black"] = 0;
	       dummy["Native American"] = 0;
	       dummy["Asian/Pacific Islander"] = 0;
	       dummy["Hispanic/Latino"] = 0;
	       // Create the counts for each race.
	       var raceCounts = _.countBy
	       (
		   cdata,
		   function(val) { return val['raceethnicity'];}
	       );

	       raceCounts = _.extend(dummy, raceCounts);

	       // Get the raw or normalised data as requested...
	       switch (graphControls.selectRaw) {
	       case "perMill":
		   raceCounts["White"] /= (whiteProp * totalPop);
		   raceCounts["Black"] /= (blackProp * totalPop);
		   raceCounts["Native American"] /= (nativeProp * totalPop);
		   raceCounts["Asian/Pacific Islander"] /= (asianPacProp * totalPop);
		   raceCounts["Hispanic/Latino"] /= (hispanicProp * totalPop);
		   break;
	       case scaled:
		   break;
	       case "rawData":
		   break;
	       }
	       return raceCounts;
	   };

	   function setupButtons() {
	       _.each(_.keys(graphControls),
		      function(k) {
			  $("#" + k + " > button").click(function(e) {
			      return handleButton(e, k);
			  });
		      });
	       return true;
	   }
	   
	   function handleButton(evt, bgroup) {
	       graphControls[bgroup] = evt.target.id;
	       $("#" + bgroup + " > button").removeClass("active");
	       $("#" + evt.target.id).addClass("active");
	       updateGraph();
	   }

	   function setupGraph() {
	       // Setup the graph with width of bars, and the x-axis.
	   }

	   function updateGraph() {
	       var d = getCurrentDataSet();
	       console.log("updateGraph");
	       //
	       return true;
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

	   $(document).on("load", doPage());
	   return; // pk;
       });

/*
 // Get the totals killed for each race.
 dby[yr].raceAllTotal = _.countBy
 (
 d,
 function(val) { return val['raceethnicity'];}
 );

 // Get the data for unarmed people killed.
 dby[yr].raceUnArmedSubset = _.filter
 (
 dby[yr].raceSubset,
 function(val) {
 return val.armed == "No";
 }
 );

 // Get the total counts by race for unarmed killed.
 dby[yr].raceUnArmedTotal = _.countBy
 (
 dby[yr].raceUnArmedSubset,
 function(val) { return val['raceethnicity'];}
 );

 // Get the data for armed people.
 dby[yr].raceArmedSubset = _.filter
 (
 dby[yr].raceSubset,
 function(val) {
 return val.armed != "No";
 }
 );

 // Get the total counts by race for armed killed.
 dby[yr].raceArmedTotal = _.countBy
 (
 dby[yr].raceArmedSubset,
 function(val) { return val['raceethnicity'];}
 );

 // 

 dby[yr].transposed = transpose(d);
 dby[yr].transposedRace = _.pick(dby[yr].transposed,
 'armed', 'gender', 'classification',
 'raceethnicity', 'age');
 var tmpArray = _.zip.apply
 (
 null,
 _.map(dby[yr].transposed, function(v, k)
 {
 v.unshift(k);
 return v;
 }
 )
 );
 */
