define("anji/ship/dragFillTool-debug", [ "./shipObject-debug", "./shareData-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    /*
	 *  Copyright (C) 1998-2016 by Northwoods Software Corporation. All Rights Reserved.
	 */
    var go = require("gojs/go-debug");
    // A custom Tool for creating a new Node with custom size by dragging its outline in the background.
    function DragFillTool() {
        go.Tool.call(this);
        this.name = "DragCreating";
        /** @type {number} */
        this._delay = 175;
    }
    go.Diagram.inherit(DragFillTool, go.Tool);
    /**
	 * This tool can run when there has been a mouse-drag, far enough away not to be a click,
	 * and there has been delay of at least {@link #delay} milliseconds
	 * after the mouse-down before a mouse-move.
	 * <p/>
	 * This method may be overridden.
	 * @this {DragFillTool}
	 * @return {boolean}
	 */
    DragFillTool.prototype.canStart = function() {
        if (!this.isEnabled) return false;
        // gotta have some node data that can be copied
        if (this.archetypeNodeData === null) return false;
        var diagram = this.diagram;
        if (diagram === null) return false;
        // heed IsReadOnly & AllowInsert
        if (diagram.isReadOnly || diagram.isModelReadOnly) return false;
        if (!diagram.allowInsert) return false;
        var e = diagram.lastInput;
        // require left button & that it has moved far enough away from the mouse down point, so it isn't a click
        if (!e.left) return false;
        // don't include the following checks when this tool is running modally
        if (diagram.currentTool !== this) {
            if (!this.isBeyondDragSize()) return false;
            // must wait for "delay" milliseconds before that tool can run
            if (e.timestamp - diagram.firstInput.timestamp < this.delay) return false;
        }
        return true;
    };
    /**
	 * Capture the mouse.
	 * @this {DragFillTool}
	 */
    DragFillTool.prototype.doActivate = function() {
        var diagram = this.diagram;
        if (diagram === null) return;
        this.isActive = true;
        diagram.isMouseCaptured = true;
        this.startTransaction(this.name);
    };
    /**
	 * Release the mouse.
	 * @this {DragFillTool}
	 */
    DragFillTool.prototype.doDeactivate = function() {
        var diagram = this.diagram;
        if (diagram === null) return;
        diagram.isMouseCaptured = false;
        this.isActive = false;
        this.transactionResult = this.name;
        this.stopTransaction(this.name);
    };
    /**
	 * Update the {@link #box}'s position and size according to the value
	 * of {@link #computeBoxBounds}.
	 * @this {DragFillTool}
	 */
    DragFillTool.prototype.doMouseMove = function() {
        var diagram = this.diagram;
        if (diagram === null) return;
        this.fillPart(diagram.lastInput.documentPoint);
    };
    /**
	 * Call {@link #insertPart} with the value of a call to {@link #computeBoxBounds}.
	 * @this {DragFillTool}
	 */
    DragFillTool.prototype.doMouseUp = function() {
        // set the TransactionResult before raising event, in case it changes the result or cancels the tool
        this.stopTool();
    };
    /**
	 * This just returns a {@link Rect} stretching from the mouse-down point to the current mouse point.
	 * <p/>
	 * This method may be overridden.
	 * @this {DragFillTool}
	 * @return {Rect} a {@link Rect} in document coordinates.
	 */
    /*DragFillTool.prototype.computeBoxBounds = function () {
		var diagram = this.diagram;
		if (diagram === null)
			return new go.Rect(0, 0, 0, 0);
		var start = diagram.firstInput.documentPoint;
		var latest = diagram.lastInput.documentPoint;
		return new go.Rect(start, latest);
	};*/
    /**
	 * Create a node by adding a copy of the {@link #archetypeNodeData} object
	 * to the diagram's model, assign its {@link GraphObject#position} and {@link GraphObject#desiredSize}
	 * according to the given bounds, and select the new part.
	 * <p>
	 * The actual part that is added to the diagram may be a {@link Part}, a {@link Node},
	 * or even a {@link Group}, depending on the properties of the {@link #archetypeNodeData}
	 * and the type of the template that is copied to create the part.
	 * @this {DragFillTool}
	 * @param {Rect} bounds a Point in document coordinates.
	 * @return {Part} the newly created Part, or null if it failed.
	 */
    DragFillTool.prototype.fillPart = function(pt) {
        var diagram = this.diagram;
        if (diagram === null) return null;
        var ShipObject = require("./shipObject-debug");
        var slot = ShipObject.findAnjiObjectAt(this.type, pt);
        if (slot && slot.data.color !== this.color) slot.data.setProperty("color", this.color);
    };
    // Public properties
    /**
	 * Gets or sets the time in milliseconds for which the mouse must be stationary
	 * before this tool can be started.
	 * The default value is 175 milliseconds.
	 * A value of zero will allow this tool to run without any wait after the mouse down.
	 * Setting this property does not raise any events.
	 * @name DragFillTool#delay
	 * @function.
	 * @return {number}
	 */
    Object.defineProperty(DragFillTool.prototype, "delay", {
        get: function() {
            return this._delay;
        },
        set: function(val) {
            this._delay = val;
        }
    });
    Object.defineProperty(DragFillTool.prototype, "type", {
        get: function() {
            return this._type;
        },
        set: function(val) {
            this._type = val;
        }
    });
    Object.defineProperty(DragFillTool.prototype, "color", {
        get: function() {
            return this._color;
        },
        set: function(val) {
            this._color = val;
        }
    });
    module.exports = DragFillTool;
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
    Object.defineProperty(ShipObject.prototype, "location", {
        get: function() {
            return this.node.location;
        },
        set: function(pt) {
            this.node.location = pt;
        }
    });
    Object.defineProperty(ShipObject.prototype, "position", {
        get: function() {
            return this.node.position;
        },
        set: function(pt) {
            this.node.move(pt);
        }
    });
    //事件定义
    //当对象被拖动到目标位置后调用，默认无动作，可重写
    ShipObject.prototype.onmoved = function() {};
    //当对象被单击调用，默认无动作，可重写
    ShipObject.prototype.onclick = function(e) {};
    //当对象被双击调用，默认无动作，可重写
    ShipObject.prototype.ondoubleClick = function(e) {};
    //当对象被右击调用，默认无动作，可重写
    ShipObject.prototype.oncontextClick = function(e) {};
    ShipObject.prototype.className = "ShipObject";
    var navig = function(g) {
        return g.part;
    };
    ShipObject.findAnjiObjectAt = ShipObject.prototype.findAnjiObjectAt = function(type, pt) {
        var pred = function(p) {
            return p.data instanceof type;
        };
        return share.diagram.findObjectAt(pt, navig, pred);
    };
    ShipObject.findAnjiObjectsIn = ShipObject.prototype.findAnjiObjectsIn = function(type, rect, partialInclusion) {
        var pred = function(p) {
            return p.data instanceof type;
        };
        return share.diagram.findObjectsIn(rect, navig, pred, partialInclusion);
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
    //重载单击事件
    Slot.prototype.onclick = function(e) {
        var share = require("./shareData-debug");
        if (share.diagram.actionButton) {
            var color = null;
            switch (share.diagram.actionButton.action) {
              case "erase":
                color = "white";
                break;

              case "20":
                color = "red";
                break;

              case "40":
                color = "blue";
                break;

              default:
                color = null;
            }
            if (color) this.setProperty("color", color);
        }
    };
    Slot.prototype.className = "Slot";
    //定义Slot类结束
    module.exports = Slot;
});

define("anji/ship/shipTemplate-debug", [], function(require, exports, module) {
    "use strict";
    var go = require("gojs/go-debug");
    var $ = go.GraphObject.make;
    // for conciseness in defining templates
    var addClassTemplate = function(Map, Class, Template) {
        Template.click = function(e, obj) {
            obj.part.data.onclick(e);
        };
        Template.doubleClick = function(e, obj) {
            obj.part.data.ondoubleClick(e);
        };
        Template.contextClick = function(e, obj) {
            obj.part.data.oncontextClick(e);
        };
        Map.add(Class.prototype.className, Template);
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
            selectable: false
        }, $(go.Shape, "Rectangle", {
            fill: "white",
            // the default fill, if there is no data-binding
            //cursor : "default", // the Shape is the port, not the whole Node
            height: 50,
            width: 50,
            strokeWidth: 1
        }, new go.Binding("fill", "color").makeTwoWay())));
        //add Template for Button
        var Button = require("./button-debug");
        addClassTemplate(diagram.nodeTemplateMap, Button, $(go.Node, "Auto", {
            locationSpot: go.Spot.Center,
            isLayoutPositioned: false
        }, $("Button", $(go.Picture, {
            background: "gray",
            width: 50,
            height: 50
        }, new go.Binding("source", "url")), $(go.TextBlock, {
            font: "bold 14pt sans-serif",
            stroke: "#333",
            margin: 6,
            // make some extra space for the shape around the text
            editable: false,
            // allow in-place editing by user
            textAlign: "center"
        }, new go.Binding("text", "caption")))));
        //add Template for Button
        var CheckBox = require("./checkBox-debug");
        addClassTemplate(diagram.nodeTemplateMap, CheckBox, $(go.Node, "Auto", {
            locationSpot: go.Spot.Center,
            isLayoutPositioned: false
        }, $("CheckBox", "checked", $(go.TextBlock, {
            font: "bold 14pt sans-serif",
            stroke: "#333",
            margin: 6,
            // make some extra space for the shape around the text
            editable: false,
            // allow in-place editing by user
            textAlign: "center"
        }, new go.Binding("text", "caption")))));
        //add Template for Label
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
            //cursor : "pointer", // the Shape is the port, not the whole Node
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
            deletable: false,
            selectable: false
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
            deletable: false,
            selectable: false
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
            deletable: false,
            selectable: false
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

define("anji/ship/button-debug", [ "./shipObject-debug", "./shareData-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    //定义Slot类开始
    function Button(obj) {
        var b = new Date();
        ShipObject.call(this);
        this.setProperties(obj);
        var e = new Date();
        console.log("Call Slot():" + (e - b));
    }
    ShipObject.inherit(Button, ShipObject);
    Button.prototype.className = "Button";
    Button.prototype.onclick = function(e) {
        var share = require("./shareData-debug");
        var cursor = (this.url ? "url(" + this.url + ")," : "") + "default";
        if (share.diagram.defaultCursor === cursor) {
            share.diagram.startTransaction();
            share.diagram.actionButton = null;
            this.node.diagram.defaultCursor = "default";
            share.diagram.commitTransaction();
        } else {
            share.diagram.startTransaction();
            share.diagram.actionButton = this;
            this.node.diagram.defaultCursor = cursor;
            share.diagram.commitTransaction();
        }
    };
    //定义Slot类结束
    module.exports = Button;
});

define("anji/ship/checkBox-debug", [ "./shipObject-debug", "./shareData-debug", "gojs/go-debug" ], function(require, exports, module) {
    "use strict";
    var ShipObject = require("./shipObject-debug");
    //定义Slot类开始
    function CheckBox(caption) {
        this.caption = caption;
        ShipObject.call(this);
    }
    ShipObject.inherit(CheckBox, ShipObject);
    CheckBox.prototype.className = "CheckBox";
    Object.defineProperty(CheckBox.prototype, "checked", {
        get: function() {
            return this._checked;
        },
        set: function(c) {
            this._checked = c;
        }
    });
    //定义Slot类结束
    module.exports = CheckBox;
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
                            this.location = rows[r].slots[tierIndex].location;
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
                            this.location = rows[r].slots[tierIndex].location;
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
    //重载单击事件
    Container.prototype.onclick = function(e) {
        var share = require("./shareData-debug");
        if (share.diagram.actionButton && share.diagram.actionButton.action === "erase") {
            share.diagram.model.removeNodeData(this);
        }
    };
    Container.prototype.className = "Container";
    //定义Container类结束
    module.exports = Container;
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
            this.cabinBay.position = new go.Point((this.deckBay.rows.length - this.cabinBay.rows.length) / 2 * share.slotSize.width, share.slotSize.height * 2);
        } else this.cabinBay = null;
        this.node.locationSpot = new go.Spot(.5, 0, share.slotSize.width / 2, this.deckBay.tierCount * share.slotSize.height);
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
            row.position = new go.Point(i * share.slotSize.width, 0);
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
            slots[s].position = pt;
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
            slots[s].position = pt;
            pt.y += share.slotSize.height;
        }
    };
    CabinRow.prototype.className = "CabinRow";
    //定义DeckRow类结束
    module.exports = CabinRow;
});

define("anji/ship/mainDefine-debug", [ "./dragFillTool-debug", "./shipObject-debug", "./shareData-debug", "./slot-debug", "./shipTemplate-debug", "./button-debug", "./checkBox-debug", "./label-debug", "./container-debug", "./dragComputation-debug", "./group-debug", "./bottomTitleGroup-debug", "./topTitleGroup-debug", "./shipBay-debug", "./deckBay-debug", "./bayBase-debug", "./deckRow-debug", "./rowBase-debug", "./cabinBay-debug", "./cabinRow-debug", "gojs/go-debug" ], function(require) {
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
        //defaultCursor : "url(../img/eraser.png),wait",
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
        // enable undo & redo
        "undoManager.isEnabled": true
    });
    myDiagram.model = new go.GraphLinksModel([], []);
    // Add an instance of the custom tool defined in DragCreatingTool.js.
    // This needs to be inserted before the standard DragSelectingTool,
    // which is normally the third Tool in the ToolManager.mouseMoveTools list.
    // Note that if you do not set the DragCreatingTool.delay, the default value will
    // require a wait after the mouse down event.  Not waiting will allow the DragSelectingTool
    // and the PanningTool to be able to run instead of the DragCreatingTool, depending on the delay.
    var DragFillTool = require("./dragFillTool-debug");
    var Slot = require("./slot-debug");
    myDiagram.toolManager.mouseMoveTools.insertAt(2, $(DragFillTool, {
        isEnabled: true,
        // disabled by the checkbox
        delay: 0,
        // always canStart(), so PanningTool never gets the chance to run
        type: Slot,
        // initial properties shared by all nodes
        fillPart: function(pt) {
            // override DragCreatingTool.insertPart
            // use a different color each time
            var share = require("./shareData-debug");
            if (share.diagram.actionButton) {
                switch (share.diagram.actionButton.action) {
                  case "erase":
                    this.color = "white";
                    break;

                  case "20":
                    this.color = "red";
                    break;

                  case "40":
                    this.color = "blue";
                    break;

                  default:
                    this.color = null;
                }
                if (!this.color) return;
                // call the base method to do normal behavior and return its result
                DragFillTool.prototype.fillPart.call(this, pt);
                if (share.objMap.CheckBox[0].checked) //镜像填充
                {
                    var ShipObject = require("./shipObject-debug");
                    var slotNode = ShipObject.findAnjiObjectAt(Slot, pt);
                    var rowNode = slotNode.containingGroup;
                    var rowNo = rowNode.data.no;
                    var bayNode = rowNode.containingGroup;
                    var rowCount = bayNode.data.rows.length - 1;
                    var offset = Math.ceil(rowNo / 2) * 2 - 1;
                    if (rowCount % 2 == 1) ++offset;
                    if (rowNo % 2 == 1) offset *= -1;
                    pt.x += offset * share.slotSize.width;
                    DragFillTool.prototype.fillPart.call(this, pt);
                }
            }
        }
    }));
    //初始化模版
    var template = require("./shipTemplate-debug");
    template.initTemplate(myDiagram);
    var ShipBay = require("./shipBay-debug");
    function formatNo(n) {
        n = n.toString();
        !n[1] && !(n = "0" + n);
        return n;
    }
    function genBayInfo(r, t, isDeck) {
        var obj = {};
        obj[""] = [];
        var b = isDeck ? 82 : t * 2;
        //gen tier no.
        for (var i = 0; i < t; ++i) obj[""].push(formatNo(b + (isDeck ? 2 : -2) * i));
        //gen rows
        var f = false;
        if (r % 2 == 1) {
            r = r - 1;
            f = true;
        }
        for (var i = 0; i < r; i += 2) obj[formatNo(r - i)] = t;
        if (f) obj["00"] = t;
        for (var i = 0; i < r; i += 2) obj[formatNo(i + 1)] = t;
        return obj;
    }
    var bay = new ShipBay("", genBayInfo(8, 6, true), genBayInfo(7, 6, false));
    function InitialLayoutCompleted() {
        var Button = require("./button-debug");
        new Button({
            url: "../img/none.png",
            action: "none"
        }).location = new go.Point(-300, -200);
        new Button({
            url: "../img/eraser.png",
            action: "erase"
        }).location = new go.Point(-300, -145);
        new Button({
            url: "../img/20.png",
            action: "20",
            caption: "20"
        }).location = new go.Point(-300, -90);
        new Button({
            url: "../img/40.png",
            action: "40",
            caption: "40"
        }).location = new go.Point(-300, -35);
        var CheckBox = require("./checkBox-debug");
        new CheckBox("镜像").location = new go.Point(-300, 50);
    }
});