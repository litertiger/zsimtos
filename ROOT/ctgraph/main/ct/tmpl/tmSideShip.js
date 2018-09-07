"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var Ship = require("../obj/ship");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    function makePt(x, y) {
        return parseInt(x) + " " + parseInt(y);
    }

    function line(x, y) {
        this.push(' L' + makePt(x, y));
    }

    function move(x, y) {
        this.push(' M' + makePt(x, y));
    }

    function bezierCurve(x1, y1, x2, y2, x, y) {
        this.push(' C' + makePt(x1, y1) + " " + makePt(x2, y2) + " " + makePt(x, y));
    }

    go.Shape.defineFigureGenerator("SideShip", function (shape, w, h) {
        var nh = (h - 5) * 8 / 11;
        var pt = ["F"];
        var lineTo = line.bind(pt);
        var moveTo = move.bind(pt);
        var bezierCurveTo = bezierCurve.bind(pt);
        if (!(shape && shape.parameter1 && shape.parameter1 instanceof Ship)) return go.Geometry.parse(" ");
        var ship = shape.parameter1;
        var x = ship.align === 'left' ? 0 : w;
        var y = h - nh;

        function offset(len) {
            return ship.align === 'left' ? len : -len;
        }

        //绘制船尾
        moveTo(x, y);
        y += nh / 2;
        lineTo(x, y);
        x += offset(ship.tailLength / 2);
        lineTo(x, y);
        bezierCurveTo(x + offset(ship.tailLength), y + nh / 8, x - offset(ship.tailLength), y + nh * 3 / 8, x, y + nh / 2);
        //绘制底线
        y = h;
        x += offset(w - ship.tailLength / 2 - ship.headLength / 2);
        lineTo(x, y);
        //绘制船头
        bezierCurveTo(x + offset(ship.headLength), y - nh / 8, x - offset(ship.headLength), y - nh * 3 / 8, x, y - nh / 2);
        x += offset(ship.headLength / 2);
        y = h - nh - 5;
        lineTo(x, y);
        x -= offset(ship.headLength * 0.4);
        lineTo(x, y);
        y += 5;
        lineTo(x, y);
        //闭合路径(绘制顶线)
        pt.push("z");
        //绘制瞭望塔
        x += offset(ship.headLength * 0.3);
        y = h - nh - 5;
        moveTo(x, y);
        y -= nh / 8;
        lineTo(x, y);
        x -= offset(ship.headLength * 0.05);
        lineTo(x, y);
        y -= nh / 8;
        lineTo(x, y);
        x -= offset(ship.headLength * 0.05);
        lineTo(x, y);
        y += nh / 8;
        lineTo(x, y);
        x -= offset(ship.headLength * 0.05);
        lineTo(x, y);
        y += nh / 8;
        lineTo(x, y);
        x += offset(ship.headLength * 0.075);
        y -= nh / 4;
        moveTo(x, y);
        y -= nh / 8;
        lineTo(x, y);
        x += offset(ship.headLength * 0.05);
        y += nh / 16;
        moveTo(x, y);
        x -= offset(ship.headLength * 0.1);
        lineTo(x, y);
        return go.Geometry.parse(pt.join(""));
    });

    var SideShip = $(go.Node, "Auto", {
        layerName: "ship"
    }, new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    //tail
    $(go.Panel, $(go.Shape, {
        figure: "SideShip",
        fill: "green"
    },
    // remember the size of this node
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), new go.Binding("width", "length"), new go.Binding("parameter1", ""), new go.Binding("height")), $(go.TextBlock, {
        font: "8px sans-serif",
        stroke: "black"
    }, new go.Binding("text"))));

    module.exports = SideShip;
});
