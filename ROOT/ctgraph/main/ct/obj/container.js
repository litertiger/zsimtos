"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	var share = require("./shareData");
	//定义Slot类开始
	function Cntr(opt) {
		for (var i in opt) {
			this[i] = opt[i];
		}this.color = this.getColor() || "gray";
		yardObject.call(this);
	}
	Cntr.inherit(yardObject);

	Cntr.prototype.getColor = function () {
		for (var key in share.colorMap[share.colorCategory]) {
			if (key === this[share.colorCategory]) return share.colorMap[share.colorCategory][key];
		}return "";
	};
	/*var lastWindow;
 Cntr.prototype.onclick = function (e) {
 	if(lastWindow)
 		lastWindow.close();
 	Load(`m?xwl=yardManage/yardedit/${this.className}DataOper/OperWnd&cntr=${this.cntrno}`).then(function (app) {
 		app.window1.show();
 		app.window1.setPosition(e.viewPoint.x,e.viewPoint.y);
 		lastWindow = app.window1;
 	});
 	return false;
 }*/

	Cntr.prototype.ondoubleClick = function (e) {
		Load('m?xwl=controlManage/portcntr/control-module', {
			ID: this.ID
		}).then(function (app) {
			var wins = new Ext.window.Window(app._cntrWin);
			wins.show();
		});
		return false;
	};

	Cntr.prototype.className = "cntr";
	//定义Slot类结束
	module.exports = Cntr;
});
