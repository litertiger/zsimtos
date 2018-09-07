define(function (require, exports, module) {
    'use strict';
    var go = require("gojs");
    var $ = go.GraphObject.make; // for conciseness in defining templates

    var addClassTemplate = function (Map, Class, Template) {
        Template.click = function (e, obj) {
            if(obj.part.data.onclick)
                obj.part.data.onclick(e);
        };
        Template.doubleClick = function (e, obj) {
            if(obj.part.data.ondoubleClick)
                obj.part.data.ondoubleClick(e);
        };
        Template.contextClick = function (e, obj) {
            if(obj.part.data.oncontextClick)
                obj.part.data.oncontextClick(e);
        };
        Template.bind(new go.Binding("position", "_position"));
        Map.add(Class.prototype.className, Template);
    }

    var initTemplate = function (diagram) {
        var share = require("./shareData");
        share.diagram = diagram;
        diagram.addDiagramListener("SelectionMoved", function (e) {
            e.subject.each(function (n) {
                n.data.onmoved();
            });
        });
        diagram.addDiagramListener("PartResized", function (e) {
            e.subject.part.data.onsized(e.parameter);
        });

        //add Template for Slot
        var Slot = require("./slot");
        addClassTemplate(diagram.nodeTemplateMap, Slot,
            $(go.Node, "Auto", {
                    locationSpot: go.Spot.Center,
                    isLayoutPositioned: false,
                    movable: false,
                    deletable: false
                },
                new go.Binding("zOrder", "cntrSizes", function (sizes) {
                    return sizes && sizes.length > 0 ? 2 : 2;
                }),
                new go.Binding("selectable", "", function () {
                    return share.slotSelectable;
                }),
                $(go.Shape, "Rectangle", {
                        desiredSize: share.slotSize,
                        strokeWidth: share.slotStrokeWidth
                    },
                    new go.Binding("strokeDashArray", "cntrSizes", function (sizes) {
                        return sizes && sizes.length > 0 ? null : share.slotDashArray;
                    }),
                    new go.Binding("fill", "cntrSizes", function (sizes) {
                        var f20 = false, f40 = false;
                        for (var s in sizes) {
                            if (sizes[s] === "20")
                                f20 = true;
                            if (sizes[s] >= "40")
                                f40 = true;
                        }
                        if (f20 && f40)
                            return "brown";
                        else if (f20)
                            return "orange";
                        else if (f40)
                            return "green";
                        else
                            return "white";
                    })
                ),
                $(go.TextBlock, {
                        font: "bold 8pt sans-serif",
                        width: share.slotSize.width,
                        margin: 6, // make some extra space for the shape around the text
                        editable: false, // allow in-place editing by user
                        textAlign: "right"
                    },
                    new go.Binding("text", "cntrSizes", function (sizes) {
                        var size = "";
                        for (var s in sizes) {
                            if (sizes[s] > size)
                                size = sizes[s];
                        }
                        return size > 40 ? size[1] : "";
                    })
                )
            )
        );
        //add Template for Label
        var Label = require("./label");
        addClassTemplate(diagram.nodeTemplateMap, Label,
            $(go.Node, "Auto", {
                    locationSpot: go.Spot.Center,
                    isLayoutPositioned: false,
                    deletable: false,
                    movable: false,
                    selectable: false,
                    zOrder: 0
                },
                $(go.Shape, "Rectangle", {
                    fill: "white", // the default fill, if there is no data-binding
                    desiredSize: share.slotSize,
                    strokeWidth: 0

                }),
                //new go.Binding("location", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.TextBlock, {
                        font: "bold 12pt sans-serif",
                        stroke: '#333',
                        margin: 6, // make some extra space for the shape around the text
                        editable: false, // allow in-place editing by user
                        textAlign: "center"
                    },
                    new go.Binding("text", "no")
                ) // the label shows the node data's text
            )
        );

        //add Template for Container
        var Container = require("./container");
        addClassTemplate(diagram.nodeTemplateMap, Container,
            $(go.Node, "Auto", {
                    locationSpot: go.Spot.Center,
                    deletable: false,
                    isLayoutPositioned: false,
                    zOrder: 3
                },
                $(go.Shape, "Rectangle", {
                        fill: "white", // the default fill, if there is no data-binding
                        desiredSize: share.slotSize,
                        strokeWidth: 0

                    },
                    new go.Binding("fill", "color")),
                //new go.Binding("location", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Panel, "Vertical",
                    $(go.TextBlock, {
                            font: "bold 10pt sans-serif",
                            stroke: '#333',
                            margin: 0, // make some extra space for the shape around the text
                            editable: false, // allow in-place editing by user
                            textAlign: "left",
                            alignment: go.Spot.TopLeft,
                        },
                        new go.Binding("text", "no", function (t) {
                            return t.substr(0, 4);
                        })), // 箱号前4位字母
                    $(go.TextBlock, {
                            font: "8pt sans-serif",
                            stroke: '#333',
                            margin: 0, // make some extra space for the shape around the text
                            isMultiline: true, // don't allow newlines in text
                            editable: false, // allow in-place editing by user
                            textAlign: "right",
                            alignment: go.Spot.TopRight,
                        },
                        new go.Binding("text", "no", function (t) {
                            return t.substr(4);
                        })
                    )
                ) // 箱号后7位数字
            )
        );

        //add Template for Group
        var Group = require("./group");
        addClassTemplate(diagram.groupTemplateMap, Group,
            $(go.Group, "Vertical", {
                    locationSpot: go.Spot.Center,
                    movable: false,
                    deletable: false,
                    selectable: false
                },
                $(go.Panel, "Auto",
                    $(go.Shape, "Rectangle", // surrounds the Placeholder
                        {
                            strokeWidth: 0,
                            fill: "rgba(128,128,128,0)"
                        }),
                    $(go.Placeholder)
                )
            )
        );

        //add Template for Group
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
        var Ship = require("./ship");
        addClassTemplate(diagram.groupTemplateMap, Ship,
            $(go.Group, "Horizontal", {
                    resizable: true,
                    resizeObjectName: "Body",
                    // hide a port when it is connected
                    linkConnected: function (node, link, port) {
                        port.visible = false;
                    },
                    linkDisconnected: function (node, link, port) {
                        port.visible = true;
                    },
                    //selectionAdorned : false // use a Binding on the Shape.stroke to show selection
                },
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                //tail
                $(go.Panel,
                    $(go.Shape, {
                            figure: "ShipTail",
                            fill: "green",
                        },
                        new go.Binding("parameter1", "tailWidth", Number.parseFloat),
                        // remember the size of this node
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        new go.Binding("width", "tailLength", Number.parseFloat),
                        new go.Binding("height", "shipWidth", Number.parseFloat))),
                //body
                $(go.Panel,

                    $(go.Shape, {
                            figure: "Rectangle",
                            fill: "green",
                            name: "Body"
                        },

                        // remember the size of this node
                        new go.Binding("width", "bodyLength", Number.parseFloat).makeTwoWay(),
                        new go.Binding("height", "shipWidth", Number.parseFloat).makeTwoWay())),

                //head
                $(go.Panel,
                    $(go.Shape, {
                            figure: "ShipHead",
                            fill: "green"
                        },
                        // remember the size of this node
                        new go.Binding("width", "headLength", Number.parseFloat),
                        new go.Binding("height", "shipWidth", Number.parseFloat)
                    )
                )
            )
        );
        var Hatch = require("./hatch");
        addClassTemplate(diagram.nodeTemplateMap, Hatch,
            $(go.Node, "Auto", {
                    locationSpot: go.Spot.Left,
                    isLayoutPositioned: false,
                    movable: false,
                   // deletable: false,
                    resizable: true,
                    resizeObjectName: "shap",
                    zOrder:4
                },
                $(go.Shape, "RoundedRectangle", {
                        strokeWidth: share.slotStrokeWidth,
                        height:16,
                        name:"shap",
                        minSize:new go.Size(share.slotSize.width,16),
                        maxSize:new go.Size(NaN,16),
                        fill:"black"
                    },
                    new go.Binding("width", "", function (h) {
                        var p = h.toRow.position.copy();
                        return p.subtract(h.fromRow.position).x + share.slotSize.width;
                    })
                ),
                new go.Binding("location", "", function (h) {
                    var p = h.fromRow.position.copy();
                    p.y = h.fromRow.label.position.y +   (h.fromRow.label.position.y > 0 ? share.slotSize.height : -share.slotSize.height);
                    return p;
                })
            )
        );
    }


    module.exports = {
        initTemplate: initTemplate
    }
});
