/**
 * Created by kingser on 2016/8/31.
 */
// hides remove HTML Element
// hides open HTML Element
function init() {

	if (!checkLocalStorage()) {
		var currentFile = document.getElementById("currentFile");
		currentFile.textContent = "Sorry! No web storage support. \n If you're using Internet Explorer, you must load the page from a server for local storage to work.";
	}
	var openDocument = document.getElementById("openDocument");
	openDocument.style.visibility = "hidden";
	var removeDocument = document.getElementById("removeDocument");

	removeDocument.style.visibility = "hidden";

	go.Shape.defineFigureGenerator("ShipHead", function (shape, w, h) {

		var geo = new go.Geometry();
		// a single figure consisting of straight lines and quarter-circle arcs
		geo.add(new go.PathFigure(0, 0)
			.add(new go.PathSegment(go.PathSegment.Arc, 270, 180, 0, h / 2, w, h / 2).close()));
		// don't intersect with two top corners when used in an "Auto" Panel
		return geo;
	});
	go.Shape.defineFigureGenerator("ShipTail", function (shape, w, h) {
		// this figure takes one parameter, the size of the corner
		var p1 = 10; // default corner size
		if (shape !== null) {
			var param1 = shape.parameter1;
			if (!isNaN(param1) && param1 >= 0)
				p1 = (h - param1) / 2; // can't be negative or NaN
		}
		p1 = Math.min(p1, h / 2); // limit by whole height or by half height?
		p1 = Math.max(p1, h / 10);
		var dgree = Math.acos(1 - 2 * p1 / h);
		var width = w / Math.sin(dgree);
		dgree = dgree * 180 / Math.PI;
		var geo = new go.Geometry();
		// a single figure consisting of straight lines and quarter-circle arcs
		geo.add(new go.PathFigure(w, h)
			.add(new go.PathSegment(go.PathSegment.Arc, 90, dgree, w, h / 2, width, h / 2))
			//.add(new go.PathSegment(go.PathSegment.Line, w*(1+Math.sin(dgree)), h - p1))
			.add(new go.PathSegment(go.PathSegment.Arc, 270 - dgree, dgree, w, h / 2, width, h / 2).close()));
		// don't intersect with two top corners when used in an "Auto" Panel
		return geo;
	});

	myDiagram =
		$AJ(go.Diagram, "myDiagramDiv", {
			"grid.visible" : true,
			scale : 0.5,
			//    ExternalObjectsDropped : function(e) {
			//        console.log(e);
			//        //myDiagram.commandHandler.deleteSelection();
			//},

			allowDrop : true, // accept drops from palette
			allowLink : false, // no user-drawn links
			"dragSelectingTool.canStart" : function () {
				return myDiagram.selection.all(function (sel) {
					return !sel.actualBounds.containsPoint(myDiagram.lastInput.documentPoint);
				});
			},
			"dragSelectingTool.isPartialInclusion" : true,
			commandHandler : new DrawCommandHandler(), // defined in DrawCommandHandler.js
			"toolManager.mouseWheelBehavior" : go.ToolManager.WheelZoom, // mouse wheel zooms instead of scrolls
			// allow Ctrl-G to call groupSelection()
			"commandHandler.archetypeGroupData" : {
				text : "Group",
				isGroup : true
			},
			
			//rotatingTool: new RotateMultipleTool(),  // defined in RotateMultipleTool.js

            //resizingTool: new ResizeMultipleTool(),  // defined in ResizeMultipleTool.js

            draggingTool: new GuidedDraggingTool(),  // defined in GuidedDraggingTool.js

			// use a custom DraggingTool instead of the standard one, defined below
			//draggingTool : new SnappingTool(),
			//"draggingTool.isGridSnapEnabled" : true,
			// notice whenever the selection may have changed
			"ChangedSelection" : enableAll, // defined below, to enable/disable commands

			// notice when the Paste command may need to be reenabled
			"ClipboardChanged" : enableAll,
			"PartResized" : function (e) {
				var shape = e.subject;
				if (shape instanceof go.Shape) {
					//shape.desiredSize = new go.Size(Math.round(shape.width),Math.round(shape.height));
				}

			},

			// notice when an object has been dropped from the palette
			"ExternalObjectsDropped" : function (e) {
				document.getElementById("myDiagramDiv").focus(); // assume keyboard focus should be on myDiagram
				// event.subject is the myDiagram.selection, the collection of just dropped Parts
				e.subject.any(function (node) {
					console.log(node.data.key);
					if (node.data.category === "Ship")
					{
						if(node.data.key === "Ship")
						{
							node.data.shipWidth = 330;
							node.data.tailLength = 200;
							node.data.bodyLength = 1000;
							node.data.headLength = 200;
							node.data.tailWidth = 240;
							node.updateTargetBindings();
						}
						else
						{
							node.diagram.commandHandler.deleteSelection();
						}
						return true;
					}
					return false;

				});
				
				e.subject.any(function (node) {
					console.log(node.data.key);
					if (node.data.item === "Hatch")
					{
						model = node.diagram.model;
						diagram = node.diagram;
						s = diagram.selection.copy();
						data = node.data;
						s.remove(node);
						model.removeNodeData(data);
						data.group = "Ship";
						model.addNodeData(data);
						s.add(diagram.findNodeForKey(data.key));
						diagram.selectCollection(s);
						return true;
					}
					return false;

				});
				
			}

		});

	// On selection changed, make sure infoDraggable will resize as necessary
	myDiagram.addDiagramListener("ChangedSelection", function (diagramEvent) {
		var idrag = document.getElementById("infoDraggable");
		idrag.style.width = "";
		idrag.style.height = "";
	});

	$(function () {
		$("#paletteDraggable").draggable({
			handle : "#paletteDraggableHandle"
		}).resizable({
			// After resizing, perform another layout to fit everything in the palette's viewport
			stop : function () {
				myPalette.layoutDiagram(true);
			}
		});

		$("#infoDraggable").draggable({
			handle : "#infoDraggableHandle"
		});

		var inspector = new Inspector('myInfo', myDiagram, {
				properties : {
					// key would be automatically added for nodes, but we want to declare it read-only also:
					"key" : {
						readOnly : true,
						show : Inspector.showIfPresent
					},
					// fill and stroke would be automatically added for nodes, but we want to declare it a color also:
					"fill" : {
						show : Inspector.showIfPresent,
						type : 'color'
					},
					"stroke" : {
						show : Inspector.showIfPresent,
						type : 'color'
					}
				}
			});
	});

	// sets the qualities of the tooltip
	var tooltiptemplate =
		$AJ(go.Adornment, go.Panel.Auto,
			$AJ(go.Shape, "RoundedRectangle", {
				fill : "whitesmoke",
				stroke : "gray"
			}),
			$AJ(go.TextBlock, {
				margin : 3,
				editable : true
			},
				// converts data about the part into a string
				new go.Binding("text", "", function (data) {
					if (data.item != undefined)
						return data.item;
					return "(unnamed item)";
				})));

	// Define the generic furniture and structure Nodes.
	// The Shape gets it Geometry from a geometry path string in the bound data.
	myDiagram.nodeTemplateMap.add("", $AJ(go.Node, "Spot", {
			locationObjectName : "SHAPE",
			locationSpot : go.Spot.Center,
			selectionAdorned : false, // use a Binding on the Shape.stroke to show selection
			toolTip : tooltiptemplate,
			itemTemplate :
			// each port is an "X" shape whose alignment spot and port ID are given by the item data
			$AJ(go.Panel,
				new go.Binding("portId", "id"),
				new go.Binding("portDirection", "dir"),
				new go.Binding("alignment", "spot", go.Spot.parse),
				$AJ(go.Shape, "XLine", {
					width : 6,
					height : 6,
					background : "transparent",
					fill : null,
					stroke : "gray"
				},
					new go.Binding("figure", "id", portFigure), // portFigure converter is defined below
					new go.Binding("angle", "angle"))),
			// hide a port when it is connected
			linkConnected : function (node, link, port) {
				/* if(node.data.group != undefined)
					if(link.fromNode == node)
						link.toNode.data.group = node.data.group;
					else
						link.fromNode.data.group = node.data.group; */
				port.visible = false;
			},
			linkDisconnected : function (node, link, port) {
				port.visible = true;
			},
			selectionAdorned : false // use a Binding on the Shape.stroke to show selection
		},
			// this creates the variable number of ports for this Spot Panel, based on the data
			new go.Binding("itemArray", "ports"),
			// remember the location of this Node
			new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			// move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
			//new go.Binding("layerName", "isSelected", function(s) { return s ? "Foreground" : ""; }).ofObject(),
			new go.Binding("zOrder", "zOrder"),
			// can be resided according to the user's desires
		{
			resizable : true,
			resizeObjectName : "SHAPE"
		},
			$AJ(go.Shape, "Rectangle", {
				name : "SHAPE",
				// the following are default values;
				// actual values may come from the node data object via data-binding
				strokeWidth : 1
			},
				new go.Binding("figure", "fig"),
				new go.Binding("fill", "fill"),
				new go.Binding("parameter1", "p1"),

				// remember the size of this node
				new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
				// can set the angle of this Node
				new go.Binding("angle", "angle").makeTwoWay(),
				new go.Binding("stroke", "isSelected", function (s) {
					return s ? "dodgerblue" : "black";
				}).ofObject())));

	function CreateSlotsWhenClick(e, n) {
		height = 26;
		count = Math.floor(n.actualBounds.height / height);
		p = new go.Point(0, 0);
		p.x = e.documentPoint.x;
		p.y = n.location.y + (height + n.actualBounds.height - count * height) / 2;
		data = {
			bay : "000",
			loc : "",
			color : "red",
			category : "Lable",
			isGroup : true
		};
		data.loc = p.x + " " + (n.location.y - 50);
		myDiagram.model.addNodeData(data);
		addSlotLinks(myDiagram.model, p, count, 60, 26,data.key);
	}

	myDiagram.groupTemplateMap.add("Ship", $AJ(go.Group, "Horizontal", {
			resizable : true,
			resizeObjectName : "Body",
			doubleClick : CreateSlotsWhenClick,
			// hide a port when it is connected
			linkConnected : function (node, link, port) {
				port.visible = false;
			},
			linkDisconnected : function (node, link, port) {
				port.visible = true;
			},
			//selectionAdorned : false // use a Binding on the Shape.stroke to show selection
		},
		new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			//tail
			$AJ(go.Panel,
				$AJ(go.Shape, {
					figure : "ShipTail",
					fill : "green",
				},
					new go.Binding("parameter1", "tailWidth", Number.parseFloat),
					// remember the size of this node
					new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
					new go.Binding("width", "tailLength", Number.parseFloat),
					new go.Binding("height", "shipWidth", Number.parseFloat))),
			//body
			$AJ(go.Panel,

				$AJ(go.Shape, {
					figure : "Rectangle",
					fill : "green",
					name : "Body"
				},

					// remember the size of this node
					new go.Binding("width", "bodyLength", Number.parseFloat).makeTwoWay(),
					new go.Binding("height", "shipWidth", Number.parseFloat).makeTwoWay())),

			//head
			$AJ(go.Panel,
				$AJ(go.Shape, {
					figure : "ShipHead",
					fill : "green"
				},
					// remember the size of this node
					new go.Binding("width", "headLength", Number.parseFloat),
					new go.Binding("height", "shipWidth", Number.parseFloat)))));

	myDiagram.groupTemplateMap.add("Lable",
		$AJ(go.Group, "Vertical", {
			selectionObjectName : "PANEL", // selection handle goes around shape, not label
			//ungroupable : true
		}, // enable Ctrl-Shift-G to ungroup a selected Group
			$AJ(go.TextBlock, {
				font : "bold 19px sans-serif",
				isMultiline : false, // don't allow newlines in text
				editable : true // allow in-place editing by user
			},
				new go.Binding("text", "bay").makeTwoWay(),
				new go.Binding("stroke", "color")),
			$AJ(go.Panel, "Auto", {
				name : "PANEL"
			},
				$AJ(go.Shape, "Rectangle", // the rectangular shape around the members
				{
					fill : "rgba(128,128,128,0)",
					stroke : "rgba(128,128,128,0)",
					strokeWidth : 1
				}),
				$AJ(go.Placeholder, {
					padding : 1
				}) // represents where the members are
			)));

	/*myDiagram.groupTemplateMap.add("Lable", $AJ(go.Node, "Auto",  // the Shape will go around the TextBlock{ height:26,width:60, locationSpot : go.Spot.Center},
	$AJ(go.Group, "Rectangle",
	// Shape.fill is bound to Node.data.color
	new go.Binding("fill", "color")),
	$AJ(go.TextBlock,{ margin: 0 ,editable: true},  // some room around the text
	// TextBlock.text is bound to Node.data.key
	new go.Binding("text", "bay").makeTwoWay()),
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
	));*/

	// Show different kinds of port fittings by using different shapes in this Binding converter
	function portFigure(pid) {
		if (pid === null || pid === "")
			return "XLine";
		if (pid[0] === 'F')
			return "CircleLine";
		if (pid[0] === 'M')
			return "PlusLine";
		return "XLine"; // including when the first character is 'U'
	}

	myDiagram.nodeTemplate.contextMenu =
		$AJ(go.Adornment, "Vertical",
			$AJ("ContextMenuButton",
				$AJ(go.TextBlock, "Rename", {
					margin : 3
				}), {
				click : function (e, obj) {
					rename(obj);
				}
			}),
			$AJ("ContextMenuButton",
				$AJ(go.TextBlock, "Cut", {
					margin : 3
				}), {
				click : function (e, obj) {
					myDiagram.commandHandler.cutSelection();
				}
			}),
			$AJ("ContextMenuButton",
				$AJ(go.TextBlock, "Copy", {
					margin : 3
				}), {
				click : function (e, obj) {
					myDiagram.commandHandler.copySelection();
				}
			}),
			$AJ("ContextMenuButton",
				$AJ(go.TextBlock, "Rotate +45", {
					margin : 3
				}), {
				click : function (e, obj) {
					myDiagram.commandHandler.rotate(45);
				}
			}),
			$AJ("ContextMenuButton",
				$AJ(go.TextBlock, "Rotate -45", {
					margin : 3
				}), {
				click : function (e, obj) {
					myDiagram.commandHandler.rotate(-45);
				}
			}),
			$AJ("ContextMenuButton",
				$AJ(go.TextBlock, "Rotate +90", {
					margin : 3
				}), {
				click : function (e, obj) {
					myDiagram.commandHandler.rotate(90);
				}
			}),
			$AJ("ContextMenuButton",
				$AJ(go.TextBlock, "Rotate -90", {
					margin : 3
				}), {
				click : function (e, obj) {
					myDiagram.commandHandler.rotate(-90);
				}
			}),
			$AJ("ContextMenuButton",
				$AJ(go.TextBlock, "Rotate 180", {
					margin : 3
				}), {
				click : function (e, obj) {
					myDiagram.commandHandler.rotate(180);
				}
			}));

	// group settings from basic.html to lock things together

	// make grouped Parts unselectable
	myDiagram.addDiagramListener("SelectionGrouped", function (e) {
		// e.subject should be the new Group
		e.subject.memberParts.each(function (part) {
			part.selectable = false;
		});
	});

	myDiagram.addDiagramListener("SelectionUngrouped", function (e) {
		// e.parameter should be collection of ungrouped former members
		e.parameter.each(function (part) {
			part.selectable = true;
			part.isSelected = true;
		});
	});

	myDiagram.addDiagramListener("SelectionCopied", function (e) {
		// selection collection will be modified during this loop,
		// so make a copy of it first
		var sel = myDiagram.selection.toArray();
		for (var i = 0; i < sel.length; i++) {
			var part = sel[i];
			// don't have any members of Groups be selected or selectable
			if (part instanceof go.Group) {
				var mems = new go.Set().addAll(part.memberParts);
				mems.each(function (member) {
					member.isSelected = false;
					member.selectable = false;
				});
			}
		}
	});

	// change the title to indicate that the diagram has been modified
	myDiagram.addDiagramListener("Modified", function (e) {
		var currentFile = document.getElementById("currentFile");
		var idx = currentFile.textContent.indexOf("*");
		if (myDiagram.isModified) {
			if (idx < 0)
				currentFile.textContent = currentFile.textContent + "*";
		} else {
			if (idx >= 0)
				currentFile.textContent = currentFile.textContent.substr(0, idx);
		}
	});

	// no visual representation of any link data
	myDiagram.linkTemplate = $AJ(go.Link, {
			visible : false
		});

	// the Palette

	// default structures and furniture
	myPalette =
		$AJ(go.Palette, "myPaletteDiv", {
			nodeTemplateMap : myDiagram.nodeTemplateMap, // shared with the main Diagram
			groupTemplateMap : myDiagram.groupTemplateMap, // shared with the main Diagram
			"contextMenuTool.isEnabled" : false, // but disable context menus
			allowZoom : false,
			scale : 0.5,
			// use a custom DraggingTool instead of the standard one, defined below
			draggingTool : new SnappingTool(),
			//allowDragOut:false,
			layout: $AJ(go.GridLayout, { cellSize: new go.Size(100, 100), spacing: new go.Size(0, 0) }),
			//layout : $AJ(go.Layout),
			// initialize the Palette with a few furniture and structure nodes
			model : $AJ(go.GraphLinksModel, {
				copiesArrays : true,
				copiesArrayObjects : true,
				linkFromPortIdProperty : "fid",
				linkToPortIdProperty : "tid",
				nodeDataArray : [/*{
						fig : "ShipTail",
						item : "ShipTail",
						fill : "rgb(240,240,240)",
						p1 : 20,
						size : "120 124",
						loc : "0 0",
						zOrder : 1,
						ports : [{
								id : "U0",
								spot : "1 0.5 -0.5 0",
								dir : 0
							}, {
								id : "M4",
								spot : "1 0.5 -10 0",
								dir : 180
							},
						]
					}, {
						fig : "ShipHead",
						item : "ShipHead",
						fill : "rgb(240,240,240)",
						size : "150 124",
						loc : "156 0",
						zOrder : 1,
						ports : [{
								id : "F4",
								spot : "0 0.5 10 0",
								dir : 0
							}, {
								id : "U4",
								spot : "0 0.5 0.5 0",
								dir : 180
							},
						]
					}, {
						fig : "Rectangle",
						item : "Right",
						fill : "rgb(240,240,240)",
						size : "55 124",
						loc : "0 130",
						zOrder : 1,
						ports : [{
								id : "U4",
								spot : "0 0.5 0.5 0",
								dir : 180
							}, {
								id : "U0",
								spot : "1 0.5 -0.5 0",
								dir : 0
							}, {
								id : "F4",
								spot : "0 0.5 5.5 0",
								dir : 0
							},
						]
					}, */{
		key:"Ship",
		tailLength : 60,
		tailWidth : 32,
		bodyLength : 200,
		shipWidth : 64,
		headLength : 60,
		category : "Ship",
		isGroup:true
	},{
						fig : "Rectangle",
						item : "Hatch",
						fill : "rgb(240,240,240)",
						size : "124 108",
						//loc : "156 130",
						//group: "Ship",
						zOrder : 2,
						/*ports : [{
								id : "U4",
								spot : "0 0.5 0.5 0",
								dir : 180
							}, {
								id : "U0",
								spot : "1 0.5 -0.5 0",
								dir : 0
							}, {
								id : "M0",
								spot : "1 0.5 -5.5 0",
								dir : 180
							},
						]*/
					},
				], // end nodeDataArray

			}) // end model
		}); // end Palette

	//用来生成箱位链
	function addSlotLinks(model, pos, count, width, height,group) {
		lastkey = 0;
		for (var i = 0; i < count; ++i) {
			var data = {
				fig : "Rectangle",
				item : "Slot",
				fill : "rgb(255,0,0)",
				size : "",
				key : 0,
				loc : "",
				group:group,
				zOrder : 2,
				ports : [{
						id : "F0",
						spot : "1 0.5 -0.5 0",
						dir : 0
					}, {
						id : "F1",
						spot : "1 1 -0.5 -0.5",
						dir : 0
					}, {
						id : "U2",
						spot : "0.5 1 0 -0.5",
						dir : 90
					}, {
						id : "M3",
						spot : "0 1 0.5 -0.5",
						dir : 180
					}, {
						id : "M4",
						spot : "0 0.5 0.5 0",
						dir : 180
					}, {
						id : "M5",
						spot : "0 0 0.5 0.5",
						dir : 180
					}, {
						id : "U6",
						spot : "0.5 0 0 0.5",
						dir : 270
					}, {
						id : "F7",
						spot : "1 0 -0.5 0.5",
						dir : 0
					},

				]
			};
			data.size = width + " " + height;
			data.loc = go.Point.stringify(pos);
			pos.y += height;
			model.addNodeData(data);

			if (i > 0) {
				var link = {
					from : -1,
					to : -1,
					fid : "U6",
					tid : "U2"
				};
				link.from = data.key;
				link.to = lastkey;
				model.addLinkData(link);
			}

			lastkey = data.key;
		}
	}
	/*addSlotLinks(myPalette.model, new go.Point(0, 215), 1, 60, 26); //生成单排
	addSlotLinks(myPalette.model, new go.Point(0, 267), 2, 60, 26); //生成双排
	addSlotLinks(myPalette.model, new go.Point(0, 345), 5, 60, 26); //生成五排
	addSlotLinks(myPalette.model, new go.Point(70, 215), 10, 60, 26); //生成十排*/

	// the Overview


	myOverview =
		$AJ(go.Overview, "myOverviewDiv", {
			observed : myDiagram,
			maxScale : 0.5
		});

	// change color of viewport border in Overview
	myOverview.box.elt(0).stroke = "dodgerblue";

	// start off with an empty document
	myDiagram.isModified = false;
	newDocument();

} // end init


// enable or disable a particular button
function enable(name, ok) {
	var button = document.getElementById(name);
	if (button)
		button.disabled = !ok;
}

// enable or disable all context-sensitive command buttons
function enableAll() {
	var cmdhnd = myDiagram.commandHandler;
	enable("Rename", myDiagram.selection.count > 0);
	enable("Undo", cmdhnd.canUndo());
	enable("Redo", cmdhnd.canRedo());
	enable("Cut", cmdhnd.canCutSelection());
	enable("Copy", cmdhnd.canCopySelection());
	enable("Paste", cmdhnd.canPasteSelection());
	enable("Delete", cmdhnd.canDeleteSelection());
	enable("SelectAll", cmdhnd.canSelectAll());
	enable("AlignLeft", cmdhnd.canAlignSelection());
	enable("AlignRight", cmdhnd.canAlignSelection());
	enable("AlignTop", cmdhnd.canAlignSelection());
	enable("AlignBottom", cmdhnd.canAlignSelection());
	enable("AlignCenterX", cmdhnd.canAlignSelection());
	enable("AlignCenterY", cmdhnd.canAlignSelection());
	enable("AlignRow", cmdhnd.canAlignSelection());
	enable("AlignColumn", cmdhnd.canAlignSelection());
	enable("AlignGrid", cmdhnd.canAlignSelection());
	enable("Rotate45", cmdhnd.canRotate(45));
	enable("Rotate_45", cmdhnd.canRotate(-45));
	enable("Rotate90", cmdhnd.canRotate(90));
	enable("Rotate_90", cmdhnd.canRotate(-90));
	enable("Rotate180", cmdhnd.canRotate(180));
}

// Commands for this application

// changes the item of the object
function rename(obj) {
	if (!obj)
		obj = myDiagram.selection.first();
	if (!obj)
		return;
	myDiagram.startTransaction("rename");
	var newName = prompt("Rename " + obj.part.data.item + " to:", obj.part.data.item);
	myDiagram.model.setDataProperty(obj.part.data, "item", newName);
	myDiagram.commitTransaction("rename");
}

// shows/hides gridlines
// to be implemented onclick of a button
function updateGridOption() {
	myDiagram.startTransaction("grid");
	var grid = document.getElementById("grid");
	myDiagram.grid.visible = (grid.checked === true);
	myDiagram.commitTransaction("grid");
}

// enables/disables guidelines when dragging
function updateGuidelinesOption() {
	// no transaction needed, because we are modifying a tool for future use
	var guide = document.getElementById("guidelines")
		if (guide.checked === true) {
			myDiagram.toolManager.draggingTool.isGuidelineEnabled = true;
		} else {
			myDiagram.toolManager.draggingTool.isGuidelineEnabled = false;
		}
}

// enables/disables snapping tools, to be implemented by buttons
function updateSnapOption() {
	// no transaction needed, because we are modifying tools for future use
	var snap = document.getElementById("snap");
	if (snap.checked === true) {
		myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;
		myDiagram.toolManager.resizingTool.isGridSnapEnabled = true;
	} else {
		myDiagram.toolManager.draggingTool.isGridSnapEnabled = false;
		myDiagram.toolManager.resizingTool.isGridSnapEnabled = false;
	}
}

// user specifies the amount of space between nodes when making rows and column
function askSpace() {
	var space = prompt("Desired space between nodes (in pixels):", "0");
	return space;
}

// update arrowkey function
function arrowMode() {
	// no transaction needed, because we are modifying the CommandHandler for future use
	var move = document.getElementById("move");
	var select = document.getElementById("select");
	var scroll = document.getElementById("scroll");
	if (move.checked === true) {
		myDiagram.commandHandler.arrowKeyBehavior = "move";
	} else if (select.checked === true) {
		myDiagram.commandHandler.arrowKeyBehavior = "select";
	} else if (scroll.checked === true) {
		myDiagram.commandHandler.arrowKeyBehavior = "scroll";
	}
}

var UnsavedFileName = "(Unsaved File)";

function getCurrentFileName() {
	var currentFile = document.getElementById("currentFile");
	var name = currentFile.textContent;
	if (name[name.length - 1] === "*")
		return name.substr(0, name.length - 1);
	return name;
}

function setCurrentFileName(name) {
	var currentFile = document.getElementById("currentFile");
	if (myDiagram.isModified) {
		name += "*";
	}
	currentFile.textContent = name;
}

function newDocument() {
	// checks to see if all changes have been saved
	if (myDiagram.isModified) {
		var save = confirm("Would you like to save changes to " + getCurrentFileName() + "?");
		if (save) {
			saveDocument();
		}
	}
	setCurrentFileName(UnsavedFileName);
	// loads an empty diagram
	myDiagram.model = $AJ(go.GraphLinksModel, {
			copiesArrays : true,
			copiesArrayObjects : true,
			linkFromPortIdProperty : "fid",
			linkToPortIdProperty : "tid"
		});
	myDiagram.undoManager.isEnabled = true;
	//myDiagram.addModelChangedListener(function(e) {
	//    if (e.isTransactionFinished) enableAll();
	//});
	myDiagram.isModified = false;
}

function checkLocalStorage() {
	return (typeof(Storage) !== "undefined") && (window.localStorage !== undefined);
}

// saves the current floor plan to local storage
function saveDocument() {
	if (checkLocalStorage()) {
		var saveName = getCurrentFileName();
		if (saveName === UnsavedFileName) {
			saveDocumentAs();
		} else {
			saveDiagramProperties()
			window.localStorage.setItem(saveName, myDiagram.model.toJson());
			myDiagram.isModified = false;
		}
	}
}

// saves floor plan to local storage with a new name
function saveDocumentAs() {
	if (checkLocalStorage()) {
		var saveName = prompt("Save file as...", getCurrentFileName());
		if (saveName && saveName !== UnsavedFileName) {
			setCurrentFileName(saveName);
			saveDiagramProperties()
			window.localStorage.setItem(saveName, myDiagram.model.toJson());
			myDiagram.isModified = false;
		}
	}
}

// checks to see if all changes have been saved -> shows the open HTML element
function openDocument() {
	if (checkLocalStorage()) {
		if (myDiagram.isModified) {
			var save = confirm("Would you like to save changes to " + getCurrentFileName() + "?");
			if (save) {
				saveDocument();
			}
		}
		openElement("openDocument", "mySavedFiles");
	}
}

// shows the remove HTML element
function removeDocument() {
	if (checkLocalStorage()) {
		openElement("removeDocument", "mySavedFiles2");
	}
}

// these functions are called when panel buttons are clicked

function loadFile() {
	var listbox = document.getElementById("mySavedFiles");
	// get selected filename
	var fileName = undefined;
	for (var i = 0; i < listbox.options.length; i++) {
		if (listbox.options[i].selected)
			fileName = listbox.options[i].text; // selected file
	}
	if (fileName !== undefined) {
		// changes the text of "currentFile" to be the same as the floor plan now loaded
		setCurrentFileName(fileName);
		// actually load the model from the JSON format string
		var savedFile = window.localStorage.getItem(fileName);

		myDiagram.model = go.Model.fromJson(savedFile);
		loadDiagramProperties();
		myDiagram.undoManager.isEnabled = true;
		myDiagram.addModelChangedListener(function (e) {
			if (e.isTransactionFinished)
				enableAll();
		});
		myDiagram.isModified = false;
		// eventually loadDiagramProperties will be called to finish
		// restoring shared saved model/diagram properties
	}
	closeElement("openDocument");
}

// Store shared model state in the Model.modelData property
// (will be loaded by loadDiagramProperties)
function saveDiagramProperties() {
	myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
}

// Called by loadFile.
function loadDiagramProperties(e) {
	// set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
	var pos = myDiagram.model.modelData.position;
	if (pos)
		myDiagram.initialPosition = go.Point.parse(pos);
}

// deletes the selected file from local storage
function removeFile() {
	var listbox = document.getElementById("mySavedFiles2");
	// get selected filename
	var fileName = undefined;
	for (var i = 0; i < listbox.options.length; i++) {
		if (listbox.options[i].selected)
			fileName = listbox.options[i].text; // selected file
	}
	if (fileName !== undefined) {
		// removes file from local storage
		window.localStorage.removeItem(fileName);
		// the current document remains open, even if its storage was deleted
	}
	closeElement("removeDocument");
}

function updateFileList(id) {
	// displays cached floor plan files in the listboxes
	var listbox = document.getElementById(id);
	// remove any old listing of files
	var last;
	while (last = listbox.lastChild)
		listbox.removeChild(last);
	// now add all saved files to the listbox
	for (key in window.localStorage) {
		var storedFile = window.localStorage.getItem(key);
		if (!storedFile)
			continue;
		var option = document.createElement("option");
		option.value = key;
		option.text = key;
		listbox.add(option, null)
	}
}

function openElement(id, listid) {
	var panel = document.getElementById(id);
	if (panel.style.visibility === "hidden") {
		updateFileList(listid);
		panel.style.visibility = "visible";
	}
}

// hides the open/remove elements when the "cancel" button is pressed
function closeElement(id) {
	var panel = document.getElementById(id);
	if (panel.style.visibility === "visible") {
		panel.style.visibility = "hidden";
	}
}

// Define a custom DraggingTool
function SnappingTool() {
	go.DraggingTool.call(this);
}
go.Diagram.inherit(SnappingTool, go.DraggingTool);

// This predicate checks to see if the ports can snap together.
// The first letter of the port id should be "H", "F", or "M" to indicate which kinds of port may connect.
// The second letter of the port id should be a digit to indicate which direction it may connect.
// The ports also need to not already have any link connections and need to face opposite directions.
SnappingTool.prototype.compatiblePorts = function (p1, p2) {
	// already connected?
	var part1 = p1.part;
	var id1 = p1.portId;
	if (id1 === null || id1 === "")
		return false;
	if (part1.findLinksConnected(id1).count > 0)
		return false;
	var part2 = p2.part;
	var id2 = p2.portId;
	if (id2 === null || id2 === "")
		return false;
	if (part2.findLinksConnected(id2).count > 0)
		return false;
	// compatible fittings?
	if ((id1[0] === 'U' && id2[0] === 'U') ||
		(id1[0] === 'F' && id2[0] === 'M') ||
		(id1[0] === 'M' && id2[0] === 'F')) {
		// find their effective sides, after rotation
		var a1 = this.effectiveAngle(p1.portDirection, part1.angle);
		var a2 = this.effectiveAngle(p2.portDirection, part2.angle);
		// are they in opposite directions?
		if (a1 - a2 === 180 || a1 - a2 === -180)
			return true;
	}
	return false;
};

// At what angle can a port connect, adjusting for the node's rotation
SnappingTool.prototype.effectiveAngle = function (dir, angle) {
	var a = dir;
	a += angle;
	if (a < 0)
		a += 360;
	else if (a >= 360)
		a -= 360;
	return a;
};

// Override this method to find the offset such that a moving port can
// be snapped to be coincident with a compatible stationary port,
// then move all of the parts by that offset.
/** @override */
SnappingTool.prototype.moveParts = function (parts, offset, check) {
	// when moving an actually copied collection of Parts, use the offset that was calculated during the drag
	if (this._snapOffset && this.isActive && this.diagram.lastInput.up && parts === this.copiedParts) {
		go.DraggingTool.prototype.moveParts.call(this, parts, this._snapOffset, check);
		this._snapOffset = undefined;
		return;
	}

	var commonOffset = offset;

	// find out if any snapping is desired for any Node being dragged
	var sit = parts.iterator;
	while (sit.next()) {
		var node = sit.key;
		if (!(node instanceof go.Node))
			continue;
		var info = sit.value;
		var newloc = info.point.copy().add(offset);

		// now calculate snap point for this Node
		var snapoffset = newloc.copy().subtract(node.location);
		var nearbyports = null;
		var closestDistance = 20 * 20; // don't bother taking sqrt
		var closestPort = null;
		var closestPortPt = null;
		var nodePort = null;
		var mit = node.ports;
		while (mit.next()) {
			var port = mit.value;
			if (node.findLinksConnected(port.portId).count > 0)
				continue;
			var portPt = port.getDocumentPoint(go.Spot.Center);
			portPt.add(snapoffset); // where it would be without snapping

			if (nearbyports === null) {
				// this collects the Nodes that intersect with the NODE's bounds,
				// excluding nodes that are being dragged (i.e. in the PARTS collection)
				var nearbyparts = this.diagram.findObjectsIn(node.actualBounds,
						function (x) {
						return x.part;
					},
						function (p) {
						return !parts.contains(p);
					},
						true);

				// gather a collection of GraphObjects that are stationary "ports" for this NODE
				nearbyports = new go.Set(go.GraphObject);
				nearbyparts.each(function (n) {
					if (n instanceof go.Node) {
						nearbyports.addAll(n.ports);
					}
				});
			}

			var pit = nearbyports.iterator;
			while (pit.next()) {
				var p = pit.value;
				if (!this.compatiblePorts(port, p))
					continue;
				var ppt = p.getDocumentPoint(go.Spot.Center);
				var d = ppt.distanceSquaredPoint(portPt);
				if (d < closestDistance) {
					closestDistance = d;
					closestPort = p;
					closestPortPt = ppt;
					nodePort = port;
				}
			}
		}

		// found something to snap to!
		if (closestPort !== null) {
			// move the node so that the compatible ports coincide
			var noderelpt = nodePort.getDocumentPoint(go.Spot.Center).subtract(node.location);
			var snappt = closestPortPt.copy().subtract(noderelpt);
			// save the offset, to ensure everything moves together
			commonOffset = snappt.subtract(newloc).add(offset);
			// ignore any node.dragComputation function
			// ignore any node.minLocation and node.maxLocation
			break;
		}
	}

	// now do the standard movement with the single (perhaps snapped) offset
	this._snapOffset = commonOffset.copy(); // remember for mouse-up when copying
	go.DraggingTool.prototype.moveParts.call(this, parts, commonOffset, check);
};

// Establish links between snapped ports,
// and remove obsolete links because their ports are no longer coincident.
/** @override */
SnappingTool.prototype.doDropOnto = function (pt, obj) {
	go.DraggingTool.prototype.doDropOnto.call(this, pt, obj);
	var tool = this;
	// Need to iterate over all of the dropped nodes to see which ports happen to be snapped to stationary ports
	var coll = this.copiedParts || this.draggedParts;
	var it = coll.iterator;
	while (it.next()) {
		var node = it.key;
		if (!(node instanceof go.Node))
			continue;
		// connect all snapped ports of this NODE (yes, there might be more than one) with links
		var pit = node.ports;
		while (pit.next()) {
			var port = pit.value;
			// maybe add a link -- see if the port is at another port that is compatible
			var portPt = port.getDocumentPoint(go.Spot.Center);
			if (!portPt.isReal())
				continue;
			var nearbyports =
				this.diagram.findObjectsAt(portPt,
					function (x) { // some GraphObject at portPt
					var o = x;
					// walk up the chain of panels
					while (o !== null && o.portId === null)
						o = o.panel;
					return o;
				},
					function (p) { // a "port" Panel
					// the parent Node must not be in the dragged collection, and
					// this port P must be compatible with the NODE's PORT
					if (coll.contains(p.part))
						return false;
					var ppt = p.getDocumentPoint(go.Spot.Center);
					if (portPt.distanceSquaredPoint(ppt) >= 0.25)
						return false;
					return tool.compatiblePorts(port, p);
				});
			// did we find a compatible port?
			var np = nearbyports.first();
			if (np !== null) {
				// connect the NODE's PORT with the other port found at the same point
				this.diagram.toolManager.linkingTool.insertLink(node, port, np.part, np);
			}
		}
	}
};

// Just move selected nodes when SHIFT moving, causing nodes to be unsnapped.
// When SHIFTing, must disconnect all links that connect with nodes not being dragged.
// Without SHIFT, move all nodes that are snapped to selected nodes, even indirectly.
/** @override */
SnappingTool.prototype.computeEffectiveCollection = function (parts) {
	if (this.diagram.lastInput.shift) {
		var links = new go.Set(go.Link);
		var coll = go.DraggingTool.prototype.computeEffectiveCollection.call(this, parts);
		coll.iteratorKeys.each(function (node) {
			// disconnect all links of this node that connect with stationary node
			if (!(node instanceof go.Node))
				return;
			node.findLinksConnected().each(function (link) {
				// see if this link connects with a node that is being dragged
				var othernode = link.getOtherNode(node);
				if (othernode !== null && !coll.contains(othernode)) {
					links.add(link); // remember for later deletion
				}
			});
		});
		// outside of nested loops we can actually delete the links
		links.each(function (l) {
			l.diagram.remove(l);
		});
		return coll;
	} else {
		var map = new go.Map(go.Part, Object);
		if (parts === null)
			return map;
		var tool = this;
		parts.iterator.each(function (n) {
			tool.gatherConnecteds(map, n);
		});
		return map;
	}
};

// Find other attached nodes.
SnappingTool.prototype.gatherConnecteds = function (map, node) {
	if (!(node instanceof go.Node))
		return;
	if (map.contains(node))
		return;
	// record the original Node location, for relative positioning and for cancellation
	map.add(node, {
		point : node.location
	});
	// now recursively collect all connected Nodes and the Links to them
	var tool = this;
	node.findLinksConnected().each(function (link) {
		map.add(link, {
			point : new go.Point()
		});
		tool.gatherConnecteds(map, link.getOtherNode(node));
	});
};
// end SnappingTool class