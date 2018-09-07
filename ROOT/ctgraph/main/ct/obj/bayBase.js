'use strict';

define(function (require, exports, module) {
	'use strict';
	//定义类开始

	var Slot = require("./slot");
	var bay = function bay(info) {
		this.slots = [];
		var slot;
		this.addSlot = function (slot) {
			this.slots.push(slot);
			slot.node.containingGroup = this.node;
		};
		var errow = info.er || '';

		if (info.seq == '0') {
			for (var ii = 0; ii < info.rows; ii++) {
				if (ii == 0) {
					var title = this.createTitle(info.bayno);
					this.addSlot(title);
				}
				if (errow.indexOf(info.bayno + '|' + PrefixInteger(ii + 1, 2)) == -1) //过滤删除的排
					{
						slot = new Slot("");
						slot.h = PrefixInteger(ii + 1, 2);
						slot.id = info.yardno + '|' + info.bayno + '|' + PrefixInteger(ii + 1, 2);
						this.addSlot(slot);
					}
			}
		} else {
			for (var ii = info.rows - 1; ii >= 0; ii--) {
				if (ii == info.rows - 1) {
					var title = this.createTitle(info.bayno);
					this.addSlot(title);
				}
				if (errow.indexOf(info.bayno + '|' + PrefixInteger(ii + 1, 2)) == -1) //过滤删除的排
					{
						slot = new Slot("");
						slot.h = PrefixInteger(ii + 1, 2);
						slot.id = info.yardno + '|' + info.bayno + '|' + PrefixInteger(ii + 1, 2);
						this.addSlot(slot);
					}
			}
		}
		this.text = info.bayno;
		this.id = info.yardno + '|' + info.bayno;

		this.initPosition();
	};

	//定义类结束
	module.exports = bay;
});