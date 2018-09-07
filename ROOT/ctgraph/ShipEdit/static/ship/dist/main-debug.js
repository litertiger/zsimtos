define("anji/ship/shipTemplate-debug", [], function(require, exports, module) {
    "use strict";
    var go = require("gojs/go-debug");
    var $ = go.GraphObject.make;
    // for conciseness in defining templates
    var addClassTemplate = function(Map, Class, Template) {
        Map.add(Class.prototype.className, Template);
    };
    var mouseDrop = function(e, g) {
        var Container = require("./container-debug");
        var Slot = require("./slot-debug");
        switch (g.part.data.category) {
          case Slot.prototype.className:
            if (g.part.data.no != "") return;
            e.diagram.selection.each(function(n) {
                if (n.data.category === Container.prototype.className) n.data.setProperty("pos", g.part.data.pos);
            });
            break;
        }
    };
    var initTemplate = function(diagram) {
        var share = require("./shareData-debug");
        share.diagram = diagram;
        diagram.addDiagramListener("SelectionMoved", function(e) {
            e.subject.each(function(n) {
                n.data.onMoved();
            });
        });
        //add Template for Slot
        var Slot = require("./slot-debug");
        addClassTemplate(diagram.nodeTemplateMap, Slot, $(go.Node, "Auto", {
            locationSpot: go.Spot.Center,
            isLayoutPositioned: false,
            deletable: false,
            movable: false,
            mouseDrop: mouseDrop
        }, $(go.Shape, "Rectangle", {
            fill: "white",
            // the default fill, if there is no data-binding
            cursor: "pointer",
            // the Shape is the port, not the whole Node
            height: 50,
            width: 50,
            strokeWidth: 1
        })));
        var Label = require("./label-debug");
        addClassTemplate(diagram.nodeTemplateMap, Label, $(go.Node, "Auto", {
            locationSpot: go.Spot.Center,
            isLayoutPositioned: false,
            deletable: false,
            movable: false,
            selectable: false
        }, $(go.Shape, "Rectangle", {
            fill: "white",
            // the default fill, if there is no data-binding
            cursor: "pointer",
            // the Shape is the port, not the whole Node
            height: 50,
            width: 50,
            strokeWidth: 0
        }, new go.Binding("fill", "color")), //new go.Binding("location", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.TextBlock, {
            font: "bold 14pt sans-serif",
            stroke: "#333",
            margin: 6,
            // make some extra space for the shape around the text
            editable: false,
            // allow in-place editing by user
            textAlign: "center"
        }, new go.Binding("text", "no"))));
        //add Template for Container
        var Container = require("./container-debug");
        addClassTemplate(diagram.nodeTemplateMap, Container, $(go.Node, "Auto", {
            locationSpot: go.Spot.Center,
            deletable: false,
            isLayoutPositioned: false
        }, $(go.Shape, "Rectangle", {
            fill: "white",
            // the default fill, if there is no data-binding
            cursor: "pointer",
            // the Shape is the port, not the whole Node
            height: 50,
            width: 50
        }, new go.Binding("strokeWidth", "no", function(no) {
            return no == "" ? 1 : 0;
        }), new go.Binding("fill", "color")), //new go.Binding("location", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, "Vertical", $(go.TextBlock, {
            font: "bold 10pt sans-serif",
            stroke: "#333",
            margin: 0,
            // make some extra space for the shape around the text
            editable: false,
            // allow in-place editing by user
            textAlign: "left",
            alignment: go.Spot.TopLeft
        }, new go.Binding("text", "no", function(t) {
            return t.substr(0, 4);
        })), // 箱号前4位字母
        $(go.TextBlock, {
            font: "8pt sans-serif",
            stroke: "#333",
            margin: 0,
            // make some extra space for the shape around the text
            isMultiline: true,
            // don't allow newlines in text
            editable: false,
            // allow in-place editing by user
            textAlign: "right",
            alignment: go.Spot.TopRight
        }, new go.Binding("text", "no", function(t) {
            return t.substr(4);
        })))));
        //add Template for Group
        var Group = require("./group-debug");
        addClassTemplate(diagram.groupTemplateMap, Group, $(go.Group, "Vertical", {
            locationSpot: go.Spot.Center,
            movable: false,
            deletable: false
        }, $(go.Panel, "Auto", $(go.Shape, "Rectangle", // surrounds the Placeholder
        {
            strokeWidth: 0,
            fill: "rgba(128,128,128,0)"
        }), $(go.Placeholder))));
        //add Template for BottomTitleGroup
        var BottomTitleGroup = require("./bottomTitleGroup-debug");
        addClassTemplate(diagram.groupTemplateMap, BottomTitleGroup, $(go.Group, "Vertical", {
            locationSpot: go.Spot.Center,
            movable: false,
            deletable: false
        }, $(go.Panel, "Auto", $(go.Shape, "Rectangle", // surrounds the Placeholder
        {
            strokeWidth: 0,
            fill: "rgba(128,128,128,0)"
        }), $(go.Placeholder)), $(go.TextBlock, // group title
        {
            alignment: go.Spot.Center,
            font: "Bold 14pt Sans-Serif"
        }, new go.Binding("text", "no"))));
        //add Template for TopTitleGroup
        var TopTitleGroup = require("./topTitleGroup-debug");
        addClassTemplate(diagram.groupTemplateMap, TopTitleGroup, $(go.Group, "Vertical", {
            locationSpot: go.Spot.Center,
            movable: false,
            deletable: false
        }, $(go.TextBlock, // group title
        {
            alignment: go.Spot.Center,
            font: "Bold 14pt Sans-Serif"
        }, new go.Binding("text", "no")), $(go.Panel, "Auto", $(go.Shape, "Rectangle", // surrounds the Placeholder
        {
            strokeWidth: 0,
            fill: "rgba(128,128,128,0)"
        }), $(go.Placeholder))));
    };
    module.exports = {
        initTemplate: initTemplate
    };
});

define("anji/ship/container-debug", [ "./shipObject-debug", "./shareData-debug", "./dragComputation-debug", "./slot-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    var DragComputation = require("./dragComputation-debug");
    var share = require("./shareData-debug");
    //定义Container类开始
    function Container(no) {
        this.color = "green";
        this.no = no;
        ShipObject.call(this);
        DragComputation.call(this);
    }
    ShipObject.inherit(Container, ShipObject);
    Container.prototype.getStowLoc = function(pos) {
        return this.stowLoc;
    };
    Container.prototype.setStowLoc = function(pos) {
        this.stowLoc = pos;
        var bayNo = pos.substr(0, 3);
        //查找贝
        for (var b in share.objMap.ShipBay) {
            if (share.objMap.ShipBay[b].no == bayNo) {
                //找到贝查找所在排和层号索引排
                //在甲板上查找对应层号
                var tierIndex = -1;
                var rowNo = pos.substr(3, 2);
                var tierNo = pos.substr(5, 2);
                var slots = share.objMap.ShipBay[b].deckBay.rows[0].slots;
                for (var i = 0; i < slots.length; ++i) if (slots[i].no == tierNo) {
                    tierIndex = i;
                    break;
                }
                //找到层号，再找对应的排
                if (tierIndex >= 0) {
                    var rows = share.objMap.ShipBay[b].deckBay.rows;
                    for (var r in rows) {
                        //找到排，移动到相应位置并退出函数
                        if (rows[r].no == rowNo) {
                            this.node.move(rows[r].slots[tierIndex].node.position);
                            break;
                        }
                    }
                    break;
                }
                //在舱下查找对应层号
                var slots = share.objMap.ShipBay[b].cabinBay.rows[0].slots;
                for (var i = 0; i < slots.length; ++i) if (slots[i].no == tierNo) {
                    tierIndex = i;
                    break;
                }
                //找到层号，再找对应的排
                if (tierIndex >= 0) {
                    rows = share.objMap.ShipBay[b].cabinBay.rows;
                    for (var r in rows) {
                        //找到排，移动到相应位置
                        if (rows[r].no == rowNo) {
                            //this.node.move(rows[r].slots[tierIndex].node.position);
                            this.node.location = rows[r].slots[tierIndex].node.location;
                            //this.node.position = rows[r].slots[tierIndex].node.position;
                            break;
                        }
                    }
                }
                break;
            }
        }
    };
    //实现DragComputation接口
    Container.prototype.onDragComputation = function(part, pt, gridpt) {
        var Slot = require("./slot-debug");
        var slot = this.findAnjiObjectAt(Slot, pt);
        if (slot === null) return part.location;
        var container = this.findAnjiObjectAt(Container, pt);
        if (container !== null) return part.location;
        return slot.location;
    };
    //重载移动事件
    Container.prototype.onMoved = function() {
        var Slot = require("./slot-debug");
        var slot = this.findAnjiObjectAt(Slot, this.node.location);
        if (slot) {
            var row = slot.containingGroup;
            var index = row.data.slots.indexOf(slot.data);
            var bayBase = row.containingGroup;
            var bay = bayBase.containingGroup;
            this.stowLoc = bay.data.no + row.data.no + bayBase.data.rows[0].slots[index].no;
            console.log(this.stowLoc);
        }
    };
    Container.prototype.className = "Container";
    //定义Container类结束
    module.exports = Container;
});

define("anji/ship/shipObject-debug", [ "./shareData-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var share = require("./shareData-debug");
    //定义ShipObject类开始
    function ShipObject() {
        var b = new Date();
        //检查全局静态变量
        if (share.diagram == null) throw "未初始化全局静态变量share.diagram";
        //按继承树查找最匹配的模版
        var p = this.__proto__;
        var map = share.diagram.nodeTemplateMap;
        if (this.isGroup) map = share.diagram.groupTemplateMap;
        while (p != null) {
            if (map.contains(p.className)) {
                this.category = p.className;
                break;
            }
            p = p.__proto__;
        }
        //创建goJs中的Node对象
        share.diagram.model.addNodeData(this);
        //记录对象到相应数组中
        if (share.objMap[this.className] === undefined) share.objMap[this.className] = [];
        share.objMap[this.className].push(this);
        this.node = share.diagram.findNodeForData(this);
        var e = new Date();
        console.log("Call ShipObject():" + (e - b));
    }
    ShipObject.inherit = function(SubClass, BaseClass) {
        var F = function() {};
        // 定义一个空构造函数
        F.prototype = BaseClass.prototype;
        // 将其原型属性设置为基类
        var oldConstructor = SubClass.prototype.constructor;
        SubClass.prototype = new F();
        SubClass.prototype.constructor = oldConstructor;
    };
    //修改对象单个属性
    ShipObject.prototype.setProperty = function(key, value) {
        this[key] = value;
        this.node.updateTargetBindings();
    };
    //修改多个属性
    ShipObject.prototype.setProperties = function(obj) {
        if (obj instanceof Object) {
            for (var i in obj) this[i] = obj[i];
            this.node.updateTargetBindings();
        }
    };
    //当对象移动到目标位置后调用
    ShipObject.prototype.onMoved = function() {};
    ShipObject.prototype.className = "ShipObject";
    ShipObject.prototype.findAnjiObjectAt = function(type, pt) {
        var navig = function(g) {
            return g.part;
        };
        var pred = function(p) {
            if (!(p.data instanceof type)) return false;
            return true;
        };
        return share.diagram.findObjectAt(pt, navig, pred);
    };
    //定义ShipObject类结束
    module.exports = ShipObject;
});

define("anji/ship/shareData-debug", [ "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var go = require("gojs/go-debug");
    module.exports = {
        objMap: {},
        diagram: null,
        slotSize: new go.Size(50, 50)
    };
});

define("anji/ship/dragComputation-debug", [], function(require, exports, module) {
    "use strict";
    //定义DragComputation私有接口类开始
    function DragComputation() {
        this.node.dragComputation = function(part, pt, gridpt) {
            return this.data.onDragComputation(part, pt, gridpt);
        };
    }
    //定义DragComputation私有接口类结束
    module.exports = DragComputation;
});

define("anji/ship/slot-debug", [ "./shipObject-debug", "./shareData-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    //定义Slot类开始
    function Slot() {
        var b = new Date();
        this.color = "white";
        ShipObject.call(this);
        var e = new Date();
        console.log("Call Slot():" + (e - b));
    }
    ShipObject.inherit(Slot, ShipObject);
    Slot.prototype.className = "Slot";
    //定义Slot类结束
    module.exports = Slot;
});

define("anji/ship/label-debug", [ "./shipObject-debug", "./shareData-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    //定义Label类开始
    function Label(no) {
        var b = new Date();
        this.no = no;
        this.color = "white";
        ShipObject.call(this);
        var e = new Date();
        console.log("Call Label():" + (e - b));
    }
    ShipObject.inherit(Label, ShipObject);
    Label.prototype.className = "Label";
    //定义Label类结束
    module.exports = Label;
});

define("anji/ship/group-debug", [ "./shipObject-debug", "./shareData-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    //定义Group类开始
    function Group() {
        var b = new Date();
        this.isGroup = true;
        ShipObject.call(this);
        var e = new Date();
        console.log("Call Group():" + (e - b));
    }
    ShipObject.inherit(Group, ShipObject);
    Group.prototype.className = "Group";
    //定义Group类结束
    module.exports = Group;
});

define("anji/ship/bottomTitleGroup-debug", [ "./shipObject-debug", "./shareData-debug", "./group-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    var Group = require("./group-debug");
    //定义TopTitleGroup类开始
    function BottomTitleGroup(no) {
        this.no = no;
        Group.call(this);
    }
    ShipObject.inherit(BottomTitleGroup, Group);
    BottomTitleGroup.prototype.className = "BottomTitleGroup";
    //定义TopTitleGroup类结束
    module.exports = BottomTitleGroup;
});

define("anji/ship/topTitleGroup-debug", [ "./shipObject-debug", "./shareData-debug", "./group-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    var Group = require("./group-debug");
    //定义TopTitleGroup类开始
    function TopTitleGroup(no) {
        this.no = no;
        Group.call(this);
    }
    ShipObject.inherit(TopTitleGroup, Group);
    TopTitleGroup.prototype.className = "TopTitleGroup";
    //定义TopTitleGroup类结束
    module.exports = TopTitleGroup;
});

define("anji/ship/shipBay-debug", [ "./shipObject-debug", "./shareData-debug", "./topTitleGroup-debug", "./group-debug", "./deckBay-debug", "./bayBase-debug", "./deckRow-debug", "./rowBase-debug", "./slot-debug", "./label-debug", "./bottomTitleGroup-debug", "./cabinBay-debug", "./cabinRow-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var go = require("gojs/go-debug");
    var ShipObject = require("./shipObject-debug");
    var TopTitleGroup = require("./topTitleGroup-debug");
    var DeckBay = require("./deckBay-debug");
    var CabinBay = require("./cabinBay-debug");
    var share = require("./shareData-debug");
    //定义ShipBay类开始
    function ShipBay(no, deckInfo, cabinInfo) {
        var b = new Date();
        TopTitleGroup.call(this, no);
        if (deckInfo != null) {
            this.deckBay = new DeckBay(deckInfo);
            this.deckBay.node.containingGroup = this.node;
        } else this.deckBay = null;
        if (cabinInfo != null) {
            this.cabinBay = new CabinBay(cabinInfo);
            this.cabinBay.node.containingGroup = this.node;
            this.cabinBay.node.move(new go.Point(0, share.slotSize.height * 2));
        } else this.cabinBay = null;
        this.node.locationSpot = new go.Spot(.5, 0, 0, this.deckBay.tierCount * share.slotSize.height);
        var e = new Date();
        console.log("Call ShipBay():" + (e - b));
    }
    ShipObject.inherit(ShipBay, TopTitleGroup);
    ShipBay.prototype.className = "ShipBay";
    //定义ShipBay类结束
    module.exports = ShipBay;
});

define("anji/ship/deckBay-debug", [ "./shipObject-debug", "./shareData-debug", "./bayBase-debug", "./group-debug", "./deckRow-debug", "./rowBase-debug", "./slot-debug", "./label-debug", "./bottomTitleGroup-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    var BayBase = require("./bayBase-debug");
    var Group = require("./group-debug");
    var DeckRow = require("./deckRow-debug");
    //定义DeckBay类开始
    function DeckBay(info) {
        Group.call(this);
        BayBase.call(this, info);
    }
    ShipObject.inherit(DeckBay, Group);
    DeckBay.prototype.createRow = function(no, info) {
        return new DeckRow(no, info);
    };
    DeckBay.prototype.className = "DeckBay";
    //定义DeckBay类结束
    module.exports = DeckBay;
});

define("anji/ship/bayBase-debug", [ "./shareData-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var go = require("gojs/go-debug");
    var share = require("./shareData-debug");
    //定义BayBase私有接口类开始
    var BayBase = function(info) {
        var b = new Date();
        this.rows = [];
        var row;
        this.tierCount = 0;
        this.addRow = function(row) {
            this.rows.push(row);
            row.node.containingGroup = this.node;
            if (row.slots.length > this.tierCount) this.tierCount = row.slots.length;
        };
        var i = 1;
        for (var r in info) {
            row = this.createRow(r, info[r]);
            this.addRow(row);
            row.node.move(new go.Point(i * share.slotSize.width, 0));
            ++i;
        }
        var e = new Date();
        console.log("Call BayBase():" + (e - b));
    };
    //定义BayBase类结束
    module.exports = BayBase;
});

define("anji/ship/deckRow-debug", [ "./shipObject-debug", "./shareData-debug", "./rowBase-debug", "./slot-debug", "./label-debug", "./bottomTitleGroup-debug", "./group-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var go = require("gojs/go-debug");
    var ShipObject = require("./shipObject-debug");
    var RowBase = require("./rowBase-debug");
    var BottomTitleGroup = require("./bottomTitleGroup-debug");
    var share = require("./shareData-debug");
    //定义DeckRow类开始
    function DeckRow(no, info) {
        BottomTitleGroup.call(this, no);
        RowBase.call(this, info);
    }
    ShipObject.inherit(DeckRow, BottomTitleGroup);
    DeckRow.prototype.initPosition = function() {
        var pt = new go.Point(0, 0);
        var slots = this.slots;
        for (var s in slots) {
            slots[s].node.move(pt);
            pt.y -= share.slotSize.height;
        }
    };
    DeckRow.prototype.className = "DeckRow";
    //定义DeckRow类结束
    module.exports = DeckRow;
});

define("anji/ship/rowBase-debug", [ "./slot-debug", "./shipObject-debug", "./shareData-debug", "./label-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var Slot = require("./slot-debug");
    var Label = require("./label-debug");
    //定义RowBase私有接口类开始
    var RowBase = function(info) {
        var b = new Date();
        this.slots = [];
        var slot;
        this.addSlot = function(slot) {
            this.slots.push(slot);
            slot.node.containingGroup = this.node;
        };
        if (info instanceof Array) {
            for (var i = 0; i < info.length; ++i) {
                slot = new Label(info[i]);
                this.addSlot(slot);
            }
        } else if (!isNaN(info)) {
            for (var i = 0; i < info; ++i) {
                slot = new Slot("");
                this.addSlot(slot);
            }
        } else throw "非法参数";
        this.initPosition();
        var e = new Date();
        console.log("Call RowBase():" + (e - b));
    };
    //定义RowBase私有接口类结束
    module.exports = RowBase;
});

define("anji/ship/cabinBay-debug", [ "./shipObject-debug", "./shareData-debug", "./bayBase-debug", "./group-debug", "./cabinRow-debug", "./rowBase-debug", "./slot-debug", "./label-debug", "./topTitleGroup-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    var BayBase = require("./bayBase-debug");
    var Group = require("./group-debug");
    var CabinRow = require("./cabinRow-debug");
    //定义CabinBay类开始
    function CabinBay(info) {
        Group.call(this);
        BayBase.call(this, info);
    }
    ShipObject.inherit(CabinBay, Group);
    CabinBay.prototype.createRow = function(no, info) {
        return new CabinRow(no, info);
    };
    CabinBay.prototype.className = "CabinBay";
    //定义CabinBay类结束
    module.exports = CabinBay;
});

define("anji/ship/cabinRow-debug", [ "./shipObject-debug", "./shareData-debug", "./rowBase-debug", "./slot-debug", "./label-debug", "./topTitleGroup-debug", "./group-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var go = require("gojs/go-debug");
    var ShipObject = require("./shipObject-debug");
    var RowBase = require("./rowBase-debug");
    var TopTitleGroup = require("./topTitleGroup-debug");
    var share = require("./shareData-debug");
    //定义DeckRow类开始
    function CabinRow(no, info) {
        TopTitleGroup.call(this, no);
        RowBase.call(this, info);
    }
    ShipObject.inherit(CabinRow, TopTitleGroup);
    CabinRow.prototype.initPosition = function() {
        var pt = new go.Point(0, 0);
        var slots = this.slots;
        for (var s in slots) {
            slots[s].node.move(pt);
            pt.y += share.slotSize.height;
        }
    };
    CabinRow.prototype.className = "CabinRow";
    //定义DeckRow类结束
    module.exports = CabinRow;
});

define("anji/ship/main-debug", [ "./shipTemplate-debug", "./container-debug", "./shipObject-debug", "./shareData-debug", "./dragComputation-debug", "./slot-debug", "./label-debug", "./group-debug", "./bottomTitleGroup-debug", "./topTitleGroup-debug", "./shipBay-debug", "./deckBay-debug", "./bayBase-debug", "./deckRow-debug", "./rowBase-debug", "./cabinBay-debug", "./cabinRow-debug", "gojs/go-debug" ], function(require) {
    "use strict";
    var go = require("gojs/go-debug");
    var $ = go.GraphObject.make;
    // for conciseness in defining templates
    var myDiagram = $(go.Diagram, "myDiagramDiv", // create a Diagram for the DIV HTML element
    {
        // position the graph in the middle of the diagram
        initialContentAlignment: go.Spot.Center,
        allowLink: false,
        InitialLayoutCompleted: InitialLayoutCompleted,
        layout: $(go.GridLayout, {
            /*isInitial:false,*/
            spacing: new go.Size(10, 10),
            sorting: go.GridLayout.Forward
        }),
        // allow double-click in background to create a new node
        "clickCreatingTool.archetypeNodeData": {
            text: "Node",
            color: "white"
        },
        // allow Ctrl-G to call groupSelection()
        "commandHandler.archetypeGroupData": {
            text: "Group",
            isGroup: true,
            color: "blue"
        },
        // enable undo & redo
        "undoManager.isEnabled": true
    });
    // Define the appearance and behavior for Nodes:
    // First, define the shared context menu for all Nodes, Links, and Groups.
    // To simplify this code we define a function for creating a context menu button:
    function makeButton(text, action, visiblePredicate) {
        return $("ContextMenuButton", $(go.TextBlock, text), {
            click: action
        }, // don't bother with binding GraphObject.visible if there's no predicate
        visiblePredicate ? new go.Binding("visible", "", visiblePredicate).ofObject() : {});
    }
    // a context menu is an Adornment with a bunch of buttons in them
    var partContextMenu = $(go.Adornment, "Vertical", makeButton("Properties", function(e, obj) {
        // OBJ is this Button
        var contextmenu = obj.part;
        // the Button is in the context menu Adornment
        var part = contextmenu.adornedPart;
        // the adornedPart is the Part that the context menu adorns
        // now can do something with PART, or with its data, or with the Adornment (the context menu)
        if (part instanceof go.Link) alert(linkInfo(part.data)); else if (part instanceof go.Group) alert(groupInfo(contextmenu)); else alert(nodeInfo(part.data));
    }), makeButton("Cut", function(e, obj) {
        e.diagram.commandHandler.cutSelection();
    }, function(o) {
        return o.diagram.commandHandler.canCutSelection();
    }), makeButton("Copy", function(e, obj) {
        e.diagram.commandHandler.copySelection();
    }, function(o) {
        return o.diagram.commandHandler.canCopySelection();
    }), makeButton("Paste", function(e, obj) {
        e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint);
    }, function(o) {
        return o.diagram.commandHandler.canPasteSelection();
    }), makeButton("Delete", function(e, obj) {
        e.diagram.commandHandler.deleteSelection();
    }, function(o) {
        return o.diagram.commandHandler.canDeleteSelection();
    }), makeButton("Undo", function(e, obj) {
        e.diagram.commandHandler.undo();
    }, function(o) {
        return o.diagram.commandHandler.canUndo();
    }), makeButton("Redo", function(e, obj) {
        e.diagram.commandHandler.redo();
    }, function(o) {
        return o.diagram.commandHandler.canRedo();
    }), makeButton("Group", function(e, obj) {
        e.diagram.commandHandler.groupSelection();
    }, function(o) {
        return o.diagram.commandHandler.canGroupSelection();
    }), makeButton("Ungroup", function(e, obj) {
        e.diagram.commandHandler.ungroupSelection();
    }, function(o) {
        return o.diagram.commandHandler.canUngroupSelection();
    }));
    function nodeInfo(d) {
        // Tooltip info for a node data object
        var str = "Node " + d.key + ": " + d.text + "\n";
        if (d.group) str += "member of " + d.group; else str += "top-level node";
        return str;
    }
    // Define the appearance and behavior for Groups:
    function groupInfo(adornment) {
        // takes the tooltip or context menu, not a group node data object
        var g = adornment.adornedPart;
        // get the Group that the tooltip adorns
        var mems = g.memberParts.count;
        var links = 0;
        g.memberParts.each(function(part) {
            if (part instanceof go.Link) links++;
        });
        return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including " + links + " links";
    }
    // Groups consist of a title in the color given by the group node data
    // above a translucent gray rectangle surrounding the member parts
    myDiagram.groupTemplate = $(go.Group, "Vertical", {
        selectionObjectName: "PANEL",
        // selection handle goes around shape, not label
        ungroupable: true
    }, // enable Ctrl-Shift-G to ungroup a selected Group
    $(go.TextBlock, {
        font: "bold 19px sans-serif",
        isMultiline: false,
        // don't allow newlines in text
        editable: true
    }, new go.Binding("text", "text").makeTwoWay(), new go.Binding("stroke", "color")), $(go.Panel, "Auto", {
        name: "PANEL"
    }, $(go.Shape, "Rectangle", // the rectangular shape around the members
    {
        fill: "rgba(128,128,128,0.2)",
        stroke: "gray",
        strokeWidth: 3
    }), $(go.Placeholder, {
        padding: 10
    })), {
        // this tooltip Adornment is shared by all groups
        toolTip: $(go.Adornment, "Auto", $(go.Shape, {
            fill: "#FFFFCC"
        }), $(go.TextBlock, {
            margin: 4
        }, // bind to tooltip, not to Group.data, to allow access to Group properties
        new go.Binding("text", "", groupInfo).ofObject())),
        // the same context menu Adornment is shared by all groups
        contextMenu: partContextMenu
    });
    // Define the behavior for the Diagram background:
    function diagramInfo(model) {
        // Tooltip info for the diagram's model
        return "Model:\n" + model.nodeDataArray.length + " nodes, " + model.linkDataArray.length + " links";
    }
    // provide a tooltip for the background of the Diagram, when not over any Part
    myDiagram.toolTip = $(go.Adornment, "Auto", $(go.Shape, {
        fill: "#FFFFCC"
    }), $(go.TextBlock, {
        margin: 4
    }, new go.Binding("text", "", diagramInfo)));
    // provide a context menu for the background of the Diagram, when not over any Part
    myDiagram.contextMenu = $(go.Adornment, "Vertical", makeButton("Paste", function(e, obj) {
        e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint);
    }, function(o) {
        return o.diagram.commandHandler.canPasteSelection();
    }), makeButton("Undo", function(e, obj) {
        e.diagram.commandHandler.undo();
    }, function(o) {
        return o.diagram.commandHandler.canUndo();
    }), makeButton("Redo", function(e, obj) {
        e.diagram.commandHandler.redo();
    }, function(o) {
        return o.diagram.commandHandler.canRedo();
    }));
    myDiagram.model = new go.GraphLinksModel([], []);
    function formatBayNo(n) {
        var no = (2 * n + 1).toString();
        var a = no.split();
        return no[2] ? no : no[1] ? "0" + no : "00" + no;
    }
    //初始化模版
    var template = require("./shipTemplate-debug");
    template.initTemplate(myDiagram);
    var ShipBay = require("./shipBay-debug");
    console.log("begin create");
    var begin = new Date();
    var last = begin;
    var count = 4;
    for (var i = 0; i < count; ++i) {
        var bay = new ShipBay(formatBayNo(i), {
            "": [ "82", "84", "86", "88" ],
            "05": 4,
            "03": 4,
            "01": 4,
            "00": 4,
            "02": 4,
            "04": 4,
            "06": 4
        }, {
            "": [ "12", "10", "08", "06", "04", "02" ],
            "05": 3,
            "03": 4,
            "01": 5,
            "00": 6,
            "02": 5,
            "04": 4,
            "06": 3
        });
        var end = new Date();
        var span = end - last;
        last = end;
        console.log(i + 1 + "/" + count + " created use time :" + span);
    }
    end = new Date();
    span = end - begin;
    console.log("create time :" + span);
    //创建001贝
    /*var bay = new ShipBay("001", {
		"" : ["82", "84", "86", "88"],
		"05" : 4,
		"03" : 4,
		"01" : 4,
		"00" : 4,
		"02" : 4,
		"04" : 4,
		"06" : 4
	}, {
		"" : ["12", "10", "08", "06", "04", "02"],
		"05" : 3,
		"03" : 4,
		"01" : 5,
		"00" : 9,
		"02" : 5,
		"04" : 4,
		"06" : 3
	});
	
	
	//创建003贝
	bay = new ShipBay("003", {
		"" : ["82", "84", "86", "88"],
		"05" : 4,
		"03" : 4,
		"01" : 5,
		"00" : 5,
		"02" : 5,
		"04" : 4,
		"06" : 4
	}, {
		"" : ["12", "10", "08", "06", "04", "02"],
		"05" : 3,
		"03" : 4,
		"01" : 5,
		"00" : 6,
		"02" : 5,
		"04" : 4,
		"06" : 3
	});
	
	
	//创建005贝
	bay = new ShipBay("005", {
		"" : ["82", "84", "86", "88"],
		"05" : 4,
		"03" : 4,
		"01" : 6,
		"00" : 6,
		"02" : 6,
		"04" : 4,
		"06" : 4
	}, {
		"" : ["12", "10", "08", "06", "04", "02"],
		"05" : 3,
		"03" : 4,
		"01" : 5,
		"00" : 6,
		"02" : 5,
		"04" : 4,
		"06" : 3
	});
	
	//创建007贝
	bay = new ShipBay("007", {
		"" : ["82", "84", "86", "88"],
		"05" : 4,
		"03" : 4,
		"01" : 6,
		"02" : 6,
		"04" : 4,
		"06" : 4
	}, {
		"" : ["12", "10", "08", "06", "04", "02"],
		"05" : 3,
		"03" : 4,
		"01" : 5,
		"00" : 9,
		"02" : 5,
		"04" : 4,
		"06" : 3
	});*/
    function InitialLayoutCompleted() {
        var init = new Date();
        span = init - end;
        console.log("layout time :" + span);
        /*x = 0;
		for(var i= 0;i < ShipObject.objMap.ShipBay.length; ++i)
		{
			var n = ShipObject.objMap.ShipBay[i].node;
			//n.move(new go.Point(x,0));
			x += n.actualBounds.right + 10;
		}*/
        //myDiagram.layoutDiagram(true);
        //创建一个箱
        var Container = require("./container-debug");
        new Container("TENU6937241").setStowLoc("0010384");
        new Container("TMOU7895265").setStowLoc("0030510");
        new Container("TESU2863951").setStowLoc("0050006");
    }
});