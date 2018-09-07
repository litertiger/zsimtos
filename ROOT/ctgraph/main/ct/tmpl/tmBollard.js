"use strict";

define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    var bollard = $(go.Node, "Auto", {
        locationSpot: go.Spot.TopLeft
    }, $(go.Panel, "Spot", $(go.Shape, "Circle", {
        name: "SHAPE",
        geometryString: "F M0,0 L0,5 L5,5 L5,15 L10,15 L10,5 L15,5 L15,0 Z",
        fill: "black"
    }, new go.Binding("fill", "COLOR"))
    // ,$(go.TextBlock,{margin:8, stroke: "whitesmoke"},new go.Binding("text"))

    ), new go.Binding("key", "key"), new go.Binding("location", "loc", go.Point.parse));
    module.exports = bollard;
});