"use strict";

define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make;
    var specYard = $(go.Node, "Auto", {
        width: 140, height: 70,
        locationSpot: go.Spot.TopLeft,
        resizable: true
    }, $(go.Shape, "Rectangle", {
        name: "yard",
        strokeWidth: 1,
        // stroke:"red",
        fill: "rgba(8, 141, 49, 0.54)"
    }), $(go.TextBlock, {
        text: "打堆场块"
    }, new go.Binding("text", "CY_AREA_NO", function (data) {
        return "打堆场块" + data;
    })), new go.Binding("width", "width"), new go.Binding("height", "height"));
    module.exports = specYard;
});