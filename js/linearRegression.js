define(["jquery", "d3", "underscore"], function($, d3, _) {

    var linRegPage = {};
    linRegPage.doPage = function()
    {
	console.log("In linRegPage.js");
	var csvDataFile = "../js/Galton.csv";
	var dTableId = "galtonTable";
	d3.csv(csvDataFile, function(data) {
	    createTable(dTableId, data);
	});
    };
    $(document).on("load", linRegPage.doPage());

    function createTable(tId, data) {
	linRegPage.origData = data;
	console.log("Got some data");
    }

    return linRegPage;  
});

