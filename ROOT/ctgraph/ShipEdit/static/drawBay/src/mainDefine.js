define(function (require) {
	'use strict';
	var go = require("gojs");
	var share = require("./shareData");
	if (share.isDeck === undefined)
		share.isDeck = true;
	share.slotSize = new go.Size(30, 30);
	share.slotDashArray = [2, 2];
	share.slotSelectable = true;
	var $ = go.GraphObject.make; // for conciseness in defining templates
	var DragFillTool = require("./dragFillTool");
	var Slot = require("./slot");
    var AnjiObject = require("./anjiObject");
	var fillTool = $(DragFillTool, {
			isEnabled : true, // disabled by the checkbox
			delay : 0, // always canStart(), so PanningTool never gets the chance to run
			type : Slot, // initial properties shared by all nodes
			fillPart : function (pt) { // override DragCreatingTool.insertPart
				// use a different color each time
				var AnjiObject = require("./anjiObject");
				var slot = AnjiObject.findAnjiObjectAt(this.type, pt);
				if (slot)
					slot.fill();
			}
		});
	var myDiagram =
		$(go.Diagram, "myDiagramDiv", // create a Diagram for the DIV HTML element
			{
				// position the graph in the middle of the diagram
				initialContentAlignment : go.Spot.Center,
				allowLink : false,
				allowMove :false,
				allowCopy:false,
				//allowVerticalScroll:false,
				//allowHorizontalScroll:false,
				allowZoom:false,
				//InitialLayoutCompleted : InitialLayoutCompleted,
				defaultCursor : "default",
				draggingTool : fillTool,
				"draggingTool.canStart" : function () {
					if(!(share.currAction === "pen" || share.currAction === "eraser"))
						return false;
					return  DragFillTool.prototype.canStart.call(this);
				},
				"dragSelectingTool.canStart" : function () {
					return share.currAction === "arror" || share.currAction === "hatch";
				},
				"dragSelectingTool.doMouseUp" : function () {
					if(share.currAction === "hatch")
					{
						var fromRow = null;
						var toRow = null;
						var rect = this.computeBoxBounds();
						//避免和其他舱盖交叉
						for(var h in share.objMap.Hatch) {
							var that = share.objMap.Hatch[h];
							var thatRect = that.node.actualBounds;
							if (rect.left < thatRect.right && rect.right > thatRect.right) {
								rect.width += rect.left - thatRect.right - 5;
								rect.left = thatRect.right + 5;
							}
							if (rect.right > thatRect.left && rect.left < thatRect.left)
								rect.width -= rect.right - thatRect.left + 5;
							if (rect.left >= thatRect.left && rect.right <= thatRect.right) {
								this.stopTool();
								return;//被另一个包含，不能生成
							}
						}
						rect.height = 17;
						var slots = AnjiObject.findAnjiNodesIn(Slot,rect,true);
						if(slots.count > 0) {
							slots.each(function (n) {
								if (!fromRow || fromRow.position.x > n.position.x)
									fromRow = n.containingGroup.data;
								if (!toRow || toRow.position.x < n.position.x)
									toRow = n.containingGroup.data;
							});
							if(fromRow && toRow && fromRow!== toRow) {

								var Hatch = require("./hatch");
								share.diagram.startTransaction("addHatch");
								new Hatch({fromRow: fromRow, toRow: toRow});
								this.transactionResult = this.name;
								share.diagram.commitTransaction();
							}
						}
						this.stopTool();
						return;
					}
					go.DragSelectingTool.prototype.doMouseUp.call(this);
				},
				"dragSelectingTool.isPartialInclusion" : true,
				"clickSelectingTool.canStart" : function () {
					if(!(share.currAction === "spray"))
						return true;
					if(share.diagram.selection.count < 1)
						return false;
					var rect =  share.diagram.selection.first().actualBounds.copy();
					var inSelectionRect = share.diagram.selection.any(function(n){
						rect.unionRect(n.actualBounds);
						return rect.containsPoint(share.diagram.lastInput.documentPoint);
					});
					if(!inSelectionRect)
						share.diagram.clearSelection();
					return inSelectionRect;
				},
				"panningTool.isEnabled":false,
				layout : $(go.GridLayout, { /*isInitial:false,*/ spacing : new go.Size(10, 10),
					sorting : go.GridLayout.Forward
				}),
				// enable undo & redo
				"undoManager.isEnabled" : true
			});

	var redo = myDiagram.commandHandler.redo;
	myDiagram.commandHandler.redo = function(){
		redo.call(this);
		myDiagram.defaultCursor =  share.currAction === "arror" ? "default" : "url(../img/"+ share.currAction+".png),default";
	};
	var undo = myDiagram.commandHandler.undo;
	myDiagram.commandHandler.undo = function(){
		undo.call(this);
		myDiagram.defaultCursor =  share.currAction === "arror" ? "default" : "url(../img/"+ share.currAction+".png),default";
	};

	//初始化模版
	var template = require("./defineBayTemplate");

	template.initTemplate(myDiagram);

	function genBayInfo(r, t) {
		var obj = {};
		//gen rows
		var f = false;
		if ((r % 2) == 1) {
			r = r - 1;
			f = true;
		}

		for (var i = 0; i < r; i += 2)
			obj["r" + (r - i).preFill(2)] = t;
		if (f)
			obj["r00"] = t;
		for (var i = 0; i < r; i += 2)
			obj["r" + (i + 1).preFill(2)] = t;
		return obj;
	}

	share.CreateBay = function () {
		myDiagram.model = new go.GraphLinksModel([], []);
		share.objMap = {};
		var rows = share.haveCenterRow ? 27 : 26;
		if (share.isDeck) {
			var DeckBay = require("./deckBay")
			return new DeckBay(genBayInfo(rows, 16));
		} else {
			var CabinBay = require("./cabinBay");
			return new CabinBay(genBayInfo(rows, 16));
		}
	};
	var b = new Date();
	share.CreateBay();
	console.log("create time:"+((new Date()) - b));

});
