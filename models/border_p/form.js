
MIOTEDITOR.models.push({
    preview: true,
    kind: "p",
    model_data: {
        "schema": {
            "data": {
                "type": "string",
                "title": "内容",
                "default": "一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落一个带边框的段落",
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
            }

        }
    },
})