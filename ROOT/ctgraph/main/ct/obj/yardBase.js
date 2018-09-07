"use strict";

define(function (require, exports, module) {
	'use strict';

	var go = require("gojs");
	var share = require("./shareData");
	var wd = share.slotSize.width;
	var yardBase = function yardBase(info) {
		var bay;
		this.rows = [];
		this.addBay = function (row) {
			this.rows.push(row);
			row.node.containingGroup = this.node;
		};
		//加个yard标题
		this.title = info.CY_AREA_NO;
		var title = this.createTitle(1, this.title);
		this.addBay(title);
		title.position = new go.Point(10, -30);
		// slot
		var baynums = info.BAY_NUM;

		if (info.BAY_SEQ == "0") {
			for (var i = 0; i < baynums; i++) {
				var binfo = { bayno: PrefixInteger(i * 2 + 1, 2), rows: info.ROW_NUM, yardno: info.CY_AREA_NO, seq: info.ROW_SEQ, er: info.ERASE_ROW };
				bay = this.createBay(binfo);
				this.addBay(bay);
				bay.position = new go.Point(i * wd, 0);
			}
		} else {
			for (var i = baynums - 1; i >= 0; i--) {
				var binfo = { bayno: PrefixInteger(i * 2 + 1, 2), rows: info.ROW_NUM, yardno: info.CY_AREA_NO, seq: info.ROW_SEQ, er: info.ERASE_ROW };
				bay = this.createBay(binfo);
				this.addBay(bay);
				bay.position = new go.Point((baynums - i - 1) * wd, 0);
			}
		}
		//左标题

		var lt = new Array();
		var rownum = info.ROW_NUM;
		if (info.ROW_SEQ == "0") {
			for (var i = 1; i <= rownum; i++) {
				lt.push(PrefixInteger(i, 2));
			}
		} else {
			for (var i = rownum; i > 0; i--) {
				lt.push(PrefixInteger(i, 2));
			}
		}

		var lt = this.createLTitle(i, lt);
		this.addBay(lt);
		lt.position = new go.Point(-1.2 * wd, 0);
	};
	//定义类结束

	module.exports = yardBase;
});
