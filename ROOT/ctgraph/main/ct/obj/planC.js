"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	var share = require("./shareData");
	//var DragComputation = require("./dragComputation");
	//定义Car类开始
	function planC(ops) {
		// var n = "M0,0 L0,100 L100,100 L90,90 M100,100 L90,110";
		// var r = "M0,0 L0,100 L100,100 M0,0 L-10,10 M0,0 L10,10";
		this.text = ops.text;
		this.size = ops.w + share.slotSize.width + " " + (ops.h + share.slotSize.height);
		this.color = ops.color;
		var tp = plancTp(ops.type);
		this.Lsize = ops.w + " " + ops.h;
		this.geometryString = tp.geometryString;
		this.angle = tp.angle;
		yardObject.call(this);
		//DragComputation.call(this);
	}
	planC.inherit(yardObject);

	// planC.prototype.onclick = function () {
	// 	if (share.actionCursor=='filter') {
	// 		this.setProperty("color", "rgba(255,0,0,0.5)");
	// 		this.proper = share.filter;
	// 	}
	// }
	planC.prototype.className = "planC";
	//定义Car类结束

	module.exports = planC;
});