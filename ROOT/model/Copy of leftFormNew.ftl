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
                        "layout": "border",
                        "itemId": "viewport1"
                    },
                    "children": [
                        {
                            "configs": {
                                "region": "west",
                                "frame": "true",
                                "autoScroll": "true",
                                "layout": "form",
                                "width": "300",
                                "split": "true",
                                "itemId": "panel1"
                            },
                            "children": [  ${form}
                            ],
                            "expanded": true,
                            "type": "panel"
                        },
                        {
                            "configs": {
                                "region": "center",
                                "multiSelect": "true",
                                "title": "字段字典定义",
                                "itemId": "grid1",
                                "disabled": "false",
                                "iconCls": "book_icon"
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
                                                "click": "opeType='insert';\n\nWb.reset(app.panel1);"
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
                                                "click": "opeType='modify';\nvar rec = app.grid1.getSelection()[0];\nif (!rec) {\n  Wb.warn('请选择 1 条需要修改的记录。');\n  return;\n}\nWb.setValue(app.panel1, rec.data); //把记录数据应用到窗口\n//窗口每次动态生成,方法在窗口销毁时自动销毁\n"
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
                                                "click": "Wb.del(app.grid1, {\n  url: 'm?xwl=dev/dict/delete',\n  titleField: 'FIELD_NAME'\n});"
                                            },
                                            "children": [],
                                            "expanded": false,
                                            "type": "item"
                                        },
                                        {
                                            "configs": {
                                                "text": "保存",
                                                "itemId": "saveBtn",
                                                "iconCls": "save_icon",
                                                "tooltip": "保存记录"
                                            },
                                            "events": {
                                                "click": "if(opeType=='insert'){\nvar values = Wb.getValue(panel1);\n  Wb.request({\n    url: 'm?xwl=dev/dict/insert', //使用basic-insert用于演示基本的操作，更简单的操作可使用'm?xwl=examples/crud/crud-db-access/insert'替代\n    params: values,\n    success: function(resp) {\n      Wb.apply(values, Wb.decode(resp.responseText)); //把后台返回的ID_FIELD等数据应用到values中\n      Wb.add(app.grid1, values); //同步在客户端表格中添加\n     \n    }\n  });\n}\nelse if(opeType=='modify'){\nvar rec = app.grid1.getSelection()[0];\n  var values = Wb.applyIf(Wb.getValue(panel1), Wb.getData(rec, true)); //Wb.getData用于获取记录中的原始值，见Wb.getData方法\n  Wb.request({\n    url: 'm?xwl=dev/dict/update',\n    params: values,\n    success: function(resp) {\n      Wb.update(rec, values); //同步在客户端表格中更新\n      \n    }\n  });\n}\n\n\n\n\n"
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
                                        "sorters": "'FIELD_NAME'",
                                        "itemId": "store",
                                        "autoLoad": "true",
                                        "url": "m?xwl=dev/dict/selectDict"
                                    },
                                    "children": [],
                                    "expanded": false,
                                    "type": "store"
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