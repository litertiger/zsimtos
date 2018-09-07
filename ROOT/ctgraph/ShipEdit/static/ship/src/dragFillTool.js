define(function (require, exports, module) {
	"use strict";
	/*
	 *  Copyright (C) 1998-2016 by Northwoods Software Corporation. All Rights Reserved.
	 */

	var go = require("gojs");
	// A custom Tool for creating a new Node with custom size by dragging its outline in the background.
	function DragFillTool() {
		go.Tool.call(this);
		this.name = "DragFill";
		/** @type {number} */
		this._delay = 50;
	}

	go.Diagram.inherit(DragFillTool, go.DraggingTool);

	/**
	 * This tool can run when there has been a mouse-drag, far enough away not to be a click,
	 * and there has been delay of at least {@link #delay} milliseconds
	 * after the mouse-down before a mouse-move.
	 * <p/>
	 * This method may be overridden.
	 * @this {DragFillTool}
	 * @return {boolean}
	 */
	DragFillTool.prototype.canStart = function () {
		if (!this.isEnabled)
			return false;

		var diagram = this.diagram;
		if (diagram === null)
			return false;
		var e = diagram.lastInput;
		// require left button & that it has moved far enough away from the mouse down point, so it isn't a click
		if (!e.left)
			return false;
		// don't include the following checks when this tool is running modally
		if (diagram.currentTool !== this) {
			if (!this.isBeyondDragSize())
				return false;
		}
		return true;
	};

	/**
	 * Capture the mouse.
	 * @this {DragFillTool}
	 */
	DragFillTool.prototype.doActivate = function () {
		var diagram = this.diagram;
		if (diagram === null)
			return;
		this.isActive = true;
		diagram.isMouseCaptured = true;
		this.startTransaction(this.name);
		//this.doMouseMove();
	};

	/**
	 * Release the mouse.
	 * @this {DragFillTool}
	 */
	DragFillTool.prototype.doDeactivate = function () {
		var diagram = this.diagram;
		if (diagram === null)
			return;
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
	DragFillTool.prototype.doMouseMove = function () {
		var diagram = this.diagram;
		if (diagram === null)
			return;
		this.fillPart(diagram.lastInput.documentPoint);
	};
	/**
	 * Call {@link #insertPart} with the value of a call to {@link #computeBoxBounds}.
	 * @this {DragFillTool}
	 */
	DragFillTool.prototype.doMouseUp = function () {
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
	DragFillTool.prototype.fillPart = function (pt) {
		var diagram = this.diagram;
		if (diagram === null)
			return null;
		var AnjiObject = require("./anjiObject");
		var slot = AnjiObject.findAnjiObjectAt(this.type, pt);
		if(slot && slot.color !== this.color)
			slot.setProperty("color", this.color);
		return slot;
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
		get : function () {
			return this._delay;
		},
		set : function (val) {
			this._delay = val;
		}
	});

	Object.defineProperty(DragFillTool.prototype, "type", {
		get : function () {
			return this._type;
		},
		set : function (val) {
			this._type = val;
		}
	});

	Object.defineProperty(DragFillTool.prototype, "color", {
		get : function () {
			return this._color;
		},
		set : function (val) {
			this._color = val;
		}
	});

	module.exports = DragFillTool;
});
