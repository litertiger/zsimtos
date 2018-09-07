define(function (require, exports, module) {
	'use strict';
	var BayBase = require("./bayBase");
	var CabinRow = require("./cabinRow");
	function formatRowNo(n)
	{
		n = (2*n).toString();
		return n[1] ? n : '0' + n;
	}
	
	//定义CabinBay类开始
	function CabinBay(info) {
		BayBase.call(this, info);
	}

	CabinBay.inherit( BayBase);

	CabinBay.prototype.createRow = function (no, info) {
		return new CabinRow(no, info);
	}
	CabinBay.prototype.createTierRow = function () {
		var info = [];
		for(var i=this.tierCount;i>=1;--i)
			info.push(formatRowNo(i));
		return new CabinRow("", info);
	}
	CabinBay.prototype.className = "CabinBay";
	//定义CabinBay类结束

	module.exports = CabinBay;
});
