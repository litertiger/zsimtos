"use strict";

define(function (require, exports, module) {
	'use strict';

	var go = require("gojs");
	var share = require("main/ct/obj/shareData");
	var wd = share.BslotSize.width;
	var bayBase = function bayBase(info) {
		//重新处理 每一排的数据
		var newdata = {};
		var datarows = info;
		var maxTier = "00";
		for (var i = 0; i < datarows.length; i++) {
			var datarow = datarows[i],
			    bayno = datarow.CY_ROW_NO,
			    tierno = datarow.CY_TIER_NO,
			    jobItem = newdata[bayno];
			if (tierno > maxTier) maxTier = tierno;
			if (jobItem) {
				newdata[bayno].push(datarow);
			} else {
				newdata[bayno] = [datarow];
			}
		}
		//处理完成
		this.rows = [];
		var bay;
		this.addRow = function (row) {
			this.rows.push(row);
			row.node.containingGroup = this.node;
		};

		//加个bay标题
		this.title = info[0].CY_BAY_NO;
		var title = this.createTitle(info[0].CY_AREA_NO, this.title);
		this.addRow(title);
		title.position = new go.Point(100, -10);

		// slot
		for (var i in newdata) {
			bay = this.createRow(newdata[i]);
			this.addRow(bay);
			bay.position = new go.Point((i - 1) * wd, 0);
		}

		//左标题
		var lt = new Array();
		var rownum = parseInt(maxTier);
		for (var i = rownum; i > 0; i--) {
			lt.push(i);
		}
		bay = this.createLTitle(i, lt);
		this.addRow(bay);
		bay.position = new go.Point(-20, 15);
	};
	//定义类结束

	module.exports = bayBase;
});