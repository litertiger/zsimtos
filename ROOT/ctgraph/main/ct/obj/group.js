"use strict";

define(function (require, exports, module) {
	'use strict';

	var yardObject = require("./yardObject");
	//定义Group类开始
	function Group() {
		this.isGroup = true;
		yardObject.call(this);
	}
	Group.inherit(yardObject);
	Group.prototype.className = "Group";
	//定义Group类结束

	module.exports = Group;
});