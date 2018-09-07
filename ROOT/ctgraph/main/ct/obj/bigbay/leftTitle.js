"use strict";

define(function (require, exports, module) {
	'use strict';

	var go = require("gojs");
	var titleBase = require("main/ct/obj/titleBase");
	var Group = require("main/ct/obj/group");
	var share = require("main/ct/obj/shareData");
	var hei = share.BslotSize.height * 3;
	//定义DeckRow类开始
	function bay(info) {
		this.selectable = false;
		Group.call(this, info);
		titleBase.call(this, info);
	}

	bay.inherit(Group);
	bay.prototype.initPosition = function () {
		var pt = new go.Point(5, hei);
		var slots = this.slots;
		for (var s in slots) {
			pt.y = s * hei + hei;
			slots[s].position = pt;
		}
	};
	bay.prototype.className = "leftTitle";
	//定义DeckRow类结束

	module.exports = bay;
});