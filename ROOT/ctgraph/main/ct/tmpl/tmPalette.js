"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λ
    var Slot = $(go.Node, "Spot", $(go.Shape, {
        name: "SHAPE",
        fill: "rgb(130, 130, 256)"
    }, new go.Binding("figure", "fig"),
    // this determines the actual shape of the Shape
    new go.Binding("geometryString", "geo"),
    // allows the color to be determined by the node data
    new go.Binding("fill", "color")));
    //����Slot�����
    module.exports = Slot;
});