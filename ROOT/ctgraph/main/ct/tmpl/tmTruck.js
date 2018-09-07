"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    var template = $(go.Node, "Auto", {
        locationSpot: go.Spot.TopLeft,
        layerName: "truck"
    }, $(go.Panel, "Spot", $(go.Shape, "Circle", {
        name: "SHAPE",
        geometryString: "F M0,1 L0,19 L14,19 L14,1 Z M1,2 L1,9 L4,9 L4,2 Z M1,18, L1,11 L4,11 L4,18 Z M5,1 L5,19 M0,10 L5,10 M1,19 L1,20 L6,20 L6,19 Z M9,19 L9,20 L14,20 L14,19 Z M40,0 L40,1 L45,1 L45,0 Z M48,0 L48,1 L53,1 L53,0 Z M1,0 L1,1 L6,1 L6,0 Z M9,0 L9,1 L14,1 L14,0 Z M40,19 L40,20 L45,20 L45,19 Z M48,19 L48,20 L53,20 L53,19 Z M17,1 L17,19 L57,19 L57,1 Z M 14,9 L17,9 L17,8 L14,8 Z M14,10 L14,11 L17,11 L17,10 Z M20,2 L20,18 L54,18 L54,2 Z",
        fill: "brown"
    }), $(go.TextBlock, {
        margin: 8,
        stroke: "whitesmoke"
    }, new go.Binding("text", "MACH_NAME"))), new go.Binding("location", "loc", go.Point.parse));
    module.exports = template;
});