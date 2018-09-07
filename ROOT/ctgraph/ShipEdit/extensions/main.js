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

    myDiagram =
        $AJ(go.Diagram, "myDiagramDiv",
            { "grid.visible": true,
            //    ExternalObjectsDropped : function(e) {
            //        console.log(e);
            //        //myDiagram.commandHandler.deleteSelection();
            //},

                allowDrop: true,  // accept drops from palette
                allowLink: false,  // no user-drawn links
                commandHandler: new DrawCommandHandler(),  // defined in DrawCommandHandler.js
                // default to having arrow keys move selected nodes
                "commandHandler.arrowKeyBehavior": "move",
                "toolManager.hoverDelay": 100,  // how quickly tooltips are shown
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom , // mouse wheel zooms instead of scrolls
                // allow Ctrl-G to call groupSelection()
                "commandHandler.archetypeGroupData": { text: "Group", isGroup: true },

                rotatingTool: new RotateMultipleTool(),  // defined in RotateMultipleTool.js

                resizingTool: new ResizeMultipleTool(),  // defined in ResizeMultipleTool.js

                draggingTool: new GuidedDraggingTool(),  // defined in GuidedDraggingTool.js
                "draggingTool.horizontalGuidelineColor": "blue",
                "draggingTool.verticalGuidelineColor": "blue",
                "draggingTool.centerGuidelineColor": "green",
                "draggingTool.guidelineWidth": 1,

                "draggingTool.isGridSnapEnabled": true,
                "resizingTool.isGridSnapEnabled": true,
                // notice whenever the selection may have changed
                "ChangedSelection": enableAll,  // defined below, to enable/disable commands

                // notice when the Paste command may need to be reenabled
                "ClipboardChanged": enableAll,

                // notice when an object has been dropped from the palette
                "ExternalObjectsDropped": function(e) {
                    document.getElementById("myDiagramDiv").focus();  // assume keyboard focus should be on myDiagram
                    myDiagram.toolManager.draggingTool.clearGuidelines();  // remove any guidelines
                    var nodex;
                    // event.subject is the myDiagram.selection, the collection of just dropped Parts
                    e.subject.each(function (node) {
                        console.log(node.data.key);
                        if (node.data.key == 8)
                            nodex = node;

                    });
                    if (nodex) {
                        //console.log(nodex);

                        myDiagram.remove(nodex);
                       var ag  = new drawObj();
                        ag.yy(nodex.position);
                    }
                }

            });


    // sets the qualities of the tooltip
    var tooltiptemplate =
        $AJ(go.Adornment, go.Panel.Auto,
            $AJ(go.Shape, "RoundedRectangle",
                { fill: "whitesmoke", stroke: "gray" }),
            $AJ(go.TextBlock,
                { margin: 3, editable: true },
                // converts data about the part into a string
                new go.Binding("text", "", function(data) {
                    if (data.item != undefined) return data.item;
                    return "(unnamed item)";
                }))
        );

    myDiagram.groupTemplate =
        $AJ(go.Group, "Vertical",
            { selectionObjectName: "PANEL",  // selection handle goes around shape, not label
                ungroupable: true },  // enable Ctrl-Shift-G to ungroup a selected Group
            $AJ(go.TextBlock,
                {
                    background: "lightgreen",
                    margin: 18,
                    font: "bold 19px sans-serif",
                    isMultiline: false,  // don't allow newlines in text
                    editable: true ,alignment: go.Spot.Left  // allow in-place editing by user
                },
                new go.Binding("text", "text").makeTwoWay(),
                new go.Binding("stroke", "color")),
            $AJ(go.Panel, "Auto",
                { name: "PANEL" },
                $AJ(go.Shape, "Rectangle",  // the rectangular shape around the members
                    { fill: "rgba(255,128,128,0.2)", stroke: "gray", strokeWidth: 0 }),
                $AJ(go.Placeholder)  // represents where the members are
            )
        );
    // Define the generic furniture and structure Nodes.
    // The Shape gets it Geometry from a geometry path string in the bound data.
    myDiagram.nodeTemplate =
        $AJ(go.Node, "Spot",
            {
                locationObjectName: "SHAPE",
                locationSpot: go.Spot.Center,
                toolTip: tooltiptemplate,click:function(e, node) {
                console.log(node.data.color);
                myDiagram.startTransaction("change color");
                myDiagram.model.setDataProperty(node.data, "color", "red");
                myDiagram.commitTransaction("change color");
            },
                selectionAdorned: false  // use a Binding on the Shape.stroke to show selection
            },
            //new go.Binding("name", "xxx"),
            // remember the location of this Node
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
            new go.Binding("layerName", "isSelected", function(s) { return s ? "Foreground" : ""; }).ofObject(),
            // can be resided according to the user's desires
            { resizable: true, resizeObjectName: "SHAPE" },
            $AJ(go.Shape,
                {
                    name: "SHAPE",
                    // the following are default values;
                    // actual values may come from the node data object via data-binding
                    geometryString: "F1 M0 0 L20 0 20 20 0 20 z",
                    fill: "rgb(130, 130, 256)"
                },
                new go.Binding("figure", "fig"),
                // this determines the actual shape of the Shape
                new go.Binding("geometryString", "geo"),
                // allows the color to be determined by the node data
                new go.Binding("fill", "color"),
                // selection causes the stroke to be blue instead of black
                new go.Binding("stroke", "isSelected", function(s) { return s ? "dodgerblue" : "black"; }).ofObject(),
                // remember the size of this node
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                // can set the angle of this Node
                new go.Binding("angle", "angle").makeTwoWay()
            )
        );

    myDiagram.nodeTemplate.contextMenu =
        $AJ(go.Adornment, "Vertical",
            $AJ("ContextMenuButton",
                $AJ(go.TextBlock, "Rename", { margin: 3 }),
                { click: function(e, obj) { rename(obj); } }),
            $AJ("ContextMenuButton",
                $AJ(go.TextBlock, "Cut", { margin: 3 }),
                { click: function(e, obj) { myDiagram.commandHandler.cutSelection(); } }),
            $AJ("ContextMenuButton",
                $AJ(go.TextBlock, "Copy", { margin: 3 }),
                { click: function(e, obj) { myDiagram.commandHandler.copySelection(); } }),
            $AJ("ContextMenuButton",
                $AJ(go.TextBlock, "Rotate +45", { margin: 3 }),
                { click: function(e, obj) { myDiagram.commandHandler.rotate(45); } }),
            $AJ("ContextMenuButton",
                $AJ(go.TextBlock, "Rotate -45", { margin: 3 }),
                { click: function(e, obj) { myDiagram.commandHandler.rotate(-45); } }),
            $AJ("ContextMenuButton",
                $AJ(go.TextBlock, "Rotate +90", { margin: 3 }),
                { click: function(e, obj) { myDiagram.commandHandler.rotate(90); } }),
            $AJ("ContextMenuButton",
                $AJ(go.TextBlock, "Rotate -90", { margin: 3 }),
                { click: function(e, obj) { myDiagram.commandHandler.rotate(-90); } }),
            $AJ("ContextMenuButton",
                $AJ(go.TextBlock, "Rotate 180", { margin: 3 }),
                { click: function(e, obj) { myDiagram.commandHandler.rotate(180); } })
        );

//var n = new drawObj();
//    n.yy();
    // group settings from basic.html to lock things together

    // make grouped Parts unselectable
    myDiagram.addDiagramListener("SelectionGrouped", function(e) {
        // e.subject should be the new Group
        e.subject.memberParts.each(function(part) { part.selectable = false; });
    });

    myDiagram.addDiagramListener("SelectionUngrouped", function(e) {
        // e.parameter should be collection of ungrouped former members
        e.parameter.each(function(part) {
            part.selectable = true;
            part.isSelected = true;
        });
    });

    myDiagram.addDiagramListener("SelectionCopied", function(e) {
        // selection collection will be modified during this loop,
        // so make a copy of it first
        var sel = myDiagram.selection.toArray();
        for (var i = 0; i < sel.length; i++) {
            var part = sel[i];
            // don't have any members of Groups be selected or selectable
            if (part instanceof go.Group) {
                var mems = new go.Set().addAll(part.memberParts);
                mems.each(function(member) {
                    member.isSelected = false;
                    member.selectable = false;
                });
            }
        }
    });

    // change the title to indicate that the diagram has been modified
    myDiagram.addDiagramListener("Modified", function(e) {
        var currentFile = document.getElementById("currentFile");
        var idx = currentFile.textContent.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) currentFile.textContent = currentFile.textContent + "*";
        } else {
            if (idx >= 0) currentFile.textContent = currentFile.textContent.substr(0, idx);
        }
    });

    // the Palette

    // brushes for furniture structures
    var wood = $AJ(go.Brush, "Linear", { 0: "red", 1: "#5E2605" })
    var wall = $AJ(go.Brush, { color: "palegreen" });
    var blue = $AJ(go.Brush, "Linear", { 0: "#42C0FB", 1: "#009ACD" });
    var metal = $AJ(go.Brush, "Linear", { 0: "#A8A8A8", 1: "#474747" });
    var green = $AJ(go.Brush, "Linear", { 0: "#9CCB19", 1: "#698B22" });

    // default structures and furniture
    myPalette =
        $AJ(go.Palette, "myPaletteDiv",
            {
                nodeTemplate: myDiagram.nodeTemplate,  // shared with the main Diagram
                "contextMenuTool.isEnabled": false,  // but disable context menus
                allowZoom: false,
                //allowDragOut:false,
                layout: $AJ(go.GridLayout, { cellSize: new go.Size(1, 1), spacing: new go.Size(5, 5) }),
                // initialize the Palette with a few furniture and structure nodes
                model: $AJ(go.GraphLinksModel,
                    {
                        nodeDataArray: [
                            {
                                key: 1,
                                //geo: "F1 M0 0 L5,0 5,40 0,40 0,0z x M0,0 a40,40 0 0,0  ",
                                fig:"RoundedRectangle",
                                item: "left door",
                                color: wall
                            },
                            {
                                key: 2,
                                //geo: "F1 M0 0 L5,0 5,40 0,40 0,0z x M5,0 a40,40 0 0,1 40,40 ",
                                fig:"InternalStorage",
                                item: "right door",
                                color: wall
                            },
                            {
                                key: 3, angle: 90,
                                geo: "F1 M0,0 L0,100 12,100 12,0 0,0z",
                                item: "wall",
                                color: wall
                            },
                            {
                                key: 4, angle: 90,
                                geo: "F1 M0,0 L0,50 10,50 10,0 0,0 x M5,0 L5,50z",
                                item: "window",
                                color: "whitesmoke"
                            },
                            {
                                key: 5,
                                geo: "F1 M0,0 L50,0 50,12 12,12 12,50 0,50 0,0 z",
                                item: "corner",
                                color: wall
                            },
                            {
                                key: 6,
                                geo: "F1 M0 0 L40 0 40 40 0 40 0 0 x M0 10 L40 10 x M 8 10 8 40 x M 32 10 32 40 z",
                                item: "arm chair",
                                color: blue
                            },
                            {
                                key: 7,
                                geo: "F1 M0 0 L80,0 80,40 0,40 0 0 x M0,10 L80,10 x M 7,10 7,40 x M 73,10 73,40 z",
                                item: "couch",
                                color: blue
                            },
                            {
                                key: 8,
                                geo: "F1 M0 0 L30 0 30 30 0 30 z",
                                item: "Side Table",
                                color: wood
                            },
                            {
                                key: 9,
                                geo: "F1 M0 0 L80,0 80,90 0,90 0,0 x M0,7 L80,7 x M 0,30 80,30 z",
                                item: "queen bed",
                                color: green
                            }
                        ]  // end nodeDataArray
                    })  // end model
            });  // end Palette


    // the Overview


    myOverview =
        $AJ(go.Overview, "myOverviewDiv",
            { observed: myDiagram, maxScale: 0.5 });

    // change color of viewport border in Overview
    myOverview.box.elt(0).stroke = "dodgerblue";


    // start off with an empty document
    myDiagram.isModified = false;
    newDocument();
    var nodeDataArray = [
        { key: 111, text: "Alpha", color: "lightblue","loc":"0 58" },
        { key: 112, text: "Beta", color: "orange","loc":"100 58" },
        { key: 113, text: "Gamma", color: "lightgreen", group: 115 ,name:"xxx"},
        { key: 114, text: "Delta", color: "pink", group: 115 ,"loc":"143.5 58",name:"777"},
        { key: 115, text: "Yard01", color: "green", isGroup: true }
    ];
    //myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    myDiagram.model.addNodeDataCollection(nodeDataArray);

} // end init


// enable or disable a particular button
function enable(name, ok) {
    var button = document.getElementById(name);
    if (button) button.disabled = !ok;
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
    if (!obj) obj = myDiagram.selection.first();
    if (!obj) return;
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
    if (name[name.length-1] === "*") return name.substr(0, name.length-1);
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
    myDiagram.model = new go.GraphLinksModel();
    myDiagram.undoManager.isEnabled = true;
    //myDiagram.addModelChangedListener(function(e) {
    //    if (e.isTransactionFinished) enableAll();
    //});
    myDiagram.isModified = false;
}

function checkLocalStorage() {
    return (typeof (Storage) !== "undefined") && (window.localStorage !== undefined);
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
        if (listbox.options[i].selected) fileName = listbox.options[i].text; // selected file
    }
    if (fileName !== undefined) {
        // changes the text of "currentFile" to be the same as the floor plan now loaded
        setCurrentFileName(fileName);
        // actually load the model from the JSON format string
        var savedFile = window.localStorage.getItem(fileName);

        myDiagram.model = go.Model.fromJson(savedFile);
        loadDiagramProperties();
        myDiagram.undoManager.isEnabled = true;
        myDiagram.addModelChangedListener(function(e) {
            if (e.isTransactionFinished) enableAll();
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
    if (pos) myDiagram.initialPosition = go.Point.parse(pos);
}


// deletes the selected file from local storage
function removeFile() {
    var listbox = document.getElementById("mySavedFiles2");
    // get selected filename
    var fileName = undefined;
    for (var i = 0; i < listbox.options.length; i++) {
        if (listbox.options[i].selected) fileName = listbox.options[i].text; // selected file
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
    while (last = listbox.lastChild) listbox.removeChild(last);
    // now add all saved files to the listbox
    for (key in window.localStorage) {
        var storedFile = window.localStorage.getItem(key);
        if (!storedFile) continue;
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

