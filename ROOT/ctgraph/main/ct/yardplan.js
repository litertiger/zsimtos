"use strict";

define(function (require) {
	'use strict';

	var go = require("gojs");
	var $A = go.GraphObject.make; // for conciseness in defining templates
	var DrawCom = require("main/common/DrawCommandHandler");
	var ResMulti = require("main/common/RotateMultipleTool");
	var mutiSele = require("main/common/multiDragSelectingTool");
	var Diagram = $A(go.Diagram, "myDiagramDiv", {
		//"grid.visible": true,
		allowDrop: true, // accept drops from palette
		allowLink: false, // no user-drawn links
		commandHandler: new DrawCom(), // defined in DrawCommandHandler.js
		// "commandHandler.arrowKeyBehavior": "move",
		"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom, // mouse wheel zooms instead of scrolls
		dragSelectingTool: new mutiSele(),
		// "commandHandler.archetypeGroupData": { text: "Group", isGroup: true },
		"dragSelectingTool.canStart": function dragSelectingToolCanStart() {
			return planState;
		}
		//rotatingTool: new ResMulti(),  // defined in RotateMultipleTool.js
		//resizingTool: new RotMulti(),  // defined in ResizeMultipleTool.js
		// "ChangedSelection": enableAll,  // defined below, to enable/disable commands
		// "ClipboardChanged": enableAll,
	});
	Diagram.isModified = false;
	//初始化模版
	var template = require("main/ct/tmpl/template");
	template.initTemplate(Diagram);

	//外边菜单用到，临时这样写
	myDiagram = Diagram;
	require("main/ct/biz/filter");
	require("main/ct/biz/restruWb");

	myDiagram.addDiagramListener("SelectionDeleted", function (e) {
		var parts = e.subject;
		var share = require("main/ct/obj/shareData");
		parts.each(function (p) {
			if (p instanceof go.Node) {
				p.data.del = '1';
				// p.data.setProperty("del","1");//删除标记
			}
		});
	});
});