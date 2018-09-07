"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	var go = require("gojs");
	//var DragComputation = require("./dragComputation");
	//定义parkingLot类开始
	function parkingLot(opt) {
		for (var i in opt) {
			this[i] = opt[i];
		}this.loc = this.X + " " + this.Y;

		yardObject.call(this);
		//DragComputation.call(this);
		// this.position = new go.point(info.R_U_X, info.R_U_Y);debugger;
	}

	parkingLot.inherit(yardObject);

	parkingLot.prototype.className = "parkingLot";
	//定义parkingLot类结束
	module.exports = parkingLot;
});