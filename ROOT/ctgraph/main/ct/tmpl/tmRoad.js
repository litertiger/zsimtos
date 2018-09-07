"use strict";

define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    var road = $(go.Link, { layerName: "road", zOrder: 1 }, $(go.Shape, { strokeWidth: 2, stroke: 'red' }), // the link shape
    $(go.Shape, // the arrowhead
    { toArrow: "OpenTriangle", fill: null, strokeWidth: 5, stroke: 'red' }), $(go.Shape, // the arrowhead
    { fromArrow: "BackwardOpenTriangle", fill: null, strokeWidth: 5, stroke: 'red' }));
    module.exports = road;
});