define(function (require) {
	'use strict';
	var go = require("gojs");
	var $Aj = go.GraphObject.make; // for conciseness in defining templates

	/**
	 * Created by kingser on 2016/8/31.
	 */
// hides remove HTML Element
// hides open HTML Element

	if (!checkLocalStorage()) {
		var currentFile = document.getElementById("currentFile");
		currentFile.textContent = "Sorry! No web storage support. \n If you're using Internet Explorer, you must load the page from a server for local storage to work.";
	}
	var openDocument = document.getElementById("openDocument");
	openDocument.style.visibility = "hidden";
	var removeDocument = document.getElementById("removeDocument");

	removeDocument.style.visibility = "hidden";

	var DrawCommandHandler = require("./drawCommandHandler");
	var GuidedDraggingTool = require("./guidedDraggingTool");
	var Inspector = require("./dataInspector");

	var mySideDiagram =
		$Aj(go.Diagram, "sideViewDiv", {
			"grid.visible" : true,
			scale : 0.5,
			//    ExternalObjectsDropped : function(e) {
			//        console.log(e);
			//        //myDiagram.commandHandler.deleteSelection();
			//},

			allowDrop : true, // accept drops from palette
			allowLink : false, // no user-drawn links
			"dragSelectingTool.canStart" : function () {
				return mySideDiagram.selection.all(function (sel) {
					return !sel.actualBounds.containsPoint(mySideDiagram.lastInput.documentPoint);
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
				document.getElementById("sideViewDiv").focus(); // assume keyboard focus should be on myDiagram
				// event.subject is the myDiagram.selection, the collection of just dropped Parts
				e.subject.any(function (node) {
					console.log(node.data.key);
					if (node.data.category === "Ship")
					{
						var Ship = require("./ship");
						var ship = new Ship();
						//ship.setProperties({shipWidth:330,tailLength:200,bodyLength:1000,headLength: 200,tailWidth: 240});
						node.diagram.commandHandler.deleteSelection();
						return true;
					}
					return false;
				});

				e.subject.any(function (node) {
					console.log(node.data.key);
					if (node.data.item === "Hatch")
					{
						node.diagram.commandHandler.deleteSelection();
						var Hatch = require("./hatch");
						var hatch = new Hatch();
						return true;
					}
					return false;

				});

			}

		});

	// sets the qualities of the tooltip
	var tooltiptemplate =
		$Aj(go.Adornment, go.Panel.Auto,
			$Aj(go.Shape, "RoundedRectangle", {
				fill : "whitesmoke",
				stroke : "gray"
			}),
			$Aj(go.TextBlock, {
					margin : 3,
					editable : true
				},
				// converts data about the part into a string
				new go.Binding("text", "", function (data) {
					if (data.item != undefined)
						return data.item;
					return "(unnamed item)";
				})));


	// change the title to indicate that the diagram has been modified
	mySideDiagram.addDiagramListener("Modified", function (e) {
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
	mySideDiagram.linkTemplate = $Aj(go.Link, {
		visible : false
	});
	//初始化模版
	var template = require("./sideTemplate");

	template.initTemplate(mySideDiagram);
	// Define the generic furniture and structure Nodes.
	// The Shape gets it Geometry from a geometry path string in the bound data.
	mySideDiagram.nodeTemplateMap.add("", $Aj(go.Node, "Spot", {
			locationObjectName : "SHAPE",
			locationSpot : go.Spot.Center,
			toolTip : tooltiptemplate,
			selectionAdorned : false // use a Binding on the Shape.stroke to show selection
		},
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
		$Aj(go.Shape, "Rectangle", {
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


	/*var myDiagram =
		$Aj(go.Diagram, "verticalViewDiv", {
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
				document.getElementById("verticalViewDiv").focus(); // assume keyboard focus should be on myDiagram
				// event.subject is the myDiagram.selection, the collection of just dropped Parts
				e.subject.any(function (node) {
					console.log(node.data.key);
					if (node.data.category === "Ship")
					{
						var Ship = require("./ship");
						var ship = new Ship();
						//ship.setProperties({shipWidth:330,tailLength:200,bodyLength:1000,headLength: 200,tailWidth: 240});
						node.diagram.commandHandler.deleteSelection();
						return true;
					}
					return false;
				});

				e.subject.any(function (node) {
					console.log(node.data.key);
					if (node.data.item === "Hatch")
					{
						node.diagram.commandHandler.deleteSelection();
						var Hatch = require("./hatch");
						var hatch = new Hatch();
						return true;
					}
					return false;

				});

			}

		});

	// sets the qualities of the tooltip
	var tooltiptemplate =
		$Aj(go.Adornment, go.Panel.Auto,
			$Aj(go.Shape, "RoundedRectangle", {
				fill : "whitesmoke",
				stroke : "gray"
			}),
			$Aj(go.TextBlock, {
					margin : 3,
					editable : true
				},
				// converts data about the part into a string
				new go.Binding("text", "", function (data) {
					if (data.item != undefined)
						return data.item;
					return "(unnamed item)";
				})));


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
	myDiagram.linkTemplate = $Aj(go.Link, {
		visible : false
	});
	//初始化模版
	var template = require("./shipTemplate");

	template.initTemplate(myDiagram);
	// Define the generic furniture and structure Nodes.
	// The Shape gets it Geometry from a geometry path string in the bound data.
	myDiagram.nodeTemplateMap.add("", $Aj(go.Node, "Spot", {
			locationObjectName : "SHAPE",
			locationSpot : go.Spot.Center,
			toolTip : tooltiptemplate,
			selectionAdorned : false // use a Binding on the Shape.stroke to show selection
		},
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
		$Aj(go.Shape, "Rectangle", {
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
			}).ofObject())));//*/var myDiagram = mySideDiagram;

	// the Palette

	// default structures and furniture
	var myPalette =
		$Aj(go.Palette, "myPaletteDiv", {
			nodeTemplateMap : myDiagram.nodeTemplateMap, // shared with the main Diagram
			groupTemplateMap : myDiagram.groupTemplateMap, // shared with the main Diagram
			"contextMenuTool.isEnabled" : false, // but disable context menus
			allowZoom : false,
			scale : 0.5,
			// use a custom DraggingTool instead of the standard one, defined below
			//draggingTool : new SnappingTool(),
			//allowDragOut:false,
			layout: $Aj(go.GridLayout, { cellSize: new go.Size(100, 100), spacing: new go.Size(0, 0) }),
			//layout : $Aj(go.Layout),
			// initialize the Palette with a few furniture and structure nodes
			model : $Aj(go.GraphLinksModel, {
				copiesArrays : true,
				copiesArrayObjects : true,
				linkFromPortIdProperty : "fid",
				linkToPortIdProperty : "tid",
				nodeDataArray : [{
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
				},
				], // end nodeDataArray

			}) // end model
		}); // end Palette


	// the Overview


	var myOverview =
		$Aj(go.Overview, "myOverviewDiv", {
			observed : myDiagram,
			maxScale : 0.5
		});

	// change color of viewport border in Overview
	myOverview.box.elt(0).stroke = "dodgerblue";

	// start off with an empty document
	myDiagram.isModified = false;
	newDocument();


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
		myDiagram.model = $Aj(go.GraphLinksModel, {
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
		for (var key in window.localStorage) {
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

});
