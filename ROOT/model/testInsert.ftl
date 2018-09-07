{
    "inframe": false, 
    "title": "基本添加记录", 
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
                        "sql": "${insertSql}", 
                        "itemId": "query1"
                    }, 
                    "children": [ ], 
                    "expanded": false, 
                    "type": "query"
                }, 
                {
                    "configs": {
                        "string": "{ID_FIELD:'{#sys.id#}'}", 
                        "itemId": "responseIdField"
                    }, 
                    "children": [ ], 
                    "expanded": false, 
                    "type": "response"
                }
            ], 
            "expanded": true, 
            "type": "module"
        }
    ], 
    "pageLink": "", 
    "iconCls": ""
}