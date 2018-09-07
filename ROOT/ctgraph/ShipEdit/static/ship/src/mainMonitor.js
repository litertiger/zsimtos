define(function (require,exports) {
	'use strict';
	var go = require("gojs");
	var $ = go.GraphObject.make; // for conciseness in defining templates
	var share = require("./shareData");
	share.slotSize = new go.Size(12, 12);
	var stomp = require("./stomp");
	var ws = new WebSocket( 'ws://127.0.0.1:15674/ws');
	var client = stomp.over( ws );
	client.debug = function() {
		if (window.console && console.log && console.log.apply) {
			console.log.apply(console, arguments);
		}
	};
	function updateQC(msg) {
		var panel = app.hboxLayout1.queryById(msg.qc);
		if(panel)
		{
			/*var baymap = Ext.select("#" + panel.id + " #baymap").elements[0];
			console.log(baymap);*/
			var baymap = share[msg.qc];
			if(baymap)
			{
				share.diagram = baymap.node.diagram;
				var Container = require("./container");
				var c = new Container();
				c.setStowLoc(msg.loc,baymap);
			}
		}
		
	}
	var on_connect = function( x ) {
		var id = client.subscribe( '/exchange/ex_brodcast/shipmonitor.*', function( d ) {
			try {
				var msg = JSON.parse( d.body );
				if(msg)
				{
					updateQC(msg);
				}
			}
			catch( e ) {
			}
		})
	};
	client.connect( 'liaw', '123', on_connect, function() {
		console.log( "error" );
		//client.disconnect();
	}, 'test' );

	function initBayMap(div,name) {
		var myDiagram =
			$(go.Diagram, div, // create a Diagram for the DIV HTML element
				{
					// position the graph in the middle of the diagram
					initialContentAlignment: go.Spot.Center,
					allowLink: false,
					//defaultCursor : "url(../img/eraser.png),wait",

					layout: $(go.GridLayout, {
						spacing: new go.Size(10, 10),
						sorting: go.GridLayout.Forward
					}),

					// allow double-click in background to create a new node
					"clickCreatingTool.archetypeNodeData": {
						text: "Node",
						color: "white"
					},
					// enable undo & redo
					"undoManager.isEnabled": true
				});
		//初始化模版
		var template = require("./monitorBayTemplate");
		template.initTemplate(myDiagram);
		var ShipBay = require("./shipBay");
		var i = 0;
		try{
			i = name.substr(2) * 2 + 1;
		}
		catch (e)
		{
		}

		var bay = new ShipBay({
			no: i.preFill(3),
			deckBay: {
				"r15": 10,
				"r13": 10,
				"r11": 10,
				"r09": 10,
				"r07": 10,
				"r05": 10,
				"r03": 10,
				"r01": 10,
				"r02": 10,
				"r04": 10,
				"r06": 10,
				"r08": 10,
				"r10": 10,
				"r12": 10,
				"r14": 10,
				"r16": 10
			},
			cabinBay: {
				"r13": 5,
				"r11": 5,
				"r09": 6,
				"r07": 7,
				"r05": 8,
				"r03": 8,
				"r01": 9,
				"r00": 10,
				"r02": 9,
				"r04": 8,
				"r06": 8,
				"r08": 7,
				"r10": 6,
				"r12": 5,
				"r14": 4,
			}
		});
		if(!name || name === "") {
			if (typeof div !== "string")
				name = div.id;
			else
				name = div;
		}
		if(name && name !=="")
			share[name] = bay;
	}
	function initShipMap(div,name) {
		var myDiagram =
			$(go.Diagram, div, // create a Diagram for the DIV HTML element
				{
					// position the graph in the middle of the diagram
					scale:0.5,
					initialContentAlignment: go.Spot.Center,
					allowLink: false,
					//defaultCursor : "url(../img/eraser.png),wait",

					layout: $(go.GridLayout, {
						spacing: new go.Size(10, 10),
						sorting: go.GridLayout.Forward
					}),

					// allow double-click in background to create a new node
					"clickCreatingTool.archetypeNodeData": {
						text: "Node",
						color: "white"
					},
					// enable undo & redo
					"undoManager.isEnabled": true
				});
		//初始化模版
		var template = require("./monitorBayTemplate");
		template.initTemplate(myDiagram);
		var Ship = require("./ship");
		var ship = new Ship();
		ship.move(new go.Point(0,0));
		if(!name || name === "") {
			if (typeof div !== "string")
				name = div.id;
			else
				name = div;
		}
		if(name && name !=="")
			share[name] = ship;
	}
	exports.initBayMap = initBayMap;
	exports.initShipMap = initShipMap;
});
