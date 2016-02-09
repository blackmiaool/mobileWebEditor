
MIOTEDITOR.models.push({
    preview: true,
    kind: "h",
    model_data: {
        "schema": {
            "data": {
                "type": "string",
                "title": "内容",
                "default": "美腻的标题",
            },
            "source": {
                "type": "string",
                "title": "来源",
                "default": "小米社区",
            },
            "date": {
                "type": "string",
                "title": "日期",
                "default": "2015.8.10",
            },
            style: {
                type: "object",
                title: "样式",
                properties: {
                    color: {
                        "type": "string",
                        "title": "颜色",
                        "format": "color"
                    },
                }
            },
            

        },

    },
})