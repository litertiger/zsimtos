"use strict";

define(function (require, exports, module) {
  "use strict";

  /**
  * @constructor
  * @extends DragSelectingTool
  * @class
  * The RealtimeDragSelectingTool selects and deselects Parts within the {@link DragSelectingTool#box}
  * during a drag, not just at the end of the drag.
  */

  var go = require("gojs");
  function cntrDragSelectingTool() {
    go.DragSelectingTool.call(this);
    this._originalSelection = null;
    this._temporarySelection = null;
    this.direct = [];
    this.movePoint = null;
    this.downPoint = null;
  }

  go.Diagram.inherit(cntrDragSelectingTool, go.DragSelectingTool);

  cntrDragSelectingTool.prototype.doActivate = function () {
    go.DragSelectingTool.prototype.doActivate.call(this);
    // keep a copy of the original Set of selected Parts
    this._originalSelection = this.diagram.selection.copy();
    // these Part.isSelected may have been temporarily modified
    this._temporarySelection = new go.Set(go.Part);
  };

  /**
   * Release any references to selected Parts.
   * @this {RealtimeDragSelectingTool}
   */
  cntrDragSelectingTool.prototype.doDeactivate = function () {
    this._originalSelection = null;
    this._temporarySelection = null;
    go.DragSelectingTool.prototype.doDeactivate.call(this);
  };

  /**
   * Restore the selection which may have been modified during a drag.
   * @this {RealtimeDragSelectingTool}
   */
  cntrDragSelectingTool.prototype.doCancel = function () {
    var orig = this._originalSelection;
    if (orig !== null) {
      orig.each(function (p) {
        p.isSelected = true;
      });
      this._temporarySelection.each(function (p) {
        if (!orig.contains(p)) p.isSelected = false;
      });
    }
    go.DragSelectingTool.prototype.doCancel.call(this);
  };
  /**
  * @this {RealtimeDragSelectingTool}
  */
  cntrDragSelectingTool.prototype.doMouseUp = function () {
    if (this.isActive) {
      go.DragSelectingTool.prototype.doMouseUp.call(this);
      this.selectInRect(this.computeBoxBounds());
    }
  };

  cntrDragSelectingTool.prototype.doMouseMove = function () {
    if (this.isActive) {
      go.DragSelectingTool.prototype.doMouseMove.call(this);
      this.downPoint = { x: myDiagram.firstInput.event.x, y: myDiagram.firstInput.event.y };

      if (this.downPoint) {
        this.movePoint = { x: myDiagram.lastInput.event.x, y: myDiagram.lastInput.event.y };
        var x = Math.min(this.downPoint.x, this.movePoint.x);
        var y = Math.min(this.downPoint.y, this.movePoint.y);
        var cx = Math.abs(this.movePoint.x - this.downPoint.x);
        var cy = Math.abs(this.movePoint.y - this.downPoint.y);
        if (this.direct.length === 0) {
          if (cx < 10 && cy > 10) this.direct.push(this.movePoint.y > this.downPoint.y ? "U" : "D");else if (cy < 10 && cx > 10) this.direct.push(this.movePoint.x > this.downPoint.x ? "R" : "L");
        } else {
          var canAdd = this.direct.length === 1;
          switch (this.direct[this.direct.length - 1]) {
            case 'U':
              if (this.movePoint.y > this.downPoint.y) this.direct[this.direct.length - 1] = "D";
            case 'D':
              if (this.movePoint.y < this.downPoint.y) this.direct[this.direct.length - 1] = "U";
              if (cy < 10) this.direct.pop();else if (canAdd && cx > 10) this.direct.push(this.movePoint.x > this.downPoint.x ? "R" : "L");
              break;
            case 'L':
              if (this.movePoint.x > this.downPoint.x) this.direct[this.direct.length - 1] = "R";
            case 'R':
              if (this.movePoint.x < this.downPoint.x) this.direct[this.direct.length - 1] = "L";
              if (cx < 10) this.direct.pop();else if (canAdd && cy > 10) this.direct.push(this.movePoint.y > this.downPoint.y ? "U" : "D");
              break;
          }
        }
      }
      console.log(this.direct.toString());
    }
  };

  cntrDragSelectingTool.prototype.selectInRect = function (r) {
    var diagram = myDiagram;
    var orig = this._originalSelection;
    var temp = this._temporarySelection;
    if (diagram === null || orig === null) return;
    var e = diagram.lastInput;
    diagram.raiseDiagramEvent("ChangingSelection");
    var found = diagram.findObjectsIn(r, null, function (p) {
      return p instanceof go.Part && p.canSelect();
    }, this.isPartialInclusion, new go.Set(go.Part));
    if (e.control || e.meta) {
      // toggle or deselect
      if (e.shift) {
        // deselect only
        temp.each(function (p) {
          if (!found.contains(p)) p.isSelected = orig.contains(p);
        });
        found.each(function (p) {
          p.isSelected = false;temp.add(p);
        });
      } else {
        // toggle selectedness of parts based on _originalSelection
        return;
      }
    } else if (e.shift) {
      // extend selection only
      temp.each(function (p) {
        if (!found.contains(p)) p.isSelected = orig.contains(p);
      });
      found.each(function (p) {
        p.isSelected = true;temp.add(p);
      });
    } else {
      // select found parts, and unselect all other previously selected parts
      temp.each(function (p) {
        if (!found.contains(p)) p.isSelected = false;
      });
      orig.each(function (p) {
        if (!found.contains(p)) p.isSelected = false;
      });
      found.each(function (p) {
        p.isSelected = true;temp.add(p);
      });
    }
    diagram.raiseDiagramEvent("ChangedSelection");
    // temp.each(function(p) { p.isSelected = false; });
    if (parent.transId == 1) putTransCntr(temp);else setTransCntr(temp);
  };
  function setTransCntr(temp) {
    var cntr = require("../ct/obj/bay/container");
    var share = parent.getshare;
    share.transcntr = [];
    temp.each(function (p) {
      if (p.data instanceof cntr) share.transcntr.push(p.data);
    });
    console.log(share.transcntr);
  }

  function putTransCntr(temp) {
    var slot = require("../ct/obj/bay/slot");
    var share = parent.getshare;
    var cntr = require("../ct/obj/bay/container");
    share.putSlot = [];
    temp.each(function (p) {
      if (p.data instanceof slot) share.putSlot.push(p.data);
    });
    for (var i in share.transcntr) {
      new cntr({ loc: share.putSlot[i].loc });
    }
    parent.transId = 0;
  }
  module.exports = cntrDragSelectingTool;
});