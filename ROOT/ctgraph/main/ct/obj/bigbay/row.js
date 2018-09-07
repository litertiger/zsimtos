"use strict";

define(function (require, exports, module) {
	'use strict';

	var go = require("gojs");
	var bayBase = require("main/ct/obj/bigbay/rowBase");
	var Group = require("main/ct/obj/group");
	var share = require("main/ct/obj/shareData");
	var Label = require("main/ct/obj/label");
	var hei = share.BslotSize.height * 3;
	//定义DeckRow类开始
	function row(info) {
		this.movable = false;
		Group.call(this, info);
		bayBase.call(this, info);
	}

	row.inherit(Group);
	row.prototype.initPosition = function () {
		var pt = new go.Point(0, 0);
		var slots = this.slots;
		for (var s in slots) {
			if (slots[s] instanceof Label) {
				pt.x = 30;
				pt.y = 70;
			} else {
				pt.y = (slots.length - slots[s].h) * hei;
				pt.x = 0;
			}
			slots[s].position = pt;
		}
	};

	row.prototype.createTitle = function (no) {
		var lb = new Label(no);
		return lb;
	};

	row.prototype.className = "row";
	//定义DeckRow类结束

	module.exports = row;
});