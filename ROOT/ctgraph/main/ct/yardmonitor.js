"use strict";

define(function(require) {
  'use strict';

  function makeLayer(name) {
    var layerFG = Diagram.findLayer("Foreground");
    var layer = new go.Layer();
    layer.name = name;
    Diagram.addLayerBefore(layer, layerFG);
  }
  var share = require("main/ct/obj/shareData");
  var go = require("gojs");
  var $A = go.GraphObject.make; // for conciseness in defining templates
  var DrawCom = require("main/common/DrawCommandHandler");
  var ResMulti = require("main/common/RotateMultipleTool");
  var mutiSele = require("main/common/bayDragSelectingTool");
  var bCanDragSelect = true;
  var Diagram = $A(go.Diagram, "myDiagramDiv", {
    //"grid.visible": true,
    isReadOnly: true,
    allowLink: false, // no user-drawn links
    // commandHandler: new DrawCom(),  // defined in DrawCommandHandler.js
    dragSelectingTool: new mutiSele(),
    "dragSelectingTool.canStart": function dragSelectingToolCanStart() {
      return bCanDragSelect;
    },
    "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom // mouse wheel zooms instead of scrolls
  });

  makeLayer("cntr");
  makeLayer("road");
  makeLayer("truck");
  makeLayer("qc");
  makeLayer("ship");
  makeLayer("berth");
  makeLayer("yc");
  makeLayer("areaPlan");
  Diagram.isModified = false;
  //初始化模版
  var template = require("main/ct/tmpl/template");
  template.initTemplate(Diagram);

  //外边菜单用到，临时这样写
  window.myDiagram = Diagram;
  require("main/ct/biz/restruWb");
  require("main/ct/biz/filter");
  myDiagram.addDiagramListener("ChangedSelection", function(e) {
    myDiagram.isReadOnly = !(myDiagram.selection.size > 0 && myDiagram.selection.all(function(sel) {
      return sel.data && sel.data.className === 'boundary';
    }));
    bCanDragSelect = !(myDiagram.selection.size > 0 && myDiagram.selection.any(function(sel) {
      return sel.data && sel.data.className !== 'slot';
    }));
  });

  myDiagram.addDiagramListener("PartResized", function(e) {
    var p = e.subject.part;
    p.data.caclBayRow();
    yardObjDataUpdate(p.data.toJsonData(), p.data.className);
  });
  myDiagram.addDiagramListener("SelectionDeleted", function(e) {
    var parts = e.subject;
    var Boundary = require("main/ct/obj/boundary");
    parts.each(function(p) {
      if (p.data instanceof Boundary) {
        yardObjDataDel(p.data, "boundary");
      }
    });
  });
});