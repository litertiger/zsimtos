"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	//var DragComputation = require("./dragComputation");
	//定义roadPoint类开始
	function roadPoint(opt) {
		for (var i in opt) {
			this[i] = opt[i];
		}this.key = this.POINT_NAME;
		this.loc = this.X + " " + this.Y;
		// console.log(this.loc);
		yardObject.call(this);
	}

	roadPoint.inherit(yardObject);

	roadPoint.prototype.className = "roadPoint";
	//定义roadPoint类结束
	module.exports = roadPoint;
	// module.exports = linkRoadPoint;
});