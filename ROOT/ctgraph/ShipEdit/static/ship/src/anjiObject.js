define(function (require, exports, module) {
	'use strict';
	var share = require("./shareData");
	var go = require("gojs");

	//定义AnjiObject类开始
	function AnjiObject() {
		//检查全局静态变量
		if (share.diagram == null)
			throw "未初始化全局静态变量share.diagram";

		//按继承树查找最匹配的模版
		var p = this.__proto__;
		var map = share.diagram.nodeTemplateMap;
		if (this.isGroup)
			map = share.diagram.groupTemplateMap;
		while (p != null) {
			if (map.contains(p.className)) {
				this.category = p.className;
				break;
			}
			p = p.__proto__;
		}

		//创建goJs中的Node对象
		share.diagram.model.addNodeData(this);

		//记录对象到相应数组中
		/*if (share.objMap[this.className] === undefined)
			share.objMap[this.className] = [];
		share.objMap[this.className].push(this);*/

		this.node = share.diagram.findNodeForData(this);

	}
	//修改对象单个属性
	AnjiObject.prototype.setProperty = function (key, value) {
		this.node.diagram.model.setDataProperty(this, key, value);
	};

	AnjiObject.prototype.rotate = function (angle, center) {
		if (angle == 0)
			return;
		center = center || this.location;
		if (this.node.memberParts)
			this.node.memberParts.each(function (p) {
				p.data.rotate( angle, center);
			});
		else
			this.location = this.location.copy().subtract(center).rotate(angle).add(center);
		this.node.angle += angle;
	};

	//修改多个属性
	AnjiObject.prototype.setProperties = function (obj) {
		if (obj instanceof Object) {
			for (var i in obj)
				this.setProperty(i, obj[i])
		}
	};
	Object.defineProperty(AnjiObject.prototype, "location", {
		get : function () {
			return this.node.location;
		},
		set : function (pt) {
			this.node.location = pt;
		}
	});

	Object.defineProperty(AnjiObject.prototype, "position", {
		get : function () {
			return this.node.position;
		},
		set : function (pt) {
			this.node.move(pt);
		}
	});

	Object.defineProperty(AnjiObject.prototype, "angle", {
		get : function () {
			return this.node.angle;
		},
		set : function (angle) {
			this.rotate(angle - this.angle);
		}
	});

	//事件定义

	//当对象被拖动到目标位置后调用，默认无动作，可重写
	AnjiObject.prototype.onmoved = function () {};
	//当对象被单击调用，默认无动作，可重写
	AnjiObject.prototype.onclick = function (e) {
	};
	//当对象被双击调用，默认无动作，可重写
	AnjiObject.prototype.ondoubleClick = function (e) {};
	//当对象被右击调用，默认无动作，可重写
	AnjiObject.prototype.oncontextClick = function (e) {};
	AnjiObject.prototype.onsized = function (oldsize) {};

	function getCleanValue(value) {
		var v;
		switch (typeof value) {
		case "object":
			if (Array.isArray(value)) {
				v = [];
				for (var i in value)
					v[i] = getCleanValue(value[i]);
				break
			} else if (value instanceof AnjiObject) {
				v = value.toJsonData();
				break;
			}

		default:
			v = value;
		}
		return v;
	}

	AnjiObject.prototype.toJsonData = function () {
		var obj = {};
		for (var i in this) {
			if (typeof this[i] === "function")
				continue;
			if (i === "key" || i === "__gohashid" || i === "node" || i === "category" || i === "className" || i==="group")
				continue;
			var v = getCleanValue(this[i])
				obj[i] = v;
		}
		return obj;
 	}

	AnjiObject.prototype.toJsonString = function () {
		return go.Model.prototype.writeJsonValue(this.toJsonData());
	}

	AnjiObject.prototype.className = "AnjiObject";

	var navig = function (g) {
		return g.part;
	};
	AnjiObject.findAnjiObjectAt = AnjiObject.prototype.findAnjiObjectAt = function (type, pt) {
		var pred = function (p) {
			return p.data instanceof type;
		};
		var node = AnjiObject.findAnjiNodeAt(type,pt);
		return node ? node.data : null;
	}

	AnjiObject.findAnjiNodeAt = AnjiObject.prototype.findAnjiNodeAt = function (type, pt) {
		var pred = function (p) {
			return p.data instanceof type;
		};
		return share.diagram.findObjectAt(pt, navig, pred);
	}

	AnjiObject.findAnjiNodesIn = AnjiObject.prototype.findAnjiodesIn = function (type, rect, partialInclusion) {
		var pred = function (p) {
			return p.data instanceof type;
		};
		return  share.diagram.findObjectsIn(rect, navig, pred, partialInclusion);
	}

	AnjiObject.findAnjiObjectsIn = AnjiObject.prototype.findAnjiObjectsIn = function (type, rect, partialInclusion) {
		var nodes = AnjiObject.findAnjiNodesIn (type, rect, partialInclusion);
		var list  =  new go.List(type);
		nodes.each(function(n){list.add(n.data)});
		return list;
	}

	//定义AnjiObject类结束

	module.exports = AnjiObject;
});
