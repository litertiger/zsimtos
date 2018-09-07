{
    "inframe": false, 
    "title": "修改", 
    "hidden": false, 
    "roles": {
        "dev": 1
    }, 
    "children": [
        {
            "configs": {
                "itemId": "module"
            }, 
            "children": [
                {
                    "configs": {
                        "errorText":" 名称已存在已经存在。", 
                        "sql": "select      1  from  ${tableName_en} ", 
                        "itemId": "检查是否存在重复记录"
                    }, 
                    "children": [ ], 
                    "expanded": false, 
                    "type": "query"
                }, 
                {
                    "configs": {
                        "sql": "${updateSql}", 
                        "itemId": "query1"
                    }, 
                    "children": [ ], 
                    "expanded": false, 
                    "type": "query"
                }
            ], 
            "expanded": true, 
            "type": "module"
        }
    ], 
    "pageLink": "", 
    "iconCls": ""
}