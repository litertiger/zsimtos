"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	var go = require("gojs");
	//var DragComputation = require("./dragComputation");
	//定义specYard类开始
	function specYard(opt) {
		for (var i in opt) {
			this[i] = opt[i];
		}this.X = opt.X0;
		this.Y = opt.Y0;
		this.width = opt.X1;
		this.height = opt.Y1;

		yardObject.call(this);
		this.position = new go.Point(this.X, this.Y);
	}

	specYard.inherit(yardObject);

	specYard.prototype.className = "specYard";
	//定义parkingLot类结束
	module.exports = specYard;
});