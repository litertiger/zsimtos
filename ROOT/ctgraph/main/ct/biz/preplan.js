"use strict";

/**
* Created by kingser on 2016/10/17.
*/
define(function (require, exports, module) {
    'use strict';

    function preplan(sle, issle) {
        var share = require("main/ct/obj/shareData");
        var direct = share.direct.toString();
        var Slot = seajs.require("main/ct/obj/slot");
        var arr = sle;
        if (sle instanceof Array) {} else arr = sle.toArray();
        var lx = 0,
            ly = 0,
            rx = 0,
            ry = 0;
        var posx = [],
            posy = [];
        var slotA = [];
        for (var i in arr) {
            //var cate = arr[i].data.category
            if (arr[i].data instanceof Slot) {
                slotA.push(arr[i].data.id);
                posx.push(arr[i].data.position.x);
                posy.push(arr[i].data.position.y);
            }
        }
        posx.sort(sortNumber);
        posy.sort(sortNumber);
        lx = posx[0];
        ly = posy[0];
        rx = posx[posx.length - 1];
        ry = posy[posy.length - 1];
        var go = seajs.require("gojs");
        var planC = seajs.require("main/ct/obj/planC");
        var color = "rgba(144,144,144,0.5)";
        var tp = gettype(direct);
        var ops = { text: "", type: tp, w: Math.abs(rx - lx), h: Math.abs(ry - ly), color: color };
        var planCx = new planC(ops);
        planCx.position = new go.Point(lx, ly);
        planCx.node.isSelected = issle;
        planCx.slotA = slotA;
    }

    function sortNumber(a, b) {
        return a - b;
    }
    function gettype(direct) {
        var type = 0;
        switch (direct) {
            case 'D,R':
                type = 1;
                break;
            case 'L,D':
                type = 2;
                break;
            case 'U,L':
                type = 3;
                break;
            case 'R,U':
                type = 4;
                break;
            case 'L,U':
                type = 5;
                break;
            case 'U,R':
                type = 6;
                break;
            case 'R,D':
                type = 7;
                break;
            case 'D,L':
                type = 8;
                break;
            default:
                type = 7;
        }
        return type;
    }

    module.exports = preplan;
});