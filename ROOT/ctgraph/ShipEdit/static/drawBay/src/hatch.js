define(function (require, exports, module) {
    'use strict';
    var AnjiObject = require("./anjiObject");
    var Slot = require("./slot");
    var Share = require("./shareData");
    //定义Hatch类开始
    function Hatch(obj) {
        this.fromRow = obj.fromRow;
        this.toRow = obj.toRow;
        AnjiObject.call(this);
    }

    Hatch.inherit(AnjiObject);

    Hatch.prototype.onsized = function (oldsize) {
        var rect = this.node.actualBounds.copy();
        //避免和其他舱盖交叉
        for(var h in share.objMap.Hatch){
            var that = share.objMap.Hatch[h];
            if(that !== this)
            {
                var thatRect = that.node.actualBounds;
                if(rect.left < this.fromRow.position.x && rect.left < thatRect.right && rect.right > thatRect.right) {
                    rect.width += rect.left - thatRect.right
                    rect.left = thatRect.right;
                }
                if(rect.right > this.toRow.node.actualBounds.right && rect.right > thatRect.left && rect.left < thatRect.left) {
                    rect.width -=  rect.right - thatRect.left;
                }
            }
        }
        rect.y /= 2;
        rect.x += 5;
        rect.width -= 10;
        var fromRow = null;
        var toRow = null;
        //按新的大小重新计算起始排和终止排
        var slots = AnjiObject.findAnjiNodesIn(Slot, rect, true);
        if (slots.count > 0) {
            slots.each(function (n) {
                if (!fromRow || fromRow.position.x > n.position.x)
                    fromRow = n.containingGroup.data;
                if (!toRow || toRow.position.x < n.position.x)
                    toRow = n.containingGroup.data;
            });
            //对于超出正常贝图的大小进行重新计算，去掉多余部分
            if (fromRow && toRow && fromRow !== toRow)
                if (toRow !== this.toRow || fromRow !== this.fromRow)
                    this.setProperties({fromRow: fromRow, toRow: toRow});
                else if (this.node.actualBounds.right > toRow.node.actualBounds.right || this.node.actualBounds.left < fromRow.node.actualBounds.left)
                    this.node.updateTargetBindings();
        }
    };

    Hatch.prototype.className = "Hatch";
    //定义Hatch类结束
    module.exports = Hatch;
});
