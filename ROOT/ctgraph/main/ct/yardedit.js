"use strict";

define(function (require) {
  'use strict';

  var go = require("gojs");
  var $A = go.GraphObject.make; // for conciseness in defining templates
  var DrawCom = require("../common/DrawCommandHandler");
  var ResMulti = require("../common/RotateMultipleTool");
  var RotMulti = require("../common/RotateMultipleTool");
  var Guid = require("../common/GuidedDraggingTool");

  function makeLayer(name) {
    var layerFG = Diagram.findLayer("Foreground");
    var layer = new go.Layer();
    layer.name = name;
    Diagram.addLayerBefore(layer, layerFG);
  }

  var Diagram = $A(go.Diagram, "myDiagramDiv", {
    "grid.visible": true,
    //allowDrop: true,  // accept drops from palette
    allowLink: false, // no user-drawn links
    initialPosition: new go.Point(0, 0),
    commandHandler: new DrawCom(), // defined in DrawCommandHandler.js
    // "commandHandler.arrowKeyBehavior": "move",
    "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom, // mouse wheel zooms instead of scrolls
    draggingTool: new Guid(),
    // "commandHandler.archetypeGroupData": { text: "Group", isGroup: true },
    // "dragSelectingTool.canStart":function(){return true},
    //rotatingTool: new ResMulti(),  // defined in RotateMultipleTool.js
    //resizingTool: new RotMulti(),  // defined in ResizeMultipleTool.js
    // "ChangedSelection": enableAll,  // defined below, to enable/disable commands
    // "ClipboardChanged": enableAll,
    "click": function click(e) {
      var share = require("./obj/shareData");
      var act = share.actionCursor;
      if (act) ShowProp(act, null, e.documentPoint);
    }
  });
  makeLayer("cntr");
  makeLayer("road");
  makeLayer("truck");
  makeLayer("yc");
  makeLayer("qc");
  makeLayer("areaPlan");
  makeLayer("ship");
  Diagram.isModified = false;

  //初始化模版
  var template = require("./tmpl/template");

  template.initTemplate(Diagram);

  //外边菜单用到，临时这样写
  window.myDiagram = Diagram;

  require("./biz/restruWb");

  myDiagram.addDiagramListener("SelectionMoved", function (e) {
    var parts = e.subject;
    parts.each(function (p) {
      if (p.isTopLevel) {
        p.isModified = true;
      }
    });
  });

  myDiagram.addDiagramListener("PartRotated", function (e) {
    var p = e.subject;
    p.isModified = true;
  });
  myDiagram.addDiagramListener("PartResized", function (e) {
    var p = e.subject;
    p.isModified = true;
  });

  myDiagram.addDiagramListener("SelectionDeleting", function (e) {
    var parts = e.subject;
    var share = require("./obj/shareData");
    //var FrameCrane = require("./obj/frameCrane");
    //var quayCrane = require("./obj/quayCrane");
    var parkingLot = require("./obj/parkingLot");
    var roadpoint = require("./obj/roadPoint");
    var road = require("./obj/road");
    //var truck = require("main/ct/obj/truck");
    var bollard = require("./obj/bollard");

    parts.each(function (p) {
      if (p instanceof go.Node) {
        p.data.del = '1';
        // p.data.setProperty("del","1");//删除标记
        /*if (p.data instanceof truck) {
            yardObjDataDel(p.data.info, "truck");
        } else if (p.data instanceof FrameCrane) {
            yardObjDataDel(p.data.info, "frameCrane");
        } else if (p.data instanceof quayCrane) {
            yardObjDataDel(p.data.info, "quayCrane");
        } elseif (p.data instanceof parkingLot) {
            yardObjDataDel(p.data, "parkingLot");
        } else if (p.data instanceof roadpoint) {
            yardObjDataDel(p.data, "roadPoint");
        } else if (p.data instanceof bollard) {
            yardObjDataDel(p.data, "bollard");
        } */
        if (!p.containingGroup) yardObjDataDel(p.data, p.data.className).catch(function () {
          return e.cancel = true;
        });
      }
      if (p.data instanceof road) {
        yardObjDataDel(p.data, "road");
      }
    });
  });
});