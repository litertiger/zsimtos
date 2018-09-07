"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var share = require("../obj/shareData");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λlabel
    var tmLabel = $(go.Node, "Spot", {
        locationSpot: go.Spot.Center,
        selectable: false,
        zOrder: 2
    }, new go.Binding("angle").makeTwoWay(),
    // remember the location of this Node
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    // can be resided according to the user's desires
    $(go.Shape, {
        figure: "Rectangle",
        fill: "white",
        width: share.slotSize.width,
        height: share.slotSize.height,
        strokeWidth: 0
    }, new go.Binding("fill", "color"), new go.Binding("width"), new go.Binding("height")), $(go.TextBlock, {
        //background: "lightgreen",
        font: "10px sans-serif",
        stroke: "black"
    }, new go.Binding("font"), new go.Binding("stroke"), new go.Binding("text").makeTwoWay()));
    //����Slot�����
    module.exports = tmLabel;
});
