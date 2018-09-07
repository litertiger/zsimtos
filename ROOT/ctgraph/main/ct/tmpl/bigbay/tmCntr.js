"use strict";

/**
 * Created by kingser on 2016/10/10.
 */
define(function (require, exports, module) {
    'use strict';

    var go = require("gojs");
    var share = require("main/ct/obj/shareData");
    var $ = go.GraphObject.make; // for conciseness in defining templates
    //�ѳ���λ
    var Slot =
    // $(go.Node, "Spot",
    //     {
    //         locationSpot: go.Spot.Center,
    //         zOrder:2
    //     },
    //     new go.Binding("zOrder"),new go.Binding("angle").makeTwoWay(),
    //     //new go.Binding("name", "xxx"),
    //     // remember the location of this Node
    //     new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    //     // can be resided according to the user's desires
    //     $(go.Shape,
    //         {
    //             figure: "Rectangle",
    //             fill: "white",
    //             width:share.BslotSize.width*3,
    //             height:share.BslotSize.height*3
    //         },
    //         new  go.Binding("fill", "color")
    //     ),
    //     $(go.TextBlock,
    //         { margin: 1 , stroke: "white"},  // some room around the text
    //         // TextBlock.text is bound to Node.data.key
    //         new go.Binding("text"))
    // );
    $(go.Node, "Position", { background: "red", locationSpot: go.Spot.Center, width: share.BslotSize.width * 3,
        height: share.BslotSize.height * 3 }, new go.Binding("zOrder"), new go.Binding("angle").makeTwoWay(), new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), $(go.TextBlock, "aa", { position: new go.Point(0, 5), stroke: "white" }, new go.Binding("text")), $(go.TextBlock, "bb", { position: new go.Point(0, 20), stroke: "white" }), $(go.TextBlock, "cc", { position: new go.Point(55, 28), stroke: "white" }), $(go.TextBlock, "dd", { position: new go.Point(33, 70), stroke: "white" }), $(go.TextBlock, "ee", { position: new go.Point(10, 80), stroke: "white" }), $(go.Shape, { desiredSize: new go.Size(10, 10), figure: "Cube1", fill: "yellow", position: new go.Point(20, 20) }), $(go.Shape, { desiredSize: new go.Size(10, 10), figure: "Decision", fill: "blue", position: new go.Point(50, 50) }), $(go.Picture, { desiredSize: new go.Size(40, 30), source: "assets/img/car.png", position: new go.Point(0, 40) }));
    module.exports = Slot;
});