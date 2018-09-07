"use strict";

define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make;
    var parkingLot = $(go.Node, "Auto", {
        width: 70, height: 70,
        locationSpot: go.Spot.TopLeft
        // ,resizable: true
        // ,resizeObjectName: "Parking"
    }, $(go.Shape, "Rectangle", {
        name: "Parking",
        strokeWidth: 1,
        // stroke:"red",
        fill: "rgba(8, 141, 49, 0.54)"
    }, new go.Binding("fill", "color")), $(go.TextBlock, {
        text: "停车场"
    }, new go.Binding("text", "PARK_NAME", function (data) {
        return "停车场" + data;
    })), new go.Binding("width", "width"), new go.Binding("height", "height"), new go.Binding("location", "loc", go.Point.parse));
    module.exports = parkingLot;
});