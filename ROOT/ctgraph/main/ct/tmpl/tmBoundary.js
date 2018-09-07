"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    var share = require("../obj/shareData");

    var tmBoundary = $(go.Node, "Auto", {
        locationSpot: go.Spot.Center,
        resizable: true, resizeObjectName: "PCBG",
        resizeCellSize: new go.Size(share.slotSize.width, share.slotSize.height),
        zOrder: 4,
        layerName: "areaPlan",
        movable: false
    }, new go.Binding("isSelected"), $(go.Panel, "Auto", { name: "pc" }, $(go.Shape, "Rectangle", {
        name: "PCBG",
        fill: "rgba(0, 0, 255, 0.4)"
    }, new go.Binding("fill", "color"), new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)), $(go.TextBlock, {}, new go.Binding("text"))));
    module.exports = tmBoundary;
});