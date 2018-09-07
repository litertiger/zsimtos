"use strict";

define(function (require, exports, module) {
    'use strict';

    var roadBase = require("./roadBase");
    var share = require("./shareData");
    var TruckGroup = require("./truckGroup");
    //var DragComputation = require("./dragComputation");
    //定义road类开始
    function road(opt) {
        for (var i in opt) {
            this[i] = opt[i];
        }this.from = this.BEG_POINT;
        this.to = this.END_POINT;
        for (var i = 0; i < share.objMap.yard.length; ++i) {
            if (share.objMap.yard[i].title === this.CY_AREA_NO) {
                this.area = share.objMap.yard[i];
                break;
            }
        }this.truckGroups = [];
        roadBase.call(this);
    }

    road.inherit(roadBase);

    road.prototype.addTruck = function (info) {
        var group = null;
        var beginBay = PrefixInteger(parseInt(info.CUR_CY_BAY_NO / 10) * 10 + 1, 2);
        for (var i = 0; i < this.truckGroups.length; ++i) {
            if (this.truckGroups[i].beginBay === beginBay) {
                group = this.truckGroups[i];
                break;
            }
        }if (!group) {
            group = new TruckGroup(this, beginBay);
            this.truckGroups.push(group);
        }
        group.addTruck(info);
    };

    road.prototype.removeTruck = function (id) {
        for (var i = 0; i < this.truckGroups.length; ++i) {
            if (this.truckGroups[i].removeTruck(id)) return true;
        }
    };

    road.prototype.className = "road";
    road.prototype.ondoubleClick = function (e) {
        ShowProp("road", this);
    };

    road.addTruck = function (info) {
        road.removeTruck(info.ID);
        if (info.CUR_CY_AREA_NO && info.CUR_CY_BAY_NO) for (var i = 0; i < share.objMap.road.length; ++i) {
            if (share.objMap.road[i].CY_AREA_NO === info.CUR_CY_AREA_NO) {
                share.objMap.road[i].addTruck(info);
                break;
            }
        }
    };
    road.removeTruck = function (id) {
        for (var i = 0; i < share.objMap.road.length; ++i) {
            if (share.objMap.road[i].removeTruck(id)) return;
        }
    };
    // 定义road类结束

    module.exports = road;
});