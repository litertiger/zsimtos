"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λ
    var Slot = $(go.Node, "Spot", {
        locationSpot: go.Spot.Center,
        deletable: false,
        zOrder: 3
    }, new go.Binding("zOrder"), new go.Binding("angle").makeTwoWay(), $(go.Panel, "Auto", $(go.Shape, {
        figure: "InternalStorage",
        fill: "red",
        width: 60,
        height: 60
    }), $(go.TextBlock, { text: "yard", margin: 10, stroke: "white" })));
    //����Slot�����
    module.exports = Slot;
});