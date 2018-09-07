"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	var share = require("./shareData");
	//var DragComputation = require("./dragComputation");
	//定义Car类开始
	//定义Crane类开始
	function quayCrane(opt) {
		for (var i in opt) {
			this[i] = opt[i];
		} //this.POS_X = info.POS_X;
		//this.POS_Y = info.POS_Y;
		this.initPosition();
		this.loc = this.POS_X + " " + this.POS_Y;
		yardObject.call(this);
		//DragComputation.call(this);
	}
	quayCrane.inherit(yardObject);

	quayCrane.prototype.initPosition = function () {
		if (this.CUR_CY_AREA_NO) {
			for (var i = 0; i < share.objMap.berth.length; ++i) {
				if (share.objMap.berth[i].ID === this.CUR_CY_AREA_NO) //找场
					{
						var pt = share.objMap.berth[i].loc.split(" ");
						this.POS_X = pt[0];
						this.POS_Y = pt[1] - 100;
						break;
					}
			}
		}
	};

	quayCrane.prototype.className = "quayCrane";

	//定义Crane类结束

	module.exports = quayCrane;
});
