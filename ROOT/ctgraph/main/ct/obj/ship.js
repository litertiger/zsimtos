"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	var share = require("./shareData");
	//定义Ship类开始
	function Ship(info) {
		//this.color = "green";
		var berth = this.findBerth(info.BERTH);
		this.name = info.VESSEL_NAME;
		this.ie = info.I_E;
		this.text = this.name + "(" + (this.ie.indexOf('I') >= 0 ? '进' : '') + (this.ie.indexOf('E') >= 0 ? '出' : '') + "\u53E3)";
		this.ID = info.ID;
		if (berth) {
			var shipCount = berth.shipCount || 0;
			berth.shipCount = ++shipCount;
			var len = berth.LENGTH;
			var x = berth.BEG_X;
			this.headLength = 20;
			this.tailLength = 20;
			this.length = len;
			this.height = 20;
			this.loc = x + " " + (berth.BEG_Y - shipCount * (this.height+6));
			this.align = info.ALIGN || 'left';
			yardObject.call(this);
		}
	}
	Ship.inherit(yardObject);
	Ship.prototype.findBerth = function (id) {
		return share.objMap.berth.find(function (b) {
			return b.ID === id || b.BERTH_NAME === id;
		});
	};

	Ship.prototype.className = "Ship";

	Ship.prototype.ondoubleClick = function (e) {
		if (this.ie && this.ie.indexOf('E') > -1) top.Wb.open({
			url: "m?xwl=yardManage/yardedit/ShipDataOper/stowage",
			params: { vid: this.ID },
			title: "配载界面",
			inframe: true,
			success: function success(app) {
				//app.grid1.store.load({params:{vid:this.ID}})
			}
		});
	};
	//定义Ship类结束

	module.exports = Ship;
});
