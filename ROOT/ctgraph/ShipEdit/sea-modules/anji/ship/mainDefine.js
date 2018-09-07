define("anji/ship/dragFillTool",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(){d.Tool.call(this),this.name="DragCreating",this._delay=175}var d=a("gojs/go");d.Diagram.inherit(e,d.Tool),e.prototype.canStart=function(){if(!this.isEnabled)return!1;if(null===this.archetypeNodeData)return!1;var a=this.diagram;if(null===a)return!1;if(a.isReadOnly||a.isModelReadOnly)return!1;if(!a.allowInsert)return!1;var b=a.lastInput;if(!b.left)return!1;if(a.currentTool!==this){if(!this.isBeyondDragSize())return!1;if(b.timestamp-a.firstInput.timestamp<this.delay)return!1}return!0},e.prototype.doActivate=function(){var a=this.diagram;null!==a&&(this.isActive=!0,a.isMouseCaptured=!0,this.startTransaction(this.name))},e.prototype.doDeactivate=function(){var a=this.diagram;null!==a&&(a.isMouseCaptured=!1,this.isActive=!1,this.transactionResult=this.name,this.stopTransaction(this.name))},e.prototype.doMouseMove=function(){var a=this.diagram;null!==a&&this.fillPart(a.lastInput.documentPoint)},e.prototype.doMouseUp=function(){this.stopTool()},e.prototype.fillPart=function(b){var c=this.diagram;if(null===c)return null;var d=a("./shipObject"),e=d.findAnjiObjectAt(this.type,b);e&&e.data.color!==this.color&&e.data.setProperty("color",this.color)},Object.defineProperty(e.prototype,"delay",{get:function(){return this._delay},set:function(a){this._delay=a}}),Object.defineProperty(e.prototype,"type",{get:function(){return this._type},set:function(a){this._type=a}}),Object.defineProperty(e.prototype,"color",{get:function(){return this._color},set:function(a){this._color=a}}),c.exports=e}),define("anji/ship/shipObject",["./shareData","gojs/go"],function(a,b,c){"use strict";function e(){var a=new Date;if(null==d.diagram)throw"未初始化全局静态变量share.diagram";var b=this.__proto__,c=d.diagram.nodeTemplateMap;for(this.isGroup&&(c=d.diagram.groupTemplateMap);null!=b;){if(c.contains(b.className)){this.category=b.className;break}b=b.__proto__}d.diagram.model.addNodeData(this),void 0===d.objMap[this.className]&&(d.objMap[this.className]=[]),d.objMap[this.className].push(this),this.node=d.diagram.findNodeForData(this);var e=new Date;console.log("Call ShipObject():"+(e-a))}var d=a("./shareData");e.inherit=function(a,b){var c=function(){};c.prototype=b.prototype;var d=a.prototype.constructor;a.prototype=new c,a.prototype.constructor=d},e.prototype.setProperty=function(a,b){this[a]=b,this.node.updateTargetBindings()},e.prototype.setProperties=function(a){if(a instanceof Object){for(var b in a)this[b]=a[b];this.node.updateTargetBindings()}},Object.defineProperty(e.prototype,"location",{get:function(){return this.node.location},set:function(a){this.node.location=a}}),Object.defineProperty(e.prototype,"position",{get:function(){return this.node.position},set:function(a){this.node.move(a)}}),e.prototype.onmoved=function(){},e.prototype.onclick=function(){},e.prototype.ondoubleClick=function(){},e.prototype.oncontextClick=function(){},e.prototype.className="ShipObject";var f=function(a){return a.part};e.findAnjiObjectAt=e.prototype.findAnjiObjectAt=function(a,b){var c=function(b){return b.data instanceof a};return d.diagram.findObjectAt(b,f,c)},e.findAnjiObjectsIn=e.prototype.findAnjiObjectsIn=function(a,b,c){var e=function(b){return b.data instanceof a};return d.diagram.findObjectsIn(b,f,e,c)},c.exports=e}),define("anji/ship/shareData",["gojs/go"],function(a,b,c){"use strict";var d=a("gojs/go");c.exports={objMap:{},diagram:null,slotSize:new d.Size(50,50)}}),define("anji/ship/slot",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(){var a=new Date;this.color="white",d.call(this);var b=new Date;console.log("Call Slot():"+(b-a))}var d=a("./shipObject");d.inherit(e,d),e.prototype.onclick=function(){var c=a("./shareData");if(c.diagram.actionButton){var d=null;switch(c.diagram.actionButton.action){case"erase":d="white";break;case"20":d="red";break;case"40":d="blue";break;default:d=null}d&&this.setProperty("color",d)}},e.prototype.className="Slot",c.exports=e}),define("anji/ship/shipTemplate",[],function(a,b,c){"use strict";var d=a("gojs/go"),e=d.GraphObject.make,f=function(a,b,c){c.click=function(a,b){b.part.data.onclick(a)},c.doubleClick=function(a,b){b.part.data.ondoubleClick(a)},c.contextClick=function(a,b){b.part.data.oncontextClick(a)},a.add(b.prototype.className,c)},g=function(b){var c=a("./shareData");c.diagram=b,b.addDiagramListener("SelectionMoved",function(a){a.subject.each(function(a){a.data.onMoved()})});var g=a("./slot");f(b.nodeTemplateMap,g,e(d.Node,"Auto",{locationSpot:d.Spot.Center,isLayoutPositioned:!1,selectable:!1},e(d.Shape,"Rectangle",{fill:"white",height:50,width:50,strokeWidth:1},new d.Binding("fill","color").makeTwoWay())));var h=a("./button");f(b.nodeTemplateMap,h,e(d.Node,"Auto",{locationSpot:d.Spot.Center,isLayoutPositioned:!1},e("Button",e(d.Picture,{background:"gray",width:50,height:50},new d.Binding("source","url")),e(d.TextBlock,{font:"bold 14pt sans-serif",stroke:"#333",margin:6,editable:!1,textAlign:"center"},new d.Binding("text","caption")))));var i=a("./checkBox");f(b.nodeTemplateMap,i,e(d.Node,"Auto",{locationSpot:d.Spot.Center,isLayoutPositioned:!1},e("CheckBox","checked",e(d.TextBlock,{font:"bold 14pt sans-serif",stroke:"#333",margin:6,editable:!1,textAlign:"center"},new d.Binding("text","caption")))));var j=a("./label");f(b.nodeTemplateMap,j,e(d.Node,"Auto",{locationSpot:d.Spot.Center,isLayoutPositioned:!1,deletable:!1,movable:!1,selectable:!1},e(d.Shape,"Rectangle",{fill:"white",height:50,width:50,strokeWidth:0},new d.Binding("fill","color")),e(d.TextBlock,{font:"bold 14pt sans-serif",stroke:"#333",margin:6,editable:!1,textAlign:"center"},new d.Binding("text","no"))));var k=a("./container");f(b.nodeTemplateMap,k,e(d.Node,"Auto",{locationSpot:d.Spot.Center,deletable:!1,isLayoutPositioned:!1},e(d.Shape,"Rectangle",{fill:"white",height:50,width:50},new d.Binding("strokeWidth","no",function(a){return""==a?1:0}),new d.Binding("fill","color")),e(d.Panel,"Vertical",e(d.TextBlock,{font:"bold 10pt sans-serif",stroke:"#333",margin:0,editable:!1,textAlign:"left",alignment:d.Spot.TopLeft},new d.Binding("text","no",function(a){return a.substr(0,4)})),e(d.TextBlock,{font:"8pt sans-serif",stroke:"#333",margin:0,isMultiline:!0,editable:!1,textAlign:"right",alignment:d.Spot.TopRight},new d.Binding("text","no",function(a){return a.substr(4)})))));var l=a("./group");f(b.groupTemplateMap,l,e(d.Group,"Vertical",{locationSpot:d.Spot.Center,movable:!1,deletable:!1,selectable:!1},e(d.Panel,"Auto",e(d.Shape,"Rectangle",{strokeWidth:0,fill:"rgba(128,128,128,0)"}),e(d.Placeholder))));var m=a("./bottomTitleGroup");f(b.groupTemplateMap,m,e(d.Group,"Vertical",{locationSpot:d.Spot.Center,movable:!1,deletable:!1,selectable:!1},e(d.Panel,"Auto",e(d.Shape,"Rectangle",{strokeWidth:0,fill:"rgba(128,128,128,0)"}),e(d.Placeholder)),e(d.TextBlock,{alignment:d.Spot.Center,font:"Bold 14pt Sans-Serif"},new d.Binding("text","no"))));var n=a("./topTitleGroup");f(b.groupTemplateMap,n,e(d.Group,"Vertical",{locationSpot:d.Spot.Center,movable:!1,deletable:!1,selectable:!1},e(d.TextBlock,{alignment:d.Spot.Center,font:"Bold 14pt Sans-Serif"},new d.Binding("text","no")),e(d.Panel,"Auto",e(d.Shape,"Rectangle",{strokeWidth:0,fill:"rgba(128,128,128,0)"}),e(d.Placeholder))))};c.exports={initTemplate:g}}),define("anji/ship/button",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(a){var b=new Date;d.call(this),this.setProperties(a);var c=new Date;console.log("Call Slot():"+(c-b))}var d=a("./shipObject");d.inherit(e,d),e.prototype.className="Button",e.prototype.onclick=function(){var c=a("./shareData"),d=(this.url?"url("+this.url+"),":"")+"default";c.diagram.defaultCursor===d?(c.diagram.startTransaction(),c.diagram.actionButton=null,this.node.diagram.defaultCursor="default",c.diagram.commitTransaction()):(c.diagram.startTransaction(),c.diagram.actionButton=this,this.node.diagram.defaultCursor=d,c.diagram.commitTransaction())},c.exports=e}),define("anji/ship/checkBox",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(a){this.caption=a,d.call(this)}var d=a("./shipObject");d.inherit(e,d),e.prototype.className="CheckBox",Object.defineProperty(e.prototype,"checked",{get:function(){return this._checked},set:function(a){this._checked=a}}),c.exports=e}),define("anji/ship/label",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(a){var b=new Date;this.no=a,this.color="white",d.call(this);var c=new Date;console.log("Call Label():"+(c-b))}var d=a("./shipObject");d.inherit(e,d),e.prototype.className="Label",c.exports=e}),define("anji/ship/container",["./shipObject","./shareData","./dragComputation","./slot","gojs/go"],function(a,b,c){"use strict";function g(a){this.color="green",this.no=a,d.call(this),e.call(this)}var d=a("./shipObject"),e=a("./dragComputation"),f=a("./shareData");d.inherit(g,d),g.prototype.getStowLoc=function(){return this.stowLoc},g.prototype.setStowLoc=function(a){this.stowLoc=a;var b=a.substr(0,3);for(var c in f.objMap.ShipBay)if(f.objMap.ShipBay[c].no==b){for(var d=-1,e=a.substr(3,2),g=a.substr(5,2),h=f.objMap.ShipBay[c].deckBay.rows[0].slots,i=0;h.length>i;++i)if(h[i].no==g){d=i;break}if(d>=0){var j=f.objMap.ShipBay[c].deckBay.rows;for(var k in j)if(j[k].no==e){this.location=j[k].slots[d].location;break}break}for(var h=f.objMap.ShipBay[c].cabinBay.rows[0].slots,i=0;h.length>i;++i)if(h[i].no==g){d=i;break}if(d>=0){j=f.objMap.ShipBay[c].cabinBay.rows;for(var k in j)if(j[k].no==e){this.location=j[k].slots[d].location;break}}break}},g.prototype.onDragComputation=function(b,c){var e=a("./slot"),f=this.findAnjiObjectAt(e,c);if(null===f)return b.location;var h=this.findAnjiObjectAt(g,c);return null!==h?b.location:f.location},g.prototype.onMoved=function(){var b=a("./slot"),c=this.findAnjiObjectAt(b,this.node.location);if(c){var d=c.containingGroup,e=d.data.slots.indexOf(c.data),f=d.containingGroup,g=f.containingGroup;this.stowLoc=g.data.no+d.data.no+f.data.rows[0].slots[e].no,console.log(this.stowLoc)}},g.prototype.onclick=function(){var c=a("./shareData");c.diagram.actionButton&&"erase"===c.diagram.actionButton.action&&c.diagram.model.removeNodeData(this)},g.prototype.className="Container",c.exports=g}),define("anji/ship/dragComputation",[],function(a,b,c){"use strict";function d(){this.node.dragComputation=function(a,b,c){return this.data.onDragComputation(a,b,c)}}c.exports=d}),define("anji/ship/group",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(){var a=new Date;this.isGroup=!0,d.call(this);var b=new Date;console.log("Call Group():"+(b-a))}var d=a("./shipObject");d.inherit(e,d),e.prototype.className="Group",c.exports=e}),define("anji/ship/bottomTitleGroup",["./shipObject","./shareData","./group","gojs/go"],function(a,b,c){"use strict";function f(a){this.no=a,e.call(this)}var d=a("./shipObject"),e=a("./group");d.inherit(f,e),f.prototype.className="BottomTitleGroup",c.exports=f}),define("anji/ship/topTitleGroup",["./shipObject","./shareData","./group","gojs/go"],function(a,b,c){"use strict";function f(a){this.no=a,e.call(this)}var d=a("./shipObject"),e=a("./group");d.inherit(f,e),f.prototype.className="TopTitleGroup",c.exports=f}),define("anji/ship/shipBay",["./shipObject","./shareData","./topTitleGroup","./group","./deckBay","./bayBase","./deckRow","./rowBase","./slot","./label","./bottomTitleGroup","./cabinBay","./cabinRow","gojs/go"],function(a,b,c){"use strict";function j(a,b,c){var e=new Date;f.call(this,a),null!=b?(this.deckBay=new g(b),this.deckBay.node.containingGroup=this.node):this.deckBay=null,null!=c?(this.cabinBay=new h(c),this.cabinBay.node.containingGroup=this.node,this.cabinBay.position=new d.Point((this.deckBay.rows.length-this.cabinBay.rows.length)/2*i.slotSize.width,2*i.slotSize.height)):this.cabinBay=null,this.node.locationSpot=new d.Spot(.5,0,i.slotSize.width/2,this.deckBay.tierCount*i.slotSize.height);var j=new Date;console.log("Call ShipBay():"+(j-e))}var d=a("gojs/go"),e=a("./shipObject"),f=a("./topTitleGroup"),g=a("./deckBay"),h=a("./cabinBay"),i=a("./shareData");e.inherit(j,f),j.prototype.className="ShipBay",c.exports=j}),define("anji/ship/deckBay",["./shipObject","./shareData","./bayBase","./group","./deckRow","./rowBase","./slot","./label","./bottomTitleGroup","gojs/go"],function(a,b,c){"use strict";function h(a){f.call(this),e.call(this,a)}var d=a("./shipObject"),e=a("./bayBase"),f=a("./group"),g=a("./deckRow");d.inherit(h,f),h.prototype.createRow=function(a,b){return new g(a,b)},h.prototype.className="DeckBay",c.exports=h}),define("anji/ship/bayBase",["./shareData","gojs/go"],function(a,b,c){"use strict";var d=a("gojs/go"),e=a("./shareData"),f=function(a){var b=new Date;this.rows=[];var c;this.tierCount=0,this.addRow=function(a){this.rows.push(a),a.node.containingGroup=this.node,a.slots.length>this.tierCount&&(this.tierCount=a.slots.length)};var f=1;for(var g in a)c=this.createRow(g,a[g]),this.addRow(c),c.position=new d.Point(f*e.slotSize.width,0),++f;var h=new Date;console.log("Call BayBase():"+(h-b))};c.exports=f}),define("anji/ship/deckRow",["./shipObject","./shareData","./rowBase","./slot","./label","./bottomTitleGroup","./group","gojs/go"],function(a,b,c){"use strict";function i(a,b){g.call(this,a),f.call(this,b)}var d=a("gojs/go"),e=a("./shipObject"),f=a("./rowBase"),g=a("./bottomTitleGroup"),h=a("./shareData");e.inherit(i,g),i.prototype.initPosition=function(){var a=new d.Point(0,0),b=this.slots;for(var c in b)b[c].position=a,a.y-=h.slotSize.height},i.prototype.className="DeckRow",c.exports=i}),define("anji/ship/rowBase",["./slot","./shipObject","./shareData","./label","gojs/go"],function(a,b,c){"use strict";var d=a("./slot"),e=a("./label"),f=function(a){var b=new Date;this.slots=[];var c;if(this.addSlot=function(a){this.slots.push(a),a.node.containingGroup=this.node},a instanceof Array)for(var f=0;a.length>f;++f)c=new e(a[f]),this.addSlot(c);else{if(isNaN(a))throw"非法参数";for(var f=0;a>f;++f)c=new d(""),this.addSlot(c)}this.initPosition();var g=new Date;console.log("Call RowBase():"+(g-b))};c.exports=f}),define("anji/ship/cabinBay",["./shipObject","./shareData","./bayBase","./group","./cabinRow","./rowBase","./slot","./label","./topTitleGroup","gojs/go"],function(a,b,c){"use strict";function h(a){f.call(this),e.call(this,a)}var d=a("./shipObject"),e=a("./bayBase"),f=a("./group"),g=a("./cabinRow");d.inherit(h,f),h.prototype.createRow=function(a,b){return new g(a,b)},h.prototype.className="CabinBay",c.exports=h}),define("anji/ship/cabinRow",["./shipObject","./shareData","./rowBase","./slot","./label","./topTitleGroup","./group","gojs/go"],function(a,b,c){"use strict";function i(a,b){g.call(this,a),f.call(this,b)}var d=a("gojs/go"),e=a("./shipObject"),f=a("./rowBase"),g=a("./topTitleGroup"),h=a("./shareData");e.inherit(i,g),i.prototype.initPosition=function(){var a=new d.Point(0,0),b=this.slots;for(var c in b)b[c].position=a,a.y+=h.slotSize.height},i.prototype.className="CabinRow",c.exports=i}),define("anji/ship/mainDefine",["./dragFillTool","./shipObject","./shareData","./slot","./shipTemplate","./button","./checkBox","./label","./container","./dragComputation","./group","./bottomTitleGroup","./topTitleGroup","./shipBay","./deckBay","./bayBase","./deckRow","./rowBase","./cabinBay","./cabinRow","gojs/go"],function(a){"use strict";function i(a){return a=a.toString(),!a[1]&&!(a="0"+a),a}function j(a,b,c){var d={};d[""]=[];for(var e=c?82:2*b,f=0;b>f;++f)d[""].push(i(e+(c?2:-2)*f));var g=!1;1==a%2&&(a-=1,g=!0);for(var f=0;a>f;f+=2)d[i(a-f)]=b;g&&(d["00"]=b);for(var f=0;a>f;f+=2)d[i(f+1)]=b;return d}function l(){var c=a("./button");new c({url:"../img/none.png",action:"none"}).location=new b.Point(-300,-200),new c({url:"../img/eraser.png",action:"erase"}).location=new b.Point(-300,-145),new c({url:"../img/20.png",action:"20",caption:"20"}).location=new b.Point(-300,-90),new c({url:"../img/40.png",action:"40",caption:"40"}).location=new b.Point(-300,-35);var d=a("./checkBox");new d("镜像").location=new b.Point(-300,50)}var b=a("gojs/go"),c=b.GraphObject.make,d=c(b.Diagram,"myDiagramDiv",{initialContentAlignment:b.Spot.Center,allowLink:!1,InitialLayoutCompleted:l,layout:c(b.GridLayout,{spacing:new b.Size(10,10),sorting:b.GridLayout.Forward}),"clickCreatingTool.archetypeNodeData":{text:"Node",color:"white"},"undoManager.isEnabled":!0});d.model=new b.GraphLinksModel([],[]);var e=a("./dragFillTool"),f=a("./slot");d.toolManager.mouseMoveTools.insertAt(2,c(e,{isEnabled:!0,delay:0,type:f,fillPart:function(b){var c=a("./shareData");if(c.diagram.actionButton){switch(c.diagram.actionButton.action){case"erase":this.color="white";break;case"20":this.color="red";break;case"40":this.color="blue";break;default:this.color=null}if(!this.color)return;if(e.prototype.fillPart.call(this,b),c.objMap.CheckBox[0].checked){var d=a("./shipObject"),g=d.findAnjiObjectAt(f,b),h=g.containingGroup,i=h.data.no,j=h.containingGroup,k=j.data.rows.length-1,l=2*Math.ceil(i/2)-1;1==k%2&&++l,1==i%2&&(l*=-1),b.x+=l*c.slotSize.width,e.prototype.fillPart.call(this,b)}}}}));var g=a("./shipTemplate");g.initTemplate(d);var h=a("./shipBay");new h("",j(8,6,!0),j(7,6,!1))});