define(function (require, exports, module) {
	'use strict';
	var AnjiObject = require("./anjiObject");
	//定义Group类开始
	function Group() {
		this.isGroup = true;
		AnjiObject.call(this);
	}
	Group.inherit(AnjiObject);

	Group.prototype.render = function () {
		AnjiObject.prototype.render.call(this);
	};
	
	Group.prototype.toJsonData = function () {
		var obj = {}
		for (var i in this) {
			if (i === "group" || i === "isGroup")
				continue;
			var v = this[i]
				obj[i] = v;
		}
		return AnjiObject.prototype.toJsonData.call(obj);
	}
	Group.prototype.className = "Group";
	//定义Group类结束

	module.exports = Group;
});
