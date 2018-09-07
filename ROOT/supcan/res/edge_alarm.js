var $posX, $posY, $stepX, $stepY, $count=0;
var $agent = navigator.userAgent.toLowerCase();
if($agent.indexOf("edge")>0) setTimeout("checkimg_edge()", 1000);

function checkimg_edge()
{
 var img = document.getElementById("edgeimg");
 setTimeout(img == null ? "checkimg_edge()" : "go_edge()", 1000);
}

function go_edge()
{
 var img = document.getElementById("edgeimg");
 img.src="res/edge_alarm.png";

 var screen_w = document.body.clientWidth;
 var screen_h = document.body.clientHeight;
 $posX = (screen_w - 460)/2;
 $posY = (screen_h - 440)/2;
 $stepX = (screen_w - 460)/20;
 $stepY = -(screen_h - 400)/20;

 var obj = document.getElementById('edgediv');
 obj.style.top= $posY;
 obj.style.left = $posX;
 obj.style.height='460px';
 obj.style.width ='400px';
 setTimeout("move_edge()", 200); 
}

function move_edge()
{
 var obj = document.getElementById('edgediv');
 $posX += $stepX;
 $posY += $stepY;
 obj.style.left = $posX;
 obj.style.top = $posY;
 $count++;
 if($count < 10) setTimeout("move_edge()", 50 - $count); 
}
