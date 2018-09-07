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
  var share = require("../ct/obj/shareData");

  function multiDragSelectingTool() {
    go.DragSelectingTool.call(this);
    this._originalSelection = null;
    this._temporarySelection = null;
    this.direct = [];
    this.movePoint = null;
    this.downPoint = null;
  }

  go.Diagram.inherit(multiDragSelectingTool, go.DragSelectingTool);

  multiDragSelectingTool.prototype.doActivate = function () {
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
  multiDragSelectingTool.prototype.doDeactivate = function () {
    this._originalSelection = null;
    this._temporarySelection = null;
    go.DragSelectingTool.prototype.doDeactivate.call(this);
  };

  /**
   * Restore the selection which may have been modified during a drag.
   * @this {RealtimeDragSelectingTool}
   */
  multiDragSelectingTool.prototype.doCancel = function () {
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
  multiDragSelectingTool.prototype.doMouseUp = function () {
    if (this.isActive) {
      go.DragSelectingTool.prototype.doMouseUp.call(this);
    }
  };

  multiDragSelectingTool.prototype.doMouseMove = function () {
    if (this.isActive) {
      go.DragSelectingTool.prototype.doMouseMove.call(this);
      this.downPoint = {
        x: myDiagram.firstInput.event.x,
        y: myDiagram.firstInput.event.y
      };

      if (this.downPoint) {
        this.movePoint = {
          x: myDiagram.lastInput.event.x,
          y: myDiagram.lastInput.event.y
        };
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
      if (this.direct.length == 2) share.direct = this.direct;
    }
  };

  multiDragSelectingTool.prototype.selectInRect = function (r) {
    if (r.width < share.slotSize.width && r.height < share.slotSize.height) {
      myDiagram.toolManager.clickSelectingTool.doStart();
      return;
    }
    var Slot = require("../ct/obj/slot");
    var slots = Slot.prototype.findyardObjectsIn(Slot, r, true);
    if (slots.size === 0) return;
    if (share.toggleBoundary) {
      var Boundary = require("../ct/obj/boundary");
      var begSlot = null;
      var endSlot = null;
      slots.each(function (s) {
        if (!begSlot) begSlot = s;else {
          if (begSlot.position.x > s.position.x || begSlot.position.y > s.position.y) begSlot = s;
        }
        if (!endSlot) endSlot = s;else {
          if (endSlot.position.x < s.position.x || endSlot.position.y < s.position.y) endSlot = s;
        }
      });
      var info = {};
      info.BEG_BAY_NO = begSlot.containingGroup.data.text;
      info.BEG_ROW_NO = begSlot.data.h;
      info.END_BAY_NO = endSlot.containingGroup.data.text;
      info.END_ROW_NO = endSlot.data.h;
      info.AREA_NO = begSlot.containingGroup.containingGroup.data.title;
      yardObjDataSave(info, "boundary").then(function () {
        return new Boundary(info);
      });
    } else openBay(slots);
  };

  function openBay(temp) {
    var Slot = require("../ct/obj/slot");
    var bays = [];
    temp.each(function (p) {
      if (p.data instanceof Slot) {
        var a = p.data.id.slice(0, -3);
        if (bays.indexOf(a) == -1) bays.push(a);
      }
    });
    if (share.toggleShowGrid) {
      top.Wb.open({
        url: "m?xwl=controlManage/portcntr/portCntr",
        title: "选箱列表",
        inframe: false,
        success: function success(app) {
          app.grid1.store.autoLoad = false;
          app.grid1.store.autoLoadTask && app.grid1.store.autoLoadTask.cancel();
          app.moreSql(' and (' + bays.map(function (bay) {
            return "yard_position like '" + bay.replace('|', '') + "%'";
          }).join(' or ') + ')');
          console.log(app);
        }
      });
    } else bays.forEach(function (bay) {
      var tab = top.Wb.open({
        url: 'm?xwl=yardManage/yard/bigBay',
        params: {
          bay: bay
        },
        container: top.app.tab,
        title: bay,
        inframe: false
      }).tab;
      tab.mon(tab.el, "mouseover", function (e) {
        if (e.button === 0) {
          var actTab = top.app.tab.getActiveTab();
          var me = this;
          if (actTab !== me && actTab.appScope.cyMap.dragCntrs) {
            top.app.tab.setActiveTab(me);
            me.appScope.cyMap.canvas.focus();
            me.appScope.cyMap.dragCntrs = actTab.appScope.cyMap.dragCntrs;
            actTab.appScope.cyMap.dragCntrs.forEach(function (c) {
              var stowLoc = c.getStowLoc();
              c.setStowLoc(me.title.replace('|', '') + "000");
            });
            delete actTab.appScope.cyMap.dragCntrs;
            actTab.appScope.cyMap.deselectSlots();
          }
        }
      }, tab.card);
    });
  }

  module.exports = multiDragSelectingTool;
});