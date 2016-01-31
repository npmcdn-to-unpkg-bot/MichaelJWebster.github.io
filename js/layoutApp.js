define(function(require)
{
    var d3 = require("d3");
    var _ = require("underscore");
    var svgEl = require("util/createAxes");

    var lPage = {};
    lPage.doPage = function() {
	var parent = $("#layoutSvg");
	var w = window.innerWidth;
	var h = window.innerHeight;
	$(parent).width(w);
	$(parent).height(h);
	var origin = {};
	origin.x = w/2;
	origin.y = h/2;
	origin.startX = 0.8 * origin.x;
	origin.startY = 0.8 * origin.y;
	var svgId = "layoutTest";
	var sEl = new svgEl(origin, w, h, svgId);
	$(parent).append(sEl.sEl);
    };
    
    $(document).on("load", lPage.doPage());
});
    











