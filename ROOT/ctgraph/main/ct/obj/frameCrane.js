"use strict";

define(function (require, exports, module) {
    'use strict';

    var yardObject = require("./yardObject");
    var share = require("./shareData");
    //var DragComputation = require("./dragComputation");
    //定义Crane类开始
    function FrameCrane(opt) {
        for (var i in opt) {
            this[i] = opt[i];
        } //this.POS_X = info.POS_X;
        //this.POS_Y = info.POS_Y;
        this.initPosition();
        this.loc = this.POS_X + " " + this.POS_Y;
        yardObject.call(this);
        //DragComputation.call(this);
    }

    FrameCrane.inherit(yardObject);

    FrameCrane.prototype.initPosition = function () {
        if (this.CUR_CY_AREA_NO && this.CUR_CY_BAY_NO) {
            var bayNo = this.CUR_CY_BAY_NO % 2 == 0 ? PrefixInteger(this.CUR_CY_BAY_NO - 1, 2) : this.CUR_CY_BAY_NO;
            for (var i = 0; i < share.objMap.yard.length; ++i) {
                if (share.objMap.yard[i].title === this.CUR_CY_AREA_NO) //找场
                    {
                        var id = this.CUR_CY_AREA_NO + '|' + bayNo;
                        var yard = share.objMap.yard[i];
                        for (i = 0; i < yard.rows.length; ++i) {
                            if (yard.rows[i].id === id) //找贝
                                {
                                    var bay = yard.rows[i];
                                    for (var i = 0; i < share.objMap.road.length; ++i) {
                                        if (share.objMap.road[i].CY_AREA_NO === this.CUR_CY_AREA_NO) //找车道
                                            {
                                                var road = share.objMap.road[i];
                                                var fromPt = road.node.fromNode.data;
                                                var toPt = road.node.toNode.data;
                                                if (Math.abs(fromPt.Y - toPt.Y) < 20) {
                                                    this.POS_X = bay.position.x;
                                                    if (this.CUR_CY_BAY_NO % 2 == 0) this.POS_X += share.slotSize.width / 2;
                                                    this.POS_Y = (fromPt.Y + toPt.Y) / 2;
                                                } else {
                                                    this.POS_X = (fromPt.X + toPt.X) / 2;
                                                    this.POS_Y = bay.position.y;
                                                    if (this.CUR_CY_BAY_NO % 2 == 0) this.POS_Y += share.slotSize.height / 2;
                                                }
                                                break;
                                            }
                                    }break;
                                }
                        }
                        break;
                    }
            }
        }
    };

    FrameCrane.prototype.className = "frameCrane";

    //定义frameCrane类结束

    module.exports = FrameCrane;
});