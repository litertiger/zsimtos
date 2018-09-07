define(function (require, exports, module) {
	'use strict';
	var Slot = require("./slot");
	var Label = require("./label");
	//定义RowBase私有接口类开始
	var RowBase = function (info) {
		this.slots = [];
		var slot;
		this.addSlot = function (slot) {
			this.slots.push(slot);
			slot.node.containingGroup = this.node;
		}
		if (info instanceof Array) {
			for (var i = 0; i < info.length; ++i) {
				slot = new Label(info[i]);
				this.addSlot(slot);
			}
		} else if (!isNaN(info)) {
			for (var i = 0; i < info; ++i) {
				slot = new Slot("");
				this.addSlot(slot);
			}
		} else
			throw "非法参数";
		this.initPosition();
	}

	//定义RowBase私有接口类结束

	module.exports = RowBase;
});
