"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λlabel
    var tm = $(go.Group, "Auto", new go.Binding("selectable"), new go.Binding("layerName"), new go.Binding("zOrder"), new go.Binding("angle").makeTwoWay(), new go.Binding("movable"), $(go.Shape, "Rectangle", // the rectangular shape around the members
    { fill: "rgba(128,128,128,0)", strokeWidth: 0 }), $(go.Placeholder));
    //����Slot�����
    module.exports = tm;
});