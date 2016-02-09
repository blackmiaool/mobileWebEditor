
MIOTEDITOR.models.push({
    preview: true,
    kind: "p",
    model_data: {
        "schema": {
            "data": {
                "type": "string",
                "title": "内容",
                "default": "普通的段落普通的段落普通的段落普通的段落普通的段落普通的段落普通的段落普通的段落普通的段落普通的段落普通的段落普通的段落普通的段落普通的",
            },
            style: {
                type: "object",
                title: "样式",
                properties: {
                    color: {
                        "type": "string",
                        "title": "颜色",
                        "format": "color",
                        "default":"7e7e7e",
                    },
                }
            }

        }
    },
})