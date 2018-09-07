"use strict";

define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    var roadPoint = $(go.Node, "Auto", {
        locationSpot: go.Spot.TopLeft,
        layerName: "road",
        zOrder: 2
    }, $(go.Shape, "Circle", {
        name: "RoadPoint",
        strokeWidth: 1,
        fill: "brown",
        width: 10
    }, new go.Binding("fill", "color")),
    // ,$(go.TextBlock,{margin:8, stroke: "whitesmoke"},new go.Binding("text"))


    new go.Binding("key", "key"), new go.Binding("location", "loc", go.Point.parse));
    module.exports = roadPoint;
});