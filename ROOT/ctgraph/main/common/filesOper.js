"use strict";

/**
 * Created by kingser on 2016/9/6.
 */
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

//switch Layer
function switchLayer(name) {
    var layer = myDiagram.findLayer(name);
    if (layer) layer.visible = !layer.visible;
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
    myDiagram.grid.visible = grid.checked === true;
    myDiagram.commitTransaction("grid");
}

// enables/disables guidelines when dragging
function updateGuidelinesOption() {
    // no transaction needed, because we are modifying a tool for future use
    var guide = document.getElementById("guidelines");
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
    if (name[name.length - 1] === "*") return name.substr(0, name.length - 1);
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
    return typeof Storage !== "undefined" && window.localStorage !== undefined;
}

// saves the current floor plan to local storage
function saveDocument() {
    if (checkLocalStorage()) {
        var saveName = getCurrentFileName();
        if (saveName === UnsavedFileName) {
            saveDocumentAs();
        } else {
            saveDiagramProperties();
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
            saveDiagramProperties();
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
    while (last = listbox.lastChild) {
        listbox.removeChild(last);
    } // now add all saved files to the listbox
    for (key in window.localStorage) {
        var storedFile = window.localStorage.getItem(key);
        if (!storedFile) continue;
        var option = document.createElement("option");
        option.value = key;
        option.text = key;
        listbox.add(option, null);
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

function openFiler() {
    var prop = seajs.require("main/ct/biz/filter");
    prop();
    // planState = true
}

function tempplanColor(ops) {
    var share = seajs.require("main1/ct/obj/shareData");
    var plancA = share.objMap.planC;
    for (var j in plancA) {
        var planc = plancA[j];
        var tp = plancTp(ops.tp);
        var lsize = planc.Lsize;
        var asize = planc.Lsize.split(" ");
        if (tp.angle == 90 || tp.angle == 270) lsize = asize[1] + " " + asize[0];
        planc.setProperties({
            color: ops.color,
            geometryString: tp.geometryString,
            angle: tp.angle,
            text: ops.text,
            Lsize: lsize
        });
    }
}

function drawyard(newdata) {
    for (var j in newdata) {
        var yard = seajs.require("main/ct/obj/yard");
        var go = seajs.require("gojs");
        var ya = new yard(newdata[j]);
        ya.position = new go.Point(newdata[j].X0, newdata[j].Y0);
        ya.x = newdata[j].X0;
        ya.y = newdata[j].Y0;
    }

    // console.log(newdata)
}

function loadCntr(cntr) {
    return Ajax({
        url: 'm?xwl=yardManage/yardmonitor/getcntrs', // 跳转到 action
        type: 'post',
        cache: false,
        params: cntr ? {
            cntr: cntr
        } : {},
        dataType: 'json'
    }).then(function (data) {
        var datarows = data.rows;
        var share = seajs.require("main/ct/obj/shareData");
        var yards = share.objMap.yard;
        var cntr = seajs.require("main/ct/obj/container");
        for (var i = 0; i < datarows.length; i++) {
            if (datarows[i].POS) {
                var param = findSlot(yards, datarows[i]);
                if (param) {
                    for (var k in datarows[i]) {
                        param[k] = datarows[i][k];
                    }new cntr(param);
                }
            }
        }
    });
}

function findSlot(yards, datarow, plan) {
    var ret = null;
    var share = seajs.require("main/ct/obj/shareData");
    var pos = plan ? datarow.PLAN_POS : datarow.POS;
    var areaNo = pos.substr(0, 2);
    var bayNo = pos.substr(2, 2);
    var rowNo = pos.substr(4, 2);
    var tierNo = pos.substr(6, 1);
  	if(!(areaNo && bayNo))
    	return null;
    var yard = yards.find(function (y) {
        return y.title == areaNo;
    });
    if (yard) {
        var bayno = bayNo;
        if ( bayno % 2 == 0) bayno = bayno - (yard.BAY_SEQ == "1" ? -1 : 1);
        var bay = yard.rows.find(function (b) {
            return b.text == bayno;
        });
        if (bay) {
            var slot = bay.slots.find(function (s) {
                return s.h == rowNo;
            });
            if (slot) var loc = slot.location.x + (bayNo % 2 == 0 ? share.slotSize.width / 2 : 0) + " " + slot.location.y;
            ret = {
                loc: loc,
                cntrno: datarow.CNTR,
                tier_no: tierNo,
                siz: datarow.CNTR_SIZE
            };
        }
    }

    return ret;
}

function saveFile() {
    myDiagram.startTransaction("save ");
    var yard = seajs.require("main/ct/obj/yard");
    myDiagram.selection.each(function (current) {
        if (current.data instanceof yard) Ajax({
            url: 'm?xwl=yardManage/yardedit/saveyards', // 跳转到 action
            params: {
                data: JSON.stringify(current.data.toJsonData())
            },
            type: 'post',
            headers: {
                Accept: "application/json; charset=utf-8"
            },
            cache: false,
            dataType: 'text'
        }).then(function (data) {
            if (data > 0) alert("保存成功!");else alert("保存失败!");
        });
    });
    myDiagram.commitTransaction("save ");
}

function loadbaycntr() {
    myDiagram.layout.isOngoing = false;
    //加载箱子测试
    return Ajax({
        url: 'm?xwl=yardManage/yardmonitor/getbaycntr', // 跳转到 action
        type: 'post',
        cache: false,
        async: false,
        params: {
            data: parent.getbays //GetArgsFromHref(window.location.href,"bays")
        },
        dataType: 'json'
    }).then(function (data) {
        var datarows = data.rows;
        var share = seajs.require("main/ct/obj/shareData");
        var bays = share.objMap.bay;
        var cntr = seajs.require("main/ct/obj/bay/container");
        for (var i = 0; i < datarows.length; i++) {
            var param = findsSlot(bays, datarows[i]);
            if (param != '') new cntr(param);
        }
    });
}

function loadbigbaycntr() {
    myDiagram.layout.isOngoing = false;
    //加载箱子测试
    return Ajax({
        url: 'm?xwl=yardManage/yardmonitor/getbaycntr', // 跳转到 action
        type: 'post',
        cache: false,
        async: false,
        params: {
            data: GetArgsFromHref(window.location.href, "bays")
        },
        dataType: 'json'
    }).then(function (data) {
        var datarows = data.rows;
        var share = seajs.require("main/ct/obj/shareData");
        var bays = share.objMap.bay;
        var cntr = seajs.require("main/ct/obj/bigbay/container");
        for (var i = 0; i < datarows.length; i++) {
            var param = findsSlot(bays, datarows[i]);
            if (param != '') new cntr(param);
        }
    });
}

function findsSlot(bays, datarow) {
    var ret = "";
    $(bays).each(function (i, bay) {
        if (bay.title == datarow.CY_BAY_NO) {
            var rows = bay.rows;
            $(rows).each(function (ii, row) {
                if (ii > 0) {
                    var slots = row.slots;
                    $(slots).each(function (iii, slot) {
                        if (iii == 0) {
                            if (slot.text == datarow.CY_ROW_NO) return true;else return false;
                        }
                        if (slot.h == datarow.CY_TIER_NO.replace(/\b(0+)/gi, "")) {
                            ret = {
                                loc: slot.loc,
                                cntrno: datarow.CNTR
                            };
                            return false;
                        }
                    });
                }
            });
            return false;
        } else return true;
    });
    return ret;
}

function testMq(id, pos) {
    var share = seajs.require("main/ct/obj/shareData");
    var bays = share.objMap.bay;
    var cntr = seajs.require("main/ct/obj/container");
    $(bays).each(function (i, bay) {
        if (pos.indexOf(bay.id.replace('|', '')) == 0) {
            var param = {};
            param.loc = bay.position.x + ' ' + (bay.position.y - 20);
            param.cntrno = '111';
            new cntr(param);
            return false;
        }
        ;
    });
}

function testMqcntr(no, typ, pos) {
    var share = seajs.require("main/ct/obj/shareData");
    var Slots = share.objMap.Slot;
    var cntr = seajs.require("main/ct/obj/container");
    if (typ == 1) cntr = seajs.require("main/ct/obj/bay/container");else if (typ == 2) cntr = seajs.require("main/ct/obj/bigbay/container");else cntr = seajs.require("main/ct/obj/container");

    $(Slots).each(function (i, Slot) {
        if (pos.indexOf(Slot.id.replace(new RegExp('\\|', 'gm'), '')) == 0) {
            var param = {};
            param.loc = Slot.loc;
            param.cntrno = no;
            new cntr(param);
            return false;
        }
        ;
    });
}

function testColorPlate() {
    var share = seajs.require("main/ct/obj/shareData");
    var cntrs = share.objMap.Cntr;

    $(cntrs).each(function (i, cntr) {

        switch (cntr.tier_no) {
            case "01":
                cntr.setProperty("color", 'green');
                break;
            case "02":
                cntr.setProperty("color", 'red');
                break;
            default:
            // ...
        }
    });
}

function testbay(bays) {
    var share = seajs.require("main/ct/obj/shareData");
    share.showbays = bays;
    var div = document.createElement("div");
    div.id = uuid();
    $(document.body).append(div);
    $('#' + div.id).dialog({
        width: 500,
        height: 400,
        title: bays.substr(0, 20) + "..."
    });
    $('#' + div.id).load("bayframe.html");
}

function yardObjDataSave(info, category) {

    var url = "m?xwl=yardManage/yardedit/" + category + "DataOper/save";

    return Ajax({
        url: url, // 跳转到 action
        params: info,
        type: 'post',
        headers: {
            Accept: "application/json; charset=utf-8"
        },
        cache: false,
        dataType: 'json'
    }).then(function (data) {
        if (!info.ID && data.id) info.ID = data.id;
        if (category == "truck" || category == "frameCrane" || category == "quayCrane") {
            var queu = '/exchange/ex_transporter/' + category + '.' + info.ID;
            client.send(queu, {
                info: {
                    type: category,
                    action: 'create',
                    senduser: '001',
                    sendtime: new Date().getTime(),
                    ttl: 5000,
                    sendmoudle: 'yardedit'
                },
                data: {
                    id: info.ID
                }
            });
        }
        return data;
    });
}

function yardObjDataUpdate(info, category) {

    var url = "m?xwl=yardManage/yardedit/" + category + "DataOper/update";

    return Ajax({
        url: url, // 跳转到 action
        params: info,
        async: false,
        type: 'post',
        headers: {
            Accept: "application/json; charset=utf-8"
        },
        cache: false,
        dataType: 'text'
    });
}

function yardObjDataDel(info, category) {
    var url = "m?xwl=yardManage/yardedit/" + category + "DataOper/del";
    return Confirm('确认要删除选中的对象？').then(function () {
        return Ajax({
            url: url,
            params: {
                ID: info.ID
            },
            type: 'post',
            cache: false,
            dataType: 'json',
            success: function success() {
                alert("删除成功");
            }
            // error : function() {
            //     alert("异常！");
            // }
        });
    });
}

function loadColor() {
    return Ajax({
        url: 'm?xwl=yardManage/yardmonitor/color/allColors',
        cache: false,
        dataType: 'json'
    }).then(function (data) {
        var share = seajs.require("main/ct/obj/shareData");
        share.colorCategory = 'CNTR_SIZE';
        share.colorMap = data;
    });
}

function loadFile(category, id) {
    var url = "m?xwl=yardManage/yardedit/" + category + "DataOper/getData";
    var objurl = "main/ct/obj/" + category;

    return Ajax({
        url: url, // 跳转到 action
        type: 'post',
        params: id ? {
            ID: id
        } : {},
        cache: false,
        dataType: 'json'
    }).then(function (data) {
        var obj = seajs.require(objurl);
        for (var i = 0; i < data.rows.length; i++) {
            // console.log(data.rows[i].X);
            new obj(data.rows[i]);
        }
        // console.log("载入完成");
    }, function () {
        alert("载入异常！");
    });
}

function loadTruck(truck) {
    return Ajax({
        url: "m?xwl=yardManage/yardedit/truckDataOper/getData",
        type: 'post',
        params: truck ? {
            ID: truck
        } : {},
        cache: false,
        dataType: 'json'
    }).then(function (data) {
        var road = seajs.require("main/ct/obj/road");
        for (var i = 0; i < data.rows.length; i++) {
            // console.log(data.rows[i].X);
            road.addTruck(data.rows[i]);
        }
    });
}

function loadShip() {
    return Ajax({
        url: "m?xwl=yardManage/yardedit/ShipDataOper/getData",
        type: 'post',
        cache: false,
        dataType: 'json'
    }).then(function (data) {
        var ship = seajs.require("main/ct/obj/ship");
        for (var i = 0; i < data.rows.length; i++) {
            // console.log(data.rows[i].X);
            new ship(data.rows[i]);
        }
    });
}

function LoadObjFromMessage(message) {
    var url = "";
    var objurl = "";
    var objs = [];
    var share = seajs.require("main/ct/obj/shareData");
    if (message.info.type == "truck" || message.info.type == "yc" || message.info.type == "qc") {
        url = "m?xwl=yardManage/yardedit/yardMachineDataOper/loadDataByMsg";
        if (message.info.type == "truck") {
            objurl = "main/ct/obj/road";
        } else if (message.info.type == "yc") {
            objs = share.objMap.FrameCrane;
            objurl = "main/ct/obj/frameCrane";
        } else if (message.info.type == "qc") {
            objs = share.objMap.QuayCrane;
            objurl = "main/ct/obj/quayCrane";
        }
    } else return;
    // else if (message.category == "parkingLot") {
    //     url = "m?xwl=yardManage/yardedit/parkingLotDataOper/getData";
    //     objurl = "main/ct/obj/parkingLot";
    // }else if(message.category == "roadPoint"){
    //     url = "m?xwl=yardManage/yardedit/roadPointDataOper/getData";
    //     objurl = "main/ct/obj/roadPoint"
    // }else if(message.category == "road"){
    //     url = "m?xwl=yardManage/yardedit/roadDataOper/getData";
    //     objurl = "main/ct/obj/road"
    // }else if(message.category == "bollard"){
    //     url = "m?xwl=yardManage/yardedit/bollardDataOper/getData";
    //     objurl = "main/ct/obj/bollard"
    // }else if(message.category == "berth"){
    //     url = "m?xwl=yardManage/yardedit/berthDataOper/getData";
    //     objurl = "main/ct/obj/berth"
    // }
    var info = {
        ID: message.data.id
    };
    return Ajax({
        url: url, // 跳转到 action
        type: 'post',
        params: info,
        cache: false,
        dataType: 'json'
    }).then(function (data) {
        var obj = seajs.require(objurl);
        if (message.info.type === 'truck') switch (message.info.action) {
            case 'update':
            case 'delete':
                obj.removeTruck(message.data.id);
                if (message.info.action === "delete") break;
            case 'create':
                obj.addTruck(data.rows[0]);
                break;
        } else switch (message.info.action) {
            case 'update':
            case 'delete':
                for (var i in objs) {
                    if (objs[i].ID == message.data.id) share.diagram.model.removeNodeData(objs.splice(i, 1)[0]);
                }if (message.info.action === "delete") break;
            case 'create':
                data.rows[0] && new obj(data.rows[0]);
                break;
        }
        // console.log("载入完成");
    });
}

function ProcShipMsg(msg) {
    var share = seajs.require("main/ct/obj/shareData");
    var ships = share.objMap.Ship;
    var Ship = seajs.require("main/ct/obj/ship");
    switch (msg.info.action) {
        case 'update':
        case 'delete':
            for (var i in ships) {
                if (ships[i].ID == message.data.id) share.diagram.model.removeNodeData(ships.splice(i, 1)[0]);
            }if (msg.info.action === "delete") break;
        case 'create':
            new Ship(msg.data);
            break;
    }
}

function loadAllEditCyObj() {
    myDiagram.clear();
    loadFile("roadPoint").then(function () {
        return loadFile("road");
    });
    loadFile('yard');
    loadFile('specYard');
    loadFile("parkingLot");
    loadFile("bollard");
    loadFile("berth");
}

function loadAllCyObj() {
    myDiagram.clear();
    loadColor();
    loadFile("roadPoint").then(Wait.bind(100)).then(function () {
        return loadFile("road");
    }).then(function () {
        loadFile("frameCrane");
        loadTruck();
    });
    loadFile('yard').then(Wait.bind(500)).then(function () {
        loadCntr();
        loadFile('boundary');
    });
    loadFile('specYard');
    loadFile("parkingLot");
    loadFile("bollard").then(function () {
        return loadFile("quayCrane");
    }).then(Wait.bind(500));
    loadFile("berth").then(Wait.bind(500)).then(function () {
        return loadShip();
    });
}

function makeRoad() {
    if (myDiagram.selection.size != 2) {
        alert("请选择两个路点进行操作");
        return;
    }
    // new road(myDiagram.selection);
    var prev = "";
    myDiagram.selection.each(function (current) {
        if (current.data.className == "roadPoint") {
            if (prev != "") {
                var linkDataArray = {
                    BEG_POINT: prev.data.POINT_NAME,
                    END_POINT: current.data.POINT_NAME
                };
                ShowProp('road').then(function (wnd) {
                    Wb.setValue(wnd, linkDataArray);
                });
                //road(linkDataArray);
                prev = current;
            } else {
                prev = current;
            }
        }
    });
}

function removeall() {
    myDiagram.selection.each(function (current) {
        console.log(current);
        current.data.remove;
    });
}
