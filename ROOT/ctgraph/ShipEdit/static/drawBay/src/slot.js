define(function (require, exports, module) {
	'use strict';
	var AnjiObject = require("./anjiObject");
	//定义Slot类开始
	function Slot() {
		this.cntrSizes = [];
		AnjiObject.call(this);
	}
	Slot.inherit(AnjiObject);

	function addAarry(a1, a2) {
		var a = [];
		for (var i in a1) {
			if (isNaN(i))
				continue;
			a.push(a1[i]);
		}
		for (var j in a2) {
			if (isNaN(j))
				continue;
			var find = false;
			for (var i in a1)
				if (a1[i] === a2[j]) {
					find = true;
					break;
				}
			if (!find)
				a.push(a2[j]);
			else
				a1.splice(i, 1);
		}
		return a.sort().reverse();
	}

	function subAarry(a1, a2) {
		var a = [];
		for (var i in a1) {
			if (isNaN(i))
				continue;
			var find = false;
			for (var j in a2)
				if (a1[i] === a2[j]) {
					find = true;
					break;
				}
			if (!find)
				a.push(a1[i]);
		}
		return a.sort().reverse();
	}
	//填充方法
	Slot.prototype.fill = function (e) {
		var share = require("./shareData");
		var slot = null;
		if (share.isMirror) //镜像填充
		{
			var pt = this.node.location.copy();
			var rowNode = this.node.containingGroup;
			var rowNo = rowNode.data.no;
			var bayNode = rowNode.containingGroup;
			var rowCount = bayNode.data.rows.length;
			var offset = Math.ceil(rowNo / 2) * 2 - 1;
			if ((rowCount % 2) == 1)
				++offset;
			if ((rowNo % 2) == 1)
				offset *= -1;
			pt.x += offset * share.slotSize.width;
			slot = this.findAnjiObjectAt(Slot, pt);
		}
		if (share.currAction) {
			switch (share.currAction) {
				case "eraser":
					this.node.diagram.startTransaction("slotOnClickEraser");
					this.setProperty("cntrSizes", subAarry(this.cntrSizes, share.cntrSizes));
					if (slot)
						slot.setProperty("cntrSizes", subAarry(slot.cntrSizes, share.cntrSizes));
					this.node.diagram.commitTransaction();
					break;
				case "pen":
					this.node.diagram.startTransaction("slotOnClickPen");
					this.setProperty("cntrSizes", addAarry(this.cntrSizes, share.cntrSizes));
					if (slot)
						slot.setProperty("cntrSizes", addAarry(slot.cntrSizes, share.cntrSizes));
					this.node.diagram.commitTransaction();
					break;
				case "spray":
					this.node.diagram.startTransaction("slotOnClickSpray");
					this.node.diagram.selection.each(function(n){
						var slot = n.data;
						if(!(slot instanceof Slot))
							return;
						slot.setProperty("cntrSizes", addAarry([], share.cntrSizes));
						if (share.isMirror) //镜像填充
						{
							var pt = n.location.copy();
							var rowNode = n.containingGroup;
							var rowNo = rowNode.data.no;
							var bayNode = rowNode.containingGroup;
							var rowCount = bayNode.data.rows.length;
							var offset = Math.ceil(rowNo / 2) * 2 - 1;
							if ((rowCount % 2) == 1)
								++offset;
							if ((rowNo % 2) == 1)
								offset *= -1;
							pt.x += offset * share.slotSize.width;
							slot = slot.findAnjiObjectAt(Slot, pt);
							if(slot && !n.diagram.selection.contains(slot.node))
								slot.setProperty("cntrSizes", addAarry([], share.cntrSizes));
						}
					});
					this.node.diagram.commitTransaction();
					break;
			}
		}
	};

	//重载旋转函数，让箱子同步旋转
	Slot.prototype.rotate = function (angle, center) {
		var Container = require("./container");
		var cntr = this.findAnjiObjectAt(Container, this.location);
		AnjiObject.prototype.rotate.call(this, angle, center);
		if (cntr) {
			/*cntr.angle = this.angle;
			cntr.location = this.location;*/
			cntr.rotate(angle, center);
		}

	}

	//重载单击事件
	Slot.prototype.onclick = function (e) {
		this.fill();
	}

	Slot.prototype.className = "Slot";
	//定义Slot类结束
	module.exports = Slot;
});
