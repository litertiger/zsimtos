/**
 * Created by kingser on 2016/8/30.
 */


function drawObj()
{
}

drawObj.prototype.yy = function(pos){


    for (var i=0;i<10;i++){
        var sha =
            $AJ(go.Node, "Auto",
                {position:new go.Point(pos.x+30*i,pos.y),
                    isActionable:false,
                    //selectable: false,
                click:function(e, node) {
                   //console.log(node.name);

                }},
                //{location:  new go.Point(30*i, 60) },
                $AJ(go.Shape,
                    {
                        figure: "Rectangle",
                        fill: "lightgreen",
                        width:30,height:20})
            );
        myDiagram.add( sha );
    }


    //myDiagram.addDiagramListener("ObjectSingleClicked",
    //    function(e) {
    //        var part = e.subject.part;
    //        //if (!(part instanceof go.Link))
    //            console.log(e.subject.name);//alert("Clicked on " + part.data.key);
    //    });
    //myDiagram.addDiagramListener("BackgroundSingleClicked",
    //    function(e) {
    //        var sel = myPalette.selection.toArray();
    //        for (var i = 0; i < sel.length; i++) {
    //            var part = sel[i];
    //            // don't have any members of Groups be selected or selectable
    //                console.log(part.data.key);
    //        }
    //    }
    //);
    //myDiagram.addDiagramListener("ChangedSelection",
    //    function(e) {
    //        var sel = myDiagram.selection.toArray();
    //        for (var i = 0; i < sel.length; i++) {
    //            var part = sel[i];
    //            // don't have any members of Groups be selected or selectable
    //            console.log(part);
    //        }
    //    }
    //);

}
