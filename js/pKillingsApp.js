define(function(require)
       {
	   //var bc = require('barCharts');
	   var d3 = require('d3');
	   var _ = require('underscore');
	   var $ = require('jquery');
	   var csv2015 = "../js/the-counted-2015.csv";
	   var csv2016 = "../js/the-counted-2016.csv";
	   var currentYear = 2015;
	   var dataByYear = {
	       // These pop stats from https://www.census.gov/quickfacts/table/PST045215/00
	       totalPop: 321418820,     // July 1st 2015
	       whitePercent: 61.6,      // July 1st 2015 <-- excludes hispanic latino
	       blackPercent: 13.3,      // July 1st 2015
	       nativePercent: 1.2,      // July 1st 2015
	       asianPercent: 5.6,       // July 1st 2015
	       pacIslanderPercent: 0.2, // July 1st 2015
	       hispanicPercent: 17.6,          // July 1st 2015	   
	       2015 :
	       {
		   csvFile: csv2015,
	       },
	       2016 :
	       {
		   csvFile : csv2016
	       }
	   };

	   var pk = {};
	   pk.doPage = function()
	   {
	       console.log("In pKillingsApp.js");
	       var yrs = [2015, 2016];
	       for (y in yrs) {
		   console.log("In processCurrentData and currentYear = " + yrs[y]);
		   d3.csv(dataByYear[yrs[y]].csvFile, 
			  function(data) {
			      return procRaceStats(data, dataByYear, yrs[y]);
			  });
	       }
	   };

	   function procRaceStats(d, dby, yr) {
	       dby[yr].rawData = d;

	       // Drop extraneous data.
	       dby[yr].raceSubset = _.map(d, function(val)
					  {
					      return _.pick(val, 'state', 'armed', 'gender',
							    'classification', 'raceethnicity',
							    'age');
					  }
					 );

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

	       console.log("Hello");
	       
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

	   $(document).on("load", pk.doPage());
	   return pk;
       });

