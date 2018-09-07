"use strict";

define(function (require, exports, module) {
	'use strict';
	//定义类开始

	var Label = require("./label");
	var bay = function bay(info) {

		this.slots = [];
		var slot;
		this.addSlot = function (slot) {
			this.slots.push(slot);
			slot.node.containingGroup = this.node;
		};
		if (info instanceof Array) {
			for (var i = 0; i < info.length; ++i) {
				slot = new Label(info[i]);
				this.addSlot(slot);
			}
		} else throw "非法参数";

		this.initPosition();
	};

	//定义类结束
	module.exports = bay;
});