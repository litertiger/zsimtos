"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λ
    //�ϳ�ģ�忪ʼ
    var FrameCrane = $(go.Node, "Auto", {
        locationSpot: go.Spot.TopLeft,
        resizable: true,
        resizeObjectName: "SHAPE",
        zOrder: 10,
        layerName: "yc"
    }, $(go.Panel, "Spot", $(go.Shape, "Circle", {
        name: "SHAPE",
        geometryString: "F M13,0 L48,0 L48,140 L13,140 Z M0,13 L60,13 L60,25 L0,25 Z M0,115 L60,115 L60,128 L0,128 Z",
        fill: "rgba(255,0,0,0.5)",
        width: 30
    }, new go.Binding("height")), $(go.TextBlock, {
        margin: 8,
        angle: 90
    }, new go.Binding("text", "MACH_NAME"))), new go.Binding("location", "loc", go.Point.parse));
    //����ģ�����

    //�ϳ�ģ�����
    //����Slot�����
    module.exports = FrameCrane;
});