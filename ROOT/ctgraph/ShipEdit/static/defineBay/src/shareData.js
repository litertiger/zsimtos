define(function (require, exports, module) {
	'use strict';
	//定义全局继承函数
	Function.prototype.inherit = function (BaseClass) {
		var SubClass = this;
		var F = function () {}; // 定义一个空构造函数
		F.prototype = BaseClass.prototype; // 将其原型属性设置为基类
		SubClass.prototype = new F();
		SubClass.prototype.constructor = SubClass;
	}
	
	//定义全局数字加前缀函数
	Number.prototype.preFill = function (length,prefix) {
		prefix = prefix || '0';
		var s = this.toString();
		var p=[];
		for(var i=s.length;i<=length;++i)
			p.push("");
		return p.join(prefix) + s;
	}

	var go = require("gojs");
	var _currAction = "arror";
	var shareData = {
		objMap:{},
		diagram:null,
		slotSize:new go.Size(50, 50),
		slotStrokeWidth:1,
		slotDashArray:null,
		slotSelectable : false,
		isMirror:true,
		cntrSizes:[]
	}
	Object.defineProperty(shareData, 'currAction', {
		set: function(action) {
			_currAction = action;
			shareData.diagram.defaultCursor = _currAction === "arror" ? "default" : "url(../img/"+_currAction+".png),default";
		},
		get: function() {
			return  _currAction;
		}
	});

	module.exports = shareData;
});
