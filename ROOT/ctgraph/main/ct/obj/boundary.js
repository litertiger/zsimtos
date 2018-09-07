"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

define(function (require, exports, module) {
    'use strict';

    var yardObject = require("./yardObject");
    var share = require("./shareData");
    //定义Car类开始
    function Boundary(opt) {
        for (var i in opt) {
            this[i] = opt[i];
        }var cx = share.slotSize.width * (1 + Math.abs(this.END_BAY_NO - this.BEG_BAY_NO) / 2);
        var cy = share.slotSize.height * (1 + Math.abs(this.END_ROW_NO - this.BEG_ROW_NO));
        this.size = cx + " " + cy;
        yardObject.call(this);
        this.initPosition();
    }

    Boundary.inherit(yardObject);

    Boundary.prototype.initPosition = function () {
        var areaNo = this.AREA_NO;
        var yard = share.objMap.yard.find(function (y) {
            return y.title == areaNo;
        });
        if (yard) {
            var bayno = yard.BAY_SEQ == '1' ? Math.max(this.BEG_BAY_NO,this.END_BAY_NO):Math.min(this.BEG_BAY_NO,this.END_BAY_NO);
            var bay = yard.rows.find(function (b) {
                return b.text == bayno;
            });
            if (bay) {
                var rowNo = yard.ROW_SEQ == '1' ? Math.max(this.BEG_ROW_NO, this.END_ROW_NO) : Math.min(this.BEG_ROW_NO, this.END_ROW_NO);
                var slot = bay.slots.find(function (s) {
                    return s.h == rowNo;
                });
                if (slot) this.position = slot.position;
            }
        }
    };

    Boundary.prototype.caclBayRow = function () {
        var pt = this.position.copy();
        pt.x += 2;
        pt.y += 2;
        var Slot = require("./slot");
        var begSlot = yardObject.findyardObjectAt(Slot, pt);
        if (begSlot) {
            this.BEG_BAY_NO = begSlot.containingGroup.data.text;
            this.BEG_ROW_NO = begSlot.data.h;
        }

        var _size$split = this.size.split(" "),
            _size$split2 = _slicedToArray(_size$split, 2),
            width = _size$split2[0],
            height = _size$split2[1];

        pt.x += width - 4;
        pt.y += height - 4;
        var endSlot = yardObject.findyardObjectAt(Slot, pt);
        if (endSlot) {
            this.END_BAY_NO = endSlot.containingGroup.data.text;
            this.END_ROW_NO = endSlot.data.h;
        }
    };

    Boundary.prototype.className = "boundary";
    //定义Car类结束

    module.exports = Boundary;
});