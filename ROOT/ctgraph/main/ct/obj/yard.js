"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardBase = require("./yardBase");
	var Group = require("./group");
	var bay = require("./bay");
	var Label = require("./labelTitle");
	var Lft = require("./leftTitle");
	var go = seajs.require("gojs");
	var yardObject = require("./yardObject");
	//定义CabinBay类开始
	function yard(opt) {
		for (var i in opt) {
			this[i] = opt[i];
		}this.X = opt.X0;
		this.Y = opt.Y0;
		Group.call(this);
		yardBase.call(this, opt);
		this.position = new go.Point(this.X, this.Y);
	}

	yard.inherit(Group);

	yard.prototype.createBay = function (info) {
		return new bay(info);
	};
	yard.prototype.createTitle = function (no, info) {
		var _this = this;

		var lb = new Label(info);
		lb.ondoubleClick = function (e) {
			return _this.ondoubleClick(e);
		};
		return lb;
	};
	yard.prototype.createLTitle = function (no, info) {
		var lb = new Lft(info);
		lb.ondoubleClick = function (e) {};
		return lb;
	};
	// yard.prototype.createTTitle = function (no, info) {
	// 	return new Tft(info);
	// }


	yard.prototype.toJsonData = function () {
		var obj = {};
		for (var i in this) {
			if (i === "isGroup" || i === "info") continue;
			var v = this[i];
			obj[i] = v;
		}
		return yardObject.prototype.toJsonData.call(obj);
	};

	yard.prototype.className = "yard";
	//定义CabinBay类结束

	module.exports = yard;
});
