"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("main/ct/obj/yardObject");
	//定义Slot类开始
	function Cntr(ops) {
		this.color = "red";
		this.loc = ops.loc;
		this.cntrno = ops.cntrno;
		yardObject.call(this);
	}
	Cntr.inherit(yardObject);
	Cntr.prototype.onclick = function () {
		alert(this.cntrno);
	};

	Cntr.prototype.className = "Cntr";
	//定义Slot类结束
	module.exports = Cntr;
});