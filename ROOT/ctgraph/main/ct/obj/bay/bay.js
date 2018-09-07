"use strict";

define(function (require, exports, module) {
	'use strict';

	var bayBase = require("main/ct/obj/bay/bayBase");
	var Group = require("main/ct/obj/group");
	var row = require("main/ct/obj/bay/row");
	var Label = require("main/ct/obj/labelTitle");
	var Lft = require("main/ct/obj/bay/leftTitle");
	//定义CabinBay类开始
	function bay(info) {
		this.selectable = false;
		Group.call(this);
		bayBase.call(this, info);
	}

	bay.inherit(Group);

	bay.prototype.createRow = function (info) {
		return new row(info);
	};
	bay.prototype.createTitle = function (yardno, info) {
		var lb = new Label(info);
		lb.id = yardno + '|' + info;
		lb.ondoubleClick = function () {
			window.open('bigBay.html?bays=' + lb.id);
		};
		return lb;
	};
	bay.prototype.createLTitle = function (no, info) {
		return new Lft(info);
	};

	bay.prototype.className = "bay";
	//定义CabinBay类结束

	module.exports = bay;
});