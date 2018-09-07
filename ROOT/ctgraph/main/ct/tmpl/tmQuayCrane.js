"use strict";

define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λ
    //�ϳ�ģ�忪ʼ
    var quayCrane = $(go.Node, "Auto", {
        locationSpot: go.Spot.TopLeft,
        resizable: true,
        resizeObjectName: "SHAPE",
        zOrder: 10,
        layerName: "qc"
    }, $(go.Panel, "Spot", $(go.Picture, {
        margin: 1,
        source: "ctgraph/assets/img/quayCraneBig.png"
    }), $(go.TextBlock, {
        margin: 8
    }, new go.Binding("text", "MACH_NAME"))), new go.Binding("location", "loc", go.Point.parse));
    //����ģ�����

    //�ϳ�ģ�����
    //����Slot�����
    module.exports = quayCrane;
});