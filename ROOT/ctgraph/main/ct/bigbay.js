"use strict";

define(function (require) {
	'use strict';

	var go = require("gojs");
	var $A = go.GraphObject.make; // for conciseness in defining templates
	var DrawCom = require("main/common/DrawCommandHandler");
	// var ResMulti= require("main/common/RotateMultipleTool");
	var Diagram = $A(go.Diagram, "myDiagramDiv", { layout: // Diagram has simple horizontal layout
		$A(go.GridLayout, { wrappingColumn: 4, wrappingWidth: Infinity, alignment: go.GridLayout.Position, cellSize: new go.Size(1, 1), sorting: go.GridLayout.Forward }),
		initialContentAlignment: go.Spot.Center,
		allowLink: false, // no user-drawn links
		// commandHandler: new DrawCom(),  // defined in DrawCommandHandler.js
		"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom // mouse wheel zooms instead of scrolls
	});
	Diagram.isModified = false;
	//初始化模版
	var template = require("main/ct/tmpl/bigbay/template");
	template.initTemplate(Diagram);

	//外边菜单用到，临时这样写
	window.myDiagram = Diagram;
	require("main/ct/biz/restruWb");

	// 自动加载bay图

	$.ajax({
		url: '../m?xwl=yardManage/yardmonitor/getbay', // 跳转到 action
		data: {
			data: GetArgsFromHref(window.location.href, "bays")
		},
		async: false,
		type: 'post',
		cache: false,
		dataType: 'json',
		success: function success(data) {
			var newdata = seajs.require("main/ct/biz/restruWb");
			drawBay(newdata(data, "CY_BAY_NO"));
		},
		error: function error() {
			alert("异常！");
		}
	});

	function drawBay(newdata) {
		for (var j in newdata) {
			var bay = require("main/ct/obj/bigbay/bay");
			var ya = new bay(newdata[j]);
		}
	}
	window.setTimeout("loadbigbaycntr()", 100);
});
