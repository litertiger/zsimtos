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

        //add Template for Group
        function makePt(x,y)
        {
            return parseInt(x) + "," + parseInt(y);
        }
        function line(x,y)
        {
            this.push('L'+makePt(x,y));
        }
        function move(x,y)
        {
            this.push('M'+makePt(x,y));
        }
        go.Shape.defineFigureGenerator("ShipHead", function (shape, w, h) {
            var pt = [];
            var x =0;
            var y = h;
            var lineTo = line.bind(pt);
            var moveTo = move.bind(pt);
            moveTo(x,y);
            x += w /2;
            lineTo(x,y);
            for(var i=0;i<360;i+=20){
                var step = i*h/720;
                lineTo(x+ w/5*Math.sin(i*Math.PI /180),y-step);
            }
            x=  w
            y = -5
           lineTo(x,y);
            x-= w*0.4
            lineTo(x,y);
            y+= 5;
            lineTo(x,y);
            x-= w*0.6
            lineTo(x,y);
            x= w - w*0.15
            y= - 5
            moveTo(x,y);
            y-= h/8
            lineTo(x,y);
            x-= w*0.05
            lineTo(x,y);
            y-= h/8
            lineTo(x,y);
            x-= w*0.05
            lineTo(x,y);
            y+= h/8
            lineTo(x,y);
            x-= w*0.05
            lineTo(x,y);;
            y+= h/8
            lineTo(x,y);
            x+=w*0.075
            y-= h/4
            moveTo(x,y);
            y-= h/8
            lineTo(x,y);
            x += w*0.05
            y += h/16
            moveTo(x,y);
            x -= w*0.1
            lineTo(x,y);
            return go.Geometry.parse(pt.join(" "));
        });
        go.Shape.defineFigureGenerator("ShipTail", function (shape, w, h) {
            // this figure takes one parameter, the size of the corner
            var pt = [];
            var lineTo = line.bind(pt);
            var moveTo = move.bind(pt);
            moveTo(0, 0)
            lineTo(w,0)
            moveTo(0, 0)
            var x= 0;
            var y = h/2
            lineTo(x,y)
            x+=h/2
            lineTo(x,y)
            for(var i=0;i<360;i+=20){
                var step = i*h/720;
                lineTo(x+ w/5*Math.sin(i*Math.PI /180),y+step)
            }
            lineTo(w,h)
            return go.Geometry.parse(pt.join(" "));
        });

        go.Shape.defineFigureGenerator("ShipBody", function (shape, w, h) {
            // this figure takes one parameter, the size of the corner
            var pt = [];
            var lineTo = line.bind(pt);
            var moveTo = move.bind(pt);
            moveTo(0,0)
            lineTo(w,0)
            moveTo(0,h)
            lineTo(w,h)
            return go.Geometry.parse(pt.join(" "));
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
                        },
                        // remember the size of this node
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        new go.Binding("width", "tailLength", Number.parseFloat),
                        new go.Binding("height", "shipWidth", Number.parseFloat))),
                //body
                $(go.Panel,

                    $(go.Shape, {
                            figure: "ShipBody",
                            name: "Body"
                        },

                        // remember the size of this node
                        new go.Binding("width", "bodyLength", Number.parseFloat).makeTwoWay(),
                        new go.Binding("height", "shipWidth", Number.parseFloat).makeTwoWay())),

                //head
                $(go.Panel,
                    $(go.Shape, {
                            figure: "ShipHead",
                        },
                        // remember the size of this node
                        new go.Binding("width", "headLength", Number.parseFloat),
                        new go.Binding("height", "shipWidth", Number.parseFloat)
                    )
                )
            )
        );
    }

    module.exports = {
        initTemplate: initTemplate
    }
});
