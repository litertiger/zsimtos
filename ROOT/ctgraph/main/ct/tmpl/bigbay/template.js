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
		var share = require("main/ct/obj/shareData");
		share.diagram = diagram;

		var Label = require("main/ct/obj/label");
		var tmLabel = require("main/ct/tmpl/tmLabel");
		addClassTemplate(diagram.nodeTemplateMap, Label, tmLabel);

		var Group = require("main/ct/obj/group");
		var tmGroup = require("main/ct/tmpl/tmHoGroup");
		addClassTemplate(diagram.groupTemplateMap, Group, tmGroup);

		var Slot = require("main/ct/obj/bigbay/slot");
		var tmSlot = require("main/ct/tmpl/bigbay/tmSlot");
		addClassTemplate(diagram.nodeTemplateMap, Slot, tmSlot);

		var Cntr = require("main/ct/obj/bigbay/container");
		var tmCntr = require("main/ct/tmpl/bigbay/tmCntr");
		addClassTemplate(diagram.nodeTemplateMap, Cntr, tmCntr);
	};

	module.exports = {
		initTemplate: initTemplate
	};
});