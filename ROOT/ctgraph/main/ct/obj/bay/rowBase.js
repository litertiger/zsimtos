"use strict";

define(function (require, exports, module) {
	'use strict';
	//定义类开始

	var Slot = require("main/ct/obj/bay/slot");
	var row = function row(info) {
		this.slots = [];
		var slot;
		this.addSlot = function (slot) {
			this.slots.push(slot);
			slot.node.containingGroup = this.node;
		};
		var ii = 0;
		for (var i in info) {
			if (ii == 0) {
				var title = this.createTitle(info[i].CY_ROW_NO);
				this.addSlot(title);
			}
			slot = new Slot("");
			slot.h = info[i].CY_TIER_NO;
			slot.id = info[i].CY_AREA_NO + '|' + info[i].CY_BAY_NO + '|' + info[i].CY_ROW_NO + '|' + info[i].CY_TIER_NO;
			this.addSlot(slot);
			ii++;
		}
		this.id = info[i].CY_AREA_NO + '|' + info[i].CY_BAY_NO + info[i].CY_ROW_NO;

		this.initPosition();
	};

	//定义类结束
	module.exports = row;
});