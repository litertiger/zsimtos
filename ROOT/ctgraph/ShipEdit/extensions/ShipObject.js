var $ = go.GraphObject.make;  // for conciseness in defining templates

function ShipObject() {
	ShipObject.objArray.push(this);
	if(ShipObject.diagram)
		ShipObject.diagram.addNodeData(this);
}


function ShipObject(text) {
	this.text = text;
	ShipObject.objArray.push(this);
	if(ShipObject.diagram)
		ShipObject.diagram.model.addNodeData(this);
}

ShipObject.templateName = "ShipObject";
ShipObject.isGroup = false;
ShipObject.contextMenu = null;

ShipObject.RegisteTemplate = function (diagram) {
	if (ShipObject.isGroup)
		diagram.groupTemplateMap.add(ShipObject.templateName, ShipObject.objTemplate);
	else
		diagram.nodeTemplateMap.add(ShipObject.templateName, ShipObject.objTemplate);
	ShipObject.diagram = diagram;
}

ShipObject.objTemplate = $(go.Node, "Auto", {
		locationSpot : go.Spot.Center
	},
		$(go.Shape, "Rectangle", {
			fill : "white", // the default fill, if there is no data-binding
			portId : "",
			cursor : "pointer", // the Shape is the port, not the whole Node
			// allow all kinds of links from and to this port
			fromLinkable : true,
			fromLinkableSelfNode : true,
			fromLinkableDuplicates : true,
			toLinkable : true,
			toLinkableSelfNode : true,
			toLinkableDuplicates : true,
			height:50,
			width:50
		},
		new go.Binding("fill", "color")),
		new go.Binding("location", "pos",go.Point.parse),
		$(go.TextBlock, {
			font : "bold 14px sans-serif",
			stroke : '#333',
			margin : 6, // make some extra space for the shape around the text
			isMultiline : false, // don't allow newlines in text
			editable : true // allow in-place editing by user
		},
			new go.Binding("text", "text").makeTwoWay()), // the label shows the node data's text
	{ // this tooltip Adornment is shared by all nodes
		/*toolTip :
		$(go.Adornment, "Auto",
			$(go.Shape, {
				fill : "#FFFFCC"
			}),
			$(go.TextBlock, {
				margin : 4
			}, // the tooltip shows the result of calling nodeInfo(data)
				new go.Binding("text", "", nodeInfo))),
		// this context menu Adornment is shared by all nodes
		contextMenu : ShipObject.contextMenu*/
	});
ShipObject.objArray = [];
ShipObject.diagram = null;



ShipObject.prototype.text = "";
ShipObject.prototype.color = "green";
ShipObject.prototype.category = "ShipObject";

ShipObject.prototype.setProperty = function(key,value)
{
	this[key] = value;
	if(ShipObject.diagram)
	{
		n = ShipObject.diagram.findNodeForData(this);
		if(n)
			n.updateTargetBindings();
	}
};

ShipObject.prototype.setProperties= function(obj)
{
	if(obj instanceof Object)
	{
		for( var i in obj)
			this[i] = obj[i];
		if(ShipObject.diagram)
		{
			n = ShipObject.diagram.findNodeForData(this);
			if(n)
				n.updateTargetBindings();
		}
	}
};

