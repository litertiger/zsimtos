define(function (require, exports, module) {
	'use strict';
	var AnjiObject = require("./anjiObject");
	var DragComputation = require("./dragComputation");
	var share = require("./shareData");
	//定义Container类开始
	function Container(no) {
		this.color = "green";
		this.no = no;
		AnjiObject.call(this);
		DragComputation.call(this);
	}
	Container.inherit(AnjiObject);

	Container.prototype.render = function () {
		AnjiObject.prototype.render.call(this);
	};

	Container.prototype.getStowLoc = function (pos) {
		return this.stowLoc;
	}
	Container.prototype.setStowLoc = function (pos,bay) {
		this.stowLoc = pos;
		var bayNo = pos.substr(0, 3);
		if (!bay)
			for (var b in share.objMap.ShipBay) {
				if (share.objMap.ShipBay[b].no == bayNo) {
					bay = share.objMap.ShipBay[b];
				}
			}
		//查找贝

		if (bay) {
			//找到贝查找所在排和层号索引排

			//在甲板上查找对应层号
			var tierIndex = -1;
			var rowNo = pos.substr(3, 2);
			var tierNo = pos.substr(5, 2);
			var slots = bay.deckBay.tierRow.slots;
			for (var i = 0; i < slots.length; ++i)
				if (slots[i].no == tierNo) {
					tierIndex = i;
					break;
				}
			//找到层号，再找对应的排
			if (tierIndex >= 0) {
				var rows = bay.deckBay.rows;
				for (var r in rows) {
					//找到排，移动到相应位置并退出函数
					if (rows[r].no == rowNo) {
						this.location = rows[r].slots[tierIndex].location;
						this.angle = rows[r].slots[tierIndex].angle;
						break;
					}
				}
				return;
			}
			//在舱下查找对应层号
			var slots = bay.cabinBay.tierRow.slots;
			for (var i = 0; i < slots.length; ++i)
				if (slots[i].no == tierNo) {
					tierIndex = i;
					break;
				}
			//找到层号，再找对应的排
			if (tierIndex >= 0) {
				rows = share.objMap.ShipBay[b].cabinBay.rows;
				for (var r in rows) {
					//找到排，移动到相应位置
					if (rows[r].no == rowNo) {
						this.location = rows[r].slots[tierIndex].location;
						this.angle = rows[r].slots[tierIndex].angle;
						break;
					}
				}
				return;
			}
		}
	}
	//实现DragComputation接口
	Container.prototype.onDragComputation = function (part, pt, gridpt) {
		var Slot = require("./slot");
		var slot = this.findAnjiNodeAt(Slot, pt);
		if (slot === null)
			return part.location;
		var container = this.findAnjiNodeAt(Container, pt);
		if(container !== null )
		{
			this.angle = slot.angle;
			return part.location;
		}
		return slot.location;
	}
	//重载移动事件
	Container.prototype.onmoved = function()
	{
		var Slot = require("./slot");
		var slot = this.findAnjiNodeAt(Slot,this.node.location)
		if(slot)
		{
			var row = slot.containingGroup;
			var index = row.data.slots.indexOf(slot.data);
			var bayBase = row.containingGroup;
			var bay = bayBase.containingGroup;
			this.stowLoc = bay.data.no + row.data.no + bayBase.data.tierRow.slots[index].no;
			this.angle = slot.angle;
			console.log(this.stowLoc);
		}
	}
	//重载单击事件
	Container.prototype.onclick = function(e)
	{
		var share = require("./shareData");
		if(share.diagram.actionButton && share.diagram.actionButton.action === "erase")
		{
			share.diagram.model.removeNodeData(this);
			//应该同时删除objMap里的元素，暂时未实现。
		}
		
	}
	Container.prototype.className = "Container";
	//定义Container类结束

	module.exports = Container;
});
