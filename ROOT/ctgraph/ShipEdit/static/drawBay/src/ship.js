define(function (require, exports, module) {
	'use strict';
	var Group = require("./group");
	var share = require("./shareData");
	//定义Ship类开始
	function Ship() {
		this.color = "green";
		this.headLength = 200;
		this.bodyLength = 1000;
		this.tailLength = 200;
		this.tailWidth = 240;
		this.width = 330;
		Group.call(this);
	}
	Ship.inherit(Group);

	Ship.prototype.className = "Ship";
	//定义Ship类结束

	module.exports = Ship;
});
