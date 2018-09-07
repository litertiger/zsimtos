"use strict";

define(function (require, exports, module) {
    'use strict';

    var yardObject = require("./yardObject");
    var go = require("gojs");
    //var DragComputation = require("./dragComputation");
    //定义berth类开始
    function berth(opt) {
        for (var i in opt) {
            this[i] = opt[i];
        }this.text = this.BERTH_NAME;

        this.loc = this.BEG_X + " " + this.BEG_Y;
        this.width = this.LENGTH;

        yardObject.call(this);
        //DragComputation.call(this);
        // this.position = new go.point(info.R_U_X, info.R_U_Y);debugger;
    }

    berth.inherit(yardObject);

    berth.prototype.className = "berth";

    //定义berth类结束
    module.exports = berth;
});