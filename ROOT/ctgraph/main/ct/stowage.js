"use strict";

define(function (require) {
	'use strict';

	function makeLayer(name) {
		var layerFG = Diagram.findLayer("Foreground");
		var layer = new go.Layer();
		layer.name = name;
		Diagram.addLayerBefore(layer, layerFG);
	}
	var share = require("main/ct/obj/shareData");
	share.slotSize.width = 90;
	share.slotSize.height = 20;
	var go = require("gojs");
	require('./obj/yard');
	var $ = go.GraphObject.make; // for conciseness in defining templates
	var Diagram = $(go.Diagram, "myDiagramDiv", {
		//"grid.visible": true,
		isReadOnly: true,
		allowLink: false, // no user-drawn links
		"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom // mouse wheel zooms instead of scrolls
	});

	makeLayer("cntr");
	Diagram.isModified = false;
	//初始化模版
	var template = require("./tmpl/stow/template");
	template.initTemplate(Diagram);

	//外边菜单用到，临时这样写
	window.myDiagram = Diagram;
	myDiagram.addDiagramListener("ChangedSelection", function (e) {
		var slot = myDiagram.selection.first();
		var sels = app.grid1.getSelection();
		if (slot && slot.category === 'slot' && sels.length && app.stowCntr) {
			app.stowCntr(sels[0], slot);
		}
	});

	myDiagram.print = function () {
		var size = this.documentBounds.size;
		var img = this.makeImage({ size: size, maxSize: size }); //暂时保存图片
		img.setAttribute('id', 'imgPrint');
		var iframe = document.getElementById("iframePrint");
		if (!iframe) {
			iframe = document.createElement('iframe');
			iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;display:none');
			iframe.setAttribute('id', 'iframePrint');
			document.body.appendChild(iframe);
		}
		var doc = iframe.contentDocument;
		var oldimg = doc.getElementById("imgPrint");
		if (oldimg) doc.body.replaceChild(img, oldimg);else doc.body.appendChild(img);
		doc.close();
		setTimeout(function () {
			iframe.contentWindow.print();
		}, 2000);
	};
});
