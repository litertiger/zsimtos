"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	//var DragComputation = require("./dragComputation");
	//定义bollard类开始
	function bollard(opt) {
		for (var i in opt) {
			this[i] = opt[i];
		}this.loc = this.X + " " + this.Y;
		// console.log(this.loc);
		yardObject.call(this);
	}

	bollard.inherit(yardObject);

	bollard.prototype.className = "bollard";
	//定义bollard类结束
	module.exports = bollard;
});