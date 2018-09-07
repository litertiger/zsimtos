"use strict";

define(function (require, exports, module) {
	'use strict';

	var go = require("gojs");
	var share = require("./shareData");
	var wd = share.slotSize.width;
	//定义私有接口类开始
	var yardBase = function yardBase(info) {
		this.rows = [];
		var bay;
		this.addBay = function (row) {
			this.rows.push(row);
			row.node.containingGroup = this.node;
		};
		//加个yard标题
		var title = this.createTitle(1, info.title);
		this.addBay(title);
		title.position = new go.Point(10, -30);

		// slot
		var baynums = info.bay;
		var rows = info.row;
		for (var i = 0; i < baynums; i++) {
			bay = this.createBay(i, rows);
			this.addBay(bay);
			bay.position = new go.Point(i * wd, 0);
		}
		//左标题
		var lt = new Array();
		if (info.tb == "T") {
			for (var i = 1; i <= rows; i++) {
				lt.push(PrefixInteger(i, 2));
			}
		} else {
			for (var i = rows; i > 0; i--) {
				lt.push(PrefixInteger(i, 2));
			}
		}

		bay = this.createLTitle(i, lt);
		this.addBay(bay);
		bay.position = new go.Point(-20, 3);

		//上标题
		var tt = new Array();
		if (info.lr == "L") {
			for (var i = 0; i < baynums; i++) {
				tt.push(PrefixInteger(2 * i + 1, 3));
			}
		} else {
			for (var i = baynums - 1; i >= 0; i--) {
				tt.push(PrefixInteger(2 * i + 1, 3));
			}
		}
		bay = this.createTTitle(i, tt);
		this.addBay(bay);
		bay.position = new go.Point(-3, -10);
	};
	//定义类结束

	module.exports = yardBase;
});