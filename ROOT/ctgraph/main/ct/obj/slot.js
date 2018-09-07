"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	//定义Slot类开始
	function Slot() {
		this.color = "white";
		yardObject.call(this);
	}
	Slot.inherit(yardObject);
	Slot.prototype.className = "slot";
	Slot.prototype.toJsonData = function () {
		var obj = {};
		for (var i in this) {
			if (i === "color") continue;
			var v = this[i];
			obj[i] = v;
		}
		return yardObject.prototype.toJsonData.call(obj);
	};
	Slot.prototype.ondoubleClick = function (e) {};

	//定义Slot类结束
	module.exports = Slot;
});