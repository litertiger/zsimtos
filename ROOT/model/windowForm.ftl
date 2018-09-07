{
"inframe": true,
"title": "${tableName_cn}",
"hidden": false,
"roles": {
"demo": 1,
"dev": 1
},
"children": [
{
"configs": {
"itemId": "module"
},
"events": {
"initialize": "var  opeType;"
},
"children": [
{
"configs": {
"closeAction": "hide",
"dialog": "true",
"itemId": "editWin",
"layout":"absolute"
},
"events": {
"ok": "var values = Wb.getValue(app.editWin);\nif (app.isEdit) {\n  //点击修改按钮的处理过程\n  Wb.request({\n    url: '${updateUrl}',\n    params: Wb.applyIf(values, Wb.getData(app.selRec, true)), //合并窗口和记录数据作为参数，后者为默认值\n    success: function() {\n      //把窗口数据更新到选择记录中\n      Wb.update(app.selRec, values);\n      //隐藏对话框，在模块关闭时自动销毁对话框\n      app.editWin.close();\n    }\n  });\n} else {\n  //点击添加按钮的处理过程\n  Wb.request({\n    url: '${insertUrl}',\n    out: app.editWin,\n    success: function(resp) {\n      //把服务器返回的数据合并窗口数据（公司名称等数据）添加到表格中\n        var ms=Wb.apply( values,Wb.decode(resp.responseText));\n     \n      Wb.add(app.grid1, Wb.apply(Wb.decode(resp.responseText), values));\n      //隐藏对话框，在模块关闭时自动销毁对话框\n      app.editWin.close();\n    }\n  });\n}"
},
"children": [
${form}
],
"expanded": true,
"type": "window"
},
{
"configs": {
"layout": "border",
"itemId": "viewport1"
},
"children": [
{
"configs": {
"region": "center",
"multiSelect": "true",
"itemId": "grid1",
"disabled": "false"
},
"events": {
"itemdblclick": "app.editBtn.fireEvent('click');"
},
"children": [
{
"configs": {
"region": "north",
"enableOverflow": "true",
"itemId": "tbar"
},
"children": [
{
"configs": {
"text": "添加",
"itemId": "newBtn",
"iconCls": "record_add_icon",
"tooltip": "添加新的记录 (Ctrl+E)"
},
"events": {
"click": "app.editWin.setTitle('添加 - 数据');\napp.editWin.setIconCls('record_add_icon');\napp.editWin.show();\napp.isEdit = false; //标识是否为添加或修改状态，在editWin的ok事件中用到此属性"
},
"children": [],
"expanded": false,
"type": "item"
},
{
"configs": {
"text": "修改",
"itemId": "editBtn",
"iconCls": "record_edit_icon",
"tooltip": "修改选择的记录"
},
"events": {
"click": "var sels = app.grid1.getSelection();\nif (sels.length != 1) {\n  Wb.warn('请选择 1 条需要修改的记录。');\n  return;\n}\napp.selRec = sels[0];\napp.editWin.setTitle('修改 -数据 ' + app.selRec.data.VESSEL_NAME);\napp.editWin.setIconCls('record_edit_icon');\nWb.setValue(app.editWin, app.selRec.data);\napp.editWin.show();\napp.isEdit = true; //标识是否为添加或修改状态，在editWin的ok事件中用到此属性"
},
"children": [],
"expanded": false,
"type": "item"
},
{
"configs": {
"text": "删除",
"itemId": "delBtn",
"iconCls": "record_delete_icon",
"tooltip": "删除选择的记录"
},
"events": {
"click": "var sels = app.grid1.getSelection();\nWb.confirmDo(sels, function() {\n  Wb.request({\n    url: '${deleteUrl}',\n    params: {\n      destroy: Wb.getData(sels, true)\n    },\n    success: function() {\n      Wb.remove(app.grid1, sels);\n    }\n  });\n}, 'REAL_NAME');"
},
"children": [],
"expanded": false,
"type": "item"
},
{
"configs": {
"text": "-",
"itemId": "item1"
},
"children": [],
"expanded": false,
"type": "item"
}
],
"expanded": true,
"type": "toolbar"
},
{
"configs": {
"sorters": "'ID'",
"itemId": "store",
"autoLoad": "true",
"url": "${selectUrl}"
},
"children": [],
"expanded": false,
"type": "store"
},
{
"configs": {
"itemId": "columns"
},
"children": [
{
"configs": {
"xtype": "rownumberer",
"itemId": "column1"
},
"children": [],
"expanded": false,
"type": "column"
}
${columnString}
],
"expanded": true,
"type": "array"
}
],
"expanded": true,
"type": "grid"
}
],
"expanded": true,
"type": "viewport"
}
],
"expanded": true,
"type": "module"
}
],
"pageLink": "",
"iconCls": "trash_icon"
}