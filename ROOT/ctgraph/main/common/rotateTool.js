"use strict";

define(function (require, exports, module) {
	'use strict';

	var go = require("gojs");
	var share = require("../ct/obj/shareData");
	var myDiagram = share.diagram;
	//定义Group类开始
	function rotate(node, angle) {
		var tool = myDiagram.toolManager.draggingTool; // should be a SnappingTool
		myDiagram.startTransaction("rotate " + angle.toString());
		var sel = new go.Set(go.Node);
		sel.add(node);
		var coll = tool.computeEffectiveCollection(sel).toKeySet();
		var bounds = myDiagram.computePartsBounds(coll);
		var center = bounds.center;
		coll.each(function (n) {
			n.angle += angle;
			n.location = n.location.copy().subtract(center).rotate(angle).add(center);
		});
		myDiagram.commitTransaction("rotate " + angle.toString());
	}
	//定义Group类结束

	module.exports = rotate;
});