define(function(require, exports, module) {
	'use strict';
	var AnjiObject = require("./anjiObject");
	//定义Label类开始
	function Label(no) {
		this.no = no;
		AnjiObject.call(this);
	}
	Label.inherit(AnjiObject);
	Label.prototype.className = "Label";
	//定义Label类结束
	module.exports = Label;
});
