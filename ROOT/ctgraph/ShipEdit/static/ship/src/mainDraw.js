define(function (require) {
	'use strict';
	var go = require("gojs");
	var $ = go.GraphObject.make; // for conciseness in defining templates

	var share = require("./shareData");
	share.slotSize = new go.Size(30, 30);

	var myDiagram =
		$(go.Diagram, "myDiagramDiv", // create a Diagram for the DIV HTML element
		{
			// position the graph in the middle of the diagram
			initialContentAlignment : go.Spot.Center,
			allowLink : false,
			InitialLayoutCompleted : InitialLayoutCompleted,
			LayoutCompleted:LayoutCompleted,
			//defaultCursor : "url(../img/eraser.png),wait",

			layout : $(go.GridLayout, {  spacing : new go.Size(10, 10),
				sorting : go.GridLayout.Forward
			}),

			// allow double-click in background to create a new node
			"clickCreatingTool.archetypeNodeData" : {
				text : "Node",
				color : "white"
			},
			// enable undo & redo
			"undoManager.isEnabled" : true
		});

	//初始化模版
	var template = require("./drawBayTemplate");

	template.initTemplate(myDiagram);

	var ShipBay = require("./shipBay");

	console.log("begin create");
	var begin = new Date();
	var last = begin;
	var count =100;

	for (var i = 0; i < count; ++i) {
		var bay = new ShipBay({
				no : (i*2+1).preFill(3),
				deckBay : {
					"07" : 4,
					"05" : 4,
					"03" : 4,
					"01" : 4,
					"02" : 4,
					"04" : 4,
					"06" : 4,
					"08" : 4
				},
				cabinBay : {
					"05" : 3,
					"03" : 4,
					"01" : 5,
					"00" : 6,
					"02" : 5,
					"04" : 4,
					"06" : 3
				}
			});
	}
	
	/*var bay001 = new ShipBay({
				no : "001",
				deckBay : {
					"07" : 4,
					"05" : 4,
					"03" : 4,
					"01" : 4,
					"02" : 4,
					"04" : 4,
					"06" : 4,
					"08" : 4
				},
				cabinBay : {
					"05" : 3,
					"03" : 4,
					"01" : 5,
					"00" : 6,
					"02" : 5,
					"04" : 4,
					"06" : 3
				}
			});
			
	var bay003 = new ShipBay({
				no : "003",
				deckBay : {
					"07" : 1,
					"05" : 1,
					"03" : 1,
					"01" : 1,
					"02" : 1,
					"04" : 1,
					"06" : 1,
					"08" : 1
				},
				cabinBay : {
					"05" : 3,
					"03" : 4,
					"01" : 5,
					"00" : 5,
					"02" : 5,
					"04" : 4,
					"06" : 3
				}
			});
			
	var bay005 = new ShipBay({
				no : "005",
				deckBay : {
					"07" : 5,
					"05" : 5,
					"03" : 5,
					"01" : 5,
					"02" : 6,
					"04" : 5,
					"06" : 5,
					"08" : 5
				},
				cabinBay : {
					"05" : 3,
					"03" : 4,
					"01" : 5,
					"00" : 5,
					"02" : 5,
					"04" : 4,
					"06" : 3
				}
			});*/


	var end = new Date();
	var span = end - begin;
	console.log("create time :" + span);

	function InitialLayoutCompleted() {
		var init = new Date();
		span = init - end;
		end = init;
		console.log("initial layout time :" + span);
		//bay001.angle = 90;
		//bay003.angle = 90;
		//bay005.angle = 90;
		var Container = require("./container");
		(new Container("TENU6937241")).setStowLoc("0010384");
		(new Container("TMOU7895265")).setStowLoc("0030510");
		(new Container("TESU2863951")).setStowLoc("0050006");
		

	}
	
	function LayoutCompleted() {
		var init = new Date();
		span = init - end;
		end = init;
		console.log("layout time :" + span);
		var share = require("./shareData");
		share.diagram.layout.isOngoing = true;
		for(var c in share.objMap.Container)
		{
			var cntr = share.objMap.Container[c];
			cntr.setStowLoc(cntr.stowLoc);
		}

	}
});
