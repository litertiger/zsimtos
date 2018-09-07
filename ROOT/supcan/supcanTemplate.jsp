<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=GB2312">
<link rel="stylesheet" href="res/temp1.css" type="text/css">
<script type='text/javascript' src='binary/dynaload.js?103'></script>
<link type="text/css" rel="stylesheet" href="../wb/libs/ext/resources/ext-theme-classic/ext-theme-classic-all-debug.css">
<link type="text/css" rel="stylesheet" href="../wb/css/style-debug.css">
<script type="text/javascript" src="../wb/script/locale/wb-lang-zh-debug.js"></script>
<script type="text/javascript" src="../wb/libs/ext/ext-all-debug.js"></script>
<script type="text/javascript" src="../wb/libs/ext/locale/ext-lang-zh-debug.js"></script>
<script type="text/javascript" src="../wb/script/wb-debug.js"></script>
	<%String type=request.getParameter("type");%>
    <%String url=request.getParameter("url");%>
    <%String path=request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+'/' ;%>
<script language="JavaScript">
  var supcanTL=3;
 Ext.useShims = true;
 function OnReady(id){       
   Wb.request({
  url: '<%=path+url%>',
  params: {},
  success: function(resp) {
   AF.func("Build", resp.responseText);
    Wb.info(111);
  }
});


 }
 function getxml()
 {
  var xml = AF.func("GetChangedXML", "")
  xml = xml.replace(/\r\n/g, "\\r\\n");

  AF.func("MessageBoxFloat", xml + "\r\n icon=Information; hold=0");
 }
</script>
  
   <style>
        .alert{position:absolute;z-index:-1;}
  </style>
</head>
<body class="alert" vlink=#0000ff link=#0000ff style="z-index:-1">
<div   style="position:relative;width:1000px;z-index:-99">
	<script>
     
		if('<%=type%>'=="tree")
			insertTreeList('AF', '', '95%');
		else if('<%=type%>'=="report")
			insertReport('AF', '', '95%');
		else if('<%=type%>'=="form")
			insertFreeForm('AF', '', '95%');
  supcanTL=AF;

	</script>
</div>
</body>
<script type='text/javascript' src='res/nstd.js'></script>
</html>