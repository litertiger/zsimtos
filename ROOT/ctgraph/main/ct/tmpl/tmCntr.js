"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var share = require("../obj/shareData");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λ
    var Slot = $(go.Node, "Spot", {
        locationSpot: go.Spot.Center,
        layerName: "cntr"
    }, new go.Binding("zOrder"), new go.Binding("angle").makeTwoWay(),
    //new go.Binding("name", "xxx"),
    // remember the location of this Node
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    // can be resided according to the user's desires
    $(go.Shape, {
        figure: "Rectangle",
        fill: "white",
        width: share.slotSize.width,
        height: share.slotSize.height
    }, new go.Binding("fill", "color"), new go.Binding("width", "siz", function (v) {
        return (v > 20 ? 2 : 1) * share.slotSize.width;
    })));
    //����Slot�����
    module.exports = Slot;
});