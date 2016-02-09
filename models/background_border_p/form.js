
MIOTEDITOR.models.push({
    preview: true,
    kind: "p",
    model_data: {
        "schema": {
            "data": {
                "type": "string",
                "title": "内容",
                "default": "一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-一个带边框和背景的段落-",
            },
            style: {
                type: "object",
                title: "样式",
                properties: {
                    "background-color": {
                        "type": "string",
                        "title": "背景颜色",
                        "format": "color",
                        "default":"#f4f4f5",
                    },
                    "border-color": {
                        "type": "string",
                        "title": "边框颜色",
                        "format": "color",
                        "default":"#dbdbdc",
                    },
                    "border-width": {
                        "type": "string",
                        "title": "边框宽度",        
                        "default":"1px",
                    },
                    "color": {
                        "type": "string",
                        "title": "文字颜色",
                        "format": "color",
                        "default":"#919192",
                    },
                }
            }

        }
    },
})