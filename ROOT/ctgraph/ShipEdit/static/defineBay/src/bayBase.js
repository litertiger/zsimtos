define(function (require, exports, module) {
	'use strict';
	var go = require("gojs");
	var share = require("./shareData");
	var Group = require("./group");

	//定义BayBase类开始
	var BayBase = function (info) {
		Group.call(this);
		this.rows = [];
		var row;
		this.tierCount = 0;
		var i = 1;
		for (var r in info) {
			row = this.createRow(r[0] === "r" ? r.substr(1) : r, info[r]);
			this.addRow(row);
			row.position = new go.Point(i * share.slotSize.width, 0);
			++i;
		}

		this.tierRow = this.createTierRow();
		this.tierRow.node.containingGroup = this.node;
		this.tierRow.position = new go.Point(0, 0);

	};

    BayBase.inherit(Group);

	BayBase.prototype.addRow = function (row) {
		this.rows.push(row);
		row.node.containingGroup = this.node;
		if (row.slots.length > this.tierCount)
			this.tierCount = row.slots.length;
	};

	BayBase.prototype.toJsonData =  function () {
		var obj = {}
		for (var i in this) {
			if (i === "tierRow")
				continue;
			var v = this[i]
			obj[i] = v;
		}
		return Group.prototype.toJsonData.call(obj);
	};
	BayBase.prototype.className ="BayBase";
	//定义BayBase类结束

	module.exports = BayBase;
});
