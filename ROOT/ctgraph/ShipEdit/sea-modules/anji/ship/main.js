define("anji/ship/shipTemplate",[],function(a,b,c){"use strict";var d=a("gojs/go"),e=d.GraphObject.make,f=function(a,b,c){a.add(b.prototype.className,c)},g=function(b,c){var d=a("./container"),e=a("./slot");switch(c.part.data.category){case e.prototype.className:if(""!=c.part.data.no)return;b.diagram.selection.each(function(a){a.data.category===d.prototype.className&&a.data.setProperty("pos",c.part.data.pos)})}},h=function(b){var c=a("./shareData");c.diagram=b,b.addDiagramListener("SelectionMoved",function(a){a.subject.each(function(a){a.data.onMoved()})});var h=a("./slot");f(b.nodeTemplateMap,h,e(d.Node,"Auto",{locationSpot:d.Spot.Center,isLayoutPositioned:!1,deletable:!1,movable:!1,mouseDrop:g},e(d.Shape,"Rectangle",{fill:"white",cursor:"pointer",height:50,width:50,strokeWidth:1})));var i=a("./label");f(b.nodeTemplateMap,i,e(d.Node,"Auto",{locationSpot:d.Spot.Center,isLayoutPositioned:!1,deletable:!1,movable:!1,selectable:!1},e(d.Shape,"Rectangle",{fill:"white",cursor:"pointer",height:50,width:50,strokeWidth:0},new d.Binding("fill","color")),e(d.TextBlock,{font:"bold 14pt sans-serif",stroke:"#333",margin:6,editable:!1,textAlign:"center"},new d.Binding("text","no"))));var j=a("./container");f(b.nodeTemplateMap,j,e(d.Node,"Auto",{locationSpot:d.Spot.Center,deletable:!1,isLayoutPositioned:!1},e(d.Shape,"Rectangle",{fill:"white",cursor:"pointer",height:50,width:50},new d.Binding("strokeWidth","no",function(a){return""==a?1:0}),new d.Binding("fill","color")),e(d.Panel,"Vertical",e(d.TextBlock,{font:"bold 10pt sans-serif",stroke:"#333",margin:0,editable:!1,textAlign:"left",alignment:d.Spot.TopLeft},new d.Binding("text","no",function(a){return a.substr(0,4)})),e(d.TextBlock,{font:"8pt sans-serif",stroke:"#333",margin:0,isMultiline:!0,editable:!1,textAlign:"right",alignment:d.Spot.TopRight},new d.Binding("text","no",function(a){return a.substr(4)})))));var k=a("./group");f(b.groupTemplateMap,k,e(d.Group,"Vertical",{locationSpot:d.Spot.Center,movable:!1,deletable:!1},e(d.Panel,"Auto",e(d.Shape,"Rectangle",{strokeWidth:0,fill:"rgba(128,128,128,0)"}),e(d.Placeholder))));var l=a("./bottomTitleGroup");f(b.groupTemplateMap,l,e(d.Group,"Vertical",{locationSpot:d.Spot.Center,movable:!1,deletable:!1},e(d.Panel,"Auto",e(d.Shape,"Rectangle",{strokeWidth:0,fill:"rgba(128,128,128,0)"}),e(d.Placeholder)),e(d.TextBlock,{alignment:d.Spot.Center,font:"Bold 14pt Sans-Serif"},new d.Binding("text","no"))));var m=a("./topTitleGroup");f(b.groupTemplateMap,m,e(d.Group,"Vertical",{locationSpot:d.Spot.Center,movable:!1,deletable:!1},e(d.TextBlock,{alignment:d.Spot.Center,font:"Bold 14pt Sans-Serif"},new d.Binding("text","no")),e(d.Panel,"Auto",e(d.Shape,"Rectangle",{strokeWidth:0,fill:"rgba(128,128,128,0)"}),e(d.Placeholder))))};c.exports={initTemplate:h}}),define("anji/ship/container",["./shipObject","./shareData","./dragComputation","./slot","gojs/go"],function(a,b,c){"use strict";function g(a){this.color="green",this.no=a,d.call(this),e.call(this)}var d=a("./shipObject"),e=a("./dragComputation"),f=a("./shareData");d.inherit(g,d),g.prototype.getStowLoc=function(){return this.stowLoc},g.prototype.setStowLoc=function(a){this.stowLoc=a;var b=a.substr(0,3);for(var c in f.objMap.ShipBay)if(f.objMap.ShipBay[c].no==b){for(var d=-1,e=a.substr(3,2),g=a.substr(5,2),h=f.objMap.ShipBay[c].deckBay.rows[0].slots,i=0;h.length>i;++i)if(h[i].no==g){d=i;break}if(d>=0){var j=f.objMap.ShipBay[c].deckBay.rows;for(var k in j)if(j[k].no==e){this.node.move(j[k].slots[d].node.position);break}break}for(var h=f.objMap.ShipBay[c].cabinBay.rows[0].slots,i=0;h.length>i;++i)if(h[i].no==g){d=i;break}if(d>=0){j=f.objMap.ShipBay[c].cabinBay.rows;for(var k in j)if(j[k].no==e){this.node.location=j[k].slots[d].node.location;break}}break}},g.prototype.onDragComputation=function(b,c){var e=a("./slot"),f=this.findAnjiObjectAt(e,c);if(null===f)return b.location;var h=this.findAnjiObjectAt(g,c);return null!==h?b.location:f.location},g.prototype.onMoved=function(){var b=a("./slot"),c=this.findAnjiObjectAt(b,this.node.location);if(c){var d=c.containingGroup,e=d.data.slots.indexOf(c.data),f=d.containingGroup,g=f.containingGroup;this.stowLoc=g.data.no+d.data.no+f.data.rows[0].slots[e].no,console.log(this.stowLoc)}},g.prototype.className="Container",c.exports=g}),define("anji/ship/shipObject",["./shareData","gojs/go"],function(a,b,c){"use strict";function e(){var a=new Date;if(null==d.diagram)throw"未初始化全局静态变量share.diagram";var b=this.__proto__,c=d.diagram.nodeTemplateMap;for(this.isGroup&&(c=d.diagram.groupTemplateMap);null!=b;){if(c.contains(b.className)){this.category=b.className;break}b=b.__proto__}d.diagram.model.addNodeData(this),void 0===d.objMap[this.className]&&(d.objMap[this.className]=[]),d.objMap[this.className].push(this),this.node=d.diagram.findNodeForData(this);var e=new Date;console.log("Call ShipObject():"+(e-a))}var d=a("./shareData");e.inherit=function(a,b){var c=function(){};c.prototype=b.prototype;var d=a.prototype.constructor;a.prototype=new c,a.prototype.constructor=d},e.prototype.setProperty=function(a,b){this[a]=b,this.node.updateTargetBindings()},e.prototype.setProperties=function(a){if(a instanceof Object){for(var b in a)this[b]=a[b];this.node.updateTargetBindings()}},e.prototype.onMoved=function(){},e.prototype.className="ShipObject",e.prototype.findAnjiObjectAt=function(a,b){var c=function(a){return a.part},e=function(b){return b.data instanceof a?!0:!1};return d.diagram.findObjectAt(b,c,e)},c.exports=e}),define("anji/ship/shareData",["gojs/go"],function(a,b,c){"use strict";var d=a("gojs/go");c.exports={objMap:{},diagram:null,slotSize:new d.Size(50,50)}}),define("anji/ship/dragComputation",[],function(a,b,c){"use strict";function d(){this.node.dragComputation=function(a,b,c){return this.data.onDragComputation(a,b,c)}}c.exports=d}),define("anji/ship/slot",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(){var a=new Date;this.color="white",d.call(this);var b=new Date;console.log("Call Slot():"+(b-a))}var d=a("./shipObject");d.inherit(e,d),e.prototype.className="Slot",c.exports=e}),define("anji/ship/label",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(a){var b=new Date;this.no=a,this.color="white",d.call(this);var c=new Date;console.log("Call Label():"+(c-b))}var d=a("./shipObject");d.inherit(e,d),e.prototype.className="Label",c.exports=e}),define("anji/ship/group",["./shipObject","./shareData","gojs/go"],function(a,b,c){"use strict";function e(){var a=new Date;this.isGroup=!0,d.call(this);var b=new Date;console.log("Call Group():"+(b-a))}var d=a("./shipObject");d.inherit(e,d),e.prototype.className="Group",c.exports=e}),define("anji/ship/bottomTitleGroup",["./shipObject","./shareData","./group","gojs/go"],function(a,b,c){"use strict";function f(a){this.no=a,e.call(this)}var d=a("./shipObject"),e=a("./group");d.inherit(f,e),f.prototype.className="BottomTitleGroup",c.exports=f}),define("anji/ship/topTitleGroup",["./shipObject","./shareData","./group","gojs/go"],function(a,b,c){"use strict";function f(a){this.no=a,e.call(this)}var d=a("./shipObject"),e=a("./group");d.inherit(f,e),f.prototype.className="TopTitleGroup",c.exports=f}),define("anji/ship/shipBay",["./shipObject","./shareData","./topTitleGroup","./group","./deckBay","./bayBase","./deckRow","./rowBase","./slot","./label","./bottomTitleGroup","./cabinBay","./cabinRow","gojs/go"],function(a,b,c){"use strict";function j(a,b,c){var e=new Date;f.call(this,a),null!=b?(this.deckBay=new g(b),this.deckBay.node.containingGroup=this.node):this.deckBay=null,null!=c?(this.cabinBay=new h(c),this.cabinBay.node.containingGroup=this.node,this.cabinBay.node.move(new d.Point(0,2*i.slotSize.height))):this.cabinBay=null,this.node.locationSpot=new d.Spot(.5,0,0,this.deckBay.tierCount*i.slotSize.height);var j=new Date;console.log("Call ShipBay():"+(j-e))}var d=a("gojs/go"),e=a("./shipObject"),f=a("./topTitleGroup"),g=a("./deckBay"),h=a("./cabinBay"),i=a("./shareData");e.inherit(j,f),j.prototype.className="ShipBay",c.exports=j}),define("anji/ship/deckBay",["./shipObject","./shareData","./bayBase","./group","./deckRow","./rowBase","./slot","./label","./bottomTitleGroup","gojs/go"],function(a,b,c){"use strict";function h(a){f.call(this),e.call(this,a)}var d=a("./shipObject"),e=a("./bayBase"),f=a("./group"),g=a("./deckRow");d.inherit(h,f),h.prototype.createRow=function(a,b){return new g(a,b)},h.prototype.className="DeckBay",c.exports=h}),define("anji/ship/bayBase",["./shareData","gojs/go"],function(a,b,c){"use strict";var d=a("gojs/go"),e=a("./shareData"),f=function(a){var b=new Date;this.rows=[];var c;this.tierCount=0,this.addRow=function(a){this.rows.push(a),a.node.containingGroup=this.node,a.slots.length>this.tierCount&&(this.tierCount=a.slots.length)};var f=1;for(var g in a)c=this.createRow(g,a[g]),this.addRow(c),c.node.move(new d.Point(f*e.slotSize.width,0)),++f;var h=new Date;console.log("Call BayBase():"+(h-b))};c.exports=f}),define("anji/ship/deckRow",["./shipObject","./shareData","./rowBase","./slot","./label","./bottomTitleGroup","./group","gojs/go"],function(a,b,c){"use strict";function i(a,b){g.call(this,a),f.call(this,b)}var d=a("gojs/go"),e=a("./shipObject"),f=a("./rowBase"),g=a("./bottomTitleGroup"),h=a("./shareData");e.inherit(i,g),i.prototype.initPosition=function(){var a=new d.Point(0,0),b=this.slots;for(var c in b)b[c].node.move(a),a.y-=h.slotSize.height},i.prototype.className="DeckRow",c.exports=i}),define("anji/ship/rowBase",["./slot","./shipObject","./shareData","./label","gojs/go"],function(a,b,c){"use strict";var d=a("./slot"),e=a("./label"),f=function(a){var b=new Date;this.slots=[];var c;if(this.addSlot=function(a){this.slots.push(a),a.node.containingGroup=this.node},a instanceof Array)for(var f=0;a.length>f;++f)c=new e(a[f]),this.addSlot(c);else{if(isNaN(a))throw"非法参数";for(var f=0;a>f;++f)c=new d(""),this.addSlot(c)}this.initPosition();var g=new Date;console.log("Call RowBase():"+(g-b))};c.exports=f}),define("anji/ship/cabinBay",["./shipObject","./shareData","./bayBase","./group","./cabinRow","./rowBase","./slot","./label","./topTitleGroup","gojs/go"],function(a,b,c){"use strict";function h(a){f.call(this),e.call(this,a)}var d=a("./shipObject"),e=a("./bayBase"),f=a("./group"),g=a("./cabinRow");d.inherit(h,f),h.prototype.createRow=function(a,b){return new g(a,b)},h.prototype.className="CabinBay",c.exports=h}),define("anji/ship/cabinRow",["./shipObject","./shareData","./rowBase","./slot","./label","./topTitleGroup","./group","gojs/go"],function(a,b,c){"use strict";function i(a,b){g.call(this,a),f.call(this,b)}var d=a("gojs/go"),e=a("./shipObject"),f=a("./rowBase"),g=a("./topTitleGroup"),h=a("./shareData");e.inherit(i,g),i.prototype.initPosition=function(){var a=new d.Point(0,0),b=this.slots;for(var c in b)b[c].node.move(a),a.y+=h.slotSize.height},i.prototype.className="CabinRow",c.exports=i}),define("anji/ship/main",["./shipTemplate","./container","./shipObject","./shareData","./dragComputation","./slot","./label","./group","./bottomTitleGroup","./topTitleGroup","./shipBay","./deckBay","./bayBase","./deckRow","./rowBase","./cabinBay","./cabinRow","gojs/go"],function(a){"use strict";function e(a,d,e){return c("ContextMenuButton",c(b.TextBlock,a),{click:d},e?new b.Binding("visible","",e).ofObject():{})}function g(a){var b="Node "+a.key+": "+a.text+"\n";return b+=a.group?"member of "+a.group:"top-level node"}function h(a){var c=a.adornedPart,d=c.memberParts.count,e=0;return c.memberParts.each(function(a){a instanceof b.Link&&e++}),"Group "+c.data.key+": "+c.data.text+"\n"+d+" members including "+e+" links"}function i(a){return"Model:\n"+a.nodeDataArray.length+" nodes, "+a.linkDataArray.length+" links"}function j(a){var b=(2*a+1).toString();return b.split(),b[2]?b:b[1]?"0"+b:"00"+b}function t(){var b=new Date;s=b-r,console.log("layout time :"+s);var c=a("./container");new c("TENU6937241").setStowLoc("0010384"),new c("TMOU7895265").setStowLoc("0030510"),new c("TESU2863951").setStowLoc("0050006")}var b=a("gojs/go"),c=b.GraphObject.make,d=c(b.Diagram,"myDiagramDiv",{initialContentAlignment:b.Spot.Center,allowLink:!1,InitialLayoutCompleted:t,layout:c(b.GridLayout,{spacing:new b.Size(10,10),sorting:b.GridLayout.Forward}),"clickCreatingTool.archetypeNodeData":{text:"Node",color:"white"},"commandHandler.archetypeGroupData":{text:"Group",isGroup:!0,color:"blue"},"undoManager.isEnabled":!0}),f=c(b.Adornment,"Vertical",e("Properties",function(a,c){var d=c.part,e=d.adornedPart;e instanceof b.Link?alert(linkInfo(e.data)):e instanceof b.Group?alert(h(d)):alert(g(e.data))}),e("Cut",function(a){a.diagram.commandHandler.cutSelection()},function(a){return a.diagram.commandHandler.canCutSelection()}),e("Copy",function(a){a.diagram.commandHandler.copySelection()},function(a){return a.diagram.commandHandler.canCopySelection()}),e("Paste",function(a){a.diagram.commandHandler.pasteSelection(a.diagram.lastInput.documentPoint)},function(a){return a.diagram.commandHandler.canPasteSelection()}),e("Delete",function(a){a.diagram.commandHandler.deleteSelection()},function(a){return a.diagram.commandHandler.canDeleteSelection()}),e("Undo",function(a){a.diagram.commandHandler.undo()},function(a){return a.diagram.commandHandler.canUndo()}),e("Redo",function(a){a.diagram.commandHandler.redo()},function(a){return a.diagram.commandHandler.canRedo()}),e("Group",function(a){a.diagram.commandHandler.groupSelection()},function(a){return a.diagram.commandHandler.canGroupSelection()}),e("Ungroup",function(a){a.diagram.commandHandler.ungroupSelection()},function(a){return a.diagram.commandHandler.canUngroupSelection()}));d.groupTemplate=c(b.Group,"Vertical",{selectionObjectName:"PANEL",ungroupable:!0},c(b.TextBlock,{font:"bold 19px sans-serif",isMultiline:!1,editable:!0},new b.Binding("text","text").makeTwoWay(),new b.Binding("stroke","color")),c(b.Panel,"Auto",{name:"PANEL"},c(b.Shape,"Rectangle",{fill:"rgba(128,128,128,0.2)",stroke:"gray",strokeWidth:3}),c(b.Placeholder,{padding:10})),{toolTip:c(b.Adornment,"Auto",c(b.Shape,{fill:"#FFFFCC"}),c(b.TextBlock,{margin:4},new b.Binding("text","",h).ofObject())),contextMenu:f}),d.toolTip=c(b.Adornment,"Auto",c(b.Shape,{fill:"#FFFFCC"}),c(b.TextBlock,{margin:4},new b.Binding("text","",i))),d.contextMenu=c(b.Adornment,"Vertical",e("Paste",function(a){a.diagram.commandHandler.pasteSelection(a.diagram.lastInput.documentPoint)},function(a){return a.diagram.commandHandler.canPasteSelection()}),e("Undo",function(a){a.diagram.commandHandler.undo()},function(a){return a.diagram.commandHandler.canUndo()}),e("Redo",function(a){a.diagram.commandHandler.redo()},function(a){return a.diagram.commandHandler.canRedo()})),d.model=new b.GraphLinksModel([],[]);var k=a("./shipTemplate");k.initTemplate(d);var l=a("./shipBay");console.log("begin create");for(var m=new Date,n=m,o=4,p=0;o>p;++p){new l(j(p),{"":["82","84","86","88"],"05":4,"03":4,"01":4,"00":4,"02":4,"04":4,"06":4},{"":["12","10","08","06","04","02"],"05":3,"03":4,"01":5,"00":6,"02":5,"04":4,"06":3});var r=new Date,s=r-n;n=r,console.log(p+1+"/"+o+" created use time :"+s)}r=new Date,s=r-m,console.log("create time :"+s)});