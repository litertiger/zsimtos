"use strict";

define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make;
    var berth = $(go.Node, "Auto", {
        width: 70,
        height: 20,
        locationSpot: go.Spot.TopLeft,
        layerName:"berth",
        resizable: true
    }, $(go.Shape, "Rectangle", {
        name: "berth",
        strokeWidth: 1,
        // stroke:"red",
        fill: "rgba(8, 80, 141, 0.54)"
    }, new go.Binding("fill", "COLOR")), $(go.TextBlock, {
        text: "泊位"
    }, new go.Binding("text", "text")), new go.Binding("width", "width"), new go.Binding("height", "height"), new go.Binding("location", "loc", go.Point.parse));
    module.exports = berth;
});