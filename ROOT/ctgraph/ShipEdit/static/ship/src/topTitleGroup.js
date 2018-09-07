define(function (require, exports, module) {
	'use strict';
	var AnjiObject = require("./anjiObject");
	var Group = require("./group");
	var Label = require("./label");
	var go = require("gojs");
	var share = require("./shareData");
	//定义TopTitleGroup类开始
	function TopTitleGroup(no) {
		this.no = no;
		Group.call(this);
		this.label = new Label(no);
		this.label.position = new go.Point(0,-share.slotSize.height);
		this.label.node.containingGroup = this.node;
	}
	TopTitleGroup.inherit(Group);
	TopTitleGroup.prototype.className = "TopTitleGroup";
	//定义TopTitleGroup类结束

	module.exports = TopTitleGroup;
});
