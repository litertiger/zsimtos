//�����������Firefox / Chrome / IE(X86/X64)
var $agnt=navigator.userAgent.toLowerCase();
var $isChrome = false, $isFirefox = false, $is64 = false;
var $isIE = ($agnt.indexOf("msie")>0 || $agnt.indexOf("trident")>0) ? true : false;
if($isIE) {
 if($agnt.indexOf("win64")>=0 || $agnt.indexOf("x64")>=0) $is64 = true;
}
else {
 if($agnt.indexOf("chrome")>0) $isChrome = true;
 else $isFirefox = true;
}
 
//private:
function bldStr(ctlType, id, para, height)
{
 var ctlver = '1.0.103.0';

 //ȡ��������ľ���·��(�����dynaload.js������ͬһ��Ŀ¼)
 var SupcanPath="", arrScript = document.getElementsByTagName("script");
 for(var i=0; i<arrScript.length; i++) {
	var src = arrScript[i].src;
	var index = src.indexOf('dynaload.js');
	if(index >= 0) {
		SupcanPath = src.substring(0, index);
		if(SupcanPath.charAt(0) == '/') {
			src = location.href;
			index = src.indexOf('//');
			if(index != -1) {
				index = src.indexOf('/', index+2);
				if(index != -1) src = src.substring(0, index);
				SupcanPath = src + SupcanPath;
			}
		}
		break;
	}
 }
 
 var typeid;
 if($isIE) {
  if($is64)
   typeid = 'CLASSID="clsid:11249C26-4BCD-4A74-B4D9-068936D77EFE" Codebase="' +SupcanPath+ 'supcan2.x64.cab#Version=1,0,0,3"';
  else
   typeid = 'CLASSID="clsid:619F1AC0-2644-40D3-9EB1-22F81C5FE097" Codebase="' +SupcanPath+ 'supcan2.cab#Version=1,0,0,3"';
 }
 else {
  typeid = 'type="application/supcan-plugin"';
  if($isFirefox) typeid += ' Codebase="' +SupcanPath+ 'supcan.xpi"';
 }
 
 //�����URL
 var zipurl = SupcanPath + ($is64 ? "BCV1.x64.bin" : "BCV1.bin");
 if(ctlType=="LuxForm")
  zipurl += "," +SupcanPath+ ($is64 ? "LuxForm.x64.bin" : "LuxForm.bin");
 else if(ctlType.indexOf("BCV4")>=0)
  zipurl += "," +SupcanPath+ ($is64 ? "BCV4.x64.bin" : "BCV4.bin");
 
 var str = '<Object id=' +id+ ' Width=100% height=' +height+ ' ' +typeid+ '>';
 str += '<param Name="CtlName" Value="' +ctlType+ '">';
 str += '<param Name="CtlVersion" Value="' +ctlver+ '">';
 str += '<param Name="ZipUrl" Value="' +zipurl+ '">';
 str += '<param Name="id" Value="' +id+ '">';
 str += '<param Name="wmode" Value="opaque">';
 str +=' <embed wmode="opaque"></embed> ' ;
 //str += '<param Name="Cookie" Value="' +document.cookie+ '">';
 str += '<param Name="CtlPara" Value="' +para+ '"></Object>';
 return str;
}

//public:
function insertTreeList(id, para)		{ document.write( bldStr("BCV1.TreeList",		id, para, (arguments.length > 2) ? arguments[2]:"100%") )}
function insertEdit(id, para)		{ document.write( bldStr("BCV1.Edit",		id, para, (arguments.length > 2) ? arguments[2]:"100%") )}
function insertReport(id, para)		{ document.write( bldStr("LuxForm",		id, para, (arguments.length > 2) ? arguments[2]:"100%") )}
function insertTree(id, para)		{ document.write( bldStr("BCV1.Tree",		id, para, (arguments.length > 2) ? arguments[2]:"100%") )}
function insertFreeForm(id, para)	{ document.write( bldStr("BCV1.FreeForm",	id, para, (arguments.length > 2) ? arguments[2]:"100%") )}
function insertChart(id, para)		{ document.write( bldStr("BCV1.Chart",		id, para, (arguments.length > 2) ? arguments[2]:"100%") )}
function insertUpload(id, para)		{ document.write( bldStr("BCV1.Upload",		id, para, (arguments.length > 2) ? arguments[2]:"100%") )}
function insertFormDesigner(id, para)	{ document.write( bldStr("BCV4.FormDesigner",	id, para, (arguments.length > 2) ? arguments[2]:"100%") )}

//����ĺ���(�ؼ��ᷴ����ã���;:�л�����)
function focusIE(obj_or_id)
{
 if($isIE==false) {
  document.activeElement.blur();
  return;
 }
 try {
  if(typeof(obj_or_id)=='object') {
   if(document.activeElement != obj_or_id) obj_or_id.focus();
  }
  else {
   if(document.activeElement.id == obj_or_id) return;
   var o = document.getElementById(obj_or_id);
   if(o != null) o.focus();
  }
 }
 catch(e) {
 }
}