"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	//定义类开始
	function Label(ops) {
		this.text = ops;
		this.stroke = "green";
		this.font = "bold 20px sans-serif";
		this.color = 'lightgreen';
		this.height = 25;
		yardObject.call(this);
	}

	Label.inherit(yardObject);

	Label.prototype.toJsonData = function () {
		var obj = {};
		for (var i in this) {
			if (i === "stroke" || i === "font") continue;
			var v = this[i];
			obj[i] = v;
		}
		return yardObject.prototype.toJsonData.call(obj);
	};
	Label.prototype.className = "Label";
	//定义类结束
	module.exports = Label;
});