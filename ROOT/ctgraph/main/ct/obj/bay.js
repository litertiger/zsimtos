"use strict";

define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var bayBase = require("./bayBase");
    var Group = require("./group");
    var share = require("./shareData");
    var Label = require("./label");
    var hei = share.slotSize.height;
    //定义DeckRow类开始
    function bay(info) {
        this.movable = false;
        Group.call(this, info);
        bayBase.call(this, info);
    }

    bay.inherit(Group);
    bay.prototype.initPosition = function () {
        var pt = new go.Point(0, 0);
        var slots = this.slots;
        // for (var s in slots) {
        slots.forEach(function (slot, i) {
            if (slot instanceof Label) pt.y = -2;else {
                //if (i == parseInt(slot.h)) pt.y = i * hei;else pt.y = slot.h * hei;
              pt.y = i * hei;
            }
            slot.position = pt;
        });
    };

    bay.prototype.createTitle = function (no) {
        var _this = this;

        var lb = new Label(no);
        lb.ondoubleClick = function (e) {
            return _this.ondoubleClick(e);
        };
        return lb;
    };

    bay.prototype.ondoubleClick = function (e) {
        var para = this.id.split('|');
        Load('m?xwl=yardManage/yardedit/bayDataOper/OperWnd', {
            area: para[0],
            bay: para[1]
        }).then(function (app) {
            return app.window1.show();
        });
        return false;
    };

    bay.prototype.toJsonData = function () {
        var obj = {};
        for (var i in this) {
            if (i === "movable") continue;
            var v = this[i];
            obj[i] = v;
        }
        var yardObject = require("./yardObject");
        return yardObject.prototype.toJsonData.call(obj);
    };
    bay.prototype.className = "bay";
    //定义DeckRow类结束

    module.exports = bay;
});
