"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    var share = require("../obj/shareData");
    //�ѳ���λ
    //�ϳ�ģ�忪ʼ
    var tmPlanC = $(go.Node, "Auto", {
        locationSpot: go.Spot.Center,
        resizable: true, resizeObjectName: "PCBG",
        resizeCellSize: new go.Size(share.slotSize.width, share.slotSize.height),
        zOrder: 4,
        layerName: "areaPlan"
    }, new go.Binding("isSelected"), $(go.Panel, "Auto", { name: "pc" }, $(go.Shape, "Rectangle", {
        name: "PCBG",
        fill: "rgba(255, 0, 0, 0.4)"
    }, new go.Binding("fill", "color"), new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)), $(go.Shape, "Rectangle", {
        name: "LINE",
        geometryString: "M10,0 L10,100 L100,100 L90,90 M100,100 L90,110"
    }, new go.Binding("geometryString", "geometryString"), new go.Binding("angle", "angle"), new go.Binding("desiredSize", "Lsize", go.Size.parse).makeTwoWay(go.Size.stringify)), $(go.TextBlock, {}, new go.Binding("text"))));
    //����ģ�����

    //�ϳ�ģ�����
    //����Slot�����
    module.exports = tmPlanC;
});