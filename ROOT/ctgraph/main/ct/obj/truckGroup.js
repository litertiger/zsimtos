"use strict";

define(function (require, exports, module) {
    'use strict';

    var yardObject = require("./yardObject");
    var share = require("./shareData");
    //var DragComputation = require("./dragComputation");
    //定义TruckGoup类开始
    function TruckGroup(road, beginBay) {
        this.road = road;
        this.beginBay = beginBay;
        this.trucks = [];
        this.initPosition();
        this.loc = this.POS_X + " " + this.POS_Y;
        yardObject.call(this);
        //DragComputation.call(this);
    }

    TruckGroup.inherit(yardObject);

    TruckGroup.prototype.addTruck = function (info) {
        for (var i = 0; i < this.trucks.length; ++i) {
            if (this.trucks[i].ID === info.ID) return;
        }if (this.trucks.length === 0 && !this.node.visible) this.node.visible = true;
        this.trucks.push(info);
        this.node.updateTargetBindings();
    };

    TruckGroup.prototype.removeTruck = function (truck) {
        for (var i = 0; i < this.trucks.length; ++i) {
            if (this.trucks[i].ID === truck) {
                this.trucks.splice(i, 1);
                if (this.trucks.length === 0) this.node.visible = false;else this.node.updateTargetBindings();
                return true;
            }
        }
    };

    TruckGroup.prototype.initPosition = function () {
        var road = this.road;
        var fromPt = road.node.fromNode.data;
        var toPt = road.node.toNode.data;
        var yard = road.area;
        var id = yard.title + '|' + this.beginBay;
        for (var i = 0; i < yard.rows.length; ++i) {
            if (yard.rows[i].id === id) //找贝
                {
                    var bay = yard.rows[i];
                    if (Math.abs(fromPt.Y - toPt.Y) < 20) {
                        this.POS_X = bay.position.x;
                        this.POS_Y = (fromPt.Y + toPt.Y) / 2;
                    } else {
                        this.POS_X = (fromPt.X + toPt.X) / 2;
                        this.POS_Y = bay.position.y;
                    }
                    break;
                }
        }
    };

    TruckGroup.prototype.className = "TruckGroup";
    TruckGroup.prototype.ondoubleClick = function (e) {
        var win = {};
        Wb.show({
            layout: "fit",
            resizable: true,
            width: 450,
            title: "拖车列表",
            height: 300,
            items: [{
                appScope: win, itemId: "gridTruck",
                xtype: "grid", listeners: {
                    itemdblclick: function itemdblclick(view, record, item, index, e, options) {
                        Load('m?xwl=yardManage/yardedit/truckDataOper/OperWnd', { truck: record.data.ID }).then(function (app) {
                            var oldOnEnter = app.window1.onEnter;
                            app.window1.onEnter = function () {
                                var t = event.target;
                                if (t.querySelector(".ok_icon")) {
                                    oldOnEnter.call(app.window1);
                                    return;
                                }
                                if (t.querySelector(".cancel_icon")) {
                                    this.onEsc();
                                    return;
                                }
                                t.dispatchEvent(new KeyboardEvent('keydown', { keyIdentifier: "U+0009" }));
                            };
                            app.window1.addListener("ok", function () {
                                var currentInfo = Wb.getValue(app.window1);
                                yardObjDataUpdate(currentInfo, 'truck').then(function () {
                                    return app.window1.close();
                                }).then(Wait.bind(50)).then(win.gridTruck.store.reload.bind(win.gridTruck.store));
                            });
                            app.window1.show();
                        });
                    }
                },
                columns: [{ dataIndex: "ID", text: "拖车ID" }, { dataIndex: "MACH_NAME", text: "拖车名" }, { dataIndex: "CUR_CY_AREA_NO", text: "作业场" }, { dataIndex: "CUR_CY_BAY_NO", text: "作业贝" }],
                store: { data: this.trucks, fields: ["ID", "MACH_NAME", "CUR_CY_AREA_NO", "CUR_CY_BAY_NO"] }
            }]
        });
        return false;
    };
    //定义Car类结束

    module.exports = TruckGroup;
});