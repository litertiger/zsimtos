define(function (require, exports, module) {
	'use strict';
	var BayBase = require("./bayBase");
	var DeckRow = require("./deckRow");
	
	//定义DeckBay类开始
	function DeckBay(info) {
		BayBase.call(this, info);
	}

	DeckBay.inherit(BayBase);

	DeckBay.prototype.createRow = function (no, info) {
		return new DeckRow(no, info);
	}
	DeckBay.prototype.createTierRow = function () {
		var info = [];
		for(var i=1;i<=this.tierCount;++i)
			info.push((80+2*i).toString());
		return new DeckRow("", info);
	}
	DeckBay.prototype.className = "DeckBay";
	//定义DeckBay类结束

	module.exports = DeckBay;
});
