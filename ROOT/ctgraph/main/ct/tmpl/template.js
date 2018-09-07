"use strict";

define(function (require, exports, module) {
		'use strict';

		var addClassTemplate = function addClassTemplate(Map, Class, Template) {
				Template.click = function (e, obj) {
						if (obj.part.data.onclick instanceof Function) obj.part.data.onclick(e);
				};
				Template.doubleClick = function (e, obj) {
						if (obj.part.data.ondoubleClick instanceof Function) obj.part.data.ondoubleClick(e);
				};
				Template.contextClick = function (e, obj) {
						if (obj.part.data.oncontextClick instanceof Function) obj.part.data.oncontextClick(e);
				};
				Map.add(Class.prototype.className, Template);
		};

		var initTemplate = function initTemplate(diagram) {
				var share = require("../obj/shareData");
				share.diagram = diagram;

				var Slot = require("../obj/slot");
				var tmSlot = require("./tmSlot");
				addClassTemplate(diagram.nodeTemplateMap, Slot, tmSlot);
				// addClassTemplate(myPalette.nodeTemplateMap, Slot, tmSlot);

				var Label = require("../obj/label");
				var tmLabel = require("./tmLabel");
				addClassTemplate(diagram.nodeTemplateMap, Label, tmLabel);

				var Group = require("../obj/group");
				var tmGroup = require("./tmGroup");
				addClassTemplate(diagram.groupTemplateMap, Group, tmGroup);

				var Truck = require("../obj/truck");
				var tmTruck = require("./tmTruck");
				addClassTemplate(diagram.nodeTemplateMap, Truck, tmTruck);

				var TruckGroup = require("../obj/truckGroup");
				var tmTruckGroup = require("./tmTruckGroup");
				addClassTemplate(diagram.nodeTemplateMap, TruckGroup, tmTruckGroup);

				var FrameCrane = require("../obj/frameCrane");
				var tmFrame = require("./tmFrame");
				addClassTemplate(diagram.nodeTemplateMap, FrameCrane, tmFrame);
				// addClassTemplate(myPalette.nodeTemplateMap, FrameCrane, tmFrame);


				var tmPlanc = require("./tmPlanC");
				var planC = require("../obj/planC");
				addClassTemplate(diagram.nodeTemplateMap, planC, tmPlanc);

				var tmBoundary = require("./tmBoundary");
				var boundary = require("../obj/boundary");
				addClassTemplate(diagram.nodeTemplateMap, boundary, tmBoundary);

				var Cntr = require("../obj/container");
				var tmCntr = require("./tmCntr");
				addClassTemplate(diagram.nodeTemplateMap, Cntr, tmCntr);

				var tmRoadPoint = require("./tmRoadPoint");
				var roadPoint = require("../obj/roadPoint");
				addClassTemplate(diagram.nodeTemplateMap, roadPoint, tmRoadPoint);

				var tmParkingLot = require("./tmParkingLot");
				var parkingLot = require("../obj/parkingLot");
				addClassTemplate(diagram.nodeTemplateMap, parkingLot, tmParkingLot);

				var tmQuayCrane = require("./tmQuayCrane");
				var quayCrane = require("../obj/quayCrane");
				addClassTemplate(diagram.nodeTemplateMap, quayCrane, tmQuayCrane);
				var bollard = require("../obj/bollard");

				var tmBollard = require("./tmBollard");
				addClassTemplate(diagram.nodeTemplateMap, bollard, tmBollard);
				var tmBerth = require("./tmBerth");

				var berth = require("../obj/berth");
				addClassTemplate(diagram.nodeTemplateMap, berth, tmBerth);

				var tmRoad = require("./tmRoad");
				var road = require("../obj/road");
				addClassTemplate(diagram.linkTemplateMap, road, tmRoad);

				var tmSideShip = require("./tmSideShip");
				var ship = require("../obj/ship");
				addClassTemplate(diagram.nodeTemplateMap, ship, tmSideShip);

				var tmSpec = require("./tmSpecYard");
				var spec = require("../obj/specYard");
				addClassTemplate(diagram.nodeTemplateMap, spec, tmSpec);
		};

		module.exports = {
				initTemplate: initTemplate
		};
});
