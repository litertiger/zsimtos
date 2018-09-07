"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

define(function (require, exports, module) {
	'use strict';

	var share = require("./shareData");

	//定义yardObject类开始
	function yardObject() {
		//var b = new Date();
		//检查全局静态变量
		if (share.diagram == null) {
			throw "未初始化全局静态变量share.diagram";
		}

		//按继承树查找最匹配的模版
		var p = this.__proto__;

		var map = share.diagram.nodeTemplateMap;
		if (this.isGroup) map = share.diagram.groupTemplateMap;
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
		if (share.objMap[this.className] === undefined) share.objMap[this.className] = [];
		share.objMap[this.className].push(this);

		this.node = share.diagram.findNodeForData(this);
	}

	Function.prototype.inherit = function (BaseClass) {
		var SubClass = this;
		var F = function F() {}; // 定义一个空构造函数
		F.prototype = BaseClass.prototype; // 将其原型属性设置为基类
		SubClass.prototype = new F();
		SubClass.prototype.constructor = SubClass;
	};

	//修改对象单个属性
	yardObject.prototype.setProperty = function (key, value) {
		this.node.diagram.model.setDataProperty(this, key, value);
	};
	//修改多个属性
	yardObject.prototype.setProperties = function (obj) {
		if (obj instanceof Object) {
			for (var i in obj) {
				this.setProperty(i, obj[i]);
			}
		}
	};

	Object.defineProperty(yardObject.prototype, "location", {
		get: function get() {
			return this.node.location;
		},
		set: function set(pt) {
			this.node.location = pt;
		}
	});

	Object.defineProperty(yardObject.prototype, "position", {
		get: function get() {
			return this.node.position;
		},
		set: function set(pt) {
			this.node.move(pt);
		}
	});

	yardObject.prototype.remove = function () {
		share.diagram.remove(this.node);
		removeByValue(share.objMap[this.className], this);
	};
	Object.defineProperty(yardObject.prototype, "rotate", {
		get: function get() {
			return this.node.angle;
		},
		set: function set(angle) {
			var tool = require("../../common/rotateTool");
			tool(this.node, angle);
		}
	});

	//事件定义

	//当对象被拖动到目标位置后调用，默认无动作，可重写
	yardObject.prototype.onmoved = function () {};
	//当对象被单击调用，默认无动作，可重写
	yardObject.prototype.onclick = function (e) {};
	//当对象被双击调用，默认无动作，可重写
	yardObject.prototype.ondoubleClick = function (e) {
		ShowProp(this.className, this, e.documentPoint);
	};
	//当对象被右击调用，默认无动作，可重写
	yardObject.prototype.oncontextClick = function (e) {};
	yardObject.prototype.className = "yardObject";

	function getCleanValue(value) {
		var v;
		switch (typeof value === "undefined" ? "undefined" : _typeof(value)) {
			case "object":
				if (Array.isArray(value)) {
					v = [];
					// var j=0;
					for (var i in value) {
						// if (value[i].del!="1"&& typeof value[i] !="function"){
						// 	j++;
						// 	v[j] =  getCleanValue(value[i]);
						// }
						v[i] = getCleanValue(value[i]);
					}
					break;
				} else if (value instanceof yardObject) {
					v = value.toJsonData();
					break;
				}

			default:
				v = value;
		}
		return v;
	}

	yardObject.prototype.toJsonData = function () {
		var obj = {};
		for (var i in this) {
			if (typeof this[i] === "function" || i == "key" || i == "__gohashid" || i == "node" || i == "category" || i == "className" || i == "group" || i == "loc" || i == "isGroup") continue;
			var v = getCleanValue(this[i]);
			obj[i] = v;
		}
		return obj;
	};

	yardObject.prototype.toJsonString = function () {
		var go = require("gojs");
		return go.Model.prototype.writeJsonValue(this.toJsonData());
	};

	var navig = function navig(g) {
		return g.part;
	};
	yardObject.findyardObjectAt = yardObject.prototype.findyardObjectAt = function (type, pt) {
		var pred = function pred(p) {
			return p.data instanceof type;
		};
		return share.diagram.findObjectAt(pt, navig, pred);
	};

	yardObject.findyardObjectsIn = yardObject.prototype.findyardObjectsIn = function (type, rect, partialInclusion) {
		var pred = function pred(p) {
			return p.data instanceof type;
		};
		return share.diagram.findObjectsIn(rect, navig, pred, partialInclusion);
	};
	//定义yardObject类结束

	module.exports = yardObject;
});