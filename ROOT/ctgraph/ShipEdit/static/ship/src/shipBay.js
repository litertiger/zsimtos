define(function (require, exports, module) {
	'use strict';
	var go = require("gojs");
	var TopTitleGroup = require("./topTitleGroup");
	var DeckBay = require("./deckBay");
	var CabinBay = require("./cabinBay");
	var share = require("./shareData");
	//定义ShipBay类开始
	function ShipBay(obj) {
		TopTitleGroup.call(this, obj.no);
		if (obj.deckBay) {
			this.deckBay = new DeckBay(obj.deckBay);
			this.deckBay.node.containingGroup = this.node;
			this.deckBay.position = new go.Point(-(this.deckBay.rows.length +1)/2*share.slotSize.width, share.slotSize.height*(this.deckBay.tierCount-1));
		} else
			this.deckBay = null;
		if (obj.cabinBay) {
			this.cabinBay = new CabinBay(obj.cabinBay);
			this.cabinBay.node.containingGroup = this.node;
			this.cabinBay.position = new go.Point(-(this.cabinBay.rows.length+1)/2*share.slotSize.width, share.slotSize.height * (this.deckBay.tierCount+2));
		} else
			this.cabinBay = null;
		this.node.locationSpot = new go.Spot(0.5, 0, share.slotSize.width/2, (this.deckBay ? this.deckBay.tierCount||0 : 0) * share.slotSize.height);
	}
	ShipBay.inherit( TopTitleGroup);
	ShipBay.prototype.className = "ShipBay";
	//定义ShipBay类结束

	module.exports = ShipBay;
});
