define(function (require, exports, module) {
	'use strict';
	var go = require("gojs");
	var RowBase = require("./rowBase");
	var TopTitleGroup = require("./topTitleGroup");
	var share = require("./shareData");
	
	//定义DeckRow类开始
	function CabinRow(no, info) {
		TopTitleGroup.call(this, no);
		RowBase.call(this, info);
	}

	CabinRow.inherit(TopTitleGroup);

	CabinRow.prototype.initPosition = function () {
		var pt = new go.Point(0, 0);
		var slots = this.slots;
		for (var s in slots) {
			slots[s].position = pt;
			pt.y += share.slotSize.height;
		}
	}
	CabinRow.prototype.className = "CabinRow";
	//定义DeckRow类结束

	module.exports = CabinRow;
});
