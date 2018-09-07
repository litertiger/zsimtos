"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("main/ct/obj/yardObject");
	//定义Slot类开始
	function Slot() {
		yardObject.call(this);
	}
	Slot.inherit(yardObject);
	Slot.prototype.className = "Slot";
	//定义Slot类结束
	module.exports = Slot;
});