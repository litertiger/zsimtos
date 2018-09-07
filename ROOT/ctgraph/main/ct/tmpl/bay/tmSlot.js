"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var share = require("main/ct/obj/shareData");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λ
    var Cntr = $(go.Node, "Spot", {
        locationSpot: go.Spot.Center,
        movable: false,
        zOrder: 1
    }, new go.Binding("zOrder"), new go.Binding("angle").makeTwoWay(),
    //new go.Binding("name", "xxx"),
    // remember the location of this Node
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    // can be resided according to the user's desires
    $(go.Shape, {
        figure: "Rectangle",
        fill: "lightgreen",
        width: share.BslotSize.width,
        height: share.BslotSize.height
    }, new go.Binding("width").makeTwoWay(), new go.Binding("height").makeTwoWay()));
    //����Slot�����
    module.exports = Cntr;
});