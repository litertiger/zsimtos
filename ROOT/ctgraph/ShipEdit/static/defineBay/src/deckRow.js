define(function (require, exports, module) {
	'use strict';
	var go = require("gojs");
	var RowBase = require("./rowBase");
	var BottomTitleGroup = require("./bottomTitleGroup");
	var share = require("./shareData");
	
	//定义DeckRow类开始
	function DeckRow(no, info) {
		BottomTitleGroup.call(this, no);
		RowBase.call(this, info);
	}

	DeckRow.inherit( BottomTitleGroup);
	DeckRow.prototype.initPosition = function () {
		var pt = new go.Point(0, 0);
		var slots = this.slots;
		for (var s in slots) {
			slots[s].position = pt;
			pt.y -= share.slotSize.height;
		}
	}
	DeckRow.prototype.className = "DeckRow";
	//定义DeckRow类结束

	module.exports = DeckRow;
});
