"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	//定义类开始
	function Label(opt) {
		this.text = opt;
		yardObject.call(this);
	}

	Label.inherit(yardObject);
	Label.prototype.className = "Label";
	//定义类结束
	module.exports = Label;
});